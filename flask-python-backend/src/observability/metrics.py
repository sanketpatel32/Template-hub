import time

from flask import Flask, Response, g, request
from prometheus_client import (
    CONTENT_TYPE_LATEST,
    PLATFORM_COLLECTOR,
    PROCESS_COLLECTOR,
    CollectorRegistry,
    Counter,
    GCCollector,
    Histogram,
    generate_latest,
)

from ..config.env import settings

metrics_registry = CollectorRegistry()

if settings.METRICS_ENABLED and settings.NODE_ENV != 'test':
    metrics_registry.register(PROCESS_COLLECTOR)
    metrics_registry.register(PLATFORM_COLLECTOR)
    GCCollector(registry=metrics_registry)

http_requests_total = Counter(
    'http_requests_total',
    'Total HTTP requests served',
    ['method', 'route', 'status_code', 'service', 'environment'],
    registry=metrics_registry,
)

http_request_duration_seconds = Histogram(
    'http_request_duration_seconds',
    'HTTP request duration in seconds',
    ['method', 'route', 'status_code', 'service', 'environment'],
    buckets=[0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2, 5],
    registry=metrics_registry,
)


def register_metrics_hooks(app: Flask) -> None:
    @app.before_request
    def before_metrics() -> None:
        g.request_start_time = time.perf_counter()

    @app.after_request
    def after_metrics(response: Response) -> Response:
        if not settings.METRICS_ENABLED:
            return response

        started = getattr(g, 'request_start_time', None)
        if started is None:
            return response

        route = request.url_rule.rule if request.url_rule is not None else request.path
        labels = {
            'method': request.method,
            'route': route,
            'status_code': str(response.status_code),
            'service': 'flask-python-backend',
            'environment': settings.NODE_ENV,
        }
        http_requests_total.labels(**labels).inc()
        http_request_duration_seconds.labels(**labels).observe(time.perf_counter() - started)
        return response


def get_metrics_snapshot() -> str:
    return generate_latest(metrics_registry).decode('utf-8')


metrics_content_type = CONTENT_TYPE_LATEST
