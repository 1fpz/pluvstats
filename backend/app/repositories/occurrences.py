"""Occurrence persistence."""

from __future__ import annotations

from app.database import Database
from app.repositories.base import json_dump, json_load


def _row_to_occurrence(row) -> dict:
    return {
        "id": row["id"],
        "title": row["title"],
        "type": row["type"],
        "status": row["status"],
        "severity": row["severity"],
        "position": {"lat": row["latitude"], "lng": row["longitude"]},
        "address": row["address"],
        "neighborhood": row["neighborhood"],
        "description": row["description"],
        "reportedAt": row["reported_at"],
        "updatedAt": row["updated_at"],
        "recurrenceCount": row["recurrence_count"],
        "sensorId": row["sensor_id"],
        "affectedPeopleEstimate": row["affected_people_estimate"],
        "reporter": row["reporter"],
        "origin": row["origin"],
        "evidence": json_load(row["evidence"], []),
    }


class OccurrenceRepository:
    def __init__(self, database: Database) -> None:
        self.database = database

    def list(
        self,
        *,
        query: str | None = None,
        status: str | None = None,
        severity: str | None = None,
        neighborhood: str | None = None,
        limit: int = 200,
        offset: int = 0,
    ) -> list[dict]:
        clauses = []
        params: list = []
        if query:
            needle = f"%{query.strip().lower()}%"
            clauses.append(
                "(lower(title) LIKE ? OR lower(address) LIKE ? OR lower(neighborhood) LIKE ? "
                "OR lower(description) LIKE ? OR lower(id) LIKE ?)"
            )
            params.extend([needle] * 5)
        if status:
            clauses.append("status = ?")
            params.append(status)
        if severity:
            clauses.append("severity = ?")
            params.append(severity)
        if neighborhood:
            clauses.append("neighborhood = ?")
            params.append(neighborhood)
        where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
        params.extend([max(1, min(limit, 1000)), max(0, offset)])
        with self.database.connect() as connection:
            rows = connection.execute(
                f"SELECT * FROM occurrences {where} ORDER BY reported_at DESC, id DESC LIMIT ? OFFSET ?",
                params,
            ).fetchall()
        return [_row_to_occurrence(row) for row in rows]

    def get(self, occurrence_id: str) -> dict | None:
        with self.database.connect() as connection:
            row = connection.execute(
                "SELECT * FROM occurrences WHERE id = ?", (occurrence_id,)
            ).fetchone()
        return _row_to_occurrence(row) if row else None

    def ids(self) -> list[str]:
        with self.database.connect() as connection:
            rows = connection.execute("SELECT id FROM occurrences").fetchall()
        return [row["id"] for row in rows]

    def insert(self, occurrence: dict) -> dict:
        with self.database.connect() as connection:
            connection.execute(
                """
                INSERT INTO occurrences (
                    id, title, type, status, severity, latitude, longitude,
                    address, neighborhood, description, reported_at, updated_at,
                    recurrence_count, sensor_id, affected_people_estimate,
                    reporter, origin, evidence
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    occurrence["id"],
                    occurrence["title"],
                    occurrence["type"],
                    occurrence["status"],
                    occurrence["severity"],
                    occurrence["position"]["lat"],
                    occurrence["position"]["lng"],
                    occurrence["address"],
                    occurrence["neighborhood"],
                    occurrence["description"],
                    occurrence["reportedAt"],
                    occurrence["updatedAt"],
                    occurrence.get("recurrenceCount", 1),
                    occurrence.get("sensorId"),
                    occurrence.get("affectedPeopleEstimate", 0),
                    occurrence.get("reporter", "Canal de demonstração"),
                    occurrence.get("origin", "demonstration"),
                    json_dump(occurrence.get("evidence", [])),
                ),
            )
        return self.get(occurrence["id"])

    def update(self, occurrence: dict) -> dict:
        with self.database.connect() as connection:
            connection.execute(
                """
                UPDATE occurrences SET
                    title = ?, type = ?, status = ?, severity = ?, latitude = ?,
                    longitude = ?, address = ?, neighborhood = ?, description = ?,
                    reported_at = ?, updated_at = ?, recurrence_count = ?, sensor_id = ?,
                    affected_people_estimate = ?, reporter = ?, origin = ?, evidence = ?
                WHERE id = ?
                """,
                (
                    occurrence["title"],
                    occurrence["type"],
                    occurrence["status"],
                    occurrence["severity"],
                    occurrence["position"]["lat"],
                    occurrence["position"]["lng"],
                    occurrence["address"],
                    occurrence["neighborhood"],
                    occurrence["description"],
                    occurrence["reportedAt"],
                    occurrence["updatedAt"],
                    occurrence.get("recurrenceCount", 1),
                    occurrence.get("sensorId"),
                    occurrence.get("affectedPeopleEstimate", 0),
                    occurrence.get("reporter", "Canal de demonstração"),
                    occurrence.get("origin", "demonstration"),
                    json_dump(occurrence.get("evidence", [])),
                    occurrence["id"],
                ),
            )
        return self.get(occurrence["id"])

    def delete(self, occurrence_id: str) -> bool:
        with self.database.connect() as connection:
            cursor = connection.execute("DELETE FROM occurrences WHERE id = ?", (occurrence_id,))
        return cursor.rowcount > 0

    def clear(self) -> None:
        with self.database.connect() as connection:
            connection.execute("DELETE FROM occurrences")

    def count(self) -> int:
        with self.database.connect() as connection:
            row = connection.execute("SELECT COUNT(*) AS total FROM occurrences").fetchone()
        return int(row["total"])
