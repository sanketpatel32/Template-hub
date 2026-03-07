<?php

declare(strict_types=1);

return [
    'port' => env_int('APP_PORT', 8080),
    'env' => env_required('APP_ENV'),
    'debug' => env_bool('APP_DEBUG', false),
    'key' => env_required('APP_KEY'),
    'url' => env_required('APP_URL'),
    'shutdown_timeout_ms' => env_int('SHUTDOWN_TIMEOUT_MS', 5000),
    'trust_proxy' => env_bool('TRUST_PROXY', false),
];
