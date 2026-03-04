from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response

from ..observability.tracing import emit_request_trace_span, start_request_trace


class RequestContextMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next) -> Response:
        trace_context = start_request_trace(request.headers.get('x-trace-id'))

        request.state.trace_id = trace_context.trace_id
        request.state.span_id = trace_context.span_id
        request.state.request_start_time = trace_context.request_start_time

        response = await call_next(request)

        response.headers['x-trace-id'] = trace_context.trace_id
        response.headers['x-span-id'] = trace_context.span_id

        emit_request_trace_span(
            request_id=getattr(request.state, 'request_id', None),
            trace_id=trace_context.trace_id,
            span_id=trace_context.span_id,
            method=request.method,
            path=request.url.path,
            status_code=response.status_code,
            request_start_time=trace_context.request_start_time,
        )

        return response
