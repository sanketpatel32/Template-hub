import logging
import time

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from ..config.env import settings
from .logger import logger


def _resolve_log_level(status_code: int) -> int:
    if status_code >= 500:
        return logging.ERROR
    if status_code >= 400:
        return logging.WARNING
    return logging.INFO


class HttpLoggerMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        start = time.perf_counter()

        try:
            response = await call_next(request)
        except Exception:
            if settings.NODE_ENV != 'test':
                logger.exception(
                    'Unhandled exception while serving request',
                    extra={
                        'method': request.method,
                        'url': request.url.path,
                        'request_id': getattr(request.state, 'request_id', None),
                        'trace_id': getattr(request.state, 'trace_id', None),
                    },
                )
            raise

        if settings.NODE_ENV == 'test':
            return response

        duration_ms = round((time.perf_counter() - start) * 1000, 2)
        level = _resolve_log_level(response.status_code)

        logger.log(
            level,
            'HTTP request completed',
            extra={
                'method': request.method,
                'url': request.url.path,
                'status_code': response.status_code,
                'duration_ms': duration_ms,
                'request_id': getattr(request.state, 'request_id', None),
                'trace_id': getattr(request.state, 'trace_id', None),
                'span_id': getattr(request.state, 'span_id', None),
            },
        )

        return response
