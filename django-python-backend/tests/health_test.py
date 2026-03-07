def test_health(client):
    response = client.get('/health')
    assert response.status_code == 200
    payload = response.json()
    assert payload['success'] is True
    assert payload['data']['status'] == 'ok'
