<?php

declare(strict_types=1);

require_once __DIR__ . '/../vendor/autoload.php';

use App\State\Readiness;
use App\State\ServerLifecycle;

$envPath = __DIR__ . '/../.env';
if (file_exists($envPath)) {
    $lines = file($envPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [];
    foreach ($lines as $line) {
        if (str_starts_with(trim($line), '#') || !str_contains($line, '=')) {
            continue;
        }
        [$k, $v] = explode('=', $line, 2);
        $_ENV[trim($k)] = trim($v);
        $_SERVER[trim($k)] = trim($v);
    }
}

Readiness::boot();
ServerLifecycle::registerShutdownHooks();

set_exception_handler(static function (Throwable $e): void {
    http_response_code(500);
    header('Content-Type: application/json');
    echo json_encode(['error' => $e->getMessage()], JSON_THROW_ON_ERROR);
});
