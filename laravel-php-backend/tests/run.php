<?php

declare(strict_types=1);

$checks = [];
$checks[] = file_exists(__DIR__ . '/../routes/api.php');
$checks[] = file_exists(__DIR__ . '/../app/Errors/AppError.php');
$checks[] = file_exists(__DIR__ . '/../public/index.php');

if (in_array(false, $checks, true)) {
    fwrite(STDERR, "Template smoke tests failed\n");
    exit(1);
}

echo "Template smoke tests passed\n";
