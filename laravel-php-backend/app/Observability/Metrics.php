<?php

declare(strict_types=1);

namespace App\Observability;

final class Metrics
{
    private static array $durationBuckets = [0.005, 0.01, 0.05, 0.1, 0.5, 1, 2, 5];

    public static function record(string $route, string $method, int $status, float $seconds): void
    {
        $store = self::load();
        $key = strtolower($method) . ':' . $route . ':' . $status;
        $store['requests'][$key] = ($store['requests'][$key] ?? 0) + 1;

        foreach (self::$durationBuckets as $bucket) {
            if ($seconds <= $bucket) {
                $bucketKey = strtolower($method) . ':' . $route . ':' . $bucket;
                $store['durations'][$bucketKey] = ($store['durations'][$bucketKey] ?? 0) + 1;
            }
        }

        self::save($store);
    }

    public static function renderPrometheus(): string
    {
        $store = self::load();
        $lines = [
            '# HELP app_http_requests_total Total HTTP requests.',
            '# TYPE app_http_requests_total counter',
        ];

        foreach ($store['requests'] ?? [] as $key => $count) {
            [$method, $route, $status] = explode(':', (string) $key);
            $lines[] = sprintf('app_http_requests_total{method="%s",route="%s",status="%s"} %d', $method, $route, $status, $count);
        }

        $lines[] = '# HELP app_http_request_duration_seconds Request duration histogram buckets.';
        $lines[] = '# TYPE app_http_request_duration_seconds histogram';
        foreach ($store['durations'] ?? [] as $key => $count) {
            [$method, $route, $bucket] = explode(':', (string) $key);
            $lines[] = sprintf('app_http_request_duration_seconds_bucket{method="%s",route="%s",le="%s"} %d', $method, $route, $bucket, $count);
        }

        return implode("\n", $lines) . "\n";
    }

    private static function filePath(): string
    {
        return sys_get_temp_dir() . '/laravel_php_backend_metrics.json';
    }

    private static function load(): array
    {
        $file = self::filePath();
        if (!file_exists($file)) {
            return ['requests' => [], 'durations' => []];
        }

        $content = file_get_contents($file);

        return is_string($content) ? (json_decode($content, true) ?: ['requests' => [], 'durations' => []]) : ['requests' => [], 'durations' => []];
    }

    private static function save(array $store): void
    {
        file_put_contents(self::filePath(), json_encode($store, JSON_THROW_ON_ERROR));
    }
}
