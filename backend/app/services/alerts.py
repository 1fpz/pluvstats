"""Alert orchestration around the pure rule engine."""

from __future__ import annotations

from datetime import datetime, timezone

from app.core.errors import ConflictError, NotFoundError
from app.intelligence.alerts import (
    acknowledge_alert_record,
    evaluate_alerts,
    resolve_alert_record,
)
from app.repositories.activity import ActivityRepository
from app.repositories.alerts import AlertRepository
from app.repositories.readings import ReadingRepository
from app.repositories.sensors import SensorRepository


class AlertService:
    def __init__(
        self,
        *,
        config: dict,
        sensors: SensorRepository,
        readings: ReadingRepository,
        alerts: AlertRepository,
        activity: ActivityRepository,
    ) -> None:
        self.config = config
        self.sensors = sensors
        self.readings = readings
        self.alerts = alerts
        self.activity = activity

    def refresh(
        self,
        *,
        now: datetime | None = None,
        readings_by_sensor: dict[str, dict] | None = None,
    ) -> dict:
        now = now or datetime.now(timezone.utc)
        sensors = self.sensors.list()
        latest = readings_by_sensor if readings_by_sensor is not None else self.readings.latest_by_sensor()
        result = evaluate_alerts(
            sensors=sensors,
            readings_by_sensor=latest,
            alerts=self.alerts.list(),
            config=self.config,
            now=now,
        )
        self.alerts.replace_all(result["alerts"])
        for alert in result["created"]:
            self.activity.add(
                kind="alert",
                title=alert["title"],
                description=f"{alert['sensorName']} · {alert['description']}",
                at=alert["openedAt"],
                severity=alert["severity"],
                source=alert["source"],
            )
        for alert in result["updated"]:
            self.activity.add(
                kind="alert",
                title=f"Severidade atualizada: {alert['title']}",
                description=f"{alert['sensorName']} · agora em {alert['severity']}.",
                at=alert["lastObservedAt"],
                severity=alert["severity"],
                source=alert["source"],
            )
        for alert in result["resolved"]:
            self.activity.add(
                kind="alert",
                title="Alerta encerrado automaticamente",
                description=f"{alert['sensorName']} · condição normalizada.",
                at=alert["resolvedAt"] or now.isoformat(),
                severity="normal",
                source=alert["source"],
            )
        return result

    def list(self, **filters) -> list[dict]:
        return self.alerts.list(**filters)

    def acknowledge(self, alert_id: str, *, now: datetime | None = None) -> dict:
        now = now or datetime.now(timezone.utc)
        alert = self.alerts.get(alert_id)
        if not alert:
            raise NotFoundError("Alerta não encontrado.")
        if alert["status"] == "resolved":
            raise ConflictError("Alerta já encerrado; não é possível reconhecê-lo.")
        record = acknowledge_alert_record(alert, now)
        updated = self.alerts.update(record)
        self.activity.add(
            kind="alert",
            title="Alerta reconhecido",
            description=f"{updated['sensorName']} · {updated['title']}",
            at=updated["acknowledgedAt"],
            severity=updated["severity"],
            source=updated["source"],
        )
        return updated

    def resolve(self, alert_id: str, *, now: datetime | None = None) -> dict:
        now = now or datetime.now(timezone.utc)
        alert = self.alerts.get(alert_id)
        if not alert:
            raise NotFoundError("Alerta não encontrado.")
        if alert["status"] == "resolved":
            raise ConflictError("Alerta já encerrado.")
        record = resolve_alert_record(alert, now)
        updated = self.alerts.update(record)
        self.activity.add(
            kind="alert",
            title="Alerta resolvido",
            description=f"{updated['sensorName']} · {updated['title']}",
            at=updated["resolvedAt"],
            severity=updated["severity"],
            source=updated["source"],
        )
        return updated
