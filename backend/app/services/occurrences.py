"""Occurrence use cases: validation, sequential identifiers and audit trail."""

from __future__ import annotations

from datetime import datetime, timezone

from app.core.errors import DomainError, NotFoundError
from app.repositories.activity import ActivityRepository
from app.repositories.base import next_sequential_id, to_iso
from app.repositories.occurrences import OccurrenceRepository
from app.repositories.sensors import SensorRepository


def _iso(value) -> str | None:
    if value is None:
        return None
    if isinstance(value, datetime):
        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)
        return value.astimezone(timezone.utc).isoformat()
    return str(value)


class OccurrenceService:
    def __init__(
        self,
        *,
        occurrences: OccurrenceRepository,
        sensors: SensorRepository,
        activity: ActivityRepository,
    ) -> None:
        self.occurrences = occurrences
        self.sensors = sensors
        self.activity = activity

    def list(self, **filters) -> list[dict]:
        return self.occurrences.list(**filters)

    def get(self, occurrence_id: str) -> dict:
        occurrence = self.occurrences.get(occurrence_id)
        if not occurrence:
            raise NotFoundError("Ocorrência não encontrada.")
        return occurrence

    def _assert_sensor(self, sensor_id: str | None) -> None:
        if sensor_id and not self.sensors.get(sensor_id):
            raise DomainError(f"Sensor {sensor_id} não cadastrado neste ambiente.")

    def create(self, payload, *, now: datetime | None = None) -> dict:
        now = now or datetime.now(timezone.utc)
        data = payload.model_dump()
        self._assert_sensor(data.get("sensor_id"))
        occurrence = {
            "id": next_sequential_id("OCO", self.occurrences.ids()),
            "title": data["title"].strip(),
            "type": data["type"],
            "status": data["status"],
            "severity": data["severity"],
            "position": {"lat": data["position"]["lat"], "lng": data["position"]["lng"]},
            "address": data["address"].strip(),
            "neighborhood": data["neighborhood"].strip(),
            "description": data["description"].strip(),
            "reportedAt": _iso(data["reported_at"]),
            "updatedAt": now.isoformat(),
            "recurrenceCount": data.get("recurrence_count", 1),
            "sensorId": data.get("sensor_id"),
            "affectedPeopleEstimate": data.get("affected_people_estimate", 0),
            "reporter": data.get("reporter") or "Canal de demonstração",
            "origin": "demonstration",
            "evidence": data.get("evidence") or ["Registro criado no ambiente de demonstração"],
        }
        record = self.occurrences.insert(occurrence)
        self.activity.add(
            kind="occurrence",
            title="Ocorrência demonstrativa criada",
            description=record["title"],
            at=record["updatedAt"],
            severity=record["severity"],
            source="simulation",
        )
        return record

    def update(self, occurrence_id: str, payload, *, now: datetime | None = None) -> dict:
        now = now or datetime.now(timezone.utc)
        existing = self.get(occurrence_id)
        data = payload.model_dump(exclude_unset=True)
        if data.get("sensor_id"):
            self._assert_sensor(data["sensor_id"])
        record = dict(existing)
        for field in ("title", "type", "status", "severity", "address", "neighborhood", "description",
                      "reporter", "sensor_id"):
            if field in data:
                key = "sensorId" if field == "sensor_id" else field
                value = data[field]
                record[key] = value.strip() if isinstance(value, str) else value
        if "position" in data:
            record["position"] = {
                "lat": data["position"]["lat"],
                "lng": data["position"]["lng"],
            }
        if "reported_at" in data:
            record["reportedAt"] = _iso(data["reported_at"])
        if "recurrence_count" in data:
            record["recurrenceCount"] = data["recurrence_count"]
        if "affected_people_estimate" in data:
            record["affectedPeopleEstimate"] = data["affected_people_estimate"]
        if "evidence" in data and data["evidence"] is not None:
            record["evidence"] = data["evidence"]
        record["updatedAt"] = to_iso(now) or now.isoformat()
        updated = self.occurrences.update(record)
        self.activity.add(
            kind="occurrence",
            title="Ocorrência demonstrativa atualizada",
            description=updated["title"],
            at=updated["updatedAt"],
            severity=updated["severity"],
            source="simulation",
        )
        return updated

    def delete(self, occurrence_id: str) -> dict:
        record = self.get(occurrence_id)
        self.occurrences.delete(occurrence_id)
        self.activity.add(
            kind="occurrence",
            title="Ocorrência demonstrativa excluída",
            description=record["title"],
            at=datetime.now(timezone.utc).isoformat(),
            severity="normal",
            source="simulation",
        )
        return {"id": occurrence_id}
