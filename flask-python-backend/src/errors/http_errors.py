from .app_error import AppError


class ValidationError(AppError):
    def __init__(self, detail: str = 'Validation failed.') -> None:
        super().__init__(status=400, code='VALIDATION_ERROR', title='Bad Request', detail=detail)


class AuthenticationError(AppError):
    def __init__(self, detail: str = 'Authentication required.') -> None:
        super().__init__(
            status=401, code='AUTHENTICATION_ERROR', title='Unauthorized', detail=detail
        )


class AuthorizationError(AppError):
    def __init__(self, detail: str = 'Insufficient permissions.') -> None:
        super().__init__(status=403, code='AUTHORIZATION_ERROR', title='Forbidden', detail=detail)


class NotFoundError(AppError):
    def __init__(self, detail: str = 'Requested resource was not found.') -> None:
        super().__init__(status=404, code='NOT_FOUND', title='Not Found', detail=detail)


class ConflictError(AppError):
    def __init__(self, detail: str = 'Resource conflict detected.') -> None:
        super().__init__(status=409, code='CONFLICT', title='Conflict', detail=detail)


class RateLimitExceededError(AppError):
    def __init__(self, detail: str = 'Rate limit exceeded.') -> None:
        super().__init__(
            status=429, code='RATE_LIMIT_EXCEEDED', title='Too Many Requests', detail=detail
        )


class ExternalServiceError(AppError):
    def __init__(self, detail: str = 'External service request failed.') -> None:
        super().__init__(
            status=502, code='EXTERNAL_SERVICE_ERROR', title='Bad Gateway', detail=detail
        )


class ServiceUnavailableError(AppError):
    def __init__(self, detail: str = 'Service is unavailable.') -> None:
        super().__init__(
            status=503,
            code='SERVICE_UNAVAILABLE',
            title='Service Unavailable',
            detail=detail,
        )


class InternalServerError(AppError):
    def __init__(self, detail: str = 'Unexpected server error.') -> None:
        super().__init__(
            status=500,
            code='INTERNAL_SERVER_ERROR',
            title='Internal Server Error',
            detail=detail,
            is_operational=False,
        )
