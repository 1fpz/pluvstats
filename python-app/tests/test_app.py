"""Testes da aplicação Python do PLUVSTATS.

Execução, a partir da pasta `python-app/`:

    python -m unittest discover -s tests -p "test_*.py" -v
"""

from __future__ import annotations

import json
import sys
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

APP_DIR = Path(__file__).resolve().parents[1]
if str(APP_DIR) not in sys.path:
    sys.path.insert(0, str(APP_DIR))

import app  # noqa: E402


class CalculationTests(unittest.TestCase):
    def setUp(self) -> None:
        self.config = dict(app.DEFAULT_CONFIG)

    def test_level_is_height_minus_distance_and_is_clamped(self) -> None:
        self.assertAlmostEqual(app.water_level_cm(70, self.config), 50.0)
        self.assertAlmostEqual(app.water_level_cm(112, self.config), 8.0)
        self.assertEqual(app.water_level_cm(125, self.config), 0.0)
        self.assertEqual(app.water_level_cm(5, self.config), 100.0)

    def test_invalid_distance_is_rejected(self) -> None:
        with self.assertRaises(app.AppError):
            app.water_level_cm(-1, self.config)
        with self.assertRaises(app.AppError):
            app.water_level_cm(float("nan"), self.config)

    def test_rate_and_time_to_limit(self) -> None:
        self.assertAlmostEqual(app.rise_rate_cm_per_min(50, 55, 120), 2.5)
        self.assertAlmostEqual(app.time_to_limit_minutes(55, 75, 2.5), 8.0)
        self.assertEqual(app.time_to_limit_minutes(75, 75, 2.5), 0.0)
        self.assertIsNone(app.time_to_limit_minutes(60, 75, -1.0))

    def test_severity_uses_the_worst_signal(self) -> None:
        # Nível 30 cm é atenção; taxa 4,6 cm/min é crítica.
        self.assertEqual(app.severity_for(30, 4.6, self.config), "crítico")
        # Nível 52 cm é alerta; taxa 0 é normal.
        self.assertEqual(app.severity_for(52, 0.0, self.config), "alerta")
        self.assertEqual(app.severity_for(8, 0.0, self.config), "normal")

    def test_accumulated_volume_is_the_integral_of_the_net_rate(self) -> None:
        readings = [{"levelCm": 42.0}, {"levelCm": 58.0}]
        # V = w · L · Δh / 100 = 2 · 100 · 16 / 100 = 32 m³.
        self.assertAlmostEqual(app.accumulated_volume_m3(readings, self.config), 32.0)
        self.assertEqual(app.accumulated_volume_m3([], self.config), 0.0)


class ValidationTests(unittest.TestCase):
    def setUp(self) -> None:
        self.config = dict(app.DEFAULT_CONFIG)

    def test_distance_accepts_comma_and_dot(self) -> None:
        self.assertAlmostEqual(app.validate_distance("78,5", self.config), 78.5)
        self.assertAlmostEqual(app.validate_distance(" 78.5 ", self.config), 78.5)

    def test_distance_rejects_text_and_out_of_range(self) -> None:
        for value in ("abc", "", "0", "381", "-4"):
            with self.subTest(value=value):
                with self.assertRaises(app.AppError):
                    app.validate_distance(value, self.config)


class StateTests(unittest.TestCase):
    def setUp(self) -> None:
        self.temp = tempfile.TemporaryDirectory()
        self.original_data_dir = app.DATA_DIR
        self.original_state_path = app.STATE_PATH
        app.DATA_DIR = Path(self.temp.name)
        app.STATE_PATH = app.DATA_DIR / "estado.json"
        self.config = dict(app.DEFAULT_CONFIG)

    def tearDown(self) -> None:
        app.DATA_DIR = self.original_data_dir
        app.STATE_PATH = self.original_state_path
        self.temp.cleanup()

    def test_save_and_load_roundtrip(self) -> None:
        state = app.default_state(self.config)
        app.save_state(state)
        loaded = app.load_state(self.config)
        self.assertEqual(len(loaded["points"]), 5)
        self.assertGreater(len(loaded["readings"]), 0)
        self.assertTrue(app.STATE_PATH.exists())
        json.loads(app.STATE_PATH.read_text(encoding="utf-8"))

    def test_corrupt_state_is_rebuilt(self) -> None:
        app.STATE_PATH.write_text("{ isso não é json", encoding="utf-8")
        restored = app.load_state(self.config)
        self.assertEqual(len(restored["points"]), 5)
        self.assertGreater(len(restored["readings"]), 0)

    def test_explicit_reading_computes_rate_and_limit(self) -> None:
        state = {
            "version": app.STATE_VERSION,
            "createdAt": app.now_iso(),
            "points": [dict(app.POINTS[0])],
            "readings": [],
        }
        start = datetime(2026, 1, 1, 12, 0, tzinfo=timezone.utc)
        first = app._append_reading(state, "PS-01", 70.0, start, "teste", self.config)
        second = app._append_reading(
            state, "PS-01", 68.0, start + timedelta(seconds=120), "teste", self.config
        )
        self.assertEqual(first["levelCm"], 50.0)
        self.assertIsNone(first["rateCmPerMin"])
        self.assertEqual(second["levelCm"], 52.0)
        self.assertAlmostEqual(second["rateCmPerMin"], 1.0)
        self.assertAlmostEqual(second["timeToLimitMinutes"], 23.0)
        self.assertEqual(second["severity"], "alerta")

    def test_scenario_adds_nine_chronological_readings(self) -> None:
        state = {
            "version": app.STATE_VERSION,
            "createdAt": app.now_iso(),
            "points": [dict(app.POINTS[0])],
            "readings": [],
        }
        count = app.apply_scenario(state, "2", "PS-01", self.config)
        readings = app.point_readings(state, "PS-01")
        self.assertEqual(count, 9)
        self.assertEqual(len(readings), 9)
        self.assertEqual([item["recordedAt"] for item in readings], sorted(item["recordedAt"] for item in readings))
        self.assertAlmostEqual(readings[-1]["levelCm"], 58.0)
        self.assertAlmostEqual(readings[-1]["rateCmPerMin"], 4.0)

    def test_history_and_report_do_not_crash(self) -> None:
        state = app.default_state(self.config)
        app.list_points(state, self.config)
        app.show_history(state, "PS-01", self.config)
        app.show_report(state, self.config)


if __name__ == "__main__":
    unittest.main()
