"""Activity feed persistence."""

from __future__ import annotations

from app.database import Database
from app.repositories.base import create_entity_id, iso_now


def _row_to_activity(row) -> dict:
    return {
        "id": row["id"],
        "kind": row["kind"],
        "title": row["title"],
        "description": row["description"],
        "at": row["at"],
        "severity": row["severity"],
        "source": row["source"],
    }


class ActivityRepository:
    def __init__(self, database: Database) -> None:
        self.database = database

    def add(self, *, kind: str, title: str, description: str, at: str | None = None,
            severity: str = "normal", source: str = "simulation") -> dict:
        entry = {
            "id": create_entity_id("ACT"),
            "kind": kind,
            "title": title,
            "description": description,
            "at": at or iso_now(),
            "severity": severity,
            "source": source,
        }
        with self.database.connect() as connection:
            connection.execute(
                "INSERT INTO activity (id, kind, title, description, at, severity, source) "
                "VALUES (?, ?, ?, ?, ?, ?, ?)",
                (
                    entry["id"],
                    entry["kind"],
                    entry["title"],
                    entry["description"],
                    entry["at"],
                    entry["severity"],
                    entry["source"],
                ),
            )
        return entry

    def list(self, limit: int = 40) -> list[dict]:
        with self.database.connect() as connection:
            rows = connection.execute(
                "SELECT * FROM activity ORDER BY at DESC LIMIT ?", (max(1, min(limit, 200)),)
            ).fetchall()
        return [_row_to_activity(row) for row in rows]

    def clear(self) -> None:
        with self.database.connect() as connection:
            connection.execute("DELETE FROM activity")
