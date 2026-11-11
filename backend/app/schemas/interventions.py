"""Intervention request/response contracts."""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import Field

from app.schemas import APIModel, InputModel, Position

InterventionStatus = Literal["planned", "in_progress", "completed"]


class InterventionCreate(InputModel):
    occurrence_id: str | None = Field(default=None, max_length=40)
    title: str = Field(min_length=6, max_length=160)
    description: str = Field(min_length=15, max_length=1000)
    status: InterventionStatus
    team: str | None = Field(default=None, max_length=160)
    started_at: datetime
    completed_at: datetime | None = None
    before_level_cm: float = Field(ge=0, le=100)
    after_level_cm: float | None = Field(default=None, ge=0, le=100)
    location: str = Field(min_length=1, max_length=200)
    sensor_id: str | None = Field(default=None, max_length=40)


class InterventionUpdate(InputModel):
    occurrence_id: str | None = Field(default=None, max_length=40)
    title: str | None = Field(default=None, min_length=6, max_length=160)
    description: str | None = Field(default=None, min_length=15, max_length=1000)
    status: InterventionStatus | None = None
    team: str | None = Field(default=None, max_length=160)
    started_at: datetime | None = None
    completed_at: datetime | None = None
    before_level_cm: float | None = Field(default=None, ge=0, le=100)
    after_level_cm: float | None = Field(default=None, ge=0, le=100)
    location: str | None = Field(default=None, min_length=1, max_length=200)
    sensor_id: str | None = Field(default=None, max_length=40)


class InterventionOut(APIModel):
    id: str
    occurrence_id: str | None
    title: str
    description: str
    status: str
    team: str | None
    started_at: datetime
    completed_at: datetime | None
    before_level_cm: float
    after_level_cm: float | None
    location: str
    position: Position | None
    sensor_id: str | None
    origin: str
    created_at: datetime
    updated_at: datetime
