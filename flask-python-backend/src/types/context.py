from dataclasses import dataclass


@dataclass(frozen=True)
class RequestContext:
    request_id: str
    trace_id: str
    span_id: str
    start_time: float
