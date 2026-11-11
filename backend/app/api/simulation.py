"""Simulation control endpoints.

The frontend drives ticks in demonstration mode. Ticks are idempotent in shape
but advance the deterministic state by one configured step.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.api.deps import ContainerDep
from app.schemas.simulation import SimulationCommand, SimulationStateOut

router = APIRouter(prefix="/simulation", tags=["simulação"])


@router.get("", response_model=SimulationStateOut)
def get_simulation(container: ContainerDep) -> dict:
    snapshot = container.snapshot.build()
    return snapshot["simulation"]


@router.post("/tick")
def tick_simulation(container: ContainerDep) -> dict:
    return container.simulation_service.tick()


@router.post("/commands")
def send_simulation_command(payload: SimulationCommand, container: ContainerDep) -> dict:
    return container.simulation_service.command(payload.model_dump(by_alias=True))
