def test_propagates_request_id_and_trace_headers(client) -> None:
    request_id = 'req-12345'

    response = client.get('/api/v1/ping', headers={'x-request-id': request_id})

    assert response.status_code == 200
    assert response.headers['x-request-id'] == request_id
    assert response.headers['x-trace-id']
    assert response.headers['x-span-id']


def test_trace_identifiers_appear_in_error_response(client) -> None:
    response = client.get('/route-does-not-exist')
    payload = response.get_json()

    assert response.status_code == 404
    assert payload['requestId']
    assert payload['traceId']
    assert payload['spanId']
