<?php
declare(strict_types=1);

// Shared API helpers: JSON responses, input parsing, query execution, row formatting.
header('Content-Type: application/json; charset=utf-8');

function sendJson(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function getJsonInput(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') {
        return [];
    }

    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) {
        sendJson(400, ['ok' => false, 'error' => 'Invalid JSON payload.']);
    }

    return $decoded;
}

function runQuery($conn, string $sql, array $params = [])
{
    $stmt = sqlsrv_query($conn, $sql, $params);
    if ($stmt === false) {
        $errors = sqlsrv_errors(SQLSRV_ERR_ERRORS);
        $message = 'Database query failed.';
        if (is_array($errors) && isset($errors[0]['message'])) {
            $message .= ' ' . $errors[0]['message'];
        }
        sendJson(500, ['ok' => false, 'error' => $message]);
    }
    return $stmt;
}

function fetchAllAssoc($stmt): array
{
    $rows = [];
    while ($row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC)) {
        foreach ($row as $k => $v) {
            if ($v instanceof DateTimeInterface) {
                $row[$k] = $v->format('Y-m-d');
            }
        }
        $rows[] = $row;
    }
    return $rows;
}
