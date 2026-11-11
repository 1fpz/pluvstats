"""Alert reconciliation engine.

Pure rule evaluation over sensors, readings and the current alert set. It is
deliberately explainable and conservative: an alert is closed only when the
condition disappears, and a hysteresis band avoids flapping near a threshold.
"""

from __future__ import annotations

from datetime import datetime

from app.intelligence.thresholds import severity_from_value
from app.models.enums import severity_rank
from app.repositories.base import base36

COPY = {
    "water_level": {
        "attention": {
            "title": "Nível de água em atenção",
            "description": "O nível se aproxima da faixa de atenção configurada.",
            "recommendation": "Acompanhar a evolução e verificar o ponto em campo antes de novas chuvas.",
        },
        "alert": {
            "title": "Nível de água em alerta",
            "description": "O nível ultrapassou o limite experimental de alerta.",
            "recommendation": "Priorizar vistoria do ponto e preparar sinalização preventiva.",
        },
        "critical": {
            "title": "Nível de água crítico",
            "description": "O nível alcançou a faixa crítica configurada para demonstração.",
            "recommendation": "Acionar procedimento de contingência e restringir circulação no entorno.",
        },
    },
    "rise_rate": {
        "attention": {
            "title": "Elevação acima do ritmo usual",
            "description": "A velocidade de elevação ultrapassou a faixa de atenção.",
            "recommendation": "Monitorar a tendência nos próximos ciclos e checar drenagem local.",
        },
        "alert": {
            "title": "Elevação acelerada",
            "description": "A velocidade de elevação ultrapassou o limite de alerta.",
            "recommendation": "Verificar obstruções e reforçar o acompanhamento do ponto.",
        },
        "critical": {
            "title": "Elevação crítica",
            "description": "A velocidade de elevação está na faixa crítica.",
            "recommendation": "Tratar como cenário de resposta rápida e comunicar a equipe técnica.",
        },
    },
    "communication": {
        "attention": {
            "title": "Comunicação indisponível",
            "description": "O dispositivo deixou de enviar leituras válidas dentro da janela esperada.",
            "recommendation": "Verificar alimentação, sinal e último horário de comunicação do dispositivo.",
        },
    },
    "invalid_reading": {
        "attention": {
            "title": "Leitura inválida recebida",
            "description": "A leitura não passou na validação de distância ou estrutura.",
            "recommendation": "Inspecionar o sensor e descartar a leitura antes de qualquer decisão.",
        },
    },
    "sensor_failure": {
        "alert": {
            "title": "Falha de sensor",
            "description": "O dispositivo reportou falha interna na última leitura.",
            "recommendation": "Programar manutenção e manter o ponto sob observação.",
        },
    },
}

ALERT_LABELS = {
    "water_level": "Nível de água",
    "rise_rate": "Velocidade de elevação",
    "communication": "Comunicação",
    "invalid_reading": "Leitura inválida",
    "sensor_failure": "Falha de sensor",
}


def _reading_payload(reading: dict | None, now_iso: str) -> dict | None:
    if not reading:
        return None
    metadata = reading.get("metadata") or {}
    return {
        "waterLevelCm": reading.get("waterLevelCm"),
        "rateCmPerMin": metadata.get("rate_cm_per_min"),
        "distanceCm": reading.get("distanceCm"),
        "timestamp": reading.get("timestamp") or now_iso,
    }


def _build_alert(
    *,
    sensor: dict,
    alert_type: str,
    severity: str,
    sensor_name: str,
    now_iso: str,
    reading: dict | None,
    metrics: dict,
) -> dict:
    copy = COPY.get(alert_type, {}).get(severity) or COPY["water_level"]["attention"]
    simulated = sensor.get("source") == "simulation"
    suffix = " (simulado)" if simulated else ""
    stamp = int(datetime.fromisoformat(now_iso).timestamp() * 1000)
    return {
        "id": f"ALT-{sensor['id']}-{alert_type}-{base36(stamp)}",
        "sensorId": sensor["id"],
        "sensorName": sensor_name,
        "deviceId": sensor.get("deviceId"),
        "type": alert_type,
        "severity": severity,
        "title": f"{copy['title']}{suffix}",
        "description": copy["description"],
        "recommendation": copy["recommendation"],
        "status": "active",
        "source": sensor.get("source", "simulation"),
        "simulated": simulated,
        "openedAt": now_iso,
        "lastObservedAt": now_iso,
        "acknowledgedAt": None,
        "resolvedAt": None,
        "resolvedAutomatically": False,
        "metrics": metrics or {},
        "reading": _reading_payload(reading, now_iso),
        "timeline": [
            {
                "at": now_iso,
                "kind": "opened",
                "severity": severity,
                "message": f"{ALERT_LABELS.get(alert_type, alert_type)} em {sensor_name}{suffix}.",
            }
        ],
    }


def _update_alert(existing: dict, severity: str, now_iso: str, reading: dict | None, metrics: dict) -> dict:
    escalated = severity_rank(severity) > severity_rank(existing["severity"])
    copy = COPY.get(existing["type"], {}).get(severity) or COPY["water_level"]["attention"]
    suffix = " (simulado)" if existing.get("simulated") else ""
    timeline = list(existing.get("timeline", []))[-10:]
    timeline.append(
        {
            "at": now_iso,
            "kind": "escalated" if escalated else "updated",
            "severity": severity,
            "message": "Severidade elevada pelo motor de regras."
            if escalated
            else "Severidade reavaliada.",
        }
    )
    return {
        **existing,
        "severity": severity,
        "title": f"{copy['title']}{suffix}",
        "description": copy["description"],
        "recommendation": copy["recommendation"],
        "lastObservedAt": now_iso,
        "metrics": metrics or existing.get("metrics", {}),
        "reading": _reading_payload(reading, now_iso) or existing.get("reading"),
        "timeline": timeline,
    }


def _resolve_alert(existing: dict, now_iso: str) -> dict:
    timeline = list(existing.get("timeline", []))[-10:]
    timeline.append(
        {
            "at": now_iso,
            "kind": "resolved",
            "severity": existing["severity"],
            "message": "Condição normalizada; alerta encerrado automaticamente.",
        }
    )
    return {
        **existing,
        "status": "resolved",
        "resolvedAt": now_iso,
        "lastObservedAt": now_iso,
        "resolvedAutomatically": True,
        "timeline": timeline,
    }


def evaluate_alerts(
    *,
    sensors: list[dict],
    readings_by_sensor: dict[str, dict] | None = None,
    alerts: list[dict] | None = None,
    config: dict,
    now: datetime,
) -> dict:
    readings_by_sensor = readings_by_sensor or {}
    next_alerts = list(alerts or [])
    created: list[dict] = []
    updated: list[dict] = []
    resolved: list[dict] = []
    now_iso = now.isoformat()
    thresholds = config["thresholds"]
    max_age = thresholds["staleReadingSeconds"]

    def active_for(sensor_id: str, alert_type: str) -> dict | None:
        return next(
            (
                alert
                for alert in next_alerts
                if alert["sensorId"] == sensor_id
                and alert["type"] == alert_type
                and alert["status"] != "resolved"
            ),
            None,
        )

    for sensor in sensors:
        reading = readings_by_sensor.get(sensor["id"])
        metadata = (reading or {}).get("metadata") or {}
        status = (reading or {}).get("status") or sensor.get("status")
        quality = (reading or {}).get("quality") or sensor.get("lastReadingQuality")
        level = (reading or {}).get("waterLevelCm")
        if level is None and reading is None:
            level = sensor.get("levelCm")
        rate = metadata.get("rate_cm_per_min")
        timestamp = (reading or {}).get("timestamp") or sensor.get("lastReadingAt")
        if timestamp:
            try:
                age_seconds = max(0.0, (now - datetime.fromisoformat(str(timestamp))).total_seconds())
            except ValueError:
                age_seconds = float("inf")
        else:
            age_seconds = float("inf")

        paused = status == "simulation_paused"
        offline = status == "fault_offline" or quality == "missing" or (
            reading is None and sensor.get("source") == "simulation"
        )
        invalid = status == "fault_invalid" or quality == "invalid"
        never_seen_hardware = sensor.get("source") == "hardware" and not sensor.get("lastReadingAt") and reading is None
        stale_hardware = (
            sensor.get("source") == "hardware"
            and bool(sensor.get("lastReadingAt"))
            and age_seconds > max_age
        )

        desired: dict[str, dict] = {}
        if not paused and not never_seen_hardware and (offline or stale_hardware):
            desired["communication"] = {
                "severity": "attention",
                "metrics": {
                    "readingAgeSeconds": round(age_seconds) if age_seconds != float("inf") else None
                },
            }
        if invalid:
            desired["invalid_reading"] = {
                "severity": "attention",
                "metrics": {"distanceCm": (reading or {}).get("distanceCm")},
            }
        if not offline and not invalid and level is not None:
            previous = (active_for(sensor["id"], "water_level") or {}).get("severity")
            desired["water_level"] = {
                "severity": severity_from_value(
                    float(level),
                    thresholds["waterLevelCm"],
                    previous,
                    thresholds["hysteresisCm"],
                ),
                "metrics": {"waterLevelCm": round(float(level), 1)},
            }
        if not offline and not invalid and rate is not None:
            previous = (active_for(sensor["id"], "rise_rate") or {}).get("severity")
            desired["rise_rate"] = {
                "severity": severity_from_value(
                    max(0.0, float(rate)),
                    thresholds["riseRateCmPerMin"],
                    previous,
                    thresholds["hysteresisRateCmPerMin"],
                ),
                "metrics": {"rateCmPerMin": round(float(rate), 2)},
            }

        all_types = {
            "water_level",
            "rise_rate",
            "communication",
            "invalid_reading",
            *[
                alert["type"]
                for alert in next_alerts
                if alert["sensorId"] == sensor["id"] and alert["status"] != "resolved"
            ],
        }

        for alert_type in all_types:
            state = desired.get(alert_type)
            existing = active_for(sensor["id"], alert_type)
            severity = (state or {}).get("severity", "normal")

            if severity == "normal":
                if existing:
                    resolved_alert = _resolve_alert(existing, now_iso)
                    next_alerts[next_alerts.index(existing)] = resolved_alert
                    resolved.append(resolved_alert)
                continue

            if not COPY.get(alert_type, {}).get(severity):
                continue

            sensor_name = sensor.get("shortName") or sensor.get("name") or sensor["id"]
            if existing:
                if existing["severity"] == severity:
                    next_alerts[next_alerts.index(existing)] = {
                        **existing,
                        "lastObservedAt": now_iso,
                        "metrics": state["metrics"],
                        "reading": _reading_payload(reading, now_iso) or existing.get("reading"),
                    }
                else:
                    changed = _update_alert(existing, severity, now_iso, reading, state["metrics"])
                    next_alerts[next_alerts.index(existing)] = changed
                    updated.append(changed)
            else:
                alert = _build_alert(
                    sensor=sensor,
                    alert_type=alert_type,
                    severity=severity,
                    sensor_name=sensor_name,
                    now_iso=now_iso,
                    reading=reading,
                    metrics=state["metrics"],
                )
                next_alerts.insert(0, alert)
                created.append(alert)

    next_alerts.sort(key=lambda alert: alert.get("openedAt", ""), reverse=True)
    return {
        "alerts": next_alerts,
        "created": created,
        "updated": updated,
        "resolved": resolved,
    }


def acknowledge_alert_record(alert: dict, now: datetime) -> dict:
    if not alert or alert.get("status") == "resolved":
        return alert
    now_iso = now.isoformat()
    timeline = list(alert.get("timeline", []))[-10:]
    timeline.append(
        {
            "at": now_iso,
            "kind": "acknowledged",
            "severity": alert["severity"],
            "message": "Alerta reconhecido pela equipe.",
        }
    )
    return {
        **alert,
        "status": "acknowledged",
        "acknowledgedAt": now_iso,
        "timeline": timeline,
    }


def resolve_alert_record(alert: dict, now: datetime) -> dict:
    if not alert or alert.get("status") == "resolved":
        return alert
    now_iso = now.isoformat()
    timeline = list(alert.get("timeline", []))[-10:]
    timeline.append(
        {
            "at": now_iso,
            "kind": "resolved",
            "severity": alert["severity"],
            "message": "Alerta resolvido manualmente pela equipe.",
        }
    )
    return {
        **alert,
        "status": "resolved",
        "resolvedAt": now_iso,
        "resolvedAutomatically": False,
        "timeline": timeline,
    }
