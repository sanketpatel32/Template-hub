<?php

declare(strict_types=1);

namespace App\Observability;

use App\Types\Context;

final class Tracing
{
    public static function newId(int $length = 16): string
    {
        return substr(bin2hex(random_bytes(16)), 0, $length);
    }

    public static function export(Context $context, int $status): void
    {
        if (!env_bool('TRACE_ENABLED', true)) {
            return;
        }

        error_log(json_encode([
            'kind' => 'trace_span',
            'requestId' => $context->requestId,
            'traceId' => $context->traceId,
            'spanId' => $context->spanId,
            'path' => $context->path,
            'method' => $context->method,
            'status' => $status,
            'durationMs' => round($context->durationMs(), 2),
        ]));
    }
}
