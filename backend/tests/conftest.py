"""Shared pytest fixtures.

Every test application gets its own SQLite file. The factory never touches the
default database, and hardware ingestion stays opt-in.
"""

from __future__ import annotations

import sys
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

BACKEND_ROOT = Path(__file__).resolve().parents[1]
if str(BACKEND_ROOT) not in sys.path:
    sys.path.insert(0, str(BACKEND_ROOT))

from app.core.config import Settings  # noqa: E402
from app.main import create_app  # noqa: E402


@pytest.fixture
def make_client(tmp_path):
    def factory(**overrides) -> TestClient:
        settings = Settings(
            environment="test",
            database_path=tmp_path / "pluvstats-test.db",
            **overrides,
        )
        return TestClient(create_app(settings))

    return factory


@pytest.fixture
def client(make_client) -> TestClient:
    return make_client()
