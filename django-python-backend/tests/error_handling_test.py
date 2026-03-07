def test_not_found_problem_details(client):
    response = client.get('/missing')
    assert response.status_code == 404
    payload = response.json()
    assert payload['status'] == 404
    assert payload['code'] == 'NOT_FOUND'


def test_internal_error_normalized(client):
    response = client.get('/api/v1/ping?fail=true')
    assert response.status_code == 500
    payload = response.json()
    assert payload['status'] == 500
    assert payload['code'] == 'INTERNAL_SERVER_ERROR'
    assert payload['traceId']
