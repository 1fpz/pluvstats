"""Intervention persistence."""

from __future__ import annotations

from app.database import Database


def _row_to_intervention(row) -> dict:
    position = None
    if row["latitude"] is not None and row["longitude"] is not None:
        position = {"lat": row["latitude"], "lng": row["longitude"]}
    return {
        "id": row["id"],
        "occurrenceId": row["occurrence_id"],
        "title": row["title"],
        "description": row["description"],
        "status": row["status"],
        "team": row["team"],
        "startedAt": row["started_at"],
        "completedAt": row["completed_at"],
        "beforeLevelCm": row["before_level_cm"],
        "afterLevelCm": row["after_level_cm"],
        "location": row["location"],
        "position": position,
        "sensorId": row["sensor_id"],
        "origin": row["origin"],
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


class InterventionRepository:
    def __init__(self, database: Database) -> None:
        self.database = database

    def list(self, *, status: str | None = None, limit: int = 200) -> list[dict]:
        clauses = []
        params: list = []
        if status:
            clauses.append("status = ?")
            params.append(status)
        where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
        params.append(max(1, min(limit, 1000)))
        with self.database.connect() as connection:
            rows = connection.execute(
                f"SELECT * FROM interventions {where} ORDER BY started_at DESC LIMIT ?",
                params,
            ).fetchall()
        return [_row_to_intervention(row) for row in rows]

    def get(self, intervention_id: str) -> dict | None:
        with self.database.connect() as connection:
            row = connection.execute(
                "SELECT * FROM interventions WHERE id = ?", (intervention_id,)
            ).fetchone()
        return _row_to_intervention(row) if row else None

    def ids(self) -> list[str]:
        with self.database.connect() as connection:
            rows = connection.execute("SELECT id FROM interventions").fetchall()
        return [row["id"] for row in rows]

    def insert(self, intervention: dict) -> dict:
        with self.database.connect() as connection:
            connection.execute(
                """
                INSERT INTO interventions (
                    id, occurrence_id, title, description, status, team, started_at,
                    completed_at, before_level_cm, after_level_cm, location, latitude,
                    longitude, sensor_id, origin, created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    intervention["id"],
                    intervention.get("occurrenceId"),
                    intervention["title"],
                    intervention["description"],
                    intervention["status"],
                    intervention.get("team"),
                    intervention["startedAt"],
                    intervention.get("completedAt"),
                    intervention["beforeLevelCm"],
                    intervention.get("afterLevelCm"),
                    intervention["location"],
                    (intervention.get("position") or {}).get("lat"),
                    (intervention.get("position") or {}).get("lng"),
                    intervention.get("sensorId"),
                    intervention.get("origin", "demonstration"),
                    intervention["createdAt"],
                    intervention["updatedAt"],
                ),
            )
        return self.get(intervention["id"])

    def update(self, intervention: dict) -> dict:
        with self.database.connect() as connection:
            connection.execute(
                """
                UPDATE interventions SET
                    occurrence_id = ?, title = ?, description = ?, status = ?, team = ?,
                    started_at = ?, completed_at = ?, before_level_cm = ?, after_level_cm = ?,
                    location = ?, latitude = ?, longitude = ?, sensor_id = ?, updated_at = ?
                WHERE id = ?
                """,
                (
                    intervention.get("occurrenceId"),
                    intervention["title"],
                    intervention["description"],
                    intervention["status"],
                    intervention.get("team"),
                    intervention["startedAt"],
                    intervention.get("completedAt"),
                    intervention["beforeLevelCm"],
                    intervention.get("afterLevelCm"),
                    intervention["location"],
                    (intervention.get("position") or {}).get("lat"),
                    (intervention.get("position") or {}).get("lng"),
                    intervention.get("sensorId"),
                    intervention["updatedAt"],
                    intervention["id"],
                ),
            )
        return self.get(intervention["id"])

    def clear(self) -> None:
        with self.database.connect() as connection:
            connection.execute("DELETE FROM interventions")

    def count(self) -> int:
        with self.database.connect() as connection:
            row = connection.execute("SELECT COUNT(*) AS total FROM interventions").fetchone()
        return int(row["total"])
