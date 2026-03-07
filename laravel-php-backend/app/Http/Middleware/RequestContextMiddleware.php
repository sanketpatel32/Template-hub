<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Types\Context;

final class RequestContextMiddleware
{
    public static ?Context $context = null;

    public function set(Context $context): void
    {
        self::$context = $context;
        header('x-request-id: ' . $context->requestId);
        header('x-trace-id: ' . $context->traceId);
        header('x-span-id: ' . $context->spanId);
    }
}
