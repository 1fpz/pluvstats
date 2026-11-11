"""Hardware ingestion.

Disabled by default. The endpoint is the only path where physical data can
enter the system, and it never marks a device as validated unless the payload
is structurally valid and recent.
"""

from __future__ import annotations

from datetime import datetime, timezone

from app.core.config import Settings
from app.core.errors import (
    ConflictError,
    HardwareDisabledError,
    NotFoundError,
    UnauthorizedDeviceError,
)
from app.repositories.activity import ActivityRepository
from app.repositories.readings import ReadingRepository
from app.repositories.sensors import SensorRepository
from app.services.alerts import AlertService


class HardwareReadingService:
    def __init__(
        self,
        *,
        settings: Settings,
        config: dict,
        sensors: SensorRepository,
        readings: ReadingRepository,
        alerts: AlertService,
        activity: ActivityRepository,
    ) -> None:
        self.settings = settings
        self.config = config
        self.sensors = sensors
        self.readings = readings
        self.alerts = alerts
        self.activity = activity

    def record(self, payload, *, provided_key: str | None, now: datetime | None = None) -> dict:
        if not self.settings.hardware_enabled:
            raise HardwareDisabledError()
        if self.settings.hardware_api_key and provided_key != self.settings.hardware_api_key:
            raise UnauthorizedDeviceError()

        now = now or datetime.now(timezone.utc)
        sensor = self.sensors.get_by_device(payload.device_id)
        if not sensor:
            raise NotFoundError("Dispositivo não cadastrado neste ambiente.")
        if sensor["source"] != "hardware":
            raise ConflictError(
                "Este device_id pertence a um sensor simulado; hardware e simulação não se misturam."
            )

        timestamp = payload.timestamp or now
        if timestamp.tzinfo is None:
            timestamp = timestamp.replace(tzinfo=timezone.utc)
        timestamp = timestamp.astimezone(timezone.utc)
        age_seconds = (now - timestamp).total_seconds()

        minimum, maximum = self.config["thresholds"]["invalidDistanceRangeCm"]
        in_range = minimum <= payload.distance_cm <= maximum
        max_age = self.config["thresholds"]["staleReadingSeconds"]
        fresh = -5 <= age_seconds <= max_age
        quality = "valid" if in_range else "invalid"
        validated = in_range and fresh
        water_level = (
            max(0.0, round(self.config["sensorGeometry"]["sensorHeightCm"] - payload.distance_cm, 2))
            if in_range
            else None
        )
        if not in_range:
            status = "fault_invalid"
        elif fresh:
            status = "hardware_validated"
        else:
            status = "hardware_stale"

        reading = {
            "sensorId": sensor["id"],
            "deviceId": sensor["deviceId"],
            "timestamp": timestamp.isoformat(),
            "distanceCm": payload.distance_cm,
            "waterLevelCm": water_level,
            "source": "hardware",
            "quality": quality,
            "status": status,
            "metadata": {
                "simulated": False,
                "firmware_version": payload.firmware_version,
                "sensor_height_cm": self.config["sensorGeometry"]["sensorHeightCm"],
                "in_range": in_range,
                "age_seconds": round(age_seconds, 2),
            },
        }
        self.readings.insert(reading)
        self.sensors.update_reading_state(
            sensor["id"],
            status=status,
            validated=validated,
            last_reading_at=reading["timestamp"],
            last_reading_level_cm=water_level,
            last_reading_distance_cm=payload.distance_cm,
            last_reading_quality=quality,
            last_reading_source="hardware",
        )

        result = self.alerts.refresh(now=now, readings_by_sensor=self.readings.latest_by_sensor())

        if not in_range:
            self.activity.add(
                kind="sensor",
                title="Leitura física inválida recebida",
                description=f"{sensor['id']} · distância {payload.distance_cm} cm fora da faixa aceita.",
                at=now.isoformat(),
                severity="attention",
                source="hardware",
            )
        elif validated and not sensor.get("validated"):
            self.activity.add(
                kind="sensor",
                title="Leitura física validada",
                description=f"{sensor['id']} · primeiro registro físico recente e estruturalmente válido.",
                at=now.isoformat(),
                severity="normal",
                source="hardware",
            )

        return {
            "accepted": True,
            "sensorId": sensor["id"],
            "deviceId": sensor["deviceId"],
            "quality": quality,
            "status": status,
            "validated": validated,
            "distanceCm": payload.distance_cm,
            "waterLevelCm": water_level,
            "timestamp": reading["timestamp"],
            "alerts": {
                "created": [alert["id"] for alert in result["created"]],
                "updated": [alert["id"] for alert in result["updated"]],
            },
            "message": (
                "Leitura física registrada e considerada válida para operação."
                if validated
                else "Leitura registrada para auditoria, mas não válida para decisão operacional."
            ),
        }
