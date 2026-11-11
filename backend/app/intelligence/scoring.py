"""Experimental, explainable occurrence prioritisation.

The weights match `frontend/src/domain/intelligence.js` and are documented in
`documentation/architecture/intelligence.md`. This is not a predictive model
and not an official risk classification.
"""

from __future__ import annotations

from datetime import datetime, timezone

PRIORITY_WEIGHTS = {
    "recurrence": 0.3,
    "severity": 0.3,
    "recency": 0.2,
    "corroboration": 0.2,
}

SEVERITY_SCORE = {
    "normal": 10,
    "attention": 40,
    "alert": 70,
    "critical": 100,
}

OPEN_STATUS_WEIGHT = {
    "open": 1.0,
    "validated": 0.9,
    "in_progress": 0.75,
    "resolved": 0.25,
    "archived": 0.1,
}


def priority_band(score: int) -> str:
    if score >= 80:
        return "critical"
    if score >= 62:
        return "alert"
    if score >= 40:
        return "attention"
    return "normal"


def _parse(value) -> datetime:
    if isinstance(value, datetime):
        return value if value.tzinfo else value.replace(tzinfo=timezone.utc)
    try:
        parsed = datetime.fromisoformat(str(value).replace("Z", "+00:00"))
    except (TypeError, ValueError):
        parsed = datetime.now(timezone.utc)
    return parsed if parsed.tzinfo else parsed.replace(tzinfo=timezone.utc)


def score_occurrence(
    occurrence: dict,
    *,
    sensors: list[dict] | None = None,
    now: datetime | None = None,
    threshold_attention: float = 25,
    threshold_alert: float = 50,
) -> dict:
    sensors = sensors or []
    now = now or datetime.now(timezone.utc)
    recurrence = min(100.0, (occurrence.get("recurrenceCount") or 0) * 14)
    severity = SEVERITY_SCORE.get(occurrence.get("severity"), 20)
    age_hours = max(0.0, (now - _parse(occurrence.get("reportedAt"))).total_seconds() / 3600)
    recency = max(0.0, 100 - age_hours * 2.2)
    linked = next(
        (sensor for sensor in sensors if sensor.get("id") == occurrence.get("sensorId")),
        None,
    )
    if linked:
        linked_severity = linked.get("alertSeverity")
        if not linked_severity:
            level = linked.get("levelCm")
            linked_severity = (
                "normal"
                if level is None
                else "alert"
                if level >= threshold_alert
                else "attention"
                if level >= threshold_attention
                else "normal"
            )
        sensor_signal = SEVERITY_SCORE.get(linked_severity, 20)
    else:
        sensor_signal = 20
    status_weight = OPEN_STATUS_WEIGHT.get(occurrence.get("status"), 0.5)
    corroboration = (sensor_signal * 0.7 + severity * 0.3) * status_weight

    factors = [
        {
            "key": "recurrence",
            "label": "Recorrência",
            "value": round(recurrence),
            "weight": PRIORITY_WEIGHTS["recurrence"],
            "detail": f"{occurrence.get('recurrenceCount') or 0} registro(s) no histórico demonstrativo.",
        },
        {
            "key": "severity",
            "label": "Severidade relatada",
            "value": severity,
            "weight": PRIORITY_WEIGHTS["severity"],
            "detail": f"Severidade {occurrence.get('severity')}.",
        },
        {
            "key": "recency",
            "label": "Atualidade",
            "value": round(recency),
            "weight": PRIORITY_WEIGHTS["recency"],
            "detail": f"Registro com {age_hours:.0f} h de idade.",
        },
        {
            "key": "corroboration",
            "label": "Corroboração",
            "value": round(corroboration),
            "weight": PRIORITY_WEIGHTS["corroboration"],
            "detail": (
                f"Sensor {linked.get('id')} associado "
                f"({linked.get('source')})."
                if linked
                else "Sem sensor associado; usa apenas o relato."
            ),
        },
    ]
    raw = sum(factor["value"] * factor["weight"] for factor in factors)
    score = round(min(100, raw))
    return {
        "score": score,
        "band": priority_band(score),
        "factors": factors,
        "experimental": True,
        "note": "Pontuação explicável experimental. Não representa risco oficial.",
    }
