<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Observability\Metrics;

final class MetricsController
{
    public function metrics(): string
    {
        header('Content-Type: text/plain; version=0.0.4');
        return Metrics::renderPrometheus();
    }
}
