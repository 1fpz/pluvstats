"""Sensor response contracts."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import Field

from app.schemas import APIModel, Position


class SensorOut(APIModel):
    id: str
    name: str
    short_name: str
    device_id: str
    neighborhood: str
    address: str
    position: Position
    source: str
    status: str
    validated: bool
    catchment: str | None = None
    baseline_level_cm: float | None = None
    response_factor: float | None = None
    phase: float = 0
    installed_at: datetime | None = None
    notes: str | None = None
    last_reading_at: datetime | None = None
    level_cm: float | None = None
    rate_cm_per_min: float | None = None
    distance_cm: float | None = None
    quality: str = "unknown"
    connectivity_proof: str | None = None
    reading_age_seconds: float | None = None
    history: list[dict[str, Any]] = Field(default_factory=list)
    alert_severity: str | None = None
    active_alert_id: str | None = None
    simulated: bool = False
