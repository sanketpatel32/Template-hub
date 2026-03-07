from __future__ import annotations

import logging
import time
import uuid
from collections import defaultdict, deque
from collections.abc import Callable
from contextvars import ContextVar
from dataclasses import dataclass

from django.http import HttpRequest, HttpResponse, JsonResponse
from django.utils.deprecation import MiddlewareMixin

from apps.api.errors.app_error import AppError
from apps.api.errors.error_map import map_to_app_error
from apps.api.errors.http_errors import InternalServerError
from apps.api.types.api import problem_details
from project.env import get_settings
from project.readiness import is_ready

logger = logging.getLogger('api.request')
trace_logger = logging.getLogger('api.trace')

request_id_ctx: ContextVar[str | None] = ContextVar('request_id', default=None)
trace_id_ctx: ContextVar[str | None] = ContextVar('trace_id', default=None)
span_id_ctx: ContextVar[str | None] = ContextVar('span_id', default=None)


@dataclass
class RateBucket:
    timestamps: deque[float]


class RequestCorrelationMiddleware(MiddlewareMixin):
    def process_request(self, request: HttpRequest) -> None:
        request_id = request.headers.get('X-Request-Id', str(uuid.uuid4()))
        trace_id = request.headers.get('X-Trace-Id', uuid.uuid4().hex)
        span_id = uuid.uuid4().hex[:16]
        request.request_id = request_id
        request.trace_id = trace_id
        request.span_id = span_id
        request.started_at = time.perf_counter()
        request_id_ctx.set(request_id)
        trace_id_ctx.set(trace_id)
        span_id_ctx.set(span_id)


class SecurityHeadersMiddleware(MiddlewareMixin):
    def process_response(self, request: HttpRequest, response: HttpResponse) -> HttpResponse:
        response['X-Content-Type-Options'] = 'nosniff'
        response['X-Frame-Options'] = 'DENY'
        response['Referrer-Policy'] = 'same-origin'
        response['X-XSS-Protection'] = '1; mode=block'
        return response


class CorsMiddleware(MiddlewareMixin):
    def process_response(self, request: HttpRequest, response: HttpResponse) -> HttpResponse:
        settings = get_settings()
        response['Access-Control-Allow-Origin'] = settings.cors_origin
        response['Access-Control-Allow-Headers'] = (
            'Content-Type, Authorization, X-Request-Id, X-Trace-Id'
        )
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, PATCH, DELETE, OPTIONS'
        return response


class RequestLoggingMiddleware(MiddlewareMixin):
    def process_response(self, request: HttpRequest, response: HttpResponse) -> HttpResponse:
        started = getattr(request, 'started_at', None)
        duration_ms = round((time.perf_counter() - started) * 1000, 2) if started else 0.0
        status = response.status_code
        path = request.path
        method = request.method
        logger.info(
            'request.completed',
            extra={
                'requestId': getattr(request, 'request_id', None),
                'traceId': getattr(request, 'trace_id', None),
                'spanId': getattr(request, 'span_id', None),
                'path': path,
                'method': method,
                'status': status,
                'durationMs': duration_ms,
            },
        )
        from apps.api.views.metrics import observe_http_request

        observe_http_request(method, path, status, duration_ms / 1000)
        if get_settings().trace_enabled:
            trace_logger.info(
                'trace.span',
                extra={
                    'requestId': getattr(request, 'request_id', None),
                    'traceId': getattr(request, 'trace_id', None),
                    'spanId': getattr(request, 'span_id', None),
                    'name': f'{method} {path}',
                    'durationMs': duration_ms,
                    'status': status,
                },
            )
        response['X-Request-Id'] = getattr(request, 'request_id', '')
        response['X-Trace-Id'] = getattr(request, 'trace_id', '')
        return response


class RateLimitMiddleware(MiddlewareMixin):
    buckets: dict[str, RateBucket] = defaultdict(lambda: RateBucket(timestamps=deque()))

    def process_request(self, request: HttpRequest) -> HttpResponse | None:
        if request.path in {'/health', '/ready', '/metrics'}:
            return None
        settings = get_settings()
        key = request.META.get('REMOTE_ADDR', 'unknown')
        now = time.time()
        bucket = self.buckets[key]
        cutoff = now - (settings.rate_limit_window_ms / 1000)
        while bucket.timestamps and bucket.timestamps[0] < cutoff:
            bucket.timestamps.popleft()
        if len(bucket.timestamps) >= settings.rate_limit_max:
            err = AppError(
                status=429,
                code='RATE_LIMIT_EXCEEDED',
                title='Too Many Requests',
                detail='Rate limit exceeded',
                type_uri='https://api.example.dev/errors/rate-limit-exceeded',
            )
            return JsonResponse(problem_details(err, request), status=429)
        bucket.timestamps.append(now)
        return None


class ReadinessMiddleware(MiddlewareMixin):
    def process_request(self, request: HttpRequest) -> HttpResponse | None:
        if request.path == '/ready' and not is_ready():
            err = AppError(
                status=503,
                code='SERVICE_UNAVAILABLE',
                title='Service Unavailable',
                detail='Service is shutting down',
                type_uri='https://api.example.dev/errors/service-unavailable',
            )
            return JsonResponse(problem_details(err, request), status=503)
        return None


class ErrorHandlingMiddleware:
    def __init__(self, get_response: Callable[..., HttpResponse]) -> None:
        self.get_response = get_response

    def __call__(self, request: HttpRequest) -> HttpResponse:
        try:
            return self.get_response(request)
        except Exception as error:  # noqa: BLE001
            app_error = map_to_app_error(error)
            if not app_error.is_operational:
                logger.exception(
                    'Unhandled exception', extra={'requestId': getattr(request, 'request_id', None)}
                )
            return JsonResponse(problem_details(app_error, request), status=app_error.status)


def not_found_response(request: HttpRequest, _exception: Exception) -> JsonResponse:
    error = AppError(
        status=404,
        code='NOT_FOUND',
        title='Not Found',
        detail=f'Route not found: {request.method} {request.path}',
        type_uri='https://api.example.dev/errors/not-found',
    )
    return JsonResponse(problem_details(error, request), status=404)


def server_error_response(request: HttpRequest) -> JsonResponse:
    error = InternalServerError(detail='Unexpected server failure')
    return JsonResponse(problem_details(error, request), status=500)


def current_context() -> dict[str, str | None]:
    return {
        'requestId': request_id_ctx.get(),
        'traceId': trace_id_ctx.get(),
        'spanId': span_id_ctx.get(),
    }
