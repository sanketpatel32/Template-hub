from dataclasses import dataclass


@dataclass
class RequestContext:
    request_id: str | None = None
    trace_id: str | None = None
    span_id: str | None = None
    request_start_time: float | None = None
