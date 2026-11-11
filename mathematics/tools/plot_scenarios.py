#!/usr/bin/env python3
"""Generate the PLUVSTATS mathematics charts as deterministic SVG files.

No plotting library is required. The charts are documentation artefacts derived
from the same model and scenarios used by the tests.

Usage:
    python mathematics/tools/plot_scenarios.py
"""

from __future__ import annotations

import json
import math
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
if str(REPO_ROOT) not in sys.path:
    sys.path.insert(0, str(REPO_ROOT))

from mathematics.model import (  # noqa: E402
    load_shared_config,
    scenario_metrics,
    time_to_limit_minutes,
)

SCENARIOS_DIR = REPO_ROOT / "mathematics" / "scenarios"
OUTPUT_DIR = REPO_ROOT / "mathematics" / "graphs"

WIDTH = 960
HEIGHT = 480
MARGIN_LEFT = 82
MARGIN_RIGHT = 42
MARGIN_TOP = 96
MARGIN_BOTTOM = 70

BACKGROUND = "#0b1220"
PANEL = "#0e1a2b"
INK = "#e2e8f0"
MUTED = "#94a3b8"
GRID = "#1e293b"
LINE = "#38bdf8"
PROJECTION = "#f59e0b"
ATTENTION = "#facc15"
ALERT = "#fb923c"
CRITICAL = "#f87171"


def svg_escape(text: str) -> str:
    return (
        str(text)
        .replace("&", "&amp;")
        .replace("<", "&lt;")
        .replace(">", "&gt;")
        .replace('"', "&quot;")
    )


def pt(value: float) -> str:
    return f"{value:,.1f}".replace(",", "X").replace(".", ",").replace("X", ".")


def nice_step(raw: float) -> float:
    if raw <= 0:
        return 1.0
    exponent = math.floor(math.log10(raw))
    base = 10**exponent
    for factor in (1, 2, 5, 10):
        if raw <= factor * base:
            return factor * base
    return 10 * base


def header(title: str, subtitle: str) -> list[str]:
    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        f'<svg xmlns="http://www.w3.org/2000/svg" width="{WIDTH}" height="{HEIGHT}" '
        f'viewBox="0 0 {WIDTH} {HEIGHT}" role="img" aria-label="{svg_escape(title)}">',
        "<defs>",
        '  <style>',
        "    .title { font: 600 22px 'Segoe UI', Arial, sans-serif; fill: #e2e8f0; }",
        "    .subtitle { font: 400 12px 'Segoe UI', Arial, sans-serif; fill: #94a3b8; }",
        "    .axis { font: 400 11px 'Segoe UI', Arial, sans-serif; fill: #94a3b8; }",
        "    .label { font: 600 11px 'Segoe UI', Arial, sans-serif; fill: #e2e8f0; }",
        "    .note { font: 400 10px 'Segoe UI', Arial, sans-serif; fill: #64748b; }",
        "  </style>",
        "</defs>",
        f'<rect width="{WIDTH}" height="{HEIGHT}" fill="{BACKGROUND}"/>',
        f'<rect x="16" y="16" width="{WIDTH - 32}" height="{HEIGHT - 32}" rx="14" '
        f'fill="{PANEL}" stroke="#1e293b"/>',
        f'<text class="title" x="{MARGIN_LEFT}" y="54">{svg_escape(title)}</text>',
        f'<text class="subtitle" x="{MARGIN_LEFT}" y="76">{svg_escape(subtitle)}</text>',
    ]


def footer(lines: list[str]) -> list[str]:
    return (
        lines
        + [
            f'<text class="note" x="{MARGIN_LEFT}" y="{HEIGHT - 30}">'
            "PLUVSTATS · modelo experimental, não é previsão oficial de enchente."
            "</text>",
            "</svg>",
        ]
    )


def chart_axes(
    lines: list[str],
    *,
    max_t_seconds: float,
    max_level: float = 100.0,
) -> tuple:
    plot_left = MARGIN_LEFT
    plot_right = WIDTH - MARGIN_RIGHT
    plot_top = MARGIN_TOP
    plot_bottom = HEIGHT - MARGIN_BOTTOM
    plot_width = plot_right - plot_left
    plot_height = plot_bottom - plot_top

    def sx(t_seconds: float) -> float:
        return plot_left + (t_seconds / max_t_seconds) * plot_width if max_t_seconds else plot_left

    def sy(level: float) -> float:
        return plot_bottom - (level / max_level) * plot_height

    # Severity bands make the thresholds readable without a legend.
    bands = [
        (0, 25, "#22c55e", "normal"),
        (25, 50, ATTENTION, "atenção"),
        (50, 75, ALERT, "alerta"),
        (75, 100, CRITICAL, "crítico"),
    ]
    for low, high, color, label in bands:
        y = sy(high)
        height = sy(low) - sy(high)
        lines.append(
            f'<rect x="{plot_left}" y="{y:.1f}" width="{plot_width}" height="{height:.1f}" '
            f'fill="{color}" opacity="0.07"/>'
        )
        lines.append(
            f'<text class="note" x="{plot_left + 6}" y="{y + 13:.1f}" opacity="0.9">'
            f"{svg_escape(label)}</text>"
        )

    for level in range(0, 101, 20):
        y = sy(level)
        lines.append(
            f'<line x1="{plot_left}" y1="{y:.1f}" x2="{plot_right}" y2="{y:.1f}" '
            f'stroke="{GRID}" stroke-width="1"/>'
        )
        lines.append(
            f'<text class="axis" x="{plot_left - 10}" y="{y + 4:.1f}" text-anchor="end">'
            f"{level} cm</text>"
        )

    x_step = nice_step(max_t_seconds / 300.0) * 60.0
    tick = 0.0
    while tick <= max_t_seconds + 0.1:
        x = sx(tick)
        lines.append(
            f'<line x1="{x:.1f}" y1="{plot_top}" x2="{x:.1f}" y2="{plot_bottom}" '
            f'stroke="{GRID}" stroke-width="1" opacity="0.6"/>'
        )
        lines.append(
            f'<text class="axis" x="{x:.1f}" y="{plot_bottom + 20}" text-anchor="middle">'
            f"{pt(tick / 60.0)} min</text>"
        )
        tick += x_step

    lines.append(
        f'<line x1="{plot_left}" y1="{plot_bottom}" x2="{plot_right}" y2="{plot_bottom}" '
        f'stroke="#334155" stroke-width="1.2"/>'
    )
    lines.append(
        f'<line x1="{plot_left}" y1="{plot_top}" x2="{plot_left}" y2="{plot_bottom}" '
        f'stroke="#334155" stroke-width="1.2"/>'
    )
    return sx, sy


def render_scenario(scenario: dict, config: dict) -> str:
    metrics = scenario_metrics(scenario, config=config)
    series = metrics["series"]
    last_t = series[-1]["tSeconds"]
    ttl = time_to_limit_minutes(
        metrics["lastLevelCm"],
        metrics["limitCm"],
        metrics["rateCmPerMin"],
    )
    projection_t = None
    if ttl is not None and ttl > 0:
        projection_t = last_t + ttl * 60.0

    max_t = max(last_t, projection_t or 0.0)
    max_t = max(60.0, min(max_t * 1.18, last_t * 3 + 60.0))

    lines = header(
        metrics["name"],
        f"v = {pt(metrics['rateCmPerMin'])} cm/min · "
        f"última leitura {pt(metrics['lastLevelCm'])} cm · "
        f"limite {pt(metrics['limitCm'])} cm",
    )
    sx, sy = chart_axes(lines, max_t_seconds=max_t)

    points = " ".join(f"{sx(point['tSeconds']):.1f},{sy(point['levelCm']):.1f}" for point in series)
    lines.append(
        f'<polyline points="{points}" fill="none" stroke="{LINE}" stroke-width="2.6" '
        'stroke-linejoin="round" stroke-linecap="round"/>'
    )
    for point in series:
        lines.append(
            f'<circle cx="{sx(point["tSeconds"]):.1f}" cy="{sy(point["levelCm"]):.1f}" '
            f'r="2.6" fill="{BACKGROUND}" stroke="{LINE}" stroke-width="1.4"/>'
        )

    if projection_t is not None:
        lines.append(
            f'<line x1="{sx(last_t):.1f}" y1="{sy(metrics["lastLevelCm"]):.1f}" '
            f'x2="{sx(projection_t):.1f}" y2="{sy(metrics["limitCm"]):.1f}" '
            f'stroke="{PROJECTION}" stroke-width="2" stroke-dasharray="6 5"/>'
        )
        lines.append(
            f'<circle cx="{sx(projection_t):.1f}" cy="{sy(metrics["limitCm"]):.1f}" '
            f'r="4" fill="{PROJECTION}"/>'
        )
        lines.append(
            f'<text class="label" x="{min(sx(projection_t) + 10, WIDTH - 190):.1f}" '
            f'y="{sy(metrics["limitCm"]) - 8:.1f}">'
            f"t = {pt(ttl)} min</text>"
        )
    else:
        lines.append(
            f'<text class="label" x="{sx(last_t) - 8:.1f}" y="{sy(series[-1]["levelCm"]) - 12:.1f}" '
            f'text-anchor="end">sem projeção: v ≤ 0</text>'
        )

    lines = footer(lines)
    return "\n".join(lines)


def render_time_to_limit(config: dict) -> str:
    limits = config["thresholds"]["waterLevelCm"]
    rates = config["thresholds"]["riseRateCmPerMin"]
    limit = float(limits["critical"])
    rate_values = [
        (rates["attention"], ATTENTION, "atenção"),
        (rates["alert"], ALERT, "alerta"),
        (rates["critical"], CRITICAL, "crítico"),
    ]

    width = WIDTH
    height = HEIGHT
    plot_left = MARGIN_LEFT
    plot_right = width - MARGIN_RIGHT
    plot_top = MARGIN_TOP
    plot_bottom = height - MARGIN_BOTTOM

    def sx(level: float) -> float:
        return plot_left + (level / limit) * (plot_right - plot_left)

    max_minutes = math.ceil(limit / rates["attention"])
    max_minutes = math.ceil(max_minutes / 10) * 10

    def sy(minutes: float) -> float:
        return plot_bottom - (minutes / max_minutes) * (plot_bottom - plot_top)

    lines = header(
        "Tempo até o limite crítico",
        f"t = (h_limite − h_atual) / v · limite = {pt(limit)} cm · apenas enquanto v for constante",
    )

    plot_width = plot_right - plot_left
    plot_height = plot_bottom - plot_top
    lines.append(
        f'<rect x="{plot_left}" y="{plot_top}" width="{plot_width}" height="{plot_height}" '
        f'fill="#0f172a" opacity="0.55"/>'
    )
    for level in range(0, int(limit) + 1, 15):
        x = sx(level)
        lines.append(
            f'<line x1="{x:.1f}" y1="{plot_top}" x2="{x:.1f}" y2="{plot_bottom}" '
            f'stroke="{GRID}" stroke-width="1"/>'
        )
        lines.append(
            f'<text class="axis" x="{x:.1f}" y="{plot_bottom + 20}" text-anchor="middle">'
            f"{level} cm</text>"
        )
    for minutes in range(0, max_minutes + 1, 10):
        y = sy(minutes)
        lines.append(
            f'<line x1="{plot_left}" y1="{y:.1f}" x2="{plot_right}" y2="{y:.1f}" '
            f'stroke="{GRID}" stroke-width="1"/>'
        )
        lines.append(
            f'<text class="axis" x="{plot_left - 10}" y="{y + 4:.1f}" text-anchor="end">'
            f"{minutes} min</text>"
        )

    for rate, color, label in rate_values:
        points = []
        level = 0
        while level <= limit:
            minutes = time_to_limit_minutes(level, limit, rate)
            points.append(f"{sx(level):.1f},{sy(minutes):.1f}")
            level += 1
        lines.append(
            f'<polyline points="{" ".join(points)}" fill="none" stroke="{color}" '
            'stroke-width="2.4"/>'
        )
        end_minutes = time_to_limit_minutes(0, limit, rate)
        lines.append(
            f'<text class="label" x="{sx(limit) - 6:.1f}" y="{sy(end_minutes) - 8:.1f}" '
            f'text-anchor="end" fill="{color}">v = {pt(rate)} cm/min</text>'
        )

    lines.append(
        f'<text class="label" x="{plot_left}" y="{plot_top - 12}">'
        "tempo (min) a partir do nível atual</text>"
    )
    lines = footer(lines)
    return "\n".join(lines)


def main() -> None:
    config = load_shared_config()
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    for path in sorted(SCENARIOS_DIR.glob("*.json")):
        scenario = json.loads(path.read_text(encoding="utf-8"))
        svg = render_scenario(scenario, config)
        target = OUTPUT_DIR / f"cenario-{path.stem}.svg"
        target.write_text(svg, encoding="utf-8", newline="\n")
        print(f"wrote {target.relative_to(REPO_ROOT)}")

    target = OUTPUT_DIR / "tempo-ate-limite.svg"
    target.write_text(render_time_to_limit(config), encoding="utf-8", newline="\n")
    print(f"wrote {target.relative_to(REPO_ROOT)}")


if __name__ == "__main__":
    main()
