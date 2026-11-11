from __future__ import annotations


def _payload(**overrides):
    return {
        "occurrenceId": "OCO-2026-0148",
        "title": "Limpeza de bueiro para teste",
        "description": "Intervenção demonstrativa criada pelo teste de integração.",
        "status": "planned",
        "team": "Equipe de teste",
        "startedAt": "2026-11-12T09:00:00-03:00",
        "beforeLevelCm": 50,
        "location": "Rua Oratório, 1.200",
        **overrides,
    }


def test_list_interventions(client):
    response = client.get("/api/interventions")
    assert response.status_code == 200
    assert len(response.json()) == 4


def test_create_and_complete_intervention(client):
    created = client.post("/api/interventions", json=_payload())
    assert created.status_code == 201
    record = created.json()
    assert record["id"] == "INT-2026-0014"
    assert record["occurrenceId"] == "OCO-2026-0148"
    assert record["position"] is not None
    assert record["sensorId"] == "PS-01"
    assert record["origin"] == "demonstration"

    completed = client.patch(
        f"/api/interventions/{record['id']}",
        json={
            "status": "completed",
            "afterLevelCm": 18,
            "completedAt": "2026-11-12T11:00:00-03:00",
        },
    )
    assert completed.status_code == 200
    assert completed.json()["status"] == "completed"
    assert completed.json()["afterLevelCm"] == 18


def test_completed_intervention_requires_after_level(client):
    response = client.post(
        "/api/interventions",
        json=_payload(status="completed", afterLevelCm=None),
    )
    assert response.status_code == 400
    assert "nível após" in response.json()["detail"]


def test_unknown_occurrence_is_rejected(client):
    response = client.post("/api/interventions", json=_payload(occurrenceId="OCO-2026-9999"))
    assert response.status_code == 400
    assert "OCO-2026-9999" in response.json()["detail"]
