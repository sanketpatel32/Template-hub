from src.app import create_app


def test_returns_404_for_unknown_routes(client) -> None:
    response = client.get('/missing')
    payload = response.get_json()

    assert response.status_code == 404
    assert payload['status'] == 404
    assert payload['code'] == 'NOT_FOUND'
    assert payload['title'] == 'Not Found'
    assert '/not-found' in payload['type']


def test_returns_normalized_500_payload() -> None:
    app = create_app()

    @app.get('/boom')
    def boom() -> None:
        raise RuntimeError('boom')

    with app.test_client() as client:
        response = client.get('/boom')

    payload = response.get_json()
    assert response.status_code == 500
    assert payload['status'] == 500
    assert payload['code'] == 'INTERNAL_SERVER_ERROR'
    assert payload['detail'] == 'Unexpected server error.'


def test_rate_limit_eventually_returns_429(client) -> None:
    status_codes = [client.get('/api/v1/ping').status_code for _ in range(105)]

    assert 429 in status_codes
