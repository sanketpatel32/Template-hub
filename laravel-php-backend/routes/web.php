<?php

declare(strict_types=1);

use App\Http\Controllers\HealthController;
use App\Http\Controllers\MetricsController;

return [
    'GET /health' => [new HealthController(), 'health'],
    'GET /ready' => [new HealthController(), 'ready'],
    'GET /metrics' => [new MetricsController(), 'metrics'],
];
