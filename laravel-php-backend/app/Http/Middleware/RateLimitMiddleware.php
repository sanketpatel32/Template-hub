<?php

declare(strict_types=1);

namespace App\Http\Middleware;

use App\Errors\RateLimitExceededError;

final class RateLimitMiddleware
{
    public function check(string $clientId): void
    {
        $max = env_int('RATE_LIMIT_MAX', 60);
        $windowMs = env_int('RATE_LIMIT_WINDOW_MS', 60000);
        $now = (int) (microtime(true) * 1000);

        $hits = $this->load();
        $clientHits = array_filter($hits[$clientId] ?? [], static fn (int $hit): bool => ($now - $hit) < $windowMs);
        $clientHits[] = $now;
        $hits[$clientId] = array_values($clientHits);
        $this->save($hits);

        if (count($clientHits) > $max) {
            throw new RateLimitExceededError(sprintf('Too many requests in %dms window', $windowMs));
        }
    }

    private function filePath(): string
    {
        return sys_get_temp_dir() . '/laravel_php_backend_ratelimit.json';
    }

    private function load(): array
    {
        $file = $this->filePath();
        if (!file_exists($file)) {
            return [];
        }

        $content = file_get_contents($file);

        return is_string($content) ? (json_decode($content, true) ?: []) : [];
    }

    private function save(array $hits): void
    {
        file_put_contents($this->filePath(), json_encode($hits, JSON_THROW_ON_ERROR));
    }
}
