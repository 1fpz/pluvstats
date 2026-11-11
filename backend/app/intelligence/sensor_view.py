"""Read model for sensors.

The view always states provenance. A hardware sensor is only `validated` after
a recent, structurally valid reading received through the hardware endpoint.
"""

from __future__ import annotations

from datetime import datetime

from app.models.enums import severity_rank


def active_alert_by_sensor(alerts: list[dict]) -> dict[str, dict]:
    selected: dict[str, dict] = {}
    for alert in alerts:
        if alert.get("status") == "resolved":
            continue
        current = selected.get(alert["sensorId"])
        if current is None or severity_rank(alert.get("severity")) > severity_rank(current.get("severity")):
            selected[alert["sensorId"]] = alert
        elif severity_rank(alert.get("severity")) == severity_rank(current.get("severity")):
            if alert.get("openedAt", "") > current.get("openedAt", ""):
                selected[alert["sensorId"]] = alert
    return selected


def derive_sensor_view(
    sensor: dict,
    simulation: dict | None,
    *,
    config: dict,
    now: datetime,
    active_alert: dict | None = None,
) -> dict:
    thresholds = config["thresholds"]
    geometry = config["sensorGeometry"]

    if sensor.get("source") == "hardware":
        age_seconds = None
        if sensor.get("lastReadingAt"):
            try:
                age_seconds = max(
                    0.0,
                    (now - datetime.fromisoformat(str(sensor["lastReadingAt"]))).total_seconds(),
                )
            except ValueError:
                age_seconds = None
        validated = bool(
            sensor.get("lastReadingAt")
            and sensor.get("lastReadingSource") == "hardware"
            and sensor.get("lastReadingQuality") == "valid"
            and age_seconds is not None
            and age_seconds <= thresholds["staleReadingSeconds"]
        )
        quality = sensor.get("lastReadingQuality") or "unknown"
        if quality == "invalid":
            status = "fault_invalid"
        elif validated:
            status = "hardware_validated"
        elif sensor.get("lastReadingAt"):
            status = "hardware_stale"
        else:
            status = "hardware_unvalidated"
        view = {
            **sensor,
            "levelCm": sensor.get("lastReadingLevelCm") if quality != "invalid" else None,
            "rateCmPerMin": None,
            "distanceCm": sensor.get("lastReadingDistanceCm"),
            "quality": quality,
            "status": status,
            "validated": validated,
            "connectivityProof": (
                "Leitura física recente, estrutura válida e origem confirmada."
                if validated
                else "Não há leitura física recente e válida que comprove conectividade."
            ),
            "readingAgeSeconds": age_seconds,
            "history": [],
            "lastReadingAt": sensor.get("lastReadingAt"),
            "simulated": False,
        }
    else:
        runtime = ((simulation or {}).get("sensors") or {}).get(sensor["id"])
        if not runtime:
            view = {
                **sensor,
                "levelCm": None,
                "rateCmPerMin": None,
                "distanceCm": None,
                "quality": "unknown",
                "status": "simulation_unavailable",
                "validated": False,
                "connectivityProof": "Simulação ainda não inicializada.",
                "readingAgeSeconds": None,
                "history": [],
                "lastReadingAt": None,
                "simulated": True,
            }
        else:
            paused = not bool((simulation or {}).get("running"))
            status = (
                "fault_offline"
                if runtime.get("fault") == "offline"
                else "fault_invalid"
                if runtime.get("fault") == "invalid"
                else "simulation_paused"
                if paused
                else "simulation_active"
            )
            age_seconds = None
            if runtime.get("lastReadingAt"):
                try:
                    age_seconds = max(
                        0.0,
                        (now - datetime.fromisoformat(str(runtime["lastReadingAt"]))).total_seconds(),
                    )
                except ValueError:
                    age_seconds = None
            level = None if runtime.get("fault") else runtime.get("levelCm")
            view = {
                **sensor,
                "levelCm": round(float(level), 2) if level is not None else None,
                "rateCmPerMin": (
                    round(float(runtime.get("rateCmPerMin") or 0), 2)
                    if not runtime.get("fault")
                    else None
                ),
                "distanceCm": (
                    round(geometry["sensorHeightCm"] - float(level), 2)
                    if level is not None
                    else None
                ),
                "quality": (
                    "invalid"
                    if runtime.get("fault") == "invalid"
                    else "missing"
                    if runtime.get("fault") == "offline"
                    else "valid"
                ),
                "status": status,
                "validated": False,
                "connectivityProof": (
                    "Leitura gerada pelo simulador. Não comprova conectividade de hardware físico."
                ),
                "readingAgeSeconds": age_seconds,
                "history": runtime.get("history", []),
                "lastReadingAt": runtime.get("lastReadingAt"),
                "simulated": True,
            }

    view["alertSeverity"] = (active_alert or {}).get("severity")
    view["activeAlertId"] = (active_alert or {}).get("id")
    return view
