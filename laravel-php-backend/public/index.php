<?php

declare(strict_types=1);

require __DIR__ . '/../bootstrap/app.php';

use App\Errors\NotFoundError;
use App\Http\Middleware\ErrorHandlingMiddleware;
use App\Http\Middleware\RateLimitMiddleware;
use App\Http\Middleware\RequestContextMiddleware;
use App\Http\Middleware\RequestIdMiddleware;
use App\Observability\LoggerFactory;
use App\Observability\Metrics;
use App\Observability\Tracing;

$context = (new RequestIdMiddleware())->handle($_SERVER);
(new RequestContextMiddleware())->set($context);

header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: DENY');
header('Referrer-Policy: no-referrer');
header('Access-Control-Allow-Origin: ' . env_required('CORS_ORIGIN'));
header('Access-Control-Allow-Headers: Content-Type, x-request-id, x-trace-id');

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';
$path = parse_url($_SERVER['REQUEST_URI'] ?? '/', PHP_URL_PATH) ?: '/';
$routeKey = sprintf('%s %s', strtoupper($method), $path);

try {
    (new RateLimitMiddleware())->check($_SERVER['REMOTE_ADDR'] ?? 'local');

    $openApi = [
        'openapi' => '3.1.0',
        'info' => ['title' => 'laravel-php-backend', 'version' => '1.0.0'],
        'paths' => [
            '/health' => ['get' => ['responses' => ['200' => ['description' => 'OK']]]],
            '/ready' => ['get' => ['responses' => ['200' => ['description' => 'Ready']]]],
            '/metrics' => ['get' => ['responses' => ['200' => ['description' => 'Prometheus metrics']]]],
            '/api/v1/ping' => ['get' => ['responses' => ['200' => ['description' => 'Ping']]]],
        ],
    ];

    if ($routeKey === 'GET /openapi.json') {
        echo json_encode($openApi, JSON_THROW_ON_ERROR);
        return;
    }

    if ($routeKey === 'GET /docs') {
        header('Content-Type: text/html; charset=utf-8');
        echo '<!doctype html><html><body><h1>API Docs</h1><p>OpenAPI: <a href="/openapi.json">/openapi.json</a></p></body></html>';
        return;
    }

    $routes = array_merge(require __DIR__ . '/../routes/web.php', require __DIR__ . '/../routes/api.php');
    if (!isset($routes[$routeKey])) {
        throw new NotFoundError("Route not found: {$routeKey}");
    }

    [$controller, $action] = $routes[$routeKey];
    $response = $controller->{$action}();

    $status = http_response_code() ?: 200;
    Metrics::record($path, $method, $status, max($context->durationMs() / 1000, 0.0001));
    LoggerFactory::log('info', 'request_handled', ['status' => $status], $context);
    Tracing::export($context, $status);

    echo is_array($response) ? json_encode($response, JSON_THROW_ON_ERROR) : $response;
} catch (Throwable $error) {
    $payload = (new ErrorHandlingMiddleware())->handle($error);
    $status = http_response_code() ?: 500;
    Metrics::record($path, $method, $status, max($context->durationMs() / 1000, 0.0001));
    LoggerFactory::log('error', 'request_failed', ['error' => $error->getMessage(), 'status' => $status], $context);
    Tracing::export($context, $status);
    echo json_encode($payload, JSON_THROW_ON_ERROR);
}
