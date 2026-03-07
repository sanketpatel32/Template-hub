<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Observability\Tracing;
use App\Types\Context;

final class RequestIdMiddleware
{
    public function handle(array $server): Context
    {
        $requestId = $server['HTTP_X_REQUEST_ID'] ?? Tracing::newId(16);
        $traceId = $server['HTTP_X_TRACE_ID'] ?? Tracing::newId(32);
        $spanId = Tracing::newId(16);

        return new Context(
            requestId: $requestId,
            traceId: $traceId,
            spanId: $spanId,
            startedAt: microtime(true),
            method: $server['REQUEST_METHOD'] ?? 'GET',
            path: $server['REQUEST_URI'] ?? '/',
        );
    }
}
