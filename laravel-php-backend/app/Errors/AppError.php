<?php

declare(strict_types=1);

namespace App\Errors;

use Exception;

class AppError extends Exception
{
    public function __construct(
        public int $status,
        public string $codeValue,
        public string $title,
        public string $detail,
        public string $type,
        public bool $isOperational = true,
        public array $errors = [],
        public array $meta = [],
        ?Exception $previous = null,
    ) {
        parent::__construct($detail, $status, $previous);
    }

    public function toProblem(string $instance, string $requestId, string $traceId): array
    {
        return [
            'type' => $this->type,
            'title' => $this->title,
            'status' => $this->status,
            'detail' => $this->detail,
            'instance' => $instance,
            'code' => $this->codeValue,
            'requestId' => $requestId,
            'traceId' => $traceId,
            'errors' => $this->errors,
        ];
    }
}
