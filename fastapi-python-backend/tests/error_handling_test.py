from fastapi import FastAPI
from fastapi.testclient import TestClient

from src.app import create_app


def test_returns_404_for_unknown_routes(client: TestClient) -> None:
    response = client.get('/missing')

    assert response.status_code == 404
    assert response.json()['status'] == 404
    assert response.json()['code'] == 'NOT_FOUND'
    assert response.json()['title'] == 'Not Found'
    assert '/not-found' in response.json()['type']
    assert response.json()['requestId']


def test_returns_normalized_500_payload() -> None:
    app: FastAPI = create_app()

    @app.get('/boom')
    def boom() -> None:
        raise RuntimeError('boom')

    with TestClient(app, raise_server_exceptions=False) as local_client:
        response = local_client.get('/boom')

    assert response.status_code == 500
    assert response.json()['status'] == 500
    assert response.json()['code'] == 'INTERNAL_SERVER_ERROR'
    assert response.json()['detail'] == 'Unexpected server error.'
    assert response.json()['title'] == 'Internal Server Error'
    assert response.json()['requestId']
