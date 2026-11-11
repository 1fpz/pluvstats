"""Simulation orchestration: tick, commands and alert reconciliation."""

from __future__ import annotations

from datetime import datetime, timezone

from app.intelligence.simulation import (
    apply_simulation_command,
    build_reading,
    tick_simulation,
)
from app.repositories.activity import ActivityRepository
from app.repositories.readings import ReadingRepository
from app.repositories.sensors import SensorRepository
from app.repositories.simulation import SimulationRepository
from app.services.alerts import AlertService
from app.services.snapshot import SnapshotService

LEVEL_ACTIONS = {"raise", "lower", "drain", "set_level"}


class SimulationService:
    def __init__(
        self,
        *,
        config: dict,
        sensors: SensorRepository,
        readings: ReadingRepository,
        simulation: SimulationRepository,
        alerts: AlertService,
        activity: ActivityRepository,
        snapshot: SnapshotService,
    ) -> None:
        self.config = config
        self.sensors = sensors
        self.readings = readings
        self.simulation = simulation
        self.alerts = alerts
        self.activity = activity
        self.snapshot = snapshot

    def state(self) -> dict | None:
        return self.simulation.get_state()

    def _persist_readings(self, state: dict, sensors: list[dict], now: datetime) -> dict[str, dict]:
        readings_by_sensor: dict[str, dict] = {}
        for sensor in sensors:
            if sensor["source"] != "simulation":
                continue
            runtime = state.get("sensors", {}).get(sensor["id"])
            if not runtime:
                continue
            reading = build_reading(sensor, runtime, self.config, now, state["scenario"])
            self.readings.insert(reading)
            readings_by_sensor[sensor["id"]] = reading
            self.sensors.update_reading_state(
                sensor["id"],
                status=reading.get("status") or "simulation_active",
                validated=False,
                last_reading_at=reading.get("timestamp"),
                last_reading_level_cm=reading.get("waterLevelCm"),
                last_reading_distance_cm=reading.get("distanceCm"),
                last_reading_quality=reading.get("quality"),
                last_reading_source="simulation",
            )
        return readings_by_sensor

    def tick(self, *, now: datetime | None = None) -> dict:
        now = now or datetime.now(timezone.utc)
        state = self.simulation.get_state()
        if state is None:
            self.activity.add(
                kind="simulation",
                title="Estado do simulador ausente",
                description="Nenhum estado de simulação encontrado; reinicie a demonstração.",
                at=now.isoformat(),
                severity="attention",
                source="simulation",
            )
            return {"snapshot": self.snapshot.build(now=now), "readings": [], "alerts": []}

        if not state.get("running"):
            return {"snapshot": self.snapshot.build(now=now), "readings": [], "alerts": []}

        sensors = self.sensors.list()
        next_state, readings = tick_simulation(state, sensors, self.config, now=now)
        self.simulation.save_state(next_state, updated_at=now.isoformat())
        readings_by_sensor = self._persist_readings(next_state, sensors, now)
        self.readings.prune()
        result = self.alerts.refresh(now=now, readings_by_sensor=readings_by_sensor)
        return {
            "snapshot": self.snapshot.build(now=now),
            "readings": readings,
            "alerts": result,
        }

    def command(self, command: dict, *, now: datetime | None = None) -> dict:
        now = now or datetime.now(timezone.utc)
        sensors = self.sensors.list()
        state = self.simulation.get_state()
        next_state = apply_simulation_command(state, command, sensors, self.config, now=now)
        self.simulation.save_state(next_state, updated_at=now.isoformat())
        readings_by_sensor = self._persist_readings(next_state, sensors, now)
        self.readings.prune()
        result = self.alerts.refresh(now=now, readings_by_sensor=readings_by_sensor)
        self.activity.add(
            kind="simulation",
            title="Controle do simulador",
            description=f"Ação \"{command.get('action')}\" aplicada ao ambiente demonstrativo.",
            at=now.isoformat(),
            severity="normal",
            source="simulation",
        )
        return {
            "snapshot": self.snapshot.build(now=now),
            "readings": list(readings_by_sensor.values()),
            "alerts": result,
        }
