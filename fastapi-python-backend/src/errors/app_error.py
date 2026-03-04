from typing import Any

from ..types.api import ProblemDetails

ERROR_BASE_URI = 'https://api.example.dev/errors'


class AppError(Exception):
    def __init__(
        self,
        *,
        status: int,
        code: str,
        title: str,
        detail: str,
        type: str | None = None,
        is_operational: bool | None = None,
        errors: list[Any] | None = None,
        meta: dict[str, Any] | None = None,
        cause: Exception | None = None,
    ) -> None:
        super().__init__(detail)
        self.status = status
        self.code = code
        self.title = title
        self.detail = detail
        self.type = type or f'{ERROR_BASE_URI}/{code.lower().replace("_", "-")}'
        self.is_operational = is_operational if is_operational is not None else status < 500
        self.errors = errors or []
        self.meta = meta or {}

        if cause is not None:
            self.__cause__ = cause


def to_problem_details(
    error: AppError,
    *,
    instance: str,
    request_id: str | None = None,
    trace_id: str | None = None,
) -> ProblemDetails:
    return {
        'type': error.type,
        'title': error.title,
        'status': error.status,
        'detail': error.detail,
        'instance': instance,
        'code': error.code,
        'requestId': request_id,
        'traceId': trace_id,
        'errors': error.errors,
    }
