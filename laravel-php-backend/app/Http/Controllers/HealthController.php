<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\State\Readiness;
use App\Types\Api;

final class HealthController
{
    public function health(): array
    {
        return Api::success(['status' => 'ok']);
    }

    public function ready(): array
    {
        if (!Readiness::isReady()) {
            http_response_code(503);
            return [
                'type' => 'https://api.example.dev/errors/service-unavailable',
                'title' => 'Service Unavailable',
                'status' => 503,
                'detail' => 'Service not ready',
                'instance' => '/ready',
                'code' => 'SERVICE_UNAVAILABLE',
                'requestId' => request_context()->requestId,
                'traceId' => request_context()->traceId,
                'errors' => [],
            ];
        }

        return Api::success(['status' => 'ready']);
    }
}
