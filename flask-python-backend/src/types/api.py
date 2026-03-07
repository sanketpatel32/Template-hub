from typing import Any, NotRequired, TypedDict


class ApiSuccess(TypedDict):
    success: bool
    data: dict[str, Any]
    meta: NotRequired[dict[str, Any]]


class ProblemDetails(TypedDict):
    type: str
    title: str
    status: int
    detail: str
    instance: str
    code: str
    requestId: str | None
    traceId: str | None
    spanId: str | None
    errors: list[Any]
