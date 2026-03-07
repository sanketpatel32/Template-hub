def test_metrics_returns_prometheus_text(client) -> None:
    response = client.get('/metrics')

    assert response.status_code == 200
    assert 'text/plain' in response.content_type
    assert 'http_requests_total' in response.get_data(as_text=True)
