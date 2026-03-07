from __future__ import annotations

from django.http import HttpResponse
from prometheus_client import CONTENT_TYPE_LATEST, Counter, Histogram, generate_latest

from project.env import get_settings

HTTP_REQUESTS_TOTAL = Counter(
    'http_requests_total', 'Total HTTP requests', ['method', 'path', 'status']
)
HTTP_REQUEST_DURATION_SECONDS = Histogram(
    'http_request_duration_seconds', 'HTTP request duration', ['method', 'path']
)


def observe_http_request(method: str, path: str, status: int, duration_seconds: float) -> None:
    HTTP_REQUESTS_TOTAL.labels(method=method, path=path, status=str(status)).inc()
    HTTP_REQUEST_DURATION_SECONDS.labels(method=method, path=path).observe(duration_seconds)


def metrics_view(_request):
    if not get_settings().metrics_enabled:
        return HttpResponse('', status=404)
    return HttpResponse(generate_latest(), content_type=CONTENT_TYPE_LATEST)
