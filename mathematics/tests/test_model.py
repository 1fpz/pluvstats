"""Tests for the PLUVSTATS mathematics model.

Run from the repository root:

    python -m unittest discover -s mathematics/tests -p "test_*.py"
"""

from __future__ import annotations

import json
import math
import sys
import unittest
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from mathematics.model import (  # noqa: E402
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

SCENARIOS_DIR = Path(__file__).resolve().parents[1] / "scenarios"


def load_scenario(name: str) -> dict:
    return json.loads((SCENARIOS_DIR / name).read_text(encoding="utf-8"))


class LevelTests(unittest.TestCase):
    def setUp(self) -> None:
        self.config = load_shared_config()

    def test_level_is_sensor_height_minus_distance(self) -> None:
        self.assertAlmostEqual(water_level_cm(70), 50.0)
        self.assertAlmostEqual(water_level_cm(112), 8.0)

    def test_level_is_clamped_to_the_channel(self) -> None:
        # Distance beyond the sensor height means a dry channel.
        self.assertEqual(water_level_cm(125), 0.0)
        # A very small distance would imply more water than the channel holds.
        self.assertEqual(water_level_cm(5), 100.0)

    def test_level_uses_the_shared_geometry(self) -> None:
        geometry = self.config["sensorGeometry"]
        self.assertEqual(geometry["sensorHeightCm"], 120)
        self.assertEqual(geometry["channelDepthCm"], 100)
        self.assertAlmostEqual(water_level_cm(70, config=self.config), 50.0)

    def test_invalid_distance_is_rejected(self) -> None:
        with self.assertRaises(ModelError):
            water_level_cm(-1)
        with self.assertRaises(ModelError):
            water_level_cm(math.nan)


class RateTests(unittest.TestCase):
    def test_rate_uses_cm_per_minute(self) -> None:
        self.assertAlmostEqual(rise_rate_cm_per_min(50, 55, 120), 2.5)
        self.assertAlmostEqual(rise_rate_cm_per_min(8, 8, 60), 0.0)

    def test_negative_rate_represents_drainage(self) -> None:
        self.assertAlmostEqual(rise_rate_cm_per_min(60, 40, 120), -10.0)

    def test_elapsed_time_must_be_positive(self) -> None:
        with self.assertRaises(ModelError):
            rise_rate_cm_per_min(50, 55, 0)
        with self.assertRaises(ModelError):
            rise_rate_cm_per_min(50, 55, -30)
        with self.assertRaises(ModelError):
            rise_rate_cm_per_min(50, 55, math.inf)

    def test_short_intervals_convert_correctly(self) -> None:
        self.assertAlmostEqual(rise_rate_cm_per_min(10, 12, 30), 4.0)


class TimeToLimitTests(unittest.TestCase):
    def test_worked_example(self) -> None:
        # h = 55 cm, limit = 75 cm, v = 2.5 cm/min -> 8 minutes.
        self.assertAlmostEqual(time_to_limit_minutes(55, 75, 2.5), 8.0)

    def test_already_at_or_above_the_limit_is_zero(self) -> None:
        self.assertEqual(time_to_limit_minutes(75, 75, 2.5), 0.0)
        self.assertEqual(time_to_limit_minutes(80, 75, 2.5), 0.0)

    def test_undefined_when_not_rising(self) -> None:
        self.assertIsNone(time_to_limit_minutes(60, 75, 0))
        self.assertIsNone(time_to_limit_minutes(60, 75, -4.5))
        self.assertIsNone(time_to_limit_minutes(60, 75, math.nan))

    def test_rate_must_be_positive_to_reach_the_limit(self) -> None:
        self.assertAlmostEqual(time_to_limit_minutes(58, 75, 4.0), 4.25)


class ProjectionTests(unittest.TestCase):
    def test_projection_follows_the_linear_model(self) -> None:
        self.assertAlmostEqual(project_level_cm(58, 4.0, 4.25), 75.0)

    def test_projection_is_clamped_to_the_channel(self) -> None:
        self.assertEqual(project_level_cm(90, 10, 60), 100.0)
        self.assertEqual(project_level_cm(10, -10, 60), 0.0)

    def test_negative_horizon_is_rejected(self) -> None:
        with self.assertRaises(ModelError):
            project_level_cm(50, 2, -1)


class TrendTests(unittest.TestCase):
    def test_least_squares_trend(self) -> None:
        trend = linear_trend_cm_per_min([0, 60, 120, 180], [42, 46, 50, 54])
        self.assertAlmostEqual(trend, 4.0)

    def test_trend_needs_three_points(self) -> None:
        with self.assertRaises(ModelError):
            linear_trend_cm_per_min([0, 60], [42, 46])

    def test_trend_needs_distinct_timestamps(self) -> None:
        with self.assertRaises(ModelError):
            linear_trend_cm_per_min([0, 0, 0], [42, 46, 50])

    def test_trend_requires_matching_lengths(self) -> None:
        with self.assertRaises(ModelError):
            linear_trend_cm_per_min([0, 60, 120], [42, 46])


class ScenarioTests(unittest.TestCase):
    def test_level_series_is_strictly_increasing_in_time(self) -> None:
        scenario = load_scenario("rising-alert.json")
        series = level_series(scenario["readings"])
        times = [point["tSeconds"] for point in series]
        self.assertEqual(times, sorted(set(times)))
        self.assertTrue(all(0 <= point["levelCm"] <= 100 for point in series))

    def test_scenario_timestamps_cannot_repeat(self) -> None:
        with self.assertRaises(ModelError):
            level_series(
                [
                    {"tSeconds": 0, "distanceCm": 100},
                    {"tSeconds": 0, "distanceCm": 90},
                ]
            )

    def test_rising_alert_scenario(self) -> None:
        metrics = scenario_metrics(load_scenario("rising-alert.json"))
        self.assertEqual(metrics["firstLevelCm"], 42.0)
        self.assertEqual(metrics["lastLevelCm"], 58.0)
        self.assertAlmostEqual(metrics["rateCmPerMin"], 4.0)
        self.assertAlmostEqual(metrics["timeToLimitMinutes"], 4.25)

    def test_drainage_scenario_has_no_time_to_limit(self) -> None:
        metrics = scenario_metrics(load_scenario("drainage.json"))
        self.assertAlmostEqual(metrics["rateCmPerMin"], -4.5)
        self.assertIsNone(metrics["timeToLimitMinutes"])

    def test_normal_scenario_stays_near_the_baseline(self) -> None:
        metrics = scenario_metrics(load_scenario("normal.json"))
        self.assertLess(abs(metrics["rateCmPerMin"]), 0.5)
        self.assertGreaterEqual(metrics["lastLevelCm"], 7.0)
        self.assertLessEqual(metrics["lastLevelCm"], 9.0)

    def test_shared_limits_are_used_by_default(self) -> None:
        config = load_shared_config()
        level_limits = config["thresholds"]["waterLevelCm"]
        self.assertEqual(level_limits, {"attention": 25, "alert": 50, "critical": 75})
        metrics = scenario_metrics(load_scenario("rising-alert.json"))
        self.assertEqual(metrics["limitCm"], 75.0)


if __name__ == "__main__":
    unittest.main()
