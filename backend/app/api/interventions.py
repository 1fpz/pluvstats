"""Intervention endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Query, status

from app.api.deps import ContainerDep
from app.schemas.interventions import InterventionCreate, InterventionOut, InterventionUpdate

router = APIRouter(prefix="/interventions", tags=["intervenções"])


@router.get("", response_model=list[InterventionOut])
def list_interventions(
    container: ContainerDep,
    status_filter: str | None = Query(default=None, alias="status", max_length=40),
    limit: int = Query(default=200, ge=1, le=1000),
) -> list[dict]:
    return container.intervention_service.list(status=status_filter, limit=limit)


@router.get("/{intervention_id}", response_model=InterventionOut)
def get_intervention(intervention_id: str, container: ContainerDep) -> dict:
    return container.intervention_service.get(intervention_id)


@router.post("", response_model=InterventionOut, status_code=status.HTTP_201_CREATED)
def create_intervention(payload: InterventionCreate, container: ContainerDep) -> dict:
    return container.intervention_service.create(payload)


@router.patch("/{intervention_id}", response_model=InterventionOut)
def update_intervention(
    intervention_id: str, payload: InterventionUpdate, container: ContainerDep
) -> dict:
    return container.intervention_service.update(intervention_id, payload)
