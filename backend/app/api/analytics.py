"""Analytics endpoints. All outputs are explicitly experimental."""

from __future__ import annotations

from fastapi import APIRouter, Query

from app.api.deps import ContainerDep

router = APIRouter(prefix="/analytics", tags=["analytics"])


@router.get("/summary")
def summary(container: ContainerDep) -> dict:
    return container.analytics_service.summary()


@router.get("/timeseries")
def timeseries(
    container: ContainerDep,
    limit: int = Query(default=240, ge=10, le=2000),
) -> dict:
    return container.analytics_service.timeseries(limit=limit)


@router.get("/neighborhoods")
def neighborhoods(container: ContainerDep) -> dict:
    return container.analytics_service.neighborhoods()


@router.get("/sensors")
def sensor_stats(container: ContainerDep) -> dict:
    return container.analytics_service.sensor_stats()


@router.get("/priorities")
def priorities(container: ContainerDep) -> dict:
    return container.analytics_service.priorities()
