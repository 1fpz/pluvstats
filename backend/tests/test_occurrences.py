from __future__ import annotations

VALID_PAYLOAD = {
    "title": "Acúmulo de água na Rua das Acácias",
    "type": "waterlogging",
    "status": "open",
    "severity": "attention",
    "position": {"lat": -23.6607, "lng": -46.5331},
    "address": "Rua das Acácias, 120",
    "neighborhood": "Centro",
    "description": "Água cobrindo metade da via após chuva forte, dificultando a passagem de pedestres.",
    "reportedAt": "2026-11-11T12:00:00-03:00",
    "recurrenceCount": 1,
    "affectedPeopleEstimate": 12,
    "reporter": "Canal do cidadão (demonstração)",
    "evidence": ["Registro de teste"],
}


def test_list_occurrences_is_seeded_and_ordered(client):
    response = client.get("/api/occurrences")
    assert response.status_code == 200
    occurrences = response.json()
    assert len(occurrences) == 9
    assert occurrences[0]["id"] == "OCO-2026-0148"
    assert {occurrence["origin"] for occurrence in occurrences} == {"demonstration"}
    assert all(occurrence["id"].startswith("OCO-2026-") for occurrence in occurrences)


def test_create_update_and_delete_occurrence(client):
    created = client.post("/api/occurrences", json=VALID_PAYLOAD)
    assert created.status_code == 201
    record = created.json()
    assert record["id"] == "OCO-2026-0149"
    assert record["origin"] == "demonstration"
    assert record["title"] == VALID_PAYLOAD["title"]
    assert record["evidence"] == ["Registro de teste"]

    updated = client.patch(
        f"/api/occurrences/{record['id']}",
        json={"status": "in_progress", "severity": "alert", "title": "Acúmulo de água na Rua das Acácias — vistoria"},
    )
    assert updated.status_code == 200
    assert updated.json()["status"] == "in_progress"
    assert updated.json()["severity"] == "alert"
    assert updated.json()["address"] == VALID_PAYLOAD["address"]

    fetched = client.get(f"/api/occurrences/{record['id']}")
    assert fetched.status_code == 200
    assert fetched.json()["status"] == "in_progress"

    deleted = client.delete(f"/api/occurrences/{record['id']}")
    assert deleted.status_code == 200
    assert client.get(f"/api/occurrences/{record['id']}").status_code == 404


def test_occurrence_validation_rejects_incomplete_payload(client):
    payload = {**VALID_PAYLOAD, "description": "curta"}
    response = client.post("/api/occurrences", json=payload)
    assert response.status_code == 422

    payload = {**VALID_PAYLOAD, "unexpected": True}
    assert client.post("/api/occurrences", json=payload).status_code == 422


def test_occurrence_rejects_unknown_sensor(client):
    response = client.post("/api/occurrences", json={**VALID_PAYLOAD, "sensorId": "PS-99"})
    assert response.status_code == 400
    assert "PS-99" in response.json()["detail"]


def test_filters_work(client):
    response = client.get("/api/occurrences", params={"status": "open"})
    assert response.status_code == 200
    assert all(item["status"] == "open" for item in response.json())

    response = client.get("/api/occurrences", params={"query": "oratório"})
    assert response.status_code == 200
    assert any("Oratório" in item["address"] for item in response.json())
