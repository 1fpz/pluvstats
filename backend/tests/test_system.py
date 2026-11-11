from __future__ import annotations

from app.core.config import load_shared_config


def test_health_reports_demo_and_disabled_hardware(client):
    response = client.get("/api/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["environment"] == "test"
    assert body["hardwareEnabled"] is False
    assert body["version"]


def test_config_uses_the_shared_threshold_file(client):
    response = client.get("/api/config")
    assert response.status_code == 200
    body = response.json()
    shared = load_shared_config()
    assert body["config"]["thresholds"] == shared["thresholds"]
    assert body["runtime"]["mode"] == "demo"
    assert body["runtime"]["sourceKind"] == "api"
    assert "hardware_api_key" not in response.text
    assert "dev-secret" not in response.text


def test_snapshot_declares_provenance_and_unvalidated_hardware(client):
    response = client.get("/api/snapshot")
    assert response.status_code == 200
    snapshot = response.json()

    assert snapshot["sourceKind"] == "api"
    assert snapshot["isDemo"] is True
    assert len(snapshot["sensors"]) == 5
    assert len(snapshot["occurrences"]) == 9
    assert len(snapshot["interventions"]) == 4
    assert snapshot["alerts"] == []
    assert snapshot["simulation"]["running"] is True
    assert snapshot["simulation"]["scenario"] == "normal"
    assert snapshot["simulation"]["simulatedSensors"] == 4
    assert snapshot["counts"]["validatedHardware"] == 0
    assert snapshot["counts"]["openOccurrences"] == 7

    hardware = next(sensor for sensor in snapshot["sensors"] if sensor["id"] == "PS-05")
    assert hardware["source"] == "hardware"
    assert hardware["status"] == "hardware_unvalidated"
    assert hardware["validated"] is False
    assert hardware["levelCm"] is None
    assert "Não há leitura física" in hardware["connectivityProof"]

    simulated = [sensor for sensor in snapshot["sensors"] if sensor["source"] == "simulation"]
    assert all(sensor["validated"] is False for sensor in simulated)
    assert all(sensor["status"] == "simulation_active" for sensor in simulated)
    assert snapshot["activity"]


def test_unknown_route_returns_404(client):
    assert client.get("/api/does-not-exist").status_code == 404
