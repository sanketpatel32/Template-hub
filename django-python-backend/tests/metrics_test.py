def test_metrics(client):
    response = client.get('/metrics')
    assert response.status_code == 200
    assert 'text/plain' in response['Content-Type']
    assert 'http_requests_total' in response.content.decode('utf-8')
