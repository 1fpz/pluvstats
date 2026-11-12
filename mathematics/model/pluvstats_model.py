"""Pure level, rate and time-to-limit model for PLUVSTATS.

The model is intentionally small and explicit. It is not a hydraulic simulation
and it does not forecast floods: it converts a measured distance into a water
level, computes a linear rate and extrapolates that rate while it is assumed
constant.

All geometry and limits come from `shared/pluvstats.config.json`, the same file
used by the frontend and the API.
"""

from __future__ import annotations

import json
import math
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
SHARED_CONFIG_PATH = REPO_ROOT / "shared" / "pluvstats.config.json"


class ModelError(ValueError):
    """Raised when an input would make the formulas meaningless."""


def load_shared_config(path: str | Path | None = None) -> dict:
    source = Path(path) if path is not None else SHARED_CONFIG_PATH
    return json.loads(source.read_text(encoding="utf-8"))


def _geometry(config: dict | None) -> dict:
    return (config or load_shared_config())["sensorGeometry"]


def water_level_cm(distance_cm: float, *, config: dict | None = None) -> float:
    """Return h = H - d, clamped to the physical channel.

    H is the sensor height above the channel bottom and d is the measured
    distance from the sensor to the water surface. A distance larger than H is
    dry channel (h = 0). A negative distance is rejected: it cannot be produced
    by the sensor and would silently create a fictitious level.
    """
    geometry = _geometry(config)
    distance = float(distance_cm)
    if not math.isfinite(distance):
        raise ModelError("distance_cm must be finite")
    if distance < 0:
        raise ModelError("distance_cm must be >= 0")

    level = geometry["sensorHeightCm"] - distance
    return min(float(geometry["channelDepthCm"]), max(0.0, level))


def rise_rate_cm_per_min(
    previous_level_cm: float,
    current_level_cm: float,
    elapsed_seconds: float,
) -> float:
    """Return v = delta_h / delta_t expressed in cm/min.

    The sign is preserved: a negative value means the level is falling.
    """
    elapsed = float(elapsed_seconds)
    if not math.isfinite(elapsed) or elapsed <= 0:
        raise ModelError("elapsed_seconds must be a positive finite number")

    delta = float(current_level_cm) - float(previous_level_cm)
    return delta / (elapsed / 60.0)


def time_to_limit_minutes(
    current_level_cm: float,
    limit_cm: float,
    rate_cm_per_min: float,
) -> float | None:
    """Return t = (h_limit - h_current) / v, or None when undefined.

    - at or above the limit: 0 minutes (already there);
    - rate <= 0: None, because the linear model never reaches a higher limit;
    - otherwise: non-negative minutes.

    The result is only meaningful while the rate is assumed constant.
    """
    current = float(current_level_cm)
    limit = float(limit_cm)
    rate = float(rate_cm_per_min)

    if current >= limit:
        return 0.0
    if not math.isfinite(rate) or rate <= 0:
        return None
    return (limit - current) / rate


def project_level_cm(
    current_level_cm: float,
    rate_cm_per_min: float,
    minutes: float,
    *,
    config: dict | None = None,
) -> float:
    """Extrapolate h(t + dt) = h + v * dt, clamped to the channel."""
    horizon = float(minutes)
    if not math.isfinite(horizon) or horizon < 0:
        raise ModelError("minutes must be a non-negative finite number")
    geometry = _geometry(config)
    level = float(current_level_cm) + float(rate_cm_per_min) * horizon
    return min(float(geometry["channelDepthCm"]), max(0.0, level))


def linear_trend_cm_per_min(
    elapsed_seconds: list[float] | tuple[float, ...],
    levels_cm: list[float] | tuple[float, ...],
) -> float:
    """Least-squares slope over a short series, in cm/min.

    Requires at least three points and at least two distinct timestamps. This is
    a descriptive trend, not a forecast and not a substitute for a calibrated
    stage-discharge curve.
    """
    times = [float(value) for value in elapsed_seconds]
    levels = [float(value) for value in levels_cm]
    if len(times) != len(levels):
        raise ModelError("elapsed_seconds and levels_cm must have the same length")
    if len(times) < 3:
        raise ModelError("at least three points are required for a trend")

    mean_t = sum(times) / len(times)
    mean_h = sum(levels) / len(levels)
    denominator = sum((value - mean_t) ** 2 for value in times)
    if denominator == 0:
        raise ModelError("timestamps must contain at least two distinct values")

    numerator = sum(
        (value - mean_t) * (level - mean_h)
        for value, level in zip(times, levels, strict=True)
    )
    return (numerator / denominator) * 60.0


def level_series(
    readings: list[dict],
    *,
    config: dict | None = None,
) -> list[dict]:
    """Convert a scenario's distance readings into a validated level series."""
    series = []
    previous_t = None
    for reading in readings:
        t_seconds = float(reading["tSeconds"])
        if previous_t is not None and t_seconds <= previous_t:
            raise ModelError("scenario timestamps must be strictly increasing")
        previous_t = t_seconds
        series.append(
            {
                "tSeconds": t_seconds,
                "distanceCm": float(reading["distanceCm"]),
                "levelCm": water_level_cm(reading["distanceCm"], config=config),
            }
        )
    return series


def _validate_series(series: list[dict]) -> None:
    """Validate a level series before integrating it."""
    if len(series) < 2:
        raise ModelError("at least two points are required for an integral")
    previous_t = None
    for point in series:
        t_seconds = float(point["tSeconds"])
        level = float(point["levelCm"])
        if not math.isfinite(t_seconds) or not math.isfinite(level):
            raise ModelError("series values must be finite")
        if previous_t is not None and t_seconds <= previous_t:
            raise ModelError("timestamps must be strictly increasing")
        previous_t = t_seconds


def accumulated_volume_change_m3(
    series: list[dict],
    *,
    channel_width_m: float | None = None,
    reach_length_m: float | None = None,
    config: dict | None = None,
) -> float:
    """Net volume accumulated in a reach: V = w * L * delta_h / 100.

    This is the definite integral of the net inflow rate
    ``Q(t) = w * L * h'(t)`` over the sampled interval, in cubic metres. It uses
    an experimental reach (default 2 m x 100 m), not a hydraulic calibration.
    """
    _validate_series(series)
    geometry = _geometry(config)
    width = float(channel_width_m if channel_width_m is not None else geometry.get("channelWidthM", 2.0))
    length = float(reach_length_m if reach_length_m is not None else geometry.get("reachLengthM", 100.0))
    if not math.isfinite(width) or width <= 0:
        raise ModelError("channel_width_m must be a positive finite number")
    if not math.isfinite(length) or length <= 0:
        raise ModelError("reach_length_m must be a positive finite number")
    delta_level_cm = float(series[-1]["levelCm"]) - float(series[0]["levelCm"])
    return width * length * delta_level_cm / 100.0


def level_exposure_cm_minutes(series: list[dict]) -> float:
    """Integral of the level over time, in cm*min, by the trapezoidal rule.

    It answers "how much water level persisted over the interval" and is a
    didactic accumulated quantity, not a volume or a flood forecast.
    """
    _validate_series(series)
    total = 0.0
    for previous, current in zip(series, series[1:]):
        delta_minutes = (float(current["tSeconds"]) - float(previous["tSeconds"])) / 60.0
        if delta_minutes <= 0:
            raise ModelError("timestamps must be strictly increasing")
        total += (float(previous["levelCm"]) + float(current["levelCm"])) / 2.0 * delta_minutes
    return total


def long_run_level_cm(
    current_level_cm: float,
    rate_cm_per_min: float,
    *,
    config: dict | None = None,
) -> float:
    """Limit of the linear model as t -> infinity, clamped to the channel.

    With a positive constant rate the level grows until the physical channel
    depth; with a non-positive rate it stays at the current level. This is a
    mathematical limit of the model, not a field prediction.
    """
    current = float(current_level_cm)
    rate = float(rate_cm_per_min)
    if not math.isfinite(current):
        raise ModelError("current_level_cm must be finite")
    if not math.isfinite(rate):
        raise ModelError("rate_cm_per_min must be finite")
    depth = float(_geometry(config)["channelDepthCm"])
    if rate > 0:
        return depth
    return min(depth, max(0.0, current))


def scenario_metrics(scenario: dict, *, config: dict | None = None) -> dict:
    """Describe a scenario with the same formulas used in the documentation."""
    config = config or load_shared_config()
    geometry = _geometry(config)
    series = level_series(scenario["readings"], config=config)
    if len(series) < 2:
        raise ModelError("a scenario needs at least two readings")

    first, last = series[0], series[-1]
    elapsed = last["tSeconds"] - first["tSeconds"]
    rate = rise_rate_cm_per_min(first["levelCm"], last["levelCm"], elapsed)
    limit = float(scenario.get("limitCm", config["thresholds"]["waterLevelCm"]["critical"]))
    time_to_limit = time_to_limit_minutes(last["levelCm"], limit, rate)
    return {
        "name": scenario.get("name", "cenário"),
        "description": scenario.get("description", ""),
        "firstLevelCm": round(first["levelCm"], 2),
        "lastLevelCm": round(last["levelCm"], 2),
        "elapsedSeconds": elapsed,
        "rateCmPerMin": round(rate, 2),
        "limitCm": limit,
        "timeToLimitMinutes": None if time_to_limit is None else round(time_to_limit, 2),
        "channelWidthM": float(geometry.get("channelWidthM", 2.0)),
        "reachLengthM": float(geometry.get("reachLengthM", 100.0)),
        "accumulatedVolumeM3": round(accumulated_volume_change_m3(series, config=config), 2),
        "levelExposureCmMinutes": round(level_exposure_cm_minutes(series), 2),
        "series": series,
    }


__all__ = [
    "ModelError",
    "accumulated_volume_change_m3",
    "level_exposure_cm_minutes",
    "level_series",
    "linear_trend_cm_per_min",
    "load_shared_config",
    "long_run_level_cm",
    "project_level_cm",
    "rise_rate_cm_per_min",
    "scenario_metrics",
    "time_to_limit_minutes",
    "water_level_cm",
]
