<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Types\Api;
use RuntimeException;

final class PingController
{
    public function ping(): array
    {
        if (isset($_GET['fail']) && $_GET['fail'] === '1') {
            throw new RuntimeException('Forced ping failure');
        }

        return Api::success(['message' => 'pong']);
    }
}
