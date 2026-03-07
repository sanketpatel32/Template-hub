from apps.api.errors.app_error import AppError


class ValidationError(AppError):
    def __init__(self, detail: str = 'Validation failed') -> None:
        super().__init__(
            400,
            'VALIDATION_ERROR',
            'Bad Request',
            detail,
            'https://api.example.dev/errors/validation',
        )


class AuthenticationError(AppError):
    def __init__(self, detail: str = 'Authentication required') -> None:
        super().__init__(
            401,
            'AUTHENTICATION_ERROR',
            'Unauthorized',
            detail,
            'https://api.example.dev/errors/authentication',
        )


class AuthorizationError(AppError):
    def __init__(self, detail: str = 'Forbidden') -> None:
        super().__init__(
            403,
            'AUTHORIZATION_ERROR',
            'Forbidden',
            detail,
            'https://api.example.dev/errors/authorization',
        )


class NotFoundError(AppError):
    def __init__(self, detail: str = 'Resource not found') -> None:
        super().__init__(
            404, 'NOT_FOUND', 'Not Found', detail, 'https://api.example.dev/errors/not-found'
        )


class ConflictError(AppError):
    def __init__(self, detail: str = 'Conflict') -> None:
        super().__init__(
            409, 'CONFLICT', 'Conflict', detail, 'https://api.example.dev/errors/conflict'
        )


class RateLimitExceededError(AppError):
    def __init__(self, detail: str = 'Rate limit exceeded') -> None:
        super().__init__(
            429,
            'RATE_LIMIT_EXCEEDED',
            'Too Many Requests',
            detail,
            'https://api.example.dev/errors/rate-limit-exceeded',
        )


class ExternalServiceError(AppError):
    def __init__(self, detail: str = 'External service failed') -> None:
        super().__init__(
            502,
            'EXTERNAL_SERVICE_ERROR',
            'Bad Gateway',
            detail,
            'https://api.example.dev/errors/external-service',
        )


class ServiceUnavailableError(AppError):
    def __init__(self, detail: str = 'Service unavailable') -> None:
        super().__init__(
            503,
            'SERVICE_UNAVAILABLE',
            'Service Unavailable',
            detail,
            'https://api.example.dev/errors/service-unavailable',
        )


class InternalServerError(AppError):
    def __init__(self, detail: str = 'Internal server error') -> None:
        super().__init__(
            500,
            'INTERNAL_SERVER_ERROR',
            'Internal Server Error',
            detail,
            'https://api.example.dev/errors/internal',
            is_operational=False,
        )
