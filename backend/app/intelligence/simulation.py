"""Deterministic demonstration simulator.

It is a scenario model, not calibrated hydraulics. The same state and timestamp
produce the same frame. Hardware never enters this module.
"""

from __future__ import annotations

import math
from datetime import datetime, timedelta, timezone

SIMULATION_VERSION = 2


def clamp(value: float, minimum: float, maximum: float) -> float:
    return min(maximum, max(minimum, value))


def _hash_unit(seed: float) -> float:
    value = math.sin(seed * 12.9898 + 78.233) * 43758.5453
    return value - math.floor(value)


def _iso(now: datetime, offset_seconds: float = 0) -> str:
    return (now + timedelta(seconds=offset_seconds)).isoformat()


def _create_history(sensor: dict, level_cm: float, now: datetime, config: dict, points: int = 40) -> list[dict]:
    depth = config["sensorGeometry"]["channelDepthCm"]
    history = []
    for index in range(points - 1, -1, -1):
        offset = -index * 60
        wave = math.sin((points - index + sensor.get("phase", 0)) / 4.2) * 0.55
        level = clamp(level_cm + wave, 0, depth)
        history.append(
            {
                "t": _iso(now, offset),
                "levelCm": round(level, 2),
                "rateCmPerMin": 0,
            }
        )
    return history


def create_simulation_state(
    sensors: list[dict],
    config: dict,
    *,
    now: datetime,
    scenario: str = "normal",
    running: bool = True,
) -> dict:
    depth = config["sensorGeometry"]["channelDepthCm"]
    runtime = {}
    for sensor in sensors:
        if sensor.get("source") != "simulation":
            continue
        initial_level = clamp(sensor.get("baselineLevelCm") or 6, 0, depth)
        runtime[sensor["id"]] = {
            "levelCm": initial_level,
            "rateCmPerMin": 0,
            "status": "simulation_active" if running else "simulation_paused",
            "fault": None,
            "lastReadingAt": _iso(now),
            "history": _create_history(sensor, initial_level, now, config),
            "tickCount": 0,
        }
    return {
        "version": SIMULATION_VERSION,
        "running": running,
        "scenario": scenario if scenario in config["simulation"]["scenarios"] else "normal",
        "startedAt": _iso(now),
        "lastTickAt": _iso(now),
        "elapsedSeconds": 0,
        "tickCount": 0,
        "sensors": runtime,
        "hydrologyNote": (
            "Modelo de cenário: o nível converge para um alvo por sensor, com drenagem "
            "e oscilação determinística. Não é hidráulica calibrada."
        ),
    }


def build_reading(
    sensor: dict,
    runtime: dict,
    config: dict,
    now: datetime,
    scenario: str,
) -> dict:
    geometry = config["sensorGeometry"]
    thresholds = config["thresholds"]
    scenario_meta = config["simulation"]["scenarios"].get(
        scenario, config["simulation"]["scenarios"]["normal"]
    )
    is_valid = runtime.get("status") != "fault_invalid" and runtime.get("fault") != "invalid"
    has_signal = runtime.get("fault") != "offline" and runtime.get("status") != "fault_offline"

    valid_distance = geometry["sensorHeightCm"] - (runtime.get("levelCm") or geometry["dryDistanceCm"])
    distance = round(valid_distance, 2) if is_valid and has_signal else None
    level = round(runtime.get("levelCm") or 0, 2) if is_valid and has_signal else None
    min_distance, max_distance = thresholds["invalidDistanceRangeCm"]
    range_valid = distance is not None and min_distance <= distance <= max_distance

    return {
        "sensorId": sensor["id"],
        "deviceId": sensor["deviceId"],
        "timestamp": (runtime.get("lastReadingAt") or _iso(now)) if has_signal else _iso(now),
        "distanceCm": distance,
        "waterLevelCm": level,
        "source": "simulation",
        "quality": "valid" if has_signal and is_valid and range_valid else "invalid" if has_signal else "missing",
        "status": runtime.get("status", "simulation_active"),
        "metadata": {
            "scenario": scenario,
            "simulated": True,
            "rain_mm_h": scenario_meta.get("rainMmH", 0),
            "rate_cm_per_min": round(runtime.get("rateCmPerMin") or 0, 2),
            "sensor_height_cm": geometry["sensorHeightCm"],
            "last_valid_reading_at": runtime.get("lastReadingAt") if has_signal else None,
            "tick": runtime.get("tickCount", 0),
        },
    }


def tick_simulation(
    state: dict,
    sensors: list[dict],
    config: dict,
    *,
    now: datetime,
) -> tuple[dict, list[dict]]:
    if not state:
        return state, []
    simulated = [sensor for sensor in sensors if sensor.get("source") == "simulation"]

    if not state.get("running"):
        readings = []
        for sensor in simulated:
            runtime = state.get("sensors", {}).get(sensor["id"])
            if runtime:
                readings.append(build_reading(sensor, runtime, config, now, state["scenario"]))
        return state, readings

    tick_seconds = config["simulation"]["tickSeconds"]
    scenario = config["simulation"]["scenarios"].get(
        state.get("scenario"), config["simulation"]["scenarios"]["normal"]
    )
    depth = config["sensorGeometry"]["channelDepthCm"]
    elapsed = state.get("elapsedSeconds", 0) + tick_seconds
    tick_count = state.get("tickCount", 0) + 1
    next_sensors: dict[str, dict] = {}
    readings: list[dict] = []

    for index, sensor in enumerate(simulated):
        previous = state.get("sensors", {}).get(sensor["id"])
        if not previous:
            continue
        runtime = dict(previous)
        runtime["tickCount"] = tick_count

        if runtime.get("fault") == "offline":
            runtime["status"] = "fault_offline"
            next_sensors[sensor["id"]] = runtime
            readings.append(build_reading(sensor, runtime, config, now, state["scenario"]))
            continue

        if runtime.get("fault") == "invalid":
            runtime["status"] = "fault_invalid"
            next_sensors[sensor["id"]] = runtime
            reading = build_reading(sensor, runtime, config, now, state["scenario"])
            reading["distanceCm"] = -7
            reading["waterLevelCm"] = None
            reading["quality"] = "invalid"
            readings.append(reading)
            continue

        target = scenario["targetLevelCm"] * (sensor.get("targetFactor") or 1)
        tau = max(45, scenario["approachSeconds"] / (sensor.get("responseFactor") or 1))
        k = 1 - math.exp(-tick_seconds / tau)
        oscillation = (
            math.sin((elapsed + sensor.get("phase", 0) * 10) / 17) * 0.3
            + math.sin((elapsed + sensor.get("phase", 0) * 3) / 6.5) * 0.1
        )
        jitter = (_hash_unit(tick_count + index * 17 + sensor.get("phase", 0) * 10) - 0.5) * 0.12
        current_level = runtime.get("levelCm") or 0
        delta = (target - current_level) * k + oscillation * 0.1 + jitter
        next_level = clamp(current_level + delta, 0, depth * 0.98)
        instant_rate = (next_level - current_level) / (tick_seconds / 60)
        smoothed_rate = (runtime.get("rateCmPerMin") or 0) * 0.55 + instant_rate * 0.45

        runtime["levelCm"] = next_level
        runtime["rateCmPerMin"] = clamp(smoothed_rate, -25, 25)
        runtime["status"] = "simulation_active"
        runtime["lastReadingAt"] = _iso(now)
        history = list(runtime.get("history", []))
        history.append(
            {
                "t": _iso(now),
                "levelCm": round(next_level, 2),
                "rateCmPerMin": round(runtime["rateCmPerMin"], 2),
            }
        )
        runtime["history"] = history[-int(config["simulation"]["seriesPoints"]) :]
        next_sensors[sensor["id"]] = runtime
        readings.append(build_reading(sensor, runtime, config, now, state["scenario"]))

    next_state = {
        **state,
        "sensors": next_sensors,
        "elapsedSeconds": elapsed,
        "tickCount": tick_count,
        "lastTickAt": _iso(now),
    }
    return next_state, readings


def _touch_runtime(runtime: dict, level: float, now: datetime, rate_cm_per_min: float, config: dict) -> dict:
    depth = config["sensorGeometry"]["channelDepthCm"]
    next_level = clamp(level, 0, depth * 0.98)
    history = list(runtime.get("history", []))
    history.append(
        {
            "t": _iso(now),
            "levelCm": round(next_level, 2),
            "rateCmPerMin": rate_cm_per_min,
        }
    )
    return {
        **runtime,
        "levelCm": next_level,
        "rateCmPerMin": rate_cm_per_min,
        "status": "simulation_active",
        "lastReadingAt": _iso(now),
        "history": history[-60:],
    }


def apply_simulation_command(
    state: dict,
    command: dict,
    sensors: list[dict],
    config: dict,
    *,
    now: datetime,
) -> dict:
    if not state or not command.get("action"):
        return state
    action = command["action"]
    target_id = command.get("sensorId")
    next_sensors = dict(state.get("sensors", {}))

    if action == "start":
        return {
            **state,
            "running": True,
            "lastTickAt": _iso(now),
            "sensors": {
                key: {
                    **runtime,
                    "status": runtime.get("status") if runtime.get("fault") else "simulation_active",
                }
                for key, runtime in next_sensors.items()
            },
        }

    if action == "pause":
        return {
            **state,
            "running": False,
            "sensors": {
                key: runtime
                if runtime.get("fault")
                else {**runtime, "status": "simulation_paused"}
                for key, runtime in next_sensors.items()
            },
        }

    if action == "reset":
        return create_simulation_state(sensors, config, now=now, scenario="normal", running=True)

    if action == "set_scenario":
        scenario = command.get("scenario")
        if scenario not in config["simulation"]["scenarios"]:
            scenario = state.get("scenario", "normal")
        return {**state, "scenario": scenario, "running": state.get("running", True)}

    if action in {"raise", "lower", "drain", "set_level"}:
        amount = float(command.get("amountCm") or 0)
        for sensor_id, runtime in next_sensors.items():
            if target_id and sensor_id != target_id:
                continue
            level = runtime.get("levelCm") or 0
            rate = runtime.get("rateCmPerMin") or 0
            if action == "raise":
                level += amount or 7
                rate = max(rate, 2.4)
            elif action == "lower":
                level -= amount or 7
                rate = min(rate, -1.2)
            elif action == "drain":
                level -= amount or 12
                rate = -3.4
            elif action == "set_level":
                level = amount
                rate = 2 if level > (runtime.get("levelCm") or 0) else -2
            next_sensors[sensor_id] = _touch_runtime(runtime, level, now, round(rate, 2), config)
        return {**state, "sensors": next_sensors, "lastTickAt": _iso(now)}

    if action == "inject_fault":
        fault = "invalid" if command.get("fault") == "invalid" else "offline"
        for sensor_id, runtime in next_sensors.items():
            if target_id and sensor_id != target_id:
                continue
            next_sensors[sensor_id] = {
                **runtime,
                "fault": fault,
                "status": "fault_offline" if fault == "offline" else "fault_invalid",
            }
        return {**state, "sensors": next_sensors, "lastTickAt": _iso(now)}

    if action == "recover":
        for sensor_id, runtime in next_sensors.items():
            if target_id and sensor_id != target_id:
                continue
            next_sensors[sensor_id] = {
                **runtime,
                "fault": None,
                "status": "simulation_active" if state.get("running") else "simulation_paused",
                "lastReadingAt": _iso(now),
                "rateCmPerMin": 0,
            }
        return {**state, "sensors": next_sensors, "lastTickAt": _iso(now)}

    return state


def now_utc() -> datetime:
    return datetime.now(timezone.utc)
