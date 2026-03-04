from fastapi.testclient import TestClient


def test_returns_prometheus_metrics_payload(client: TestClient) -> None:
    response = client.get('/metrics')

    assert response.status_code == 200
    assert 'text/plain' in response.headers['content-type']
    assert 'http_requests_total' in response.text
    assert 'http_request_duration_seconds' in response.text
