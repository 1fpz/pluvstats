"""Read model used by the management and citizen interfaces.

The snapshot is assembled from persisted state only. A hardware device is never
reported as connected without a recent, structurally valid reading.
"""

from __future__ import annotations

from datetime import datetime, timezone

from app.core.config import Settings
from app.intelligence.sensor_view import active_alert_by_sensor, derive_sensor_view
from app.repositories.activity import ActivityRepository
from app.repositories.alerts import AlertRepository
from app.repositories.interventions import InterventionRepository
from app.repositories.occurrences import OccurrenceRepository
from app.repositories.readings import ReadingRepository
from app.repositories.sensors import SensorRepository
from app.repositories.simulation import SimulationRepository

OPEN_OCCURRENCE_STATUSES = {"open", "validated", "in_progress"}


class SnapshotService:
    def __init__(
        self,
        *,
        settings: Settings,
        config: dict,
        sensors: SensorRepository,
        readings: ReadingRepository,
        occurrences: OccurrenceRepository,
        interventions: InterventionRepository,
        alerts: AlertRepository,
        activity: ActivityRepository,
        simulation: SimulationRepository,
    ) -> None:
        self.settings = settings
        self.config = config
        self.sensors = sensors
        self.readings = readings
        self.occurrences = occurrences
        self.interventions = interventions
        self.alerts = alerts
        self.activity = activity
        self.simulation = simulation

    def build(self, *, now: datetime | None = None) -> dict:
        now = now or datetime.now(timezone.utc)
        sensors = self.sensors.list()
        alerts = self.alerts.list()
        simulation = self.simulation.get_state()
        active = active_alert_by_sensor(alerts)
        views = [
            derive_sensor_view(
                sensor,
                simulation,
                config=self.config,
                now=now,
                active_alert=active.get(sensor["id"]),
            )
            for sensor in sensors
        ]
        occurrences = self.occurrences.list(limit=1000)
        interventions = self.interventions.list(limit=1000)
        activity = self.activity.list(limit=20)
        open_alerts = [alert for alert in alerts if alert["status"] != "resolved"]

        return {
            "version": 2,
            "createdAt": (simulation or {}).get("startedAt") or now.isoformat(),
            "updatedAt": now.isoformat(),
            "now": now.isoformat(),
            "sensors": views,
            "occurrences": occurrences,
            "interventions": interventions,
            "alerts": alerts,
            "simulation": {
                **(simulation or {}),
                "simulatedSensors": sum(1 for sensor in sensors if sensor["source"] == "simulation"),
            },
            "readings": self.readings.latest_by_sensor(),
            "activity": activity,
            "sourceKind": "api",
            "isDemo": self.settings.is_demo,
            "counts": {
                "activeAlerts": len(open_alerts),
                "criticalAlerts": sum(1 for alert in open_alerts if alert["severity"] == "critical"),
                "openOccurrences": sum(
                    1 for occurrence in occurrences if occurrence["status"] in OPEN_OCCURRENCE_STATUSES
                ),
                "sensors": len(views),
                "validatedHardware": sum(1 for sensor in views if sensor["validated"]),
            },
        }
