"""Reading query and hardware ingestion endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Header, Query, status

from app.api.deps import ContainerDep
from app.schemas.readings import HardwareReadingIn, HardwareReadingOut, ReadingOut

router = APIRouter(tags=["leituras"])


@router.get("/readings", response_model=list[ReadingOut])
def list_readings(
    container: ContainerDep,
    sensor_id: str | None = Query(default=None, alias="sensorId", max_length=40),
    source: str | None = Query(default=None, max_length=20),
    quality: str | None = Query(default=None, max_length=20),
    since: str | None = Query(default=None, max_length=40),
    limit: int = Query(default=100, ge=1, le=2000),
) -> list[dict]:
    return container.readings.list(
        sensor_id=sensor_id,
        source=source,
        quality=quality,
        since=since,
        limit=limit,
    )


@router.post(
    "/hardware/readings",
    response_model=HardwareReadingOut,
    status_code=status.HTTP_201_CREATED,
    tags=["hardware"],
)
def ingest_hardware_reading(
    payload: HardwareReadingIn,
    container: ContainerDep,
    device_key: str | None = Header(default=None, alias="X-Device-Key"),
) -> dict:
    return container.hardware_service.record(payload, provided_key=device_key)
