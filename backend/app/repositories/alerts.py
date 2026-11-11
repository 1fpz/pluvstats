"""Alert persistence."""

from __future__ import annotations

from app.database import Database
from app.repositories.base import json_dump, json_load


def _row_to_alert(row) -> dict:
    return {
        "id": row["id"],
        "sensorId": row["sensor_id"],
        "sensorName": row["sensor_name"],
        "deviceId": row["device_id"],
        "type": row["type"],
        "severity": row["severity"],
        "title": row["title"],
        "description": row["description"],
        "recommendation": row["recommendation"],
        "status": row["status"],
        "source": row["source"],
        "simulated": bool(row["simulated"]),
        "openedAt": row["opened_at"],
        "lastObservedAt": row["last_observed_at"],
        "acknowledgedAt": row["acknowledged_at"],
        "resolvedAt": row["resolved_at"],
        "resolvedAutomatically": bool(row["resolved_automatically"]),
        "metrics": json_load(row["metrics"], {}),
        "reading": json_load(row["reading"], None),
        "timeline": json_load(row["timeline"], []),
    }


class AlertRepository:
    def __init__(self, database: Database) -> None:
        self.database = database

    def list(
        self,
        *,
        status: str | None = None,
        severity: str | None = None,
        source: str | None = None,
        alert_type: str | None = None,
        limit: int = 500,
    ) -> list[dict]:
        clauses = []
        params: list = []
        if status:
            clauses.append("status = ?")
            params.append(status)
        if severity:
            clauses.append("severity = ?")
            params.append(severity)
        if source:
            clauses.append("source = ?")
            params.append(source)
        if alert_type:
            clauses.append("type = ?")
            params.append(alert_type)
        where = f"WHERE {' AND '.join(clauses)}" if clauses else ""
        params.append(max(1, min(limit, 2000)))
        with self.database.connect() as connection:
            rows = connection.execute(
                f"SELECT * FROM alerts {where} ORDER BY opened_at DESC LIMIT ?",
                params,
            ).fetchall()
        return [_row_to_alert(row) for row in rows]

    def get(self, alert_id: str) -> dict | None:
        with self.database.connect() as connection:
            row = connection.execute("SELECT * FROM alerts WHERE id = ?", (alert_id,)).fetchone()
        return _row_to_alert(row) if row else None

    def replace_all(self, alerts: list[dict]) -> None:
        with self.database.connect() as connection:
            connection.execute("DELETE FROM alerts")
            for alert in alerts:
                connection.execute(
                    """
                    INSERT INTO alerts (
                        id, sensor_id, sensor_name, device_id, type, severity, title,
                        description, recommendation, status, source, simulated,
                        opened_at, last_observed_at, acknowledged_at, resolved_at,
                        resolved_automatically, metrics, reading, timeline
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        alert["id"],
                        alert["sensorId"],
                        alert["sensorName"],
                        alert.get("deviceId"),
                        alert["type"],
                        alert["severity"],
                        alert["title"],
                        alert["description"],
                        alert["recommendation"],
                        alert["status"],
                        alert["source"],
                        int(bool(alert.get("simulated"))),
                        alert["openedAt"],
                        alert["lastObservedAt"],
                        alert.get("acknowledgedAt"),
                        alert.get("resolvedAt"),
                        int(bool(alert.get("resolvedAutomatically"))),
                        json_dump(alert.get("metrics", {})),
                        json_dump(alert.get("reading")) if alert.get("reading") is not None else None,
                        json_dump(alert.get("timeline", [])),
                    ),
                )

    def update(self, alert: dict) -> dict:
        with self.database.connect() as connection:
            connection.execute(
                """
                UPDATE alerts SET
                    severity = ?, title = ?, description = ?, recommendation = ?,
                    status = ?, last_observed_at = ?, acknowledged_at = ?, resolved_at = ?,
                    resolved_automatically = ?, metrics = ?, reading = ?, timeline = ?
                WHERE id = ?
                """,
                (
                    alert["severity"],
                    alert["title"],
                    alert["description"],
                    alert["recommendation"],
                    alert["status"],
                    alert["lastObservedAt"],
                    alert.get("acknowledgedAt"),
                    alert.get("resolvedAt"),
                    int(bool(alert.get("resolvedAutomatically"))),
                    json_dump(alert.get("metrics", {})),
                    json_dump(alert.get("reading")) if alert.get("reading") is not None else None,
                    json_dump(alert.get("timeline", [])),
                    alert["id"],
                ),
            )
        return self.get(alert["id"])

    def clear(self) -> None:
        with self.database.connect() as connection:
            connection.execute("DELETE FROM alerts")

    def count_active(self) -> int:
        with self.database.connect() as connection:
            row = connection.execute(
                "SELECT COUNT(*) AS total FROM alerts WHERE status != 'resolved'"
            ).fetchone()
        return int(row["total"])

    def count(self) -> int:
        with self.database.connect() as connection:
            row = connection.execute("SELECT COUNT(*) AS total FROM alerts").fetchone()
        return int(row["total"])
