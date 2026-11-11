"""Alert endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Query

from app.api.deps import ContainerDep
from app.schemas.alerts import AlertOut

router = APIRouter(prefix="/alerts", tags=["alertas"])


@router.get("", response_model=list[AlertOut])
def list_alerts(
    container: ContainerDep,
    status_filter: str | None = Query(default=None, alias="status", max_length=40),
    severity: str | None = Query(default=None, max_length=40),
    source: str | None = Query(default=None, max_length=20),
    alert_type: str | None = Query(default=None, alias="type", max_length=40),
    limit: int = Query(default=500, ge=1, le=2000),
) -> list[dict]:
    return container.alert_service.list(
        status=status_filter,
        severity=severity,
        source=source,
        alert_type=alert_type,
        limit=limit,
    )


@router.get("/{alert_id}", response_model=AlertOut)
def get_alert(alert_id: str, container: ContainerDep) -> dict:
    alert = container.alerts_repository.get(alert_id)
    if not alert:
        from app.core.errors import NotFoundError

        raise NotFoundError("Alerta não encontrado.")
    return alert


@router.post("/{alert_id}/acknowledge", response_model=AlertOut)
def acknowledge_alert(alert_id: str, container: ContainerDep) -> dict:
    return container.alert_service.acknowledge(alert_id)


@router.post("/{alert_id}/resolve", response_model=AlertOut)
def resolve_alert(alert_id: str, container: ContainerDep) -> dict:
    return container.alert_service.resolve(alert_id)
