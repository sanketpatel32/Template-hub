from flask import Flask, Response, g, request

from ..observability.tracing import emit_request_trace_span, start_request_trace

TRACE_HEADER = 'x-trace-id'
SPAN_HEADER = 'x-span-id'


def register_request_context_middleware(app: Flask) -> None:
    @app.before_request
    def bind_request_context() -> None:
        trace = start_request_trace(request.headers.get(TRACE_HEADER))
        g.trace_id = trace.trace_id
        g.span_id = trace.span_id
        g.request_start_time = trace.request_start_time

    @app.after_request
    def attach_trace_headers(response: Response) -> Response:
        response.headers[TRACE_HEADER] = g.trace_id
        response.headers[SPAN_HEADER] = g.span_id
        emit_request_trace_span(
            request_id=getattr(g, 'request_id', None),
            trace_id=g.trace_id,
            span_id=g.span_id,
            method=request.method,
            path=request.path,
            status_code=response.status_code,
            request_start_time=g.request_start_time,
        )
        return response
