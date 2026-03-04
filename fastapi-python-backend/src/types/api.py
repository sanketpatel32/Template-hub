from typing import Any, NotRequired, TypedDict


class ProblemDetails(TypedDict):
    type: str
    title: str
    status: int
    detail: str
    instance: str
    code: str
    requestId: NotRequired[str | None]
    traceId: NotRequired[str | None]
    errors: NotRequired[list[Any]]
