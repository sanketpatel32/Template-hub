<?php

declare(strict_types=1);

namespace App\Types;

final class Api
{
    public static function success(array $data, array $meta = []): array
    {
        $payload = ['success' => true, 'data' => $data];
        if ($meta !== []) {
            $payload['meta'] = $meta;
        }

        return $payload;
    }
}
