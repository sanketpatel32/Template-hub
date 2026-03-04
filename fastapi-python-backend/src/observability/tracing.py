import time
import uuid
from dataclasses import dataclass

from ..config.env import settings
from .logger import logger


@dataclass(frozen=True)
class RequestTraceContext:
    trace_id: str
    span_id: str
    request_start_time: float


def start_request_trace(incoming_trace_id: str | None) -> RequestTraceContext:
    trace_id = incoming_trace_id or uuid.uuid4().hex
    span_id = uuid.uuid4().hex[:16]

    return RequestTraceContext(
        trace_id=trace_id,
        span_id=span_id,
        request_start_time=time.perf_counter(),
    )


def emit_request_trace_span(
    *,
    request_id: str | None,
    trace_id: str,
    span_id: str,
    method: str,
    path: str,
    status_code: int,
    request_start_time: float,
) -> None:
    if not settings.TRACE_ENABLED or settings.NODE_ENV == 'test':
        return

    duration_ms = round((time.perf_counter() - request_start_time) * 1000, 2)
    logger.info(
        'Request trace span',
        extra={
            'request_id': request_id,
            'trace_id': trace_id,
            'span_id': span_id,
            'method': method,
            'path': path,
            'status_code': status_code,
            'duration_ms': duration_ms,
        },
    )
