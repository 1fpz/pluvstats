"""Health and configuration endpoints."""

from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter

from app import __version__
from app.api.deps import ContainerDep
from app.schemas import HealthOut

router = APIRouter(tags=["sistema"])


@router.get("/health", response_model=HealthOut)
def health(container: ContainerDep) -> dict:
    return {
        "status": "ok",
        "version": __version__,
        "environment": container.settings.environment,
        "hardware_enabled": container.settings.hardware_enabled,
        "time": datetime.now(timezone.utc).isoformat(),
    }


@router.get("/config")
def public_config(container: ContainerDep) -> dict:
    """Public configuration. Secrets are never included."""
    return {
        "config": container.config,
        "runtime": {
            "mode": "demo" if container.settings.is_demo else "hardware",
            "hardwareEnabled": container.settings.hardware_enabled,
            "hardwareRequiresValidation": bool(
                container.config["operation"].get("hardwareRequiresValidation", True)
            ),
            "sourceKind": "api",
            "database": "sqlite",
            "corsOrigins": list(container.settings.cors_origins),
        },
    }
