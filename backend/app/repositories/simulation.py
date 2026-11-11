"""Simulation runtime persistence."""

from __future__ import annotations

from app.database import Database
from app.repositories.base import json_dump, json_load


def _row_to_state(row) -> dict:
    return {
        "running": bool(row["running"]),
        "scenario": row["scenario"],
        "startedAt": row["started_at"],
        "lastTickAt": row["last_tick_at"],
        "elapsedSeconds": row["elapsed_seconds"],
        "tickCount": row["tick_count"],
        "hydrologyNote": row["hydrology_note"],
        "sensors": json_load(row["sensors"], {}),
    }


class SimulationRepository:
    def __init__(self, database: Database) -> None:
        self.database = database

    def get_state(self) -> dict | None:
        with self.database.connect() as connection:
            row = connection.execute("SELECT * FROM simulation_state WHERE id = 1").fetchone()
        return _row_to_state(row) if row else None

    def save_state(self, state: dict, *, updated_at: str) -> None:
        with self.database.connect() as connection:
            connection.execute(
                """
                INSERT INTO simulation_state (
                    id, running, scenario, started_at, last_tick_at,
                    elapsed_seconds, tick_count, hydrology_note, sensors, updated_at
                ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON CONFLICT(id) DO UPDATE SET
                    running = excluded.running,
                    scenario = excluded.scenario,
                    started_at = excluded.started_at,
                    last_tick_at = excluded.last_tick_at,
                    elapsed_seconds = excluded.elapsed_seconds,
                    tick_count = excluded.tick_count,
                    hydrology_note = excluded.hydrology_note,
                    sensors = excluded.sensors,
                    updated_at = excluded.updated_at
                """,
                (
                    int(bool(state.get("running", True))),
                    state.get("scenario", "normal"),
                    state["startedAt"],
                    state["lastTickAt"],
                    state.get("elapsedSeconds", 0),
                    state.get("tickCount", 0),
                    state.get("hydrologyNote"),
                    json_dump(state.get("sensors", {})),
                    updated_at,
                ),
            )

    def clear(self) -> None:
        with self.database.connect() as connection:
            connection.execute("DELETE FROM simulation_state")
