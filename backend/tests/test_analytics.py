from __future__ import annotations


def test_summary_counts_are_consistent(client):
    summary = client.get("/api/analytics/summary").json()
    assert summary["experimental"] is True
    assert summary["counts"]["occurrences"] == 9
    assert summary["occurrences"]["total"] == 9
    assert summary["occurrences"]["active"] == 7
    assert summary["occurrences"]["affectedPeopleEstimate"] == sum(
        item["affectedPeopleEstimate"] for item in client.get("/api/occurrences").json()
    )
    assert summary["sensors"]["simulated"] == 4
    assert summary["sensors"]["hardware"] == 1
    assert summary["sensors"]["validatedHardware"] == 0
    assert summary["alerts"]["active"] == 0
    assert summary["interventions"]["total"] == 4
    assert summary["levels"]["monitoredSensors"] == 4
    assert summary["levels"]["averageCm"] == 7.05


def test_timeseries_groups_readings_per_sensor(client):
    body = client.get("/api/analytics/timeseries").json()
    assert len(body["series"]) == 4
    assert {series["sensorId"] for series in body["series"]} == {"PS-01", "PS-02", "PS-03", "PS-04"}
    assert all(series["points"] for series in body["series"])
    assert all(series["source"] == "simulation" for series in body["series"])


def test_neighborhoods_aggregate_occurrences_and_sensors(client):
    body = client.get("/api/analytics/neighborhoods").json()
    rows = body["neighborhoods"]
    assert sum(row["occurrences"] for row in rows) == 9
    assert sum(row["sensors"] for row in rows) == 5
    centro = next(row for row in rows if row["neighborhood"] == "Centro")
    assert centro["occurrences"] >= 2
    assert centro["maxLevelCm"] is not None


def test_sensor_stats_and_priorities(client):
    stats = client.get("/api/analytics/sensors").json()
    ps01 = next(item for item in stats["sensors"] if item["id"] == "PS-01")
    assert ps01["readings"]["total"] == 1
    assert ps01["readings"]["valid"] == 1

    priorities = client.get("/api/analytics/priorities").json()
    assert priorities["experimental"] is True
    assert len(priorities["occurrences"]) == 9
    scores = [item["priority"]["score"] for item in priorities["occurrences"]]
    assert scores == sorted(scores, reverse=True)
    assert priorities["occurrences"][0]["priority"]["band"] in {
        "normal",
        "attention",
        "alert",
        "critical",
    }
    assert sum(priorities["weights"].values()) == 1.0


def test_demo_status_and_reset(client):
    status = client.get("/api/demo/status").json()
    assert status["seed"] == {
        "sensors": 5,
        "occurrences": 9,
        "interventions": 4,
        "alerts": 0,
        "readings": 4,
    }

    created = client.post(
        "/api/occurrences",
        json={
            "title": "Registro de teste para reinício",
            "type": "other",
            "severity": "attention",
            "position": {"lat": -23.66, "lng": -46.53},
            "address": "Rua de Teste, 10",
            "neighborhood": "Centro",
            "description": "Registro criado apenas para validar o retorno ao estado inicial.",
            "reportedAt": "2026-11-11T12:00:00-03:00",
        },
    )
    assert created.status_code == 201

    reset = client.post("/api/demo/reset")
    assert reset.status_code == 200
    snapshot = reset.json()["snapshot"]
    assert len(snapshot["occurrences"]) == 9
    assert snapshot["alerts"] == []
    assert snapshot["simulation"]["scenario"] == "normal"
    assert snapshot["simulation"]["running"] is True
    assert snapshot["counts"]["validatedHardware"] == 0
