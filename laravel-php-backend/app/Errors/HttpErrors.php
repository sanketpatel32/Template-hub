<?php

declare(strict_types=1);

namespace App\Errors;

final class ValidationError extends AppError
{
    public function __construct(string $detail = 'Validation failed', array $errors = [])
    {
        parent::__construct(422, 'VALIDATION_ERROR', 'Unprocessable Entity', $detail, 'https://api.example.dev/errors/validation', true, $errors);
    }
}

final class AuthenticationError extends AppError
{
    public function __construct(string $detail = 'Authentication required')
    {
        parent::__construct(401, 'AUTHENTICATION_ERROR', 'Unauthorized', $detail, 'https://api.example.dev/errors/authentication');
    }
}

final class AuthorizationError extends AppError
{
    public function __construct(string $detail = 'Forbidden')
    {
        parent::__construct(403, 'AUTHORIZATION_ERROR', 'Forbidden', $detail, 'https://api.example.dev/errors/authorization');
    }
}

final class NotFoundError extends AppError
{
    public function __construct(string $detail = 'Resource not found')
    {
        parent::__construct(404, 'NOT_FOUND', 'Not Found', $detail, 'https://api.example.dev/errors/not-found');
    }
}

final class ConflictError extends AppError
{
    public function __construct(string $detail = 'Conflict')
    {
        parent::__construct(409, 'CONFLICT', 'Conflict', $detail, 'https://api.example.dev/errors/conflict');
    }
}

final class RateLimitExceededError extends AppError
{
    public function __construct(string $detail = 'Rate limit exceeded')
    {
        parent::__construct(429, 'RATE_LIMIT_EXCEEDED', 'Too Many Requests', $detail, 'https://api.example.dev/errors/rate-limit');
    }
}

final class ExternalServiceError extends AppError
{
    public function __construct(string $detail = 'External service failed')
    {
        parent::__construct(502, 'EXTERNAL_SERVICE_ERROR', 'Bad Gateway', $detail, 'https://api.example.dev/errors/external-service');
    }
}

final class ServiceUnavailableError extends AppError
{
    public function __construct(string $detail = 'Service unavailable')
    {
        parent::__construct(503, 'SERVICE_UNAVAILABLE', 'Service Unavailable', $detail, 'https://api.example.dev/errors/service-unavailable');
    }
}

final class InternalServerError extends AppError
{
    public function __construct(string $detail = 'Internal server error')
    {
        parent::__construct(500, 'INTERNAL_SERVER_ERROR', 'Internal Server Error', $detail, 'https://api.example.dev/errors/internal', false);
    }
}
