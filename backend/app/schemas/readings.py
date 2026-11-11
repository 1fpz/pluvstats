"""Reading ingestion and response contracts."""

from __future__ import annotations

from datetime import datetime
from typing import Any

from pydantic import Field

from app.schemas import APIModel, InputModel


class HardwareReadingIn(InputModel):
    device_id: str = Field(min_length=3, max_length=80)
    distance_cm: float = Field(ge=0, le=500)
    water_level_cm: float | None = Field(default=None, ge=0, le=500)
    timestamp: datetime | None = None
    firmware_version: str | None = Field(default=None, max_length=64)


class ReadingOut(APIModel):
    id: int | None = None
    sensor_id: str
    device_id: str
    timestamp: datetime
    distance_cm: float | None = None
    water_level_cm: float | None = None
    source: str
    quality: str
    status: str
    metadata: dict[str, Any] = Field(default_factory=dict)


class HardwareReadingOut(APIModel):
    accepted: bool
    sensor_id: str
    device_id: str
    quality: str
    status: str
    validated: bool
    distance_cm: float
    water_level_cm: float | None = None
    timestamp: datetime
    alerts: dict[str, list[str]] = Field(default_factory=dict)
    message: str
