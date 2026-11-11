"""Snapshot endpoint used by the frontend API adapter."""

from __future__ import annotations

from fastapi import APIRouter

from app.api.deps import ContainerDep

router = APIRouter(tags=["estado"])


@router.get("/snapshot")
def snapshot(container: ContainerDep) -> dict:
    return container.snapshot.build()
