from project.readiness import mark_ready, mark_shutting_down


def test_ready_success(client):
    mark_ready()
    response = client.get('/ready')
    assert response.status_code == 200
    assert response.json()['success'] is True


def test_ready_shutdown_state(client):
    mark_shutting_down()
    response = client.get('/ready')
    assert response.status_code == 503
    payload = response.json()
    assert payload['status'] == 503
    mark_ready()
