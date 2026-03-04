from fastapi.testclient import TestClient


def test_propagates_incoming_request_id_and_emits_trace_headers(client: TestClient) -> None:
    request_id = 'req-12345'

    response = client.get('/api/v1/ping', headers={'x-request-id': request_id})

    assert response.status_code == 200
    assert response.headers['x-request-id'] == request_id
    assert response.headers['x-trace-id']
    assert response.headers['x-span-id']


def test_adds_request_and_trace_identifiers_to_error_responses(client: TestClient) -> None:
    response = client.get('/route-does-not-exist')

    assert response.status_code == 404
    assert response.json()['requestId']
    assert response.json()['traceId']
