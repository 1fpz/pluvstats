"""Tests for the firmware threshold generator.

Run from the repository root:

    python -m unittest discover -s edge/tools -p "test_*.py"
"""

from __future__ import annotations

import json
import sys
import unittest
from pathlib import Path

TOOLS_DIR = Path(__file__).resolve().parent
sys.path.insert(0, str(TOOLS_DIR))

import sync_thresholds  # noqa: E402


class ThresholdHeaderTests(unittest.TestCase):
    def setUp(self) -> None:
        self.config = json.loads(sync_thresholds.SHARED_CONFIG.read_text(encoding="utf-8"))

    def test_committed_header_matches_shared_config(self) -> None:
        expected = sync_thresholds.render(self.config)
        actual = sync_thresholds.OUTPUT_HEADER.read_text(encoding="utf-8")
        self.assertEqual(actual, expected, "regenerate with python edge/tools/sync_thresholds.py")

    def test_rendered_values_come_from_the_shared_file(self) -> None:
        rendered = sync_thresholds.render(self.config)
        level = self.config["thresholds"]["waterLevelCm"]
        self.assertIn(f"#define PLUVSTATS_LEVEL_ATTENTION_CM {level['attention']:.1f}f", rendered)
        self.assertIn(f"#define PLUVSTATS_LEVEL_ALERT_CM {level['alert']:.1f}f", rendered)
        self.assertIn(f"#define PLUVSTATS_LEVEL_CRITICAL_CM {level['critical']:.1f}f", rendered)

    def test_float_formatting_is_valid_c(self) -> None:
        self.assertEqual(sync_thresholds.c_float(25), "25.0f")
        self.assertEqual(sync_thresholds.c_float(0.4), "0.4f")
        self.assertEqual(sync_thresholds.c_float(4.5), "4.5f")

    def test_no_placeholder_values(self) -> None:
        rendered = sync_thresholds.render(self.config)
        self.assertNotIn("TODO", rendered)
        self.assertNotIn("0.0f  //", rendered)


if __name__ == "__main__":
    unittest.main()
