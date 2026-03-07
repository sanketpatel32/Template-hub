from src.state.readiness import mark_shutting_down


def test_health_returns_200_with_success(client) -> None:
    response = client.get('/health')
    payload = response.get_json()

    assert response.status_code == 200
    assert payload['success'] is True
    assert payload['data']['status'] == 'ok'


def test_ready_returns_200_when_ready(client) -> None:
    response = client.get('/ready')

    assert response.status_code == 200
    assert response.get_json()['success'] is True


def test_ready_returns_503_when_not_ready(client) -> None:
    mark_shutting_down()

    response = client.get('/ready')

    assert response.status_code == 503
    assert response.get_json()['code'] == 'SERVICE_UNAVAILABLE'
