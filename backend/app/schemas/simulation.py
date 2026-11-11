"""Simulation control contracts."""

from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import Field

from app.schemas import APIModel, InputModel

SimulationAction = Literal[
    "start",
    "pause",
    "reset",
    "set_scenario",
    "raise",
    "lower",
    "drain",
    "set_level",
    "inject_fault",
    "recover",
]


class SimulationCommand(InputModel):
    action: SimulationAction
    scenario: str | None = Field(default=None, max_length=40)
    sensor_id: str | None = Field(default=None, max_length=40)
    amount_cm: float | None = Field(default=None, ge=-100, le=100)
    fault: Literal["offline", "invalid"] | None = None


class SimulationStateOut(APIModel):
    running: bool
    scenario: str
    started_at: datetime
    last_tick_at: datetime
    elapsed_seconds: float
    tick_count: int
    hydrology_note: str | None = None
    sensors: dict[str, Any] = Field(default_factory=dict)
    simulated_sensors: int = 0
