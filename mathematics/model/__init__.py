"""Pure, dependency-free PLUVSTATS mathematics model."""

from .pluvstats_model import (
    ModelError,
    accumulated_volume_change_m3,
    level_exposure_cm_minutes,
    level_series,
    linear_trend_cm_per_min,
    load_shared_config,
    long_run_level_cm,
    project_level_cm,
    rise_rate_cm_per_min,
    scenario_metrics,
    time_to_limit_minutes,
    water_level_cm,
)

__all__ = [
    "ModelError",
    "accumulated_volume_change_m3",
    "level_exposure_cm_minutes",
    "level_series",
    "linear_trend_cm_per_min",
    "load_shared_config",
    "long_run_level_cm",
    "project_level_cm",
    "rise_rate_cm_per_min",
    "scenario_metrics",
    "time_to_limit_minutes",
    "water_level_cm",
]
