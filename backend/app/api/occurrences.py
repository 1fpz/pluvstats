"""Occurrence endpoints."""

from __future__ import annotations

from fastapi import APIRouter, Query, status

from app.api.deps import ContainerDep
from app.schemas.occurrences import OccurrenceCreate, OccurrenceOut, OccurrenceUpdate

router = APIRouter(prefix="/occurrences", tags=["ocorrências"])


@router.get("", response_model=list[OccurrenceOut])
def list_occurrences(
    container: ContainerDep,
    query: str | None = Query(default=None, max_length=120),
    status_filter: str | None = Query(default=None, alias="status", max_length=40),
    severity: str | None = Query(default=None, max_length=40),
    neighborhood: str | None = Query(default=None, max_length=120),
    limit: int = Query(default=200, ge=1, le=1000),
    offset: int = Query(default=0, ge=0),
) -> list[dict]:
    return container.occurrence_service.list(
        query=query,
        status=status_filter,
        severity=severity,
        neighborhood=neighborhood,
        limit=limit,
        offset=offset,
    )


@router.get("/{occurrence_id}", response_model=OccurrenceOut)
def get_occurrence(occurrence_id: str, container: ContainerDep) -> dict:
    return container.occurrence_service.get(occurrence_id)


@router.post("", response_model=OccurrenceOut, status_code=status.HTTP_201_CREATED)
def create_occurrence(payload: OccurrenceCreate, container: ContainerDep) -> dict:
    return container.occurrence_service.create(payload)


@router.patch("/{occurrence_id}", response_model=OccurrenceOut)
def update_occurrence(occurrence_id: str, payload: OccurrenceUpdate, container: ContainerDep) -> dict:
    return container.occurrence_service.update(occurrence_id, payload)


@router.delete("/{occurrence_id}")
def delete_occurrence(occurrence_id: str, container: ContainerDep) -> dict:
    return container.occurrence_service.delete(occurrence_id)
