#!/usr/bin/env python3
"""PLUVSTATS Console — aplicação Python da Global Solution 2026.2.

Aplicação de terminal, sem bibliotecas externas, que opera os pontos monitorados
do PLUVSTATS: lista pontos, registra leituras, calcula nível/taxa/tempo até o
limite, carrega cenários, gera relatório e persiste tudo em JSON.

Ela existe para a disciplina **Computational Thinking with Python** e usa os
mesmos limiares e a mesma geometria do restante do projeto
(`shared/pluvstats.config.json`). Quando o arquivo compartilhado não está
disponível — por exemplo, no ZIP isolado da disciplina —, a aplicação usa os
valores padrão embutidos e avisa no menu.

Execução:
    python app.py
    python app.py --report

Requisitos atendidos: menu, validação de entrada, try/except, if/elif/else,
match/case, while, for, funções com parâmetros e retorno, listas, tuplas,
dicionários e persistência em JSON.
"""

from __future__ import annotations

import json
import math
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

APP_DIR = Path(__file__).resolve().parent
DATA_DIR = APP_DIR / "data"
STATE_PATH = DATA_DIR / "estado.json"
SHARED_CONFIG_PATH = APP_DIR.parent / "shared" / "pluvstats.config.json"

STATE_VERSION = 1

DEFAULT_CONFIG = {
    "sensorHeightCm": 120.0,
    "channelDepthCm": 100.0,
    "channelWidthM": 2.0,
    "reachLengthM": 100.0,
    "invalidDistanceRangeCm": (2.0, 380.0),
    "waterLevelCm": {"attention": 25.0, "alert": 50.0, "critical": 75.0},
    "riseRateCmPerMin": {"attention": 1.2, "alert": 2.8, "critical": 4.5},
}

POINTS = [
    {"id": "PS-01", "name": "Rua Oratório", "neighborhood": "Vila Metalúrgica", "kind": "simulado"},
    {"id": "PS-02", "name": "Av. Firestone", "neighborhood": "Jardim", "kind": "simulado"},
    {"id": "PS-03", "name": "Praça do Carmo", "neighborhood": "Centro", "kind": "simulado"},
    {"id": "PS-04", "name": "Av. Portugal", "neighborhood": "Jardim Bela Vista", "kind": "simulado"},
    {"id": "PS-05", "name": "Rua Jujuá", "neighborhood": "Jardim Bom Pastor", "kind": "hardware não validado"},
]

SCENARIOS = {
    "1": {
        "key": "normal",
        "label": "Canal estável",
        "description": "Oscilação de poucos centímetros em torno de 8 cm, compatível com drenagem funcionando.",
        "readings": [
            (0, 112.0), (30, 111.8), (60, 112.1), (90, 111.7), (120, 111.9),
            (150, 112.0), (180, 111.6), (240, 111.9), (300, 112.0),
        ],
    },
    "2": {
        "key": "rising",
        "label": "Elevação sustentada",
        "description": "O nível sobe de 42 cm para 58 cm em quatro minutos: taxa de 4 cm/min.",
        "readings": [
            (0, 78.0), (30, 76.0), (60, 74.0), (90, 72.0), (120, 70.0),
            (150, 68.0), (180, 66.0), (210, 64.0), (240, 62.0),
        ],
    },
    "3": {
        "key": "drainage",
        "label": "Drenagem",
        "description": "O nível cai de 62 cm para 44 cm em quatro minutos: taxa negativa.",
        "readings": [
            (0, 58.0), (30, 60.5), (60, 63.0), (90, 65.5), (120, 68.0),
            (150, 70.5), (180, 73.0), (210, 75.0), (240, 76.0),
        ],
    },
}

SEVERITY_ORDER = {"normal": 0, "atenção": 1, "alerta": 2, "crítico": 3}


class AppError(ValueError):
    """Erro de entrada ou de estado que pode ser mostrado ao usuário."""


# ---------------------------------------------------------------------------
# Configuração e persistência
# ---------------------------------------------------------------------------


def load_config() -> tuple[dict, str]:
    """Carrega a configuração compartilhada ou usa os padrões embutidos.

    Retorna a configuração e uma descrição legível da origem, para que o menu
    nunca esconda de onde vêm os limiares.
    """
    try:
        raw = json.loads(SHARED_CONFIG_PATH.read_text(encoding="utf-8"))
        config = {
            "sensorHeightCm": float(raw["sensorGeometry"]["sensorHeightCm"]),
            "channelDepthCm": float(raw["sensorGeometry"]["channelDepthCm"]),
            "channelWidthM": float(raw["sensorGeometry"].get("channelWidthM", 2.0)),
            "reachLengthM": float(raw["sensorGeometry"].get("reachLengthM", 100.0)),
            "invalidDistanceRangeCm": tuple(raw["thresholds"]["invalidDistanceRangeCm"]),
            "waterLevelCm": dict(raw["thresholds"]["waterLevelCm"]),
            "riseRateCmPerMin": dict(raw["thresholds"]["riseRateCmPerMin"]),
        }
        return config, f"shared/pluvstats.config.json ({SHARED_CONFIG_PATH})"
    except (OSError, KeyError, TypeError, ValueError, json.JSONDecodeError):
        return dict(DEFAULT_CONFIG), "valores padrão embutidos (configuração compartilhada indisponível)"


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


def parse_iso(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


def default_state(config: dict) -> dict:
    """Estado inicial com quatro pontos e três séries de exemplo."""
    state = {
        "version": STATE_VERSION,
        "createdAt": now_iso(),
        "points": [dict(point) for point in POINTS],
        "readings": [],
    }
    base = datetime.now(timezone.utc) - timedelta(minutes=20)
    examples = [
        ("PS-01", SCENARIOS["1"], "exemplo"),
        ("PS-02", SCENARIOS["2"], "exemplo"),
        ("PS-03", SCENARIOS["3"], "exemplo"),
    ]
    for point_id, scenario, origin in examples:
        for offset, distance in scenario["readings"]:
            recorded_at = base + timedelta(seconds=offset)
            _append_reading(state, point_id, float(distance), recorded_at, origin, config)
    return state


def save_state(state: dict) -> None:
    """Grava o estado de forma atômica para não corromper o JSON."""
    try:
        DATA_DIR.mkdir(parents=True, exist_ok=True)
        temporary = STATE_PATH.with_suffix(".json.tmp")
        temporary.write_text(json.dumps(state, ensure_ascii=False, indent=2), encoding="utf-8")
        temporary.replace(STATE_PATH)
    except OSError as error:
        raise AppError(f"Não foi possível gravar {STATE_PATH}: {error}") from error


def load_state(config: dict) -> dict:
    """Lê o JSON; se estiver ausente ou inválido, recria o estado inicial."""
    if not STATE_PATH.exists():
        state = default_state(config)
        save_state(state)
        return state
    try:
        state = json.loads(STATE_PATH.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        print(f"[aviso] Estado ilegível ({error}). Recriando com dados de exemplo.")
        state = default_state(config)
        save_state(state)
        return state

    if not isinstance(state, dict) or state.get("version") != STATE_VERSION:
        print("[aviso] Versão de estado desconhecida. Recriando com dados de exemplo.")
        state = default_state(config)
        save_state(state)
        return state
    if not isinstance(state.get("points"), list) or not isinstance(state.get("readings"), list):
        print("[aviso] Estado incompleto. Recriando com dados de exemplo.")
        state = default_state(config)
        save_state(state)
    return state


# ---------------------------------------------------------------------------
# Cálculos (mesmas fórmulas do módulo de matemática)
# ---------------------------------------------------------------------------


def water_level_cm(distance_cm: float, config: dict) -> float:
    distance = float(distance_cm)
    if not math.isfinite(distance):
        raise AppError("A distância precisa ser um número finito.")
    if distance < 0:
        raise AppError("A distância não pode ser negativa.")
    level = config["sensorHeightCm"] - distance
    return min(float(config["channelDepthCm"]), max(0.0, level))


def rise_rate_cm_per_min(previous_level: float, current_level: float, elapsed_seconds: float) -> float:
    if not math.isfinite(elapsed_seconds) or elapsed_seconds <= 0:
        raise AppError("O intervalo entre leituras precisa ser positivo.")
    return (current_level - previous_level) / (elapsed_seconds / 60.0)


def time_to_limit_minutes(current_level: float, limit: float, rate: float | None) -> float | None:
    if current_level >= limit:
        return 0.0
    if rate is None or not math.isfinite(rate) or rate <= 0:
        return None
    return (limit - current_level) / rate


def severity_from_value(value: float | None, limits: dict) -> str:
    """Classifica um valor em normal/atenção/alerta/crítico com if/elif/else."""
    if value is None or not math.isfinite(value):
        return "normal"
    if value >= limits["critical"]:
        return "crítico"
    elif value >= limits["alert"]:
        return "alerta"
    elif value >= limits["attention"]:
        return "atenção"
    else:
        return "normal"


def severity_for(level: float, rate: float | None, config: dict) -> str:
    """A severidade final é a mais grave entre nível e taxa de elevação."""
    level_severity = severity_from_value(level, config["waterLevelCm"])
    rate_severity = severity_from_value(rate, config["riseRateCmPerMin"]) if rate is not None else "normal"
    return max((level_severity, rate_severity), key=lambda item: SEVERITY_ORDER[item])


def accumulated_volume_m3(readings: list[dict], config: dict) -> float:
    """Volume líquido acumulado no trecho: V = largura × comprimento × Δh / 100.

    É a integral da vazão líquida Q(t) = w · L · h'(t) no intervalo. O trecho é
    uma hipótese didática de 100 m, não uma calibração hidráulica.
    """
    if len(readings) < 2:
        return 0.0
    delta_level_cm = float(readings[-1]["levelCm"]) - float(readings[0]["levelCm"])
    return config["channelWidthM"] * config["reachLengthM"] * delta_level_cm / 100.0


# ---------------------------------------------------------------------------
# Estado e leituras
# ---------------------------------------------------------------------------


def find_point(state: dict, point_id: str) -> dict:
    for point in state["points"]:
        if point["id"].lower() == point_id.lower():
            return point
    raise AppError(f"Ponto '{point_id}' não encontrado. Use um ID da lista.")


def point_readings(state: dict, point_id: str) -> list[dict]:
    readings = [item for item in state["readings"] if item["pointId"] == point_id]
    return sorted(readings, key=lambda item: item["recordedAt"])


def validate_distance(text: str, config: dict) -> float:
    try:
        distance = float(text.replace(",", "."))
    except (TypeError, ValueError) as error:
        raise AppError("Digite um número, por exemplo 78 ou 78,5.") from error
    if not math.isfinite(distance):
        raise AppError("A distância precisa ser um número finito.")
    minimum, maximum = config["invalidDistanceRangeCm"]
    if distance < minimum or distance > maximum:
        raise AppError(f"A distância deve ficar entre {minimum:g} cm e {maximum:g} cm.")
    return distance


def _append_reading(
    state: dict,
    point_id: str,
    distance_cm: float,
    recorded_at: datetime,
    origin: str,
    config: dict,
) -> dict:
    point = find_point(state, point_id)
    # Normaliza para segundos inteiros: o JSON e o cálculo de taxa usam a mesma
    # precisão, evitando diferenças artificiais de alguns milissegundos.
    recorded_at = recorded_at.astimezone(timezone.utc).replace(microsecond=0)
    level = water_level_cm(distance_cm, config)
    previous = [item for item in state["readings"] if item["pointId"] == point["id"]]
    previous.sort(key=lambda item: item["recordedAt"])
    rate = None
    if previous:
        last = previous[-1]
        elapsed = (recorded_at - parse_iso(last["recordedAt"])).total_seconds()
        if elapsed > 0:
            rate = rise_rate_cm_per_min(float(last["levelCm"]), level, elapsed)
    severity = severity_for(level, rate, config)
    limit = config["waterLevelCm"]["critical"]
    reading = {
        "pointId": point["id"],
        "distanceCm": round(distance_cm, 2),
        "levelCm": round(level, 2),
        "rateCmPerMin": None if rate is None else round(rate, 2),
        "timeToLimitMinutes": None if time_to_limit_minutes(level, limit, rate) is None
        else round(time_to_limit_minutes(level, limit, rate), 2),
        "severity": severity,
        "origin": origin,
        "recordedAt": recorded_at.astimezone(timezone.utc).isoformat(timespec="seconds"),
    }
    state["readings"].append(reading)
    return reading


def add_manual_reading(state: dict, point_id: str, distance_cm: float, config: dict) -> dict:
    return _append_reading(state, point_id, distance_cm, datetime.now(timezone.utc), "manual", config)


def apply_scenario(state: dict, scenario_key: str, point_id: str, config: dict) -> int:
    scenario = SCENARIOS[scenario_key]
    base = datetime.now(timezone.utc) - timedelta(seconds=scenario["readings"][-1][0] + 5)
    for offset, distance in scenario["readings"]:
        _append_reading(state, point_id, float(distance), base + timedelta(seconds=offset), "cenário", config)
    return len(scenario["readings"])


# ---------------------------------------------------------------------------
# Apresentação no terminal
# ---------------------------------------------------------------------------


def format_number(value: float | None, unit: str = "", digits: int = 1) -> str:
    if value is None:
        return "—"
    text = f"{value:.{digits}f}".replace(".", ",")
    return f"{text} {unit}".strip()


def print_header(title: str) -> None:
    print()
    print("=" * 78)
    print(f" PLUVSTATS · {title}")
    print("=" * 78)


def print_menu(config: dict, config_origin: str) -> None:
    print_header("Console de monitoramento demonstrativo")
    print(f" Limiares: atenção {config['waterLevelCm']['attention']:g} cm · "
          f"alerta {config['waterLevelCm']['alert']:g} cm · "
          f"crítico {config['waterLevelCm']['critical']:g} cm")
    print(f" Origem da configuração: {config_origin}")
    print("-" * 78)
    print(" 1  Listar pontos monitorados")
    print(" 2  Registrar leitura manual")
    print(" 3  Gerar relatório consolidado")
    print(" 4  Ver histórico de um ponto")
    print(" 5  Carregar cenário de exemplo")
    print(" 6  Reiniciar dados de exemplo")
    print(" 0  Sair")
    print("-" * 78)


def list_points(state: dict, config: dict) -> None:
    print_header("Pontos monitorados")
    print(f"{'ID':<6} {'Ponto':<20} {'Bairro':<22} {'Nível':>8} {'Taxa':>10} {'Severidade':<10}")
    print("-" * 78)
    for point in state["points"]:
        readings = point_readings(state, point["id"])
        last = readings[-1] if readings else None
        level = format_number(last["levelCm"] if last else None, "cm")
        rate = format_number(last["rateCmPerMin"] if last else None, "cm/min")
        severity = last["severity"] if last else "sem leitura"
        print(f"{point['id']:<6} {point['name']:<20} {point['neighborhood']:<22} "
              f"{level:>8} {rate:>10} {severity:<10}")
    print("-" * 78)
    print(f"Total: {len(state['points'])} ponto(s) · {len(state['readings'])} leitura(s) registrada(s).")


def show_history(state: dict, point_id: str, config: dict) -> None:
    point = find_point(state, point_id)
    readings = point_readings(state, point["id"])
    print_header(f"Histórico · {point['id']} — {point['name']}")
    if not readings:
        print("Nenhuma leitura registrada para este ponto.")
        return
    print(f"{'Quando (UTC)':<21} {'Distância':>10} {'Nível':>8} {'Taxa':>10} {'Até limite':>11} {'Severidade':<10}")
    print("-" * 78)
    for reading in readings[-15:]:
        when = reading["recordedAt"].replace("T", " ")[:19]
        rate = format_number(reading["rateCmPerMin"], "cm/min")
        eta = format_number(reading["timeToLimitMinutes"], "min")
        print(f"{when:<21} {format_number(reading['distanceCm'], 'cm'):>10} "
              f"{format_number(reading['levelCm'], 'cm'):>8} {rate:>10} {eta:>11} "
              f"{reading['severity']:<10}")
    print("-" * 78)
    print(f"{len(readings)} leitura(s). Exibindo as 15 mais recentes. "
          f"Volume líquido acumulado: {format_number(accumulated_volume_m3(readings, config), 'm³')}.")


def show_report(state: dict, config: dict) -> None:
    print_header("Relatório consolidado")
    totals = {"normal": 0, "atenção": 0, "alerta": 0, "crítico": 0}
    for point in state["points"]:
        readings = point_readings(state, point["id"])
        if not readings:
            print(f"{point['id']} · {point['name']}: sem leitura.")
            continue
        last = readings[-1]
        totals[last["severity"]] = totals.get(last["severity"], 0) + 1
        volume = accumulated_volume_m3(readings, config)
        print(f"{point['id']} · {point['name']} ({point['neighborhood']})")
        print(f"   {len(readings)} leitura(s) · nível {format_number(last['levelCm'], 'cm')} · "
              f"taxa {format_number(last['rateCmPerMin'], 'cm/min')} · "
              f"até o limite {format_number(last['timeToLimitMinutes'], 'min')}")
        print(f"   severidade {last['severity']} · volume líquido acumulado {format_number(volume, 'm³')}")
    print("-" * 78)
    print("Situação por severidade (última leitura de cada ponto):")
    for severity in ("crítico", "alerta", "atenção", "normal"):
        print(f"   {severity:<9} {totals.get(severity, 0)} ponto(s)")
    print("-" * 78)
    print("Os dados são demonstrativos. O volume usa um trecho hipotético de "
          f"{config['reachLengthM']:g} m × {config['channelWidthM']:g} m; não é calibração hidráulica.")


def choose_point(state: dict, prompt: str = "ID do ponto") -> str:
    while True:
        value = input(f"{prompt} (ex.: PS-01, ou vazio para cancelar): ").strip()
        if not value:
            return ""
        try:
            find_point(state, value)
            return value.upper()
        except AppError as error:
            print(f"[erro] {error}")


def action_register(state: dict, config: dict) -> None:
    point_id = choose_point(state)
    if not point_id:
        print("Operação cancelada.")
        return
    while True:
        text = input("Distância medida pelo sensor em cm (vazio cancela): ").strip()
        if not text:
            print("Operação cancelada.")
            return
        try:
            distance = validate_distance(text, config)
            reading = add_manual_reading(state, point_id, distance, config)
            save_state(state)
            print(f"[ok] Leitura registrada em {point_id}: nível {format_number(reading['levelCm'], 'cm')}, "
                  f"taxa {format_number(reading['rateCmPerMin'], 'cm/min')}, "
                  f"severidade {reading['severity']}.")
            return
        except AppError as error:
            print(f"[erro] {error}")


def action_scenario(state: dict, config: dict, scenario_key: str) -> None:
    scenario = SCENARIOS[scenario_key]
    print(f"\nCenário: {scenario['label']} — {scenario['description']}")
    point_id = choose_point(state)
    if not point_id:
        print("Operação cancelada.")
        return
    count = apply_scenario(state, scenario_key, point_id, config)
    save_state(state)
    print(f"[ok] {count} leituras do cenário '{scenario['label']}' adicionadas a {point_id}.")


def action_reset(state: dict, config: dict) -> dict:
    answer = input("Isso apaga as leituras salvas e recria os exemplos. Confirmar? [s/N]: ").strip().lower()
    if answer not in {"s", "sim", "y", "yes"}:
        print("Operação cancelada.")
        return state
    new_state = default_state(config)
    save_state(new_state)
    print("[ok] Dados restaurados para o estado de exemplo.")
    return new_state


# ---------------------------------------------------------------------------
# Menu principal
# ---------------------------------------------------------------------------


def run_menu(config: dict, config_origin: str) -> None:
    state = load_state(config)
    while True:
        print_menu(config, config_origin)
        choice = input("Escolha uma opção: ").strip()
        try:
            match choice:
                case "1":
                    list_points(state, config)
                case "2":
                    action_register(state, config)
                case "3":
                    show_report(state, config)
                case "4":
                    point_id = choose_point(state)
                    if point_id:
                        show_history(state, point_id, config)
                case "5":
                    print("\n 1 Canal estável   2 Elevação sustentada   3 Drenagem   0 Cancelar")
                    scenario_key = input("Cenário: ").strip()
                    if scenario_key in SCENARIOS:
                        action_scenario(state, config, scenario_key)
                    elif scenario_key != "0":
                        print("[erro] Cenário inválido.")
                case "6":
                    state = action_reset(state, config)
                case "0":
                    save_state(state)
                    print("\nAté logo. Os dados ficaram salvos em data/estado.json.")
                    return
                case _:
                    print("[erro] Opção inválida. Digite um número do menu.")
        except (AppError, KeyboardInterrupt) as error:
            if isinstance(error, KeyboardInterrupt):
                print("\nOperação interrompida.")
            else:
                print(f"[erro] {error}")


def main() -> int:
    if hasattr(sys.stdout, "reconfigure"):
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    config, origin = load_config()
    if "--report" in sys.argv:
        state = load_state(config)
        show_report(state, config)
        return 0
    try:
        run_menu(config, origin)
    except KeyboardInterrupt:
        print("\nExecução encerrada.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
