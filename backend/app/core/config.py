"""Application settings and the shared single source of truth.

The JSON configuration in ``shared/pluvstats.config.json`` is read by both the
frontend and this backend. Thresholds must never be duplicated in code.
"""

from __future__ import annotations

import json
import os
from dataclasses import dataclass, field
from functools import lru_cache
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parents[3]
BACKEND_ROOT = Path(__file__).resolve().parents[2]
SHARED_CONFIG_PATH = PROJECT_ROOT / "shared" / "pluvstats.config.json"


def _as_bool(value: str | None, default: bool = False) -> bool:
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _resolve_database_path(value: str | None) -> Path:
    if not value:
        return BACKEND_ROOT / "data" / "pluvstats.db"
    path = Path(value)
    return path if path.is_absolute() else PROJECT_ROOT / path


@dataclass(frozen=True)
class Settings:
    environment: str = "demo"
    database_path: Path = field(default_factory=lambda: BACKEND_ROOT / "data" / "pluvstats.db")
    cors_origins: tuple[str, ...] = (
        "http://127.0.0.1:5173",
        "http://localhost:5173",
    )
    hardware_enabled: bool = False
    hardware_api_key: str | None = None

    @property
    def is_demo(self) -> bool:
        return self.environment != "production"

    @classmethod
    def from_env(cls) -> "Settings":
        origins = os.getenv("PLUVSTATS_CORS_ORIGINS", "")
        parsed_origins = tuple(item.strip() for item in origins.split(",") if item.strip())
        hardware_key = (os.getenv("PLUVSTATS_HARDWARE_KEY") or "").strip() or None
        return cls(
            environment=os.getenv("PLUVSTATS_ENV", "demo").strip() or "demo",
            database_path=_resolve_database_path(os.getenv("PLUVSTATS_DB_PATH")),
            cors_origins=parsed_origins or cls.cors_origins,
            hardware_enabled=_as_bool(os.getenv("PLUVSTATS_HARDWARE_ENABLED")),
            hardware_api_key=hardware_key,
        )


@lru_cache(maxsize=1)
def load_shared_config() -> dict:
    with SHARED_CONFIG_PATH.open("r", encoding="utf-8") as handle:
        return json.load(handle)


def clear_config_cache() -> None:
    load_shared_config.cache_clear()
