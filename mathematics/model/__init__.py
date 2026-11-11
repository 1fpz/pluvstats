"""Pure, dependency-free PLUVSTATS mathematics model."""

from .pluvstats_model import (
    ModelError,
    level_series,
    linear_trend_cm_per_min,
    load_shared_config,
    project_level_cm,
    rise_rate_cm_per_min,
    scenario_metrics,
    time_to_limit_minutes,
    water_level_cm,
)

__all__ = [
    "ModelError",
    "level_series",
    "linear_trend_cm_per_min",
    "load_shared_config",
    "project_level_cm",
    "rise_rate_cm_per_min",
    "scenario_metrics",
    "time_to_limit_minutes",
    "water_level_cm",
]
