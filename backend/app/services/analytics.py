"""Read-only analytics aggregations.

These numbers describe the demonstration dataset. They are not forecasts and
must not be presented as official municipal indicators.
"""

from __future__ import annotations

from collections import Counter
from datetime import datetime, timezone

from app.intelligence.scoring import score_occurrence
from app.repositories.readings import ReadingRepository
from app.repositories.sensors import SensorRepository
from app.services.snapshot import SnapshotService

ACTIVE_STATUSES = {"open", "validated", "in_progress"}


def _average(values: list[float]) -> float | None:
    return round(sum(values) / len(values), 2) if values else None


class AnalyticsService:
    def __init__(
        self,
        *,
        config: dict,
        sensors: SensorRepository,
        readings: ReadingRepository,
        snapshot: SnapshotService,
    ) -> None:
        self.config = config
        self.sensors = sensors
        self.readings = readings
        self.snapshot = snapshot

    def summary(self, *, now: datetime | None = None) -> dict:
        now = now or datetime.now(timezone.utc)
        snap = self.snapshot.build(now=now)
        occurrences = snap["occurrences"]
        alerts = snap["alerts"]
        interventions = snap["interventions"]
        sensors = snap["sensors"]
        stats = self.readings.stats_by_sensor()

        open_alerts = [alert for alert in alerts if alert["status"] != "resolved"]
        levels = [
            float(sensor["levelCm"])
            for sensor in sensors
            if sensor.get("levelCm") is not None
            and sensor.get("status") in {"simulation_active", "hardware_validated"}
        ]
        return {
            "generatedAt": now.isoformat(),
            "experimental": True,
            "note": "Indicadores demonstrativos. Não representam risco oficial nem previsão.",
            "counts": {
                **snap["counts"],
                "occurrences": len(occurrences),
                "interventions": len(interventions),
                "readings": sum(item["total"] for item in stats.values()),
                "validReadings": sum(item["valid"] for item in stats.values()),
            },
            "occurrences": {
                "total": len(occurrences),
                "active": sum(1 for item in occurrences if item["status"] in ACTIVE_STATUSES),
                "byStatus": dict(Counter(item["status"] for item in occurrences)),
                "bySeverity": dict(Counter(item["severity"] for item in occurrences)),
                "byType": dict(Counter(item["type"] for item in occurrences)),
                "affectedPeopleEstimate": sum(
                    item.get("affectedPeopleEstimate") or 0 for item in occurrences
                ),
            },
            "alerts": {
                "total": len(alerts),
                "active": len(open_alerts),
                "byStatus": dict(Counter(item["status"] for item in alerts)),
                "bySeverity": dict(Counter(item["severity"] for item in open_alerts)),
                "simulated": sum(1 for item in open_alerts if item["simulated"]),
            },
            "sensors": {
                "total": len(sensors),
                "simulated": sum(1 for item in sensors if item["source"] == "simulation"),
                "hardware": sum(1 for item in sensors if item["source"] == "hardware"),
                "validatedHardware": sum(1 for item in sensors if item["validated"]),
                "byStatus": dict(Counter(item["status"] for item in sensors)),
            },
            "interventions": {
                "total": len(interventions),
                "byStatus": dict(Counter(item["status"] for item in interventions)),
                "completed": sum(1 for item in interventions if item["status"] == "completed"),
            },
            "levels": {
                "averageCm": _average(levels),
                "minimumCm": round(min(levels), 2) if levels else None,
                "maximumCm": round(max(levels), 2) if levels else None,
                "monitoredSensors": len(levels),
            },
        }

    def timeseries(self, *, limit: int = 240) -> dict:
        records = self.readings.list(limit=max(1, min(limit, 2000)))
        grouped: dict[str, list[dict]] = {}
        for record in reversed(records):
            grouped.setdefault(record["sensorId"], []).append(
                {
                    "t": record["timestamp"],
                    "levelCm": record["waterLevelCm"],
                    "rateCmPerMin": (record.get("metadata") or {}).get("rate_cm_per_min"),
                    "quality": record["quality"],
                }
            )
        sensors = {sensor["id"]: sensor for sensor in self.sensors.list()}
        return {
            "generatedAt": datetime.now(timezone.utc).isoformat(),
            "note": "Série de leituras demonstrativas, sem calibração hidráulica.",
            "series": [
                {
                    "sensorId": sensor_id,
                    "sensorName": (sensors.get(sensor_id) or {}).get("shortName", sensor_id),
                    "source": (sensors.get(sensor_id) or {}).get("source"),
                    "points": points,
                }
                for sensor_id, points in sorted(grouped.items())
            ],
        }

    def neighborhoods(self, *, now: datetime | None = None) -> dict:
        now = now or datetime.now(timezone.utc)
        snap = self.snapshot.build(now=now)
        buckets: dict[str, dict] = {}
        for occurrence in snap["occurrences"]:
            key = occurrence["neighborhood"]
            bucket = buckets.setdefault(
                key,
                {
                    "neighborhood": key,
                    "occurrences": 0,
                    "active": 0,
                    "critical": 0,
                    "recurrence": 0,
                    "affectedPeopleEstimate": 0,
                    "lastReportedAt": None,
                },
            )
            bucket["occurrences"] += 1
            if occurrence["status"] in ACTIVE_STATUSES:
                bucket["active"] += 1
            if occurrence["severity"] == "critical":
                bucket["critical"] += 1
            bucket["recurrence"] += occurrence.get("recurrenceCount") or 0
            bucket["affectedPeopleEstimate"] += occurrence.get("affectedPeopleEstimate") or 0
            last = occurrence["reportedAt"]
            if bucket["lastReportedAt"] is None or last > bucket["lastReportedAt"]:
                bucket["lastReportedAt"] = last

        for sensor in snap["sensors"]:
            bucket = buckets.setdefault(
                sensor["neighborhood"],
                {
                    "neighborhood": sensor["neighborhood"],
                    "occurrences": 0,
                    "active": 0,
                    "critical": 0,
                    "recurrence": 0,
                    "affectedPeopleEstimate": 0,
                    "lastReportedAt": None,
                },
            )
            bucket["sensors"] = bucket.get("sensors", 0) + 1
            if sensor.get("levelCm") is not None:
                bucket["maxLevelCm"] = max(bucket.get("maxLevelCm") or 0, sensor["levelCm"])

        ordered = sorted(
            buckets.values(),
            key=lambda item: (-item["occurrences"], item["neighborhood"]),
        )
        for item in ordered:
            item.setdefault("sensors", 0)
            item.setdefault("maxLevelCm", None)
        return {
            "generatedAt": now.isoformat(),
            "experimental": True,
            "neighborhoods": ordered,
        }

    def sensor_stats(self, *, now: datetime | None = None) -> dict:
        now = now or datetime.now(timezone.utc)
        snap = self.snapshot.build(now=now)
        stats = self.readings.stats_by_sensor()
        return {
            "generatedAt": now.isoformat(),
            "sensors": [
                {
                    "id": sensor["id"],
                    "name": sensor["name"],
                    "shortName": sensor["shortName"],
                    "source": sensor["source"],
                    "status": sensor["status"],
                    "validated": sensor["validated"],
                    "levelCm": sensor.get("levelCm"),
                    "quality": sensor.get("quality"),
                    "readings": stats.get(sensor["id"], {}),
                    "simulated": sensor.get("simulated", False),
                }
                for sensor in snap["sensors"]
            ],
        }

    def priorities(self, *, now: datetime | None = None) -> dict:
        now = now or datetime.now(timezone.utc)
        snap = self.snapshot.build(now=now)
        scored = [
            {
                **occurrence,
                "priority": score_occurrence(
                    occurrence,
                    sensors=snap["sensors"],
                    now=now,
                    threshold_attention=self.config["thresholds"]["waterLevelCm"]["attention"],
                    threshold_alert=self.config["thresholds"]["waterLevelCm"]["alert"],
                ),
            }
            for occurrence in snap["occurrences"]
        ]
        scored.sort(key=lambda item: item["priority"]["score"], reverse=True)
        return {
            "generatedAt": now.isoformat(),
            "experimental": True,
            "note": (
                "Priorização explicável experimental. Não é modelo preditivo nem "
                "classificação oficial de risco."
            ),
            "weights": {
                "recurrence": 0.3,
                "severity": 0.3,
                "recency": 0.2,
                "corroboration": 0.2,
            },
            "occurrences": scored,
        }
