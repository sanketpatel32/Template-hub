<?php

declare(strict_types=1);

namespace App\State;

use App\Observability\LoggerFactory;

final class ServerLifecycle
{
    public static function registerShutdownHooks(): void
    {
        register_shutdown_function(static function (): void {
            $lastError = error_get_last();
            if ($lastError !== null) {
                LoggerFactory::log('critical', 'fatal_error', $lastError);
            }
        });

        if (function_exists('pcntl_signal')) {
            pcntl_async_signals(true);
            pcntl_signal(SIGTERM, static function (): void {
                Readiness::markNotReady();
            });
            pcntl_signal(SIGINT, static function (): void {
                Readiness::markNotReady();
            });
        }
    }

    public static function shutdownTimeoutMs(): int
    {
        return env_int('SHUTDOWN_TIMEOUT_MS', 5000);
    }
}
