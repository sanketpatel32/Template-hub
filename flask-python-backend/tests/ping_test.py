def test_ping_route(client) -> None:
    response = client.get('/api/v1/ping')
    payload = response.get_json()

    assert response.status_code == 200
    assert payload == {'success': True, 'data': {'message': 'pong', 'version': 'v1'}}


def test_openapi_and_docs_endpoints(client) -> None:
    openapi_response = client.get('/openapi.json')
    docs_response = client.get('/docs')

    assert openapi_response.status_code == 200
    assert openapi_response.get_json()['openapi'] == '3.0.3'
    assert docs_response.status_code == 200
    assert 'swagger-ui' in docs_response.get_data(as_text=True).lower()
