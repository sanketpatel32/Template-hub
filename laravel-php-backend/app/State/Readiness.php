<?php

declare(strict_types=1);

namespace App\State;

final class Readiness
{
    private static bool $ready = true;

    public static function boot(): void
    {
        self::$ready = true;
    }

    public static function markNotReady(): void
    {
        self::$ready = false;
    }

    public static function markReady(): void
    {
        self::$ready = true;
    }

    public static function isReady(): bool
    {
        return self::$ready;
    }
}
