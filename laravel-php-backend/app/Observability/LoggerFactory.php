<?php

declare(strict_types=1);

namespace App\Observability;

use App\Types\Context;

final class LoggerFactory
{
    public static function log(string $level, string $message, array $context = [], ?Context $request = null): void
    {
        $payload = [
            'level' => $level,
            'message' => $message,
            'time' => gmdate('c'),
            'context' => self::redact($context),
        ];

        if ($request !== null) {
            $payload['requestId'] = $request->requestId;
            $payload['traceId'] = $request->traceId;
            $payload['spanId'] = $request->spanId;
            $payload['path'] = $request->path;
            $payload['method'] = $request->method;
            $payload['durationMs'] = round($request->durationMs(), 2);
        }

        $pretty = env_bool('LOG_PRETTY', env_value('APP_ENV', 'production') !== 'production');
        error_log($pretty ? json_encode($payload, JSON_PRETTY_PRINT) : json_encode($payload));
    }

    private static function redact(array $context): array
    {
        $sensitive = ['password', 'token', 'secret', 'authorization'];
        foreach ($context as $key => $value) {
            if (in_array(strtolower((string) $key), $sensitive, true)) {
                $context[$key] = '[REDACTED]';
            }
        }

        return $context;
    }
}
