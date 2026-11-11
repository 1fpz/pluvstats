from __future__ import annotations

from datetime import datetime, timedelta, timezone

DEVICE = "PLUV-ESP32-0001"
KEY_HEADER = {"X-Device-Key": "dev-secret"}


def _payload(**overrides):
    return {"deviceId": DEVICE, "distanceCm": 70, **overrides}


def test_hardware_is_disabled_by_default(client):
    response = client.post("/api/hardware/readings", json=_payload())
    assert response.status_code == 503
    assert "desabilitada" in response.json()["detail"]


def test_valid_reading_validates_device_and_opens_alert(make_client):
    client = make_client(hardware_enabled=True, hardware_api_key="dev-secret")
    response = client.post("/api/hardware/readings", json=_payload(), headers=KEY_HEADER)
    assert response.status_code == 201
    body = response.json()
    assert body["accepted"] is True
    assert body["quality"] == "valid"
    assert body["validated"] is True
    assert body["status"] == "hardware_validated"
    assert body["waterLevelCm"] == 50.0
    assert body["alerts"]["created"]

    sensor = client.get("/api/sensors/PS-05").json()
    assert sensor["validated"] is True
    assert sensor["status"] == "hardware_validated"
    assert sensor["levelCm"] == 50.0
    assert sensor["source"] == "hardware"
    assert sensor["simulated"] is False

    water = next(alert for alert in client.get("/api/alerts").json() if alert["type"] == "water_level")
    assert water["source"] == "hardware"
    assert water["simulated"] is False
    assert water["severity"] == "alert"


def test_requires_key_when_configured(make_client):
    client = make_client(hardware_enabled=True, hardware_api_key="dev-secret")
    assert client.post("/api/hardware/readings", json=_payload()).status_code == 401
    assert (
        client.post(
            "/api/hardware/readings", json=_payload(), headers={"X-Device-Key": "wrong"}
        ).status_code
        == 401
    )


def test_unknown_device_is_rejected(make_client):
    client = make_client(hardware_enabled=True)
    response = client.post("/api/hardware/readings", json={"deviceId": "NOPE", "distanceCm": 70})
    assert response.status_code == 404


def test_simulated_device_cannot_inject_hardware(make_client):
    client = make_client(hardware_enabled=True)
    response = client.post(
        "/api/hardware/readings",
        json={"deviceId": "PLUV-SIM-ESP32-01", "distanceCm": 70},
    )
    assert response.status_code == 409


def test_invalid_reading_is_audited_but_not_validated(make_client):
    client = make_client(hardware_enabled=True, hardware_api_key="dev-secret")
    response = client.post(
        "/api/hardware/readings", json=_payload(distanceCm=1), headers=KEY_HEADER
    )
    assert response.status_code == 201
    body = response.json()
    assert body["quality"] == "invalid"
    assert body["status"] == "fault_invalid"
    assert body["validated"] is False
    assert body["waterLevelCm"] is None

    sensor = client.get("/api/sensors/PS-05").json()
    assert sensor["validated"] is False
    assert sensor["status"] == "fault_invalid"
    assert sensor["levelCm"] is None

    alerts = client.get("/api/alerts").json()
    assert any(alert["type"] == "invalid_reading" for alert in alerts)


def test_stale_reading_is_not_operational(make_client):
    client = make_client(hardware_enabled=True)
    stale = (datetime.now(timezone.utc) - timedelta(seconds=600)).isoformat()
    response = client.post("/api/hardware/readings", json=_payload(timestamp=stale))
    assert response.status_code == 201
    body = response.json()
    assert body["quality"] == "valid"
    assert body["validated"] is False
    assert body["status"] == "hardware_stale"

    sensor = client.get("/api/sensors/PS-05").json()
    assert sensor["validated"] is False
    assert sensor["status"] == "hardware_stale"
    alerts = client.get("/api/alerts").json()
    assert any(alert["type"] == "communication" for alert in alerts)


def test_hardware_payload_validation(make_client):
    client = make_client(hardware_enabled=True)
    assert client.post("/api/hardware/readings", json={"deviceId": "X"}).status_code == 422
    assert (
        client.post(
            "/api/hardware/readings", json={"deviceId": DEVICE, "distanceCm": 999}
        ).status_code
        == 422
    )
