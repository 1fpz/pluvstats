"""Demonstration reset endpoint.

Explicitly destructive by design: it only restores the fictional seed. It is
never wired to hardware or production data.
"""

from __future__ import annotations

from fastapi import APIRouter

from app.api.deps import ContainerDep

router = APIRouter(prefix="/demo", tags=["demonstração"])


@router.post("/reset")
def reset_demo(container: ContainerDep) -> dict:
    container.seed.reset()
    return {"message": "Demonstração restaurada.", "snapshot": container.snapshot.build()}


@router.get("/status")
def demo_status(container: ContainerDep) -> dict:
    return {
        "isDemo": container.settings.is_demo,
        "environment": container.settings.environment,
        "hardwareEnabled": container.settings.hardware_enabled,
        "seed": {
            "sensors": container.sensors.count(),
            "occurrences": container.occurrences.count(),
            "interventions": container.interventions.count(),
            "alerts": container.alerts_repository.count(),
            "readings": container.readings.count(),
        },
    }
