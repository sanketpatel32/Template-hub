<?php

declare(strict_types=1);

use App\Http\Controllers\PingController;

return [
    'GET /api/v1/ping' => [new PingController(), 'ping'],
];
