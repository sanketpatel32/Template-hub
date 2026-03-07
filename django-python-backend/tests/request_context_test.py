def test_request_id_propagation(client):
    response = client.get('/api/v1/ping', HTTP_X_REQUEST_ID='req-123')
    assert response.status_code == 200
    assert response['X-Request-Id'] == 'req-123'
    assert response['X-Trace-Id']
