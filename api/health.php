<?php
declare(strict_types=1);

require_once __DIR__ . '/helpers.php';
require_once dirname(__DIR__) . '/config/db.php';

try {
    $conn = getConnection();
    $stmt = runQuery($conn, 'SELECT DATABASE() AS database_name');
    $row = fetchOneAssoc($stmt) ?? [];
    sendJson(200, [
        'ok' => true,
        'data' => [
            'database' => $row['database_name'] ?? null,
            'timestamp' => gmdate('c'),
        ],
    ]);
} catch (Throwable $e) {
    error_log('Health check failed: ' . $e->getMessage());
    sendJson(500, ['ok' => false, 'error' => 'Database service unavailable.']);
}
