"""Canonical enums and ordering used by persistence, services and the API.

They mirror the frontend vocabulary on purpose. If a value changes here it must
also change in `frontend/src/utils/validators.js`.
"""

from __future__ import annotations

from typing import Final

SEVERITIES: Final[tuple[str, ...]] = ("normal", "attention", "alert", "critical")
OCCURRENCE_TYPES: Final[tuple[str, ...]] = ("flooding", "waterlogging", "drainage", "overflow", "other")
OCCURRENCE_STATUSES: Final[tuple[str, ...]] = ("open", "validated", "in_progress", "resolved", "archived")
INTERVENTION_STATUSES: Final[tuple[str, ...]] = ("planned", "in_progress", "completed")
ALERT_STATUSES: Final[tuple[str, ...]] = ("active", "acknowledged", "resolved")
ALERT_TYPES: Final[tuple[str, ...]] = (
    "water_level",
    "rise_rate",
    "communication",
    "invalid_reading",
    "sensor_failure",
)
SOURCES: Final[tuple[str, ...]] = ("simulation", "hardware")
SENSOR_STATUSES: Final[tuple[str, ...]] = (
    "simulation_active",
    "simulation_paused",
    "simulation_unavailable",
    "fault_offline",
    "fault_invalid",
    "hardware_validated",
    "hardware_unvalidated",
    "hardware_stale",
)

SEVERITY_RANK: Final[dict[str, int]] = {value: index for index, value in enumerate(SEVERITIES)}


def severity_rank(value: str | None) -> int:
    return SEVERITY_RANK.get(value or "normal", 0)


def worst_severity(values) -> str:
    worst = "normal"
    for value in values:
        if severity_rank(value) > severity_rank(worst):
            worst = value
    return worst
