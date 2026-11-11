"""Deterministic demonstration seed and reset.

The seed is the only place that knows the fictional dataset. It never touches
hardware state beyond registering the unvalidated diagnostic device.
"""

from __future__ import annotations

from datetime import datetime, timezone

from app.intelligence.alerts import evaluate_alerts
from app.intelligence.simulation import build_reading, create_simulation_state
from app.repositories.activity import ActivityRepository
from app.repositories.alerts import AlertRepository
from app.repositories.interventions import InterventionRepository
from app.repositories.occurrences import OccurrenceRepository
from app.repositories.readings import ReadingRepository
from app.repositories.sensors import SensorRepository
from app.repositories.simulation import SimulationRepository
from app.services.seed_data import SEED_INTERVENTIONS, SEED_OCCURRENCES, SEED_SENSORS


class SeedService:
    def __init__(
        self,
        *,
        config: dict,
        sensors: SensorRepository,
        readings: ReadingRepository,
        occurrences: OccurrenceRepository,
        interventions: InterventionRepository,
        alerts: AlertRepository,
        activity: ActivityRepository,
        simulation: SimulationRepository,
    ) -> None:
        self.config = config
        self.sensors = sensors
        self.readings = readings
        self.occurrences = occurrences
        self.interventions = interventions
        self.alerts = alerts
        self.activity = activity
        self.simulation = simulation

    def ensure_seeded(self) -> bool:
        """Seed an empty database. Returns True when the seed was written."""
        if self.sensors.count() == 0:
            self.reset()
            return True
        if self.simulation.get_state() is None:
            now = datetime.now(timezone.utc)
            sensors = self.sensors.list()
            state = create_simulation_state(sensors, self.config, now=now, scenario="normal", running=True)
            self.simulation.save_state(state, updated_at=now.isoformat())
        return False

    def reset(self, *, now: datetime | None = None) -> None:
        now = now or datetime.now(timezone.utc)
        # Child rows first: readings reference sensors.
        self.readings.clear()
        self.alerts.clear()
        self.interventions.clear()
        self.occurrences.clear()
        self.sensors.clear()
        self.activity.clear()
        self.simulation.clear()

        sensors = [self.sensors.insert(sensor) for sensor in SEED_SENSORS]
        occurrences = [self.occurrences.insert(occurrence) for occurrence in SEED_OCCURRENCES]
        for intervention in SEED_INTERVENTIONS:
            self.interventions.insert(intervention)

        state = create_simulation_state(sensors, self.config, now=now, scenario="normal", running=True)
        readings_by_sensor: dict[str, dict] = {}
        for sensor in sensors:
            if sensor["source"] != "simulation":
                continue
            runtime = state["sensors"].get(sensor["id"])
            if not runtime:
                continue
            reading = build_reading(sensor, runtime, self.config, now, state["scenario"])
            self.readings.insert(reading)
            readings_by_sensor[sensor["id"]] = reading
            self._update_sensor_from_reading(sensor, reading)
        self.simulation.save_state(state, updated_at=now.isoformat())

        result = evaluate_alerts(
            sensors=sensors,
            readings_by_sensor=readings_by_sensor,
            alerts=[],
            config=self.config,
            now=now,
        )
        self.alerts.replace_all(result["alerts"])

        recent = sorted(occurrences, key=lambda item: item["reportedAt"], reverse=True)[:6]
        for occurrence in recent:
            self.activity.add(
                kind="occurrence",
                title="Ocorrência demonstrativa registrada",
                description=occurrence["title"],
                at=occurrence["updatedAt"] or occurrence["reportedAt"],
                severity=occurrence["severity"],
                source="simulation",
            )
        for alert in result["alerts"][:4]:
            self.activity.add(
                kind="alert",
                title=alert["title"],
                description=f"{alert['sensorName']} · {alert['description']}",
                at=alert["openedAt"],
                severity=alert["severity"],
                source=alert["source"],
            )

    def _update_sensor_from_reading(self, sensor: dict, reading: dict) -> None:
        self.sensors.update_reading_state(
            sensor["id"],
            status=reading.get("status") or "simulation_active",
            validated=False,
            last_reading_at=reading.get("timestamp"),
            last_reading_level_cm=reading.get("waterLevelCm"),
            last_reading_distance_cm=reading.get("distanceCm"),
            last_reading_quality=reading.get("quality"),
            last_reading_source=reading.get("source"),
        )
