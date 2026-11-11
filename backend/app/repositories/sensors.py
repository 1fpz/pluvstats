"""Sensor persistence."""

from __future__ import annotations

from app.database import Database
from app.repositories.base import iso_now


def _row_to_sensor(row) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "shortName": row["short_name"],
        "deviceId": row["device_id"],
        "neighborhood": row["neighborhood"],
        "address": row["address"],
        "position": {"lat": row["latitude"], "lng": row["longitude"]},
        "source": row["source"],
        "status": row["status"],
        "validated": bool(row["validated"]),
        "catchment": row["catchment"],
        "baselineLevelCm": row["baseline_level_cm"],
        "responseFactor": row["response_factor"],
        "phase": row["phase"],
        "installedAt": row["installed_at"],
        "notes": row["notes"],
        "lastReadingAt": row["last_reading_at"],
        "lastReadingLevelCm": row["last_reading_level_cm"],
        "lastReadingDistanceCm": row["last_reading_distance_cm"],
        "lastReadingQuality": row["last_reading_quality"],
        "lastReadingSource": row["last_reading_source"],
        "createdAt": row["created_at"],
        "updatedAt": row["updated_at"],
    }


class SensorRepository:
    def __init__(self, database: Database) -> None:
        self.database = database

    def list(self) -> list[dict]:
        with self.database.connect() as connection:
            rows = connection.execute("SELECT * FROM sensors ORDER BY id").fetchall()
        return [_row_to_sensor(row) for row in rows]

    def get(self, sensor_id: str) -> dict | None:
        with self.database.connect() as connection:
            row = connection.execute("SELECT * FROM sensors WHERE id = ?", (sensor_id,)).fetchone()
        return _row_to_sensor(row) if row else None

    def get_by_device(self, device_id: str) -> dict | None:
        with self.database.connect() as connection:
            row = connection.execute(
                "SELECT * FROM sensors WHERE device_id = ?", (device_id,)
            ).fetchone()
        return _row_to_sensor(row) if row else None

    def insert(self, sensor: dict) -> dict:
        now = iso_now()
        with self.database.connect() as connection:
            connection.execute(
                """
                INSERT INTO sensors (
                    id, name, short_name, device_id, neighborhood, address,
                    latitude, longitude, source, status, validated, catchment,
                    baseline_level_cm, response_factor, phase, installed_at, notes,
                    created_at, updated_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                (
                    sensor["id"],
                    sensor["name"],
                    sensor["shortName"],
                    sensor["deviceId"],
                    sensor["neighborhood"],
                    sensor["address"],
                    sensor["position"]["lat"],
                    sensor["position"]["lng"],
                    sensor["source"],
                    sensor.get("status", "hardware_unvalidated"),
                    int(bool(sensor.get("validated", False))),
                    sensor.get("catchment"),
                    sensor.get("baselineLevelCm"),
                    sensor.get("responseFactor"),
                    sensor.get("phase", 0),
                    sensor.get("installedAt"),
                    sensor.get("notes"),
                    now,
                    now,
                ),
            )
        return self.get(sensor["id"])

    def update_reading_state(
        self,
        sensor_id: str,
        *,
        status: str,
        validated: bool,
        last_reading_at: str | None,
        last_reading_level_cm: float | None,
        last_reading_distance_cm: float | None,
        last_reading_quality: str | None,
        last_reading_source: str | None,
    ) -> None:
        with self.database.connect() as connection:
            connection.execute(
                """
                UPDATE sensors SET
                    status = ?, validated = ?, last_reading_at = ?,
                    last_reading_level_cm = ?, last_reading_distance_cm = ?,
                    last_reading_quality = ?, last_reading_source = ?, updated_at = ?
                WHERE id = ?
                """,
                (
                    status,
                    int(validated),
                    last_reading_at,
                    last_reading_level_cm,
                    last_reading_distance_cm,
                    last_reading_quality,
                    last_reading_source,
                    iso_now(),
                    sensor_id,
                ),
            )

    def clear(self) -> None:
        with self.database.connect() as connection:
            connection.execute("DELETE FROM sensors")

    def count(self) -> int:
        with self.database.connect() as connection:
            row = connection.execute("SELECT COUNT(*) AS total FROM sensors").fetchone()
        return int(row["total"])
