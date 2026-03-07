<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Errors\ErrorMap;
use Throwable;

final class ErrorHandlingMiddleware
{
    public function handle(Throwable $error): array
    {
        $appError = ErrorMap::normalize($error);
        http_response_code($appError->status);

        $context = RequestContextMiddleware::$context;
        $requestId = $context?->requestId ?? 'unknown';
        $traceId = $context?->traceId ?? 'unknown';
        $instance = $context?->path ?? '/';

        return $appError->toProblem($instance, $requestId, $traceId);
    }
}
