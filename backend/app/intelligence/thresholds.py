"""Threshold helpers. All limits come from the shared JSON configuration."""

from __future__ import annotations

from app.models.enums import severity_rank


def severity_from_value(
    value: float | None,
    limits: dict,
    previous: str | None,
    hysteresis: float,
) -> str:
    if value is None:
        return "normal"
    severity = "normal"
    if value >= limits["critical"]:
        severity = "critical"
    elif value >= limits["alert"]:
        severity = "alert"
    elif value >= limits["attention"]:
        severity = "attention"

    if previous and severity_rank(previous) > severity_rank(severity):
        hold = limits.get(previous, 0) - hysteresis
        if value >= hold:
            return previous
    return severity


def level_severity(value: float | None, thresholds: dict) -> str:
    return severity_from_value(value, thresholds["waterLevelCm"], None, 0)
