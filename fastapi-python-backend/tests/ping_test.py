from fastapi.testclient import TestClient

PING_ENDPOINT = '/api/v1/ping'


def test_returns_readiness_endpoint_in_docs(client: TestClient) -> None:
    response = client.get('/openapi.json')

    assert response.status_code == 200
    assert response.json()['paths']['/ready']
    assert response.json()['paths']['/metrics']


def test_returns_pong_from_api_v1_ping(client: TestClient) -> None:
    response = client.get(PING_ENDPOINT)

    assert response.status_code == 200
    assert response.json() == {
        'success': True,
        'data': {
            'message': 'pong',
            'version': 'v1',
        },
    }


def test_exposes_openapi_docs_endpoints(client: TestClient) -> None:
    openapi_response = client.get('/openapi.json')
    docs_response = client.get('/docs')

    assert openapi_response.status_code == 200
    assert openapi_response.json()['openapi'].startswith('3.')
    assert docs_response.status_code == 200


def test_rate_limits_after_threshold(client: TestClient) -> None:
    for _ in range(100):
        response = client.get(PING_ENDPOINT)
        assert response.status_code == 200

    blocked_response = client.get(PING_ENDPOINT)

    assert blocked_response.status_code == 429
    assert blocked_response.json()['title'] == 'Too Many Requests'
    assert blocked_response.json()['code'] == 'RATE_LIMIT_EXCEEDED'
    assert blocked_response.json()['status'] == 429
    assert '/rate-limit-exceeded' in blocked_response.json()['type']
