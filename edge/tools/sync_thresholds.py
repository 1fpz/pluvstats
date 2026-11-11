#!/usr/bin/env python3
"""Generate the ESP32 configuration header from the shared JSON config.

The firmware cannot parse JSON at runtime, so the thresholds are emitted as C
constants. This script is the only supported way to change them: run it after
editing `shared/pluvstats.config.json` and commit both files together.

Usage:
    python edge/tools/sync_thresholds.py           # write the header
    python edge/tools/sync_thresholds.py --check   # fail if the header drifted
"""

from __future__ import annotations

import argparse
import json
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
SHARED_CONFIG = REPO_ROOT / "shared" / "pluvstats.config.json"
OUTPUT_HEADER = REPO_ROOT / "edge" / "esp32" / "pluvstats_sensor" / "generated_config.h"

FIRMWARE_VERSION = "0.1.0"


def c_float(value: float | int) -> str:
    """Render a JSON number as a C float literal (25 -> 25.0f)."""
    text = f"{float(value):.6f}".rstrip("0").rstrip(".")
    if "." not in text:
        text += ".0"
    return f"{text}f"


def render(config: dict) -> str:
    thresholds = config["thresholds"]
    level = thresholds["waterLevelCm"]
    rate = thresholds["riseRateCmPerMin"]
    geometry = config["sensorGeometry"]
    invalid_min, invalid_max = thresholds["invalidDistanceRangeCm"]

    lines = [
        "// AUTO-GENERATED FILE - DO NOT EDIT BY HAND.",
        f"// Source: shared/pluvstats.config.json (version {config['version']}).",
        "// Regenerate with: python edge/tools/sync_thresholds.py",
        "// The firmware mirrors the same experimental limits used by the API.",
        "",
        "#ifndef PLUVSTATS_GENERATED_CONFIG_H",
        "#define PLUVSTATS_GENERATED_CONFIG_H",
        "",
        f'#define PLUVSTATS_FIRMWARE_VERSION "{FIRMWARE_VERSION}"',
        f'#define PLUVSTATS_CONFIG_VERSION "{config["version"]}"',
        "",
        f"#define PLUVSTATS_LEVEL_ATTENTION_CM {c_float(level['attention'])}",
        f"#define PLUVSTATS_LEVEL_ALERT_CM {c_float(level['alert'])}",
        f"#define PLUVSTATS_LEVEL_CRITICAL_CM {c_float(level['critical'])}",
        "",
        f"#define PLUVSTATS_RATE_ATTENTION_CM_PER_MIN {c_float(rate['attention'])}",
        f"#define PLUVSTATS_RATE_ALERT_CM_PER_MIN {c_float(rate['alert'])}",
        f"#define PLUVSTATS_RATE_CRITICAL_CM_PER_MIN {c_float(rate['critical'])}",
        "",
        f"#define PLUVSTATS_HYSTERESIS_CM {c_float(thresholds['hysteresisCm'])}",
        f"#define PLUVSTATS_HYSTERESIS_RATE_CM_PER_MIN {c_float(thresholds['hysteresisRateCmPerMin'])}",
        "",
        f"#define PLUVSTATS_SENSOR_HEIGHT_CM {c_float(geometry['sensorHeightCm'])}",
        f"#define PLUVSTATS_CHANNEL_DEPTH_CM {c_float(geometry['channelDepthCm'])}",
        "",
        f"#define PLUVSTATS_INVALID_DISTANCE_MIN_CM {c_float(invalid_min)}",
        f"#define PLUVSTATS_INVALID_DISTANCE_MAX_CM {c_float(invalid_max)}",
        f"#define PLUVSTATS_STALE_READING_SECONDS {int(thresholds['staleReadingSeconds'])}",
        "",
        "#endif  // PLUVSTATS_GENERATED_CONFIG_H",
        "",
    ]
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--check",
        action="store_true",
        help="compare instead of writing; exit 1 when the header is out of date",
    )
    args = parser.parse_args()

    config = json.loads(SHARED_CONFIG.read_text(encoding="utf-8"))
    rendered = render(config)

    if args.check:
        current = OUTPUT_HEADER.read_text(encoding="utf-8") if OUTPUT_HEADER.exists() else ""
        if current != rendered:
            print(f"drift detected: {OUTPUT_HEADER}")
            print("run: python edge/tools/sync_thresholds.py")
            return 1
        print(f"ok: {OUTPUT_HEADER} matches {SHARED_CONFIG}")
        return 0

    OUTPUT_HEADER.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_HEADER.write_text(rendered, encoding="utf-8", newline="\n")
    print(f"wrote {OUTPUT_HEADER}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
