<?php

declare(strict_types=1);

namespace App\Errors;

use Throwable;

final class ErrorMap
{
    public static function normalize(Throwable $error): AppError
    {
        if ($error instanceof AppError) {
            return $error;
        }

        return new InternalServerError($error->getMessage() !== '' ? $error->getMessage() : 'Unexpected runtime failure');
    }
}
