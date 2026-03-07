from typing import TypedDict


class RequestContext(TypedDict, total=False):
    requestId: str
    traceId: str
    spanId: str
