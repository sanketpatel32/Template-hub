import time

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
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

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


def _resolve_route(request: Request) -> str:
    route = request.scope.get('route')
    route_path = getattr(route, 'path', None)

    if isinstance(route_path, str) and route_path:
        return route_path

    return request.url.path or 'unknown'


class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        if not settings.METRICS_ENABLED:
            return await call_next(request)

        started = time.perf_counter()
        response = await call_next(request)
        duration = time.perf_counter() - started

        route = _resolve_route(request)
        labels = {
            'method': request.method,
            'route': route,
            'status_code': str(response.status_code),
            'service': 'fastapi-python-backend',
            'environment': settings.NODE_ENV,
        }

        http_requests_total.labels(**labels).inc()
        http_request_duration_seconds.labels(**labels).observe(duration)

        return response


def get_metrics_snapshot() -> str:
    return generate_latest(metrics_registry).decode('utf-8')


metrics_content_type = CONTENT_TYPE_LATEST
