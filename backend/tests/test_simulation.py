from __future__ import annotations


def _command(client, **payload):
    response = client.post("/api/simulation/commands", json=payload)
    assert response.status_code == 200, response.text
    return response.json()


def test_tick_advances_state_and_persists_readings(client):
    before = client.get("/api/snapshot").json()
    readings_before = client.get("/api/readings", params={"limit": 100}).json()

    tick = client.post("/api/simulation/tick")
    assert tick.status_code == 200
    snapshot = tick.json()["snapshot"]
    assert snapshot["simulation"]["tickCount"] == before["simulation"]["tickCount"] + 1
    assert snapshot["simulation"]["running"] is True
    assert len(tick.json()["readings"]) == 4

    readings_after = client.get("/api/readings", params={"limit": 100}).json()
    assert len(readings_after) == len(readings_before) + 4
    assert all(reading["source"] == "simulation" for reading in readings_after[:4])


def test_scenario_and_level_command_open_explainable_alerts(client):
    _command(client, action="set_scenario", scenario="critical")
    result = _command(client, action="set_level", sensorId="PS-01", amountCm=80)
    snapshot = result["snapshot"]

    assert snapshot["simulation"]["scenario"] == "critical"
    sensor = next(item for item in snapshot["sensors"] if item["id"] == "PS-01")
    assert sensor["levelCm"] == 80.0
    assert sensor["alertSeverity"] == "critical"

    water_alert = next(alert for alert in snapshot["alerts"] if alert["type"] == "water_level")
    assert water_alert["severity"] == "critical"
    assert water_alert["status"] == "active"
    assert water_alert["simulated"] is True
    assert water_alert["source"] == "simulation"
    assert water_alert["metrics"]["waterLevelCm"] == 80.0

    acknowledged = client.post(f"/api/alerts/{water_alert['id']}/acknowledge")
    assert acknowledged.status_code == 200
    assert acknowledged.json()["status"] == "acknowledged"

    client.post("/api/simulation/tick")
    after_tick = client.get("/api/alerts").json()
    current = next(alert for alert in after_tick if alert["id"] == water_alert["id"])
    assert current["status"] == "acknowledged"

    resolved = client.post(f"/api/alerts/{water_alert['id']}/resolve")
    assert resolved.status_code == 200
    assert resolved.json()["status"] == "resolved"
    assert resolved.json()["resolvedAutomatically"] is False

    _command(client, action="set_level", sensorId="PS-01", amountCm=5)
    client.post("/api/simulation/tick")
    alerts = client.get("/api/alerts").json()
    assert all(
        not (alert["sensorId"] == "PS-01" and alert["type"] == "water_level" and alert["status"] != "resolved")
        for alert in alerts
    )


def test_hysteresis_keeps_the_previous_severity_near_threshold(client):
    _command(client, action="set_level", sensorId="PS-01", amountCm=49)
    # 49 cm is below the 50 cm alert limit but inside the 4 cm hysteresis band
    # only matters after a higher severity was reached.
    _command(client, action="set_level", sensorId="PS-01", amountCm=52)
    alerts = client.get("/api/alerts").json()
    water = next(
        alert for alert in alerts if alert["sensorId"] == "PS-01" and alert["type"] == "water_level"
    )
    assert water["severity"] == "alert"

    _command(client, action="set_level", sensorId="PS-01", amountCm=48)
    alerts = client.get("/api/alerts").json()
    water = next(
        alert for alert in alerts if alert["sensorId"] == "PS-01" and alert["type"] == "water_level"
    )
    assert water["severity"] == "alert"
    assert water["status"] != "resolved"


def test_pause_stops_the_clock_and_reset_restores_normal(client):
    first = client.post("/api/simulation/tick").json()["snapshot"]
    assert first["simulation"]["tickCount"] == 1

    paused = _command(client, action="pause")["snapshot"]
    assert paused["simulation"]["running"] is False
    assert next(item for item in paused["sensors"] if item["id"] == "PS-01")["status"] == "simulation_paused"

    frozen = client.post("/api/simulation/tick").json()["snapshot"]
    assert frozen["simulation"]["tickCount"] == paused["simulation"]["tickCount"]

    reset = _command(client, action="reset")["snapshot"]
    assert reset["simulation"]["running"] is True
    assert reset["simulation"]["scenario"] == "normal"
    assert reset["simulation"]["tickCount"] == 0
    assert all(
        sensor["levelCm"] is not None
        for sensor in reset["sensors"]
        if sensor["source"] == "simulation"
    )
    assert reset["alerts"] == []


def test_simulation_command_contract_rejects_unknown_action(client):
    response = client.post("/api/simulation/commands", json={"action": "explode"})
    assert response.status_code == 422
