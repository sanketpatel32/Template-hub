<?php

declare(strict_types=1);

namespace App\Types;

final class Context
{
    public function __construct(
        public string $requestId,
        public string $traceId,
        public string $spanId,
        public float $startedAt,
        public string $method,
        public string $path,
    ) {}

    public function durationMs(): float
    {
        return (microtime(true) - $this->startedAt) * 1000;
    }
}
