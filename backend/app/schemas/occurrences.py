"""Occurrence request/response contracts."""

from __future__ import annotations

from datetime import datetime
from typing import Literal

from pydantic import Field

from app.schemas import InputModel
from app.schemas import Position

OccurrenceType = Literal["flooding", "waterlogging", "drainage", "overflow", "other"]
OccurrenceStatus = Literal["open", "validated", "in_progress", "resolved", "archived"]
OccurrenceSeverity = Literal["attention", "alert", "critical"]


class OccurrenceCreate(InputModel):
    title: str = Field(min_length=8, max_length=140)
    type: OccurrenceType
    status: OccurrenceStatus = "open"
    severity: OccurrenceSeverity
    position: Position
    address: str = Field(min_length=1, max_length=200)
    neighborhood: str = Field(min_length=2, max_length=120)
    description: str = Field(min_length=20, max_length=800)
    reported_at: datetime
    recurrence_count: int = Field(default=1, ge=1, le=99)
    sensor_id: str | None = Field(default=None, max_length=40)
    affected_people_estimate: int = Field(default=0, ge=0, le=100000)
    reporter: str = Field(default="Canal de demonstração", max_length=120)
    evidence: list[str] = Field(default_factory=list, max_length=20)


class OccurrenceUpdate(InputModel):
    title: str | None = Field(default=None, min_length=8, max_length=140)
    type: OccurrenceType | None = None
    status: OccurrenceStatus | None = None
    severity: OccurrenceSeverity | None = None
    position: Position | None = None
    address: str | None = Field(default=None, min_length=1, max_length=200)
    neighborhood: str | None = Field(default=None, min_length=2, max_length=120)
    description: str | None = Field(default=None, min_length=20, max_length=800)
    reported_at: datetime | None = None
    recurrence_count: int | None = Field(default=None, ge=1, le=99)
    sensor_id: str | None = Field(default=None, max_length=40)
    affected_people_estimate: int | None = Field(default=None, ge=0, le=100000)
    reporter: str | None = Field(default=None, max_length=120)
    evidence: list[str] | None = Field(default=None, max_length=20)


class OccurrenceOut(OccurrenceCreate):
    id: str
    updated_at: datetime
    origin: str
