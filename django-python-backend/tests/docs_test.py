def test_openapi_json(client):
    response = client.get('/openapi.json')
    assert response.status_code == 200
    assert response.json()['openapi'] == '3.0.3'


def test_docs(client):
    response = client.get('/docs')
    assert response.status_code == 200
    assert 'SwaggerUIBundle' in response.content.decode('utf-8')
