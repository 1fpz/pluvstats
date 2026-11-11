"""Composition root for the service layer."""

from __future__ import annotations

from dataclasses import dataclass

from app.core.config import Settings, load_shared_config
from app.database import Database
from app.repositories.activity import ActivityRepository
from app.repositories.alerts import AlertRepository
from app.repositories.interventions import InterventionRepository
from app.repositories.occurrences import OccurrenceRepository
from app.repositories.readings import ReadingRepository
from app.repositories.sensors import SensorRepository
from app.repositories.simulation import SimulationRepository
from app.services.alerts import AlertService
from app.services.analytics import AnalyticsService
from app.services.interventions import InterventionService
from app.services.occurrences import OccurrenceService
from app.services.readings import HardwareReadingService
from app.services.seed import SeedService
from app.services.simulation import SimulationService
from app.services.snapshot import SnapshotService


@dataclass
class ServiceContainer:
    settings: Settings
    database: Database
    config: dict
    sensors: SensorRepository
    readings: ReadingRepository
    occurrences: OccurrenceRepository
    interventions: InterventionRepository
    alerts_repository: AlertRepository
    activity: ActivityRepository
    simulation_repository: SimulationRepository
    seed: SeedService
    snapshot: SnapshotService
    occurrence_service: OccurrenceService
    intervention_service: InterventionService
    alert_service: AlertService
    simulation_service: SimulationService
    hardware_service: HardwareReadingService
    analytics_service: AnalyticsService

    @classmethod
    def build(cls, settings: Settings, database: Database | None = None) -> "ServiceContainer":
        database = database or Database(settings.database_path)
        database.initialize()
        config = load_shared_config()

        sensors = SensorRepository(database)
        readings = ReadingRepository(database)
        occurrences = OccurrenceRepository(database)
        interventions = InterventionRepository(database)
        alerts_repository = AlertRepository(database)
        activity = ActivityRepository(database)
        simulation_repository = SimulationRepository(database)

        snapshot = SnapshotService(
            settings=settings,
            config=config,
            sensors=sensors,
            readings=readings,
            occurrences=occurrences,
            interventions=interventions,
            alerts=alerts_repository,
            activity=activity,
            simulation=simulation_repository,
        )
        seed = SeedService(
            config=config,
            sensors=sensors,
            readings=readings,
            occurrences=occurrences,
            interventions=interventions,
            alerts=alerts_repository,
            activity=activity,
            simulation=simulation_repository,
        )
        alert_service = AlertService(
            config=config,
            sensors=sensors,
            readings=readings,
            alerts=alerts_repository,
            activity=activity,
        )
        occurrence_service = OccurrenceService(
            occurrences=occurrences,
            sensors=sensors,
            activity=activity,
        )
        intervention_service = InterventionService(
            interventions=interventions,
            occurrences=occurrences,
            activity=activity,
        )
        simulation_service = SimulationService(
            config=config,
            sensors=sensors,
            readings=readings,
            simulation=simulation_repository,
            alerts=alert_service,
            activity=activity,
            snapshot=snapshot,
        )
        hardware_service = HardwareReadingService(
            settings=settings,
            config=config,
            sensors=sensors,
            readings=readings,
            alerts=alert_service,
            activity=activity,
        )
        analytics_service = AnalyticsService(
            config=config,
            sensors=sensors,
            readings=readings,
            snapshot=snapshot,
        )

        return cls(
            settings=settings,
            database=database,
            config=config,
            sensors=sensors,
            readings=readings,
            occurrences=occurrences,
            interventions=interventions,
            alerts_repository=alerts_repository,
            activity=activity,
            simulation_repository=simulation_repository,
            seed=seed,
            snapshot=snapshot,
            occurrence_service=occurrence_service,
            intervention_service=intervention_service,
            alert_service=alert_service,
            simulation_service=simulation_service,
            hardware_service=hardware_service,
            analytics_service=analytics_service,
        )
