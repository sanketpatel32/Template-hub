<?php

declare(strict_types=1);

return [
    'metrics_enabled' => env_bool('METRICS_ENABLED', true),
    'trace_enabled' => env_bool('TRACE_ENABLED', true),
];
