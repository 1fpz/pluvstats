"""Reading persistence."""

from __future__ import annotations

from app.database import Database
from app.repositories.base import iso_now, json_dump, json_load


def _row_to_reading(row) -> dict:
    return {
        "id": row["id"],
        "sensorId": row["sensor_id"],
        "deviceId": row["device_id"],
        "timestamp": row["timestamp"],
        "distanceCm": row["distance_cm"],
        "waterLevelCm": row["water_level_cm"],
        "source": row["source"],
        "quality": row["quality"],
        "status": row["status"],
        "metadata": json_load(row["metadata"], {}),
    }


class ReadingRepository:
    def __init__(self, database: Database) -> None:
        self.database = database

    def insert(self, reading: dict) -> dict:
        with self.database.connect() as connection:
            cursor = connection.execute(
                """
                INSERT INTO readings (
                    sensor_id, device_id, timestamp, distance_cm, water_level_cm,
                    source, quality, status, metadata, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    reading["sensorId"],
                    reading["deviceId"],
                    reading["timestamp"],
                    reading.get("distanceCm"),
                    reading.get("waterLevelCm"),
                    reading.get("source", "simulation"),
                    reading.get("quality", "unknown"),
                    reading.get("status", "unknown"),
                    json_dump(reading.get("metadata", {})),
                    iso_now(),
                ),
            )
            reading_id = cursor.lastrowid
        result = dict(reading)
        result["id"] = reading_id
        return result

    def insert_many(self, readings: list[dict]) -> list[dict]:
        return [self.insert(reading) for reading in readings]

    def list(
        self,
        *,
        sensor_id: str | None = None,
        source: str | None = None,
        quality: str | None = None,
        since: str | None = None,
        limit: int = 100,
    ) -> list[dict]:
        clauses = []
        params: list = []
        if sensor_id:
            clauses.append("sensor_id = ?")
            params.append(sensor_id)
        if source:
            clauses.append("source = ?")
            params.append(source)
        if quality:
            clauses.append("quality = ?")
            params.append(quality)
        if since:
            clauses.append("timestamp >= ?")
            params.append(since)
        where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
        params.append(max(1, min(limit, 2000)))
        with self.database.connect() as connection:
            rows = connection.execute(
                f"SELECT * FROM readings {where} ORDER BY timestamp DESC, id DESC LIMIT ?",
                params,
            ).fetchall()
        return [_row_to_reading(row) for row in rows]

    def latest_by_sensor(self) -> dict[str, dict]:
        with self.database.connect() as connection:
            rows = connection.execute(
                """
                SELECT * FROM (
                    SELECT readings.*,
                           ROW_NUMBER() OVER (
                               PARTITION BY sensor_id ORDER BY timestamp DESC, id DESC
                           ) AS position
                    FROM readings
                ) WHERE position = 1
                """
            ).fetchall()
        return {row["sensor_id"]: _row_to_reading(row) for row in rows}

    def count(self) -> int:
        with self.database.connect() as connection:
            row = connection.execute("SELECT COUNT(*) AS total FROM readings").fetchone()
        return int(row["total"])

    def stats_by_sensor(self) -> dict[str, dict]:
        with self.database.connect() as connection:
            rows = connection.execute(
                """
                SELECT sensor_id,
                       COUNT(*) AS total,
                       SUM(CASE WHEN quality = 'valid' THEN 1 ELSE 0 END) AS valid,
                       SUM(CASE WHEN quality = 'invalid' THEN 1 ELSE 0 END) AS invalid,
                       SUM(CASE WHEN quality = 'missing' THEN 1 ELSE 0 END) AS missing,
                       MIN(water_level_cm) AS minimum,
                       MAX(water_level_cm) AS maximum,
                       AVG(water_level_cm) AS average,
                       MAX(timestamp) AS latest
                FROM readings
                GROUP BY sensor_id
                """
            ).fetchall()
        return {
            row["sensor_id"]: {
                "total": int(row["total"] or 0),
                "valid": int(row["valid"] or 0),
                "invalid": int(row["invalid"] or 0),
                "missing": int(row["missing"] or 0),
                "minimum": row["minimum"],
                "maximum": row["maximum"],
                "average": round(row["average"], 2) if row["average"] is not None else None,
                "latest": row["latest"],
            }
            for row in rows
        }

    def prune(self, *, keep_per_sensor: int = 720) -> int:
        """Keep the most recent readings per sensor to bound the demo database."""
        with self.database.connect() as connection:
            cursor = connection.execute(
                """
                DELETE FROM readings WHERE id IN (
                    SELECT id FROM (
                        SELECT id,
                               ROW_NUMBER() OVER (
                                   PARTITION BY sensor_id ORDER BY timestamp DESC, id DESC
                               ) AS position
                        FROM readings
                    ) WHERE position > ?
                )
                """,
                (max(10, keep_per_sensor),),
            )
        return cursor.rowcount

    def clear(self) -> None:
        with self.database.connect() as connection:
            connection.execute("DELETE FROM readings")
