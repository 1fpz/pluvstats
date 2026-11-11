"""Alert response contracts."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import Field

from app.schemas import APIModel


class AlertOut(APIModel):
    id: str
    sensor_id: str
    sensor_name: str
    device_id: str | None = None
    type: str
    severity: str
    title: str
    description: str
    recommendation: str
    status: str
    source: str
    simulated: bool
    opened_at: datetime
    last_observed_at: datetime
    acknowledged_at: datetime | None = None
    resolved_at: datetime | None = None
    resolved_automatically: bool
    metrics: dict[str, Any] = Field(default_factory=dict)
    reading: dict[str, Any] | None = None
    timeline: list[dict[str, Any]] = Field(default_factory=list)
