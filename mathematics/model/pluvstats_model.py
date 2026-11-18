"""Modelo matemático autônomo do PLUVSTATS.

Pode ser executado diretamente no PyCharm ou importado por outro módulo.
Usa somente a biblioteca padrão do Python.

O modelo converte distância em nível, calcula taxas, projeções lineares,
tendência por mínimos quadrados, variação de volume e exposição acumulada.
Não é uma simulação hidráulica nem substitui calibração ou validação de campo.

Configuração: procura shared/pluvstats.config.json nas pastas do projeto.
Se não encontrar o arquivo, usa os parâmetros padrão incorporados abaixo.
Para obrigar o uso de um arquivo específico, passe --config no terminal.
"""

from __future__ import annotations

import argparse
import copy
import json
import math
from pathlib import Path
from typing import Any, Sequence


DEFAULT_CONFIG: dict[str, Any] = {
    "thresholds": {
        "waterLevelCm": {"attention": 25, "alert": 50, "critical": 75},
        "riseRateCmPerMin": {"attention": 1.2, "alert": 2.8, "critical": 4.5},
        "invalidDistanceRangeCm": [2, 380],
    },
    "sensorGeometry": {
        "sensorHeightCm": 120,
        "dryDistanceCm": 112,
        "channelDepthCm": 100,
        "channelWidthM": 2.0,
        "reachLengthM": 100.0,
    },
}


class ModelError(ValueError):
    """Erro de entrada, configuração ou domínio matemático do PLUVSTATS."""


def _to_finite_float(value: object, name: str) -> float:
    if value is None or isinstance(value, bool):
        raise ModelError(f"{name} deve ser um número finito.")
    try:
        number = float(value)  # aceita int, float e strings numéricas
    except (TypeError, ValueError, OverflowError) as exc:
        raise ModelError(f"{name} deve ser um número válido.") from exc
    if not math.isfinite(number):
        raise ModelError(f"{name} deve ser finito (não pode ser NaN ou infinito).")
    return number


def _find_default_config() -> Path | None:
    """Procura o JSON compartilhado sem depender do diretório de execução do IDE."""
    candidates: list[Path] = [Path.cwd() / "shared" / "pluvstats.config.json"]
    module_dir = Path(__file__).resolve().parent
    for base in (module_dir, *module_dir.parents):
        candidates.append(base / "shared" / "pluvstats.config.json")
    seen: set[Path] = set()
    for candidate in candidates:
        candidate = candidate.resolve()
        if candidate not in seen:
            seen.add(candidate)
            if candidate.is_file():
                return candidate
    return None


def load_shared_config(path: str | Path | None = None) -> dict[str, Any]:
    """Carrega o JSON; sem caminho explícito, usa JSON encontrado ou padrão interno.

    Se `path` for informado e não puder ser lido, lança ModelError em vez de
    esconder o problema usando os valores padrão.
    """
    if path is None:
        source = _find_default_config()
        if source is None:
            config = copy.deepcopy(DEFAULT_CONFIG)
            _validate_config(config)
            return config
    else:
        source = Path(path).expanduser()

    try:
        raw = source.read_text(encoding="utf-8")
    except OSError as exc:
        raise ModelError(f"Não foi possível ler a configuração '{source}': {exc}") from exc
    try:
        config = json.loads(raw)
    except json.JSONDecodeError as exc:
        raise ModelError(f"O arquivo de configuração não contém JSON válido: {exc}") from exc
    _validate_config(config)
    return config


def _validate_config(config: object) -> None:
    if not isinstance(config, dict):
        raise ModelError("A raiz da configuração deve ser um objeto JSON.")
    geometry = config.get("sensorGeometry")
    thresholds = config.get("thresholds")
    if not isinstance(geometry, dict):
        raise ModelError("Configuração sem o objeto 'sensorGeometry'.")
    if not isinstance(thresholds, dict):
        raise ModelError("Configuração sem o objeto 'thresholds'.")

    sensor_height = _to_finite_float(geometry.get("sensorHeightCm"), "sensorHeightCm")
    depth = _to_finite_float(geometry.get("channelDepthCm"), "channelDepthCm")
    width = _to_finite_float(geometry.get("channelWidthM"), "channelWidthM")
    length = _to_finite_float(geometry.get("reachLengthM"), "reachLengthM")
    if sensor_height <= 0 or depth <= 0 or width <= 0 or length <= 0:
        raise ModelError("Altura do sensor, profundidade, largura e comprimento devem ser positivos.")

    valid_range = thresholds.get("invalidDistanceRangeCm")
    if not isinstance(valid_range, (list, tuple)) or len(valid_range) != 2:
        raise ModelError("'invalidDistanceRangeCm' deve conter [distância_mínima, distância_máxima].")
    minimum = _to_finite_float(valid_range[0], "invalidDistanceRangeCm[0]")
    maximum = _to_finite_float(valid_range[1], "invalidDistanceRangeCm[1]")
    if minimum < 0 or minimum >= maximum:
        raise ModelError("Faixa 'invalidDistanceRangeCm' inválida.")

    water_thresholds = thresholds.get("waterLevelCm")
    rate_thresholds = thresholds.get("riseRateCmPerMin")
    if not isinstance(water_thresholds, dict) or not isinstance(rate_thresholds, dict):
        raise ModelError("Configuração precisa conter 'waterLevelCm' e 'riseRateCmPerMin'.")
    for key in ("attention", "alert", "critical"):
        value = _to_finite_float(water_thresholds.get(key), f"waterLevelCm.{key}")
        if value <= 0 or value > depth:
            raise ModelError(f"Limite waterLevelCm.{key} deve estar entre 0 e {depth} cm.")
        rate = _to_finite_float(rate_thresholds.get(key), f"riseRateCmPerMin.{key}")
        if rate < 0:
            raise ModelError(f"Limite riseRateCmPerMin.{key} não pode ser negativo.")


def _get_config(config: dict[str, Any] | None) -> dict[str, Any]:
    cfg = load_shared_config() if config is None else config
    _validate_config(cfg)
    return cfg


def _geometry(config: dict[str, Any] | None) -> dict[str, Any]:
    return _get_config(config)["sensorGeometry"]


def _thresholds(config: dict[str, Any] | None) -> dict[str, Any]:
    return _get_config(config)["thresholds"]


def _validate_level(level: object, name: str, depth: float) -> float:
    value = _to_finite_float(level, name)
    if value < 0 or value > depth:
        raise ModelError(f"{name} deve estar entre 0 e {depth:g} cm.")
    return value


def water_level_cm(distance_cm: float, *, config: dict[str, Any] | None = None) -> float:
    """Calcula h = H - d e limita o resultado ao canal [0, profundidade].

    `sensorHeightCm` é a referência geométrica usada na fórmula. `dryDistanceCm`
    permanece como referência declarada na configuração e não é usado como
    calibração, pois não há comprovação de ensaio experimental.
    """
    cfg = _get_config(config)
    distance = _to_finite_float(distance_cm, "distance_cm")
    valid_range = cfg["thresholds"]["invalidDistanceRangeCm"]
    minimum, maximum = map(float, valid_range)
    if not minimum <= distance <= maximum:
        raise ModelError(f"distance_cm deve estar na faixa [{minimum:g}, {maximum:g}] cm.")
    geometry = cfg["sensorGeometry"]
    sensor_height = _to_finite_float(geometry["sensorHeightCm"], "sensorHeightCm")
    depth = _to_finite_float(geometry["channelDepthCm"], "channelDepthCm")
    return min(depth, max(0.0, sensor_height - distance))


def rise_rate_cm_per_min(
    previous_level_cm: float, current_level_cm: float, elapsed_seconds: float
) -> float:
    """Taxa média assinada em cm/min: positiva sobe, negativa desce, zero estabiliza."""
    previous = _to_finite_float(previous_level_cm, "previous_level_cm")
    current = _to_finite_float(current_level_cm, "current_level_cm")
    elapsed = _to_finite_float(elapsed_seconds, "elapsed_seconds")
    if previous < 0 or current < 0:
        raise ModelError("Os níveis de água não podem ser negativos.")
    if elapsed <= 0:
        raise ModelError("elapsed_seconds deve ser maior que zero.")
    return (current - previous) / (elapsed / 60.0)


def time_to_limit_minutes(
    current_level_cm: float,
    limit_cm: float,
    rate_cm_per_min: float,
    *,
    config: dict[str, Any] | None = None,
) -> float | None:
    """Tempo estimado até um limite superior, supondo taxa constante.

    Retorna 0 se o nível já atingiu o limite e None se a taxa não for positiva.
    """
    cfg = _get_config(config)
    depth = float(cfg["sensorGeometry"]["channelDepthCm"])
    current = _validate_level(current_level_cm, "current_level_cm", depth)
    limit = _to_finite_float(limit_cm, "limit_cm")
    rate = _to_finite_float(rate_cm_per_min, "rate_cm_per_min")
    if limit <= 0 or limit > depth:
        raise ModelError(f"limit_cm deve estar entre 0 e {depth:g} cm.")
    if current >= limit:
        return 0.0
    if rate <= 0:
        return None
    result = (limit - current) / rate
    if not math.isfinite(result):
        raise ModelError("O tempo calculado excede a faixa numérica suportada.")
    return result


def project_level_cm(
    current_level_cm: float,
    rate_cm_per_min: float,
    minutes: float,
    *,
    config: dict[str, Any] | None = None,
) -> float:
    """Projeta h(t+Δt)=h+v·Δt e limita o resultado ao canal [0, profundidade]."""
    cfg = _get_config(config)
    depth = float(cfg["sensorGeometry"]["channelDepthCm"])
    current = _validate_level(current_level_cm, "current_level_cm", depth)
    rate = _to_finite_float(rate_cm_per_min, "rate_cm_per_min")
    horizon = _to_finite_float(minutes, "minutes")
    if horizon < 0:
        raise ModelError("minutes não pode ser negativo.")
    projected = current + rate * horizon
    if not math.isfinite(projected):
        raise ModelError("A projeção excedeu a faixa numérica suportada.")
    return min(depth, max(0.0, projected))


def linear_trend_cm_per_min(
    elapsed_seconds: Sequence[float],
    levels_cm: Sequence[float],
    *,
    config: dict[str, Any] | None = None,
) -> float:
    """Inclinação por mínimos quadrados em cm/min (mínimo de três amostras)."""
    if elapsed_seconds is None or levels_cm is None:
        raise ModelError("As séries de tempo e nível não podem ser None.")
    try:
        times = [_to_finite_float(value, "elapsed_seconds") for value in elapsed_seconds]
        raw_levels = [_to_finite_float(value, "levels_cm") for value in levels_cm]
    except TypeError as exc:
        raise ModelError("As entradas devem ser sequências numéricas.") from exc
    if len(times) != len(raw_levels):
        raise ModelError("As séries de tempo e nível devem ter o mesmo tamanho.")
    if len(times) < 3:
        raise ModelError("São necessários pelo menos três pontos para a tendência.")
    cfg = _get_config(config)
    depth = float(cfg["sensorGeometry"]["channelDepthCm"])
    levels = [_validate_level(value, "levels_cm", depth) for value in raw_levels]
    if any(t2 <= t1 for t1, t2 in zip(times, times[1:])):
        raise ModelError("Os tempos devem estar em ordem estritamente crescente.")
    mean_t = math.fsum(times) / len(times)
    mean_h = math.fsum(levels) / len(levels)
    denominator = math.fsum((t - mean_t) ** 2 for t in times)
    if denominator == 0:
        raise ModelError("A série precisa conter tempos distintos.")
    numerator = math.fsum((t - mean_t) * (h - mean_h) for t, h in zip(times, levels))
    slope = (numerator / denominator) * 60.0
    if not math.isfinite(slope):
        raise ModelError("Não foi possível calcular uma tendência finita.")
    return slope


def level_series(
    readings: list[dict[str, Any]], *, config: dict[str, Any] | None = None
) -> list[dict[str, float]]:
    """Converte leituras {tSeconds, distanceCm} em uma série de níveis."""
    if not isinstance(readings, list) or not readings:
        raise ModelError("readings deve ser uma lista não vazia.")
    series: list[dict[str, float]] = []
    previous_time: float | None = None
    for index, reading in enumerate(readings):
        if not isinstance(reading, dict) or "tSeconds" not in reading or "distanceCm" not in reading:
            raise ModelError(f"A leitura {index + 1} precisa conter tSeconds e distanceCm.")
        timestamp = _to_finite_float(reading["tSeconds"], "tSeconds")
        if previous_time is not None and timestamp <= previous_time:
            raise ModelError("Os timestamps das leituras devem ser estritamente crescentes.")
        distance = _to_finite_float(reading["distanceCm"], "distanceCm")
        series.append({
            "tSeconds": timestamp,
            "distanceCm": distance,
            "levelCm": water_level_cm(distance, config=config),
        })
        previous_time = timestamp
    return series


def _validate_series(
    series: list[dict[str, Any]], config: dict[str, Any] | None = None
) -> list[tuple[float, float]]:
    if not isinstance(series, list) or len(series) < 2:
        raise ModelError("São necessários pelo menos dois pontos para integrar a série.")
    cfg = _get_config(config)
    depth = float(cfg["sensorGeometry"]["channelDepthCm"])
    validated: list[tuple[float, float]] = []
    previous_time: float | None = None
    for index, point in enumerate(series):
        if not isinstance(point, dict) or "tSeconds" not in point or "levelCm" not in point:
            raise ModelError(f"O ponto {index + 1} precisa conter tSeconds e levelCm.")
        timestamp = _to_finite_float(point["tSeconds"], "tSeconds")
        level = _validate_level(point["levelCm"], "levelCm", depth)
        if previous_time is not None and timestamp <= previous_time:
            raise ModelError("Os timestamps devem ser estritamente crescentes.")
        validated.append((timestamp, level))
        previous_time = timestamp
    return validated


def accumulated_volume_change_m3(
    series: list[dict[str, Any]],
    *,
    channel_width_m: float | None = None,
    reach_length_m: float | None = None,
    config: dict[str, Any] | None = None,
) -> float:
    """Variação líquida de volume no trecho retangular: ΔV=w·L·Δh/100 (m³)."""
    points = _validate_series(series, config)
    geometry = _geometry(config)
    width = _to_finite_float(
        geometry["channelWidthM"] if channel_width_m is None else channel_width_m,
        "channel_width_m",
    )
    length = _to_finite_float(
        geometry["reachLengthM"] if reach_length_m is None else reach_length_m,
        "reach_length_m",
    )
    if width <= 0 or length <= 0:
        raise ModelError("A largura e o comprimento do trecho devem ser positivos.")
    delta_level = points[-1][1] - points[0][1]
    result = width * length * delta_level / 100.0
    if not math.isfinite(result):
        raise ModelError("A variação de volume excedeu a faixa numérica suportada.")
    return result


def level_exposure_cm_minutes(
    series: list[dict[str, Any]], *, config: dict[str, Any] | None = None
) -> float:
    """Integral de h(t) pelo método dos trapézios, em cm·min."""
    points = _validate_series(series, config)
    areas = []
    for (t0, h0), (t1, h1) in zip(points, points[1:]):
        delta_minutes = (t1 - t0) / 60.0
        areas.append(((h0 + h1) / 2.0) * delta_minutes)
    result = math.fsum(areas)
    if not math.isfinite(result):
        raise ModelError("A integral de exposição excedeu a faixa numérica suportada.")
    return result


def long_run_level_cm(
    current_level_cm: float,
    rate_cm_per_min: float,
    *,
    config: dict[str, Any] | None = None,
) -> float:
    """Limite da projeção linear saturada quando t tende ao infinito."""
    cfg = _get_config(config)
    depth = float(cfg["sensorGeometry"]["channelDepthCm"])
    current = _validate_level(current_level_cm, "current_level_cm", depth)
    rate = _to_finite_float(rate_cm_per_min, "rate_cm_per_min")
    if rate > 0:
        return depth
    if rate < 0:
        return 0.0
    return current


def scenario_metrics(
    scenario: dict[str, Any], *, config: dict[str, Any] | None = None
) -> dict[str, Any]:
    """Calcula indicadores de um cenário usando as mesmas fórmulas do relatório."""
    if not isinstance(scenario, dict) or "readings" not in scenario:
        raise ModelError("scenario deve ser um objeto contendo readings.")
    cfg = _get_config(config)
    series = level_series(scenario["readings"], config=cfg)
    if len(series) < 2:
        raise ModelError("Um cenário precisa conter pelo menos duas leituras.")
    first, last = series[0], series[-1]
    elapsed = last["tSeconds"] - first["tSeconds"]
    rate = rise_rate_cm_per_min(first["levelCm"], last["levelCm"], elapsed)
    thresholds = cfg["thresholds"]["waterLevelCm"]
    limit = _to_finite_float(scenario.get("limitCm", thresholds["critical"]), "limitCm")
    time_to_limit = time_to_limit_minutes(last["levelCm"], limit, rate, config=cfg)
    geometry = cfg["sensorGeometry"]
    return {
        "name": scenario.get("name", "cenário"),
        "description": scenario.get("description", ""),
        "firstLevelCm": round(first["levelCm"], 2),
        "lastLevelCm": round(last["levelCm"], 2),
        "elapsedSeconds": elapsed,
        "rateCmPerMin": round(rate, 2),
        "limitCm": limit,
        "timeToLimitMinutes": None if time_to_limit is None else round(time_to_limit, 2),
        "channelWidthM": float(geometry["channelWidthM"]),
        "reachLengthM": float(geometry["reachLengthM"]),
        "accumulatedVolumeM3": round(accumulated_volume_change_m3(series, config=cfg), 2),
        "levelExposureCmMinutes": round(level_exposure_cm_minutes(series, config=cfg), 2),
        "series": series,
    }


def _demo(config: dict[str, Any] | None = None) -> None:
    """Demonstra as principais funções quando o arquivo é executado diretamente."""
    config = load_shared_config() if config is None else config
    rising = [{"tSeconds": 0, "distanceCm": 78},
              {"tSeconds": 120, "distanceCm": 70},
              {"tSeconds": 240, "distanceCm": 62}]
    falling = [{"tSeconds": 0, "distanceCm": 58},
               {"tSeconds": 120, "distanceCm": 67},
               {"tSeconds": 240, "distanceCm": 76}]
    print("PLUVSTATS | Demonstração do modelo matemático")
    print("Configuração: JSON compartilhado ou parâmetros padrão incorporados")
    print("-" * 54)
    for title, readings in (("Elevação", rising), ("Drenagem", falling)):
        result = scenario_metrics({"name": title, "readings": readings}, config=config)
        print(f"{title}: {result['firstLevelCm']:.2f} -> {result['lastLevelCm']:.2f} cm")
        print(f"  Taxa média: {result['rateCmPerMin']:.2f} cm/min")
        print(f"  Variação de volume: {result['accumulatedVolumeM3']:.2f} m³")
        print(f"  Exposição acumulada: {result['levelExposureCmMinutes']:.2f} cm·min")
        print(f"  Tempo até limite crítico: {result['timeToLimitMinutes']} min")
    print("\nAviso: resultados matemáticos demonstrativos; não representam previsão oficial de enchente.")


def main() -> None:
    parser = argparse.ArgumentParser(description="Modelo matemático autônomo do PLUVSTATS")
    parser.add_argument("--config", help="caminho opcional para pluvstats.config.json")
    args = parser.parse_args()
    config = load_shared_config(args.config) if args.config else load_shared_config()
    _demo(config)


__all__ = [
    "DEFAULT_CONFIG", "ModelError", "accumulated_volume_change_m3",
    "level_exposure_cm_minutes", "level_series", "linear_trend_cm_per_min",
    "load_shared_config", "long_run_level_cm", "project_level_cm",
    "rise_rate_cm_per_min", "scenario_metrics", "time_to_limit_minutes",
    "water_level_cm", "main",
]


if __name__ == "__main__":
    main()
