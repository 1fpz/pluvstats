"""Intervention use cases."""

from __future__ import annotations

from datetime import datetime, timezone

from app.core.errors import DomainError, NotFoundError
from app.repositories.activity import ActivityRepository
from app.repositories.base import next_sequential_id
from app.repositories.interventions import InterventionRepository
from app.repositories.occurrences import OccurrenceRepository


def _iso(value: datetime | None) -> str | None:
    if value is None:
        return None
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc).isoformat()


class InterventionService:
    def __init__(
        self,
        *,
        interventions: InterventionRepository,
        occurrences: OccurrenceRepository,
        activity: ActivityRepository,
    ) -> None:
        self.interventions = interventions
        self.occurrences = occurrences
        self.activity = activity

    def list(self, **filters) -> list[dict]:
        return self.interventions.list(**filters)

    def get(self, intervention_id: str) -> dict:
        intervention = self.interventions.get(intervention_id)
        if not intervention:
            raise NotFoundError("Intervenção não encontrada.")
        return intervention

    def _resolve_occurrence(self, occurrence_id: str | None) -> dict | None:
        if not occurrence_id:
            return None
        occurrence = self.occurrences.get(occurrence_id)
        if not occurrence:
            raise DomainError(f"Ocorrência {occurrence_id} não encontrada.")
        return occurrence

    @staticmethod
    def _validate_completion(status: str, after_level_cm, completed_at) -> None:
        if status == "completed":
            if after_level_cm is None:
                raise DomainError("Informe o nível após a intervenção para concluí-la.")
            if completed_at is None:
                raise DomainError("Informe a data de conclusão da intervenção.")

    def create(self, payload, *, now: datetime | None = None) -> dict:
        now = now or datetime.now(timezone.utc)
        data = payload.model_dump()
        occurrence = self._resolve_occurrence(data.get("occurrence_id"))
        self._validate_completion(data["status"], data.get("after_level_cm"), data.get("completed_at"))
        record = {
            "id": next_sequential_id("INT", self.interventions.ids()),
            "occurrenceId": data.get("occurrence_id"),
            "title": data["title"].strip(),
            "description": data["description"].strip(),
            "status": data["status"],
            "team": (data.get("team") or "Equipe técnica — demonstração").strip(),
            "startedAt": _iso(data["started_at"]),
            "completedAt": _iso(data.get("completed_at")),
            "beforeLevelCm": data["before_level_cm"],
            "afterLevelCm": data.get("after_level_cm"),
            "location": data["location"].strip(),
            "position": (occurrence or {}).get("position"),
            "sensorId": data.get("sensor_id") or (occurrence or {}).get("sensorId"),
            "origin": "demonstration",
            "createdAt": now.isoformat(),
            "updatedAt": now.isoformat(),
        }
        created = self.interventions.insert(record)
        self.activity.add(
            kind="intervention",
            title="Intervenção demonstrativa registrada",
            description=created["title"],
            at=created["startedAt"],
            severity="normal",
            source="simulation",
        )
        return created

    def update(self, intervention_id: str, payload, *, now: datetime | None = None) -> dict:
        now = now or datetime.now(timezone.utc)
        existing = self.get(intervention_id)
        data = payload.model_dump(exclude_unset=True)
        record = dict(existing)

        if "occurrence_id" in data:
            occurrence = self._resolve_occurrence(data["occurrence_id"])
            record["occurrenceId"] = data["occurrence_id"]
            if occurrence:
                record["position"] = occurrence["position"]
                record["sensorId"] = occurrence.get("sensorId")
        for field in ("title", "description", "status", "location"):
            if field in data and data[field] is not None:
                record[field] = data[field].strip()
        if "team" in data:
            record["team"] = (data["team"] or "").strip() or None
        if "started_at" in data:
            record["startedAt"] = _iso(data["started_at"])
        if "completed_at" in data:
            record["completedAt"] = _iso(data["completed_at"])
        if "before_level_cm" in data:
            record["beforeLevelCm"] = data["before_level_cm"]
        if "after_level_cm" in data:
            record["afterLevelCm"] = data["after_level_cm"]
        if "sensor_id" in data:
            record["sensorId"] = data["sensor_id"]

        self._validate_completion(
            record["status"], record.get("afterLevelCm"), record.get("completedAt")
        )
        record["updatedAt"] = now.isoformat()
        updated = self.interventions.update(record)
        self.activity.add(
            kind="intervention",
            title="Intervenção demonstrativa atualizada",
            description=updated["title"],
            at=now.isoformat(),
            severity="normal",
            source="simulation",
        )
        return updated
