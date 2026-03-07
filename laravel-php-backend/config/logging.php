<?php

declare(strict_types=1);

return [
    'level' => env_required('LOG_LEVEL'),
    'pretty' => env_bool('LOG_PRETTY', false),
];
