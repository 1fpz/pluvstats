"""SQLite schema. Foreign keys are enforced by the connection layer."""

SCHEMA_SQL = """
CREATE TABLE IF NOT EXISTS sensors (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    short_name TEXT NOT NULL,
    device_id TEXT NOT NULL UNIQUE,
    neighborhood TEXT NOT NULL,
    address TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    source TEXT NOT NULL CHECK (source IN ('simulation', 'hardware')),
    status TEXT NOT NULL,
    validated INTEGER NOT NULL DEFAULT 0,
    catchment TEXT,
    baseline_level_cm REAL,
    response_factor REAL,
    phase REAL NOT NULL DEFAULT 0,
    installed_at TEXT,
    notes TEXT,
    last_reading_at TEXT,
    last_reading_level_cm REAL,
    last_reading_distance_cm REAL,
    last_reading_quality TEXT,
    last_reading_source TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS readings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    sensor_id TEXT NOT NULL REFERENCES sensors(id) ON DELETE CASCADE,
    device_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    distance_cm REAL,
    water_level_cm REAL,
    source TEXT NOT NULL CHECK (source IN ('simulation', 'hardware')),
    quality TEXT NOT NULL,
    status TEXT NOT NULL,
    metadata TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_readings_sensor_time ON readings(sensor_id, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_readings_time ON readings(timestamp DESC);

CREATE TABLE IF NOT EXISTS occurrences (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT NOT NULL,
    severity TEXT NOT NULL,
    latitude REAL NOT NULL,
    longitude REAL NOT NULL,
    address TEXT NOT NULL,
    neighborhood TEXT NOT NULL,
    description TEXT NOT NULL,
    reported_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    recurrence_count INTEGER NOT NULL DEFAULT 1,
    sensor_id TEXT,
    affected_people_estimate INTEGER NOT NULL DEFAULT 0,
    reporter TEXT,
    origin TEXT NOT NULL DEFAULT 'demonstration',
    evidence TEXT NOT NULL DEFAULT '[]'
);
CREATE INDEX IF NOT EXISTS idx_occurrences_reported ON occurrences(reported_at DESC);
CREATE INDEX IF NOT EXISTS idx_occurrences_status ON occurrences(status);

CREATE TABLE IF NOT EXISTS interventions (
    id TEXT PRIMARY KEY,
    occurrence_id TEXT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    status TEXT NOT NULL,
    team TEXT,
    started_at TEXT NOT NULL,
    completed_at TEXT,
    before_level_cm REAL NOT NULL,
    after_level_cm REAL,
    location TEXT NOT NULL,
    latitude REAL,
    longitude REAL,
    sensor_id TEXT,
    origin TEXT NOT NULL DEFAULT 'demonstration',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS alerts (
    id TEXT PRIMARY KEY,
    sensor_id TEXT NOT NULL,
    sensor_name TEXT NOT NULL,
    device_id TEXT,
    type TEXT NOT NULL,
    severity TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    status TEXT NOT NULL,
    source TEXT NOT NULL,
    simulated INTEGER NOT NULL DEFAULT 0,
    opened_at TEXT NOT NULL,
    last_observed_at TEXT NOT NULL,
    acknowledged_at TEXT,
    resolved_at TEXT,
    resolved_automatically INTEGER NOT NULL DEFAULT 0,
    metrics TEXT NOT NULL DEFAULT '{}',
    reading TEXT,
    timeline TEXT NOT NULL DEFAULT '[]'
);
CREATE INDEX IF NOT EXISTS idx_alerts_status ON alerts(status);
CREATE INDEX IF NOT EXISTS idx_alerts_opened ON alerts(opened_at DESC);

CREATE TABLE IF NOT EXISTS activity (
    id TEXT PRIMARY KEY,
    kind TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    at TEXT NOT NULL,
    severity TEXT NOT NULL DEFAULT 'normal',
    source TEXT NOT NULL DEFAULT 'simulation'
);
CREATE INDEX IF NOT EXISTS idx_activity_at ON activity(at DESC);

CREATE TABLE IF NOT EXISTS simulation_state (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    running INTEGER NOT NULL,
    scenario TEXT NOT NULL,
    started_at TEXT NOT NULL,
    last_tick_at TEXT NOT NULL,
    elapsed_seconds REAL NOT NULL DEFAULT 0,
    tick_count INTEGER NOT NULL DEFAULT 0,
    hydrology_note TEXT,
    sensors TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT NOT NULL
);
"""
