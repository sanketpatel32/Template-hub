from project.middleware import RateLimitMiddleware


def test_rate_limit_exceeded(client, monkeypatch):
    monkeypatch.setenv('RATE_LIMIT_MAX', '2')
    monkeypatch.setenv('RATE_LIMIT_WINDOW_MS', '60000')
    from project.env import get_settings

    get_settings.cache_clear()
    RateLimitMiddleware.buckets.clear()
    assert client.get('/api/v1/ping').status_code == 200
    assert client.get('/api/v1/ping').status_code == 200
    response = client.get('/api/v1/ping')
    assert response.status_code == 429
    assert response.json()['code'] == 'RATE_LIMIT_EXCEEDED'
    get_settings.cache_clear()
