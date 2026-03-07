def test_ping(client):
    response = client.get('/api/v1/ping')
    assert response.status_code == 200
    payload = response.json()
    assert payload['success'] is True
    assert payload['data']['message'] == 'pong'
