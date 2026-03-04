from fastapi.testclient import TestClient

from src.state.readiness import mark_shutting_down


def test_returns_service_liveness_payload(client: TestClient) -> None:
    response = client.get('/health')

    assert response.status_code == 200
    assert response.json()['success'] is True
    assert response.json()['data']['status'] == 'ok'
    assert response.json()['data']['environment']


def test_returns_ready_state_when_server_is_available(client: TestClient) -> None:
    response = client.get('/ready')

    assert response.status_code == 200
    assert response.json()['success'] is True
    assert response.json()['data']['ready'] is True


def test_returns_503_problem_details_when_shutting_down(client: TestClient) -> None:
    mark_shutting_down()

    response = client.get('/ready')

    assert response.status_code == 503
    assert response.json()['status'] == 503
    assert response.json()['code'] == 'SERVICE_UNAVAILABLE'
    assert '/service-unavailable' in response.json()['type']
