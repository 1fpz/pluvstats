"""Sensor endpoints. Views always carry provenance and validation state."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

from app.api.deps import ContainerDep
from app.core.errors import NotFoundError
from app.intelligence.sensor_view import active_alert_by_sensor, derive_sensor_view
from app.schemas.sensors import SensorOut

router = APIRouter(prefix="/sensors", tags=["sensores"])


def _views(container: ContainerDep) -> list[dict]:
    now = datetime.now(timezone.utc)
    simulation = container.simulation_repository.get_state()
    active = active_alert_by_sensor(container.alerts_repository.list())
    return [
        derive_sensor_view(
            sensor,
            simulation,
            config=container.config,
            now=now,
            active_alert=active.get(sensor["id"]),
        )
        for sensor in container.sensors.list()
    ]


@router.get("", response_model=list[SensorOut])
def list_sensors(container: ContainerDep) -> list[dict]:
    return _views(container)


@router.get("/{sensor_id}", response_model=SensorOut)
def get_sensor(sensor_id: str, container: ContainerDep) -> dict:
    for sensor in _views(container):
        if sensor["id"] == sensor_id:
            return sensor
    raise NotFoundError("Sensor não encontrado.")
