<?php

declare(strict_types=1);

function env_value(string $key, mixed $default = null): mixed
{
    $value = $_ENV[$key] ?? $_SERVER[$key] ?? getenv($key);

    return $value === false || $value === null || $value === '' ? $default : $value;
}

function env_required(string $key): string
{
    $value = env_value($key);

    if ($value === null || $value === '') {
        throw new RuntimeException("Missing required environment variable: {$key}");
    }

    return (string) $value;
}

function env_bool(string $key, bool $default = false): bool
{
    $value = env_value($key);
    if ($value === null) {
        return $default;
    }

    return in_array(strtolower((string) $value), ['1', 'true', 'yes', 'on'], true);
}

function env_int(string $key, int $default): int
{
    $value = env_value($key);
    if ($value === null) {
        return $default;
    }

    if (!is_numeric($value)) {
        throw new RuntimeException("Environment variable {$key} must be numeric");
    }

    return (int) $value;
}

function request_context(): ?\App\Types\Context
{
    return \App\Http\Middleware\RequestContextMiddleware::$context;
}
