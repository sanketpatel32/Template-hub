from typing import Any

from .app_error import AppError


class ValidationError(AppError):
    def __init__(
        self,
        *,
        detail: str,
        errors: list[Any] | None = None,
        meta: dict[str, Any] | None = None,
        cause: Exception | None = None,
    ) -> None:
        super().__init__(
            status=400,
            code='VALIDATION_ERROR',
            title='Bad Request',
            detail=detail,
            errors=errors,
            meta=meta,
            cause=cause,
        )


class AuthenticationError(AppError):
    def __init__(
        self,
        *,
        detail: str,
        errors: list[Any] | None = None,
        meta: dict[str, Any] | None = None,
        cause: Exception | None = None,
    ) -> None:
        super().__init__(
            status=401,
            code='AUTHENTICATION_REQUIRED',
            title='Unauthorized',
            detail=detail,
            errors=errors,
            meta=meta,
            cause=cause,
        )


class AuthorizationError(AppError):
    def __init__(
        self,
        *,
        detail: str,
        errors: list[Any] | None = None,
        meta: dict[str, Any] | None = None,
        cause: Exception | None = None,
    ) -> None:
        super().__init__(
            status=403,
            code='FORBIDDEN',
            title='Forbidden',
            detail=detail,
            errors=errors,
            meta=meta,
            cause=cause,
        )


class NotFoundError(AppError):
    def __init__(
        self,
        *,
        detail: str,
        errors: list[Any] | None = None,
        meta: dict[str, Any] | None = None,
        cause: Exception | None = None,
    ) -> None:
        super().__init__(
            status=404,
            code='NOT_FOUND',
            title='Not Found',
            detail=detail,
            errors=errors,
            meta=meta,
            cause=cause,
        )


class ConflictError(AppError):
    def __init__(
        self,
        *,
        detail: str,
        errors: list[Any] | None = None,
        meta: dict[str, Any] | None = None,
        cause: Exception | None = None,
    ) -> None:
        super().__init__(
            status=409,
            code='CONFLICT',
            title='Conflict',
            detail=detail,
            errors=errors,
            meta=meta,
            cause=cause,
        )


class RateLimitExceededError(AppError):
    def __init__(
        self,
        *,
        detail: str,
        errors: list[Any] | None = None,
        meta: dict[str, Any] | None = None,
        cause: Exception | None = None,
    ) -> None:
        super().__init__(
            status=429,
            code='RATE_LIMIT_EXCEEDED',
            title='Too Many Requests',
            detail=detail,
            errors=errors,
            meta=meta,
            cause=cause,
        )


class ExternalServiceError(AppError):
    def __init__(
        self,
        *,
        detail: str,
        errors: list[Any] | None = None,
        meta: dict[str, Any] | None = None,
        cause: Exception | None = None,
    ) -> None:
        super().__init__(
            status=502,
            code='EXTERNAL_SERVICE_ERROR',
            title='Bad Gateway',
            detail=detail,
            errors=errors,
            meta=meta,
            cause=cause,
            is_operational=True,
        )


class ServiceUnavailableError(AppError):
    def __init__(
        self,
        *,
        detail: str,
        errors: list[Any] | None = None,
        meta: dict[str, Any] | None = None,
        cause: Exception | None = None,
    ) -> None:
        super().__init__(
            status=503,
            code='SERVICE_UNAVAILABLE',
            title='Service Unavailable',
            detail=detail,
            errors=errors,
            meta=meta,
            cause=cause,
            is_operational=True,
        )


class InternalServerError(AppError):
    def __init__(
        self,
        *,
        detail: str,
        errors: list[Any] | None = None,
        meta: dict[str, Any] | None = None,
        cause: Exception | None = None,
    ) -> None:
        super().__init__(
            status=500,
            code='INTERNAL_SERVER_ERROR',
            title='Internal Server Error',
            detail=detail,
            errors=errors,
            meta=meta,
            cause=cause,
            is_operational=False,
        )
