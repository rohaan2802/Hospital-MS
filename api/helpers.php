<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

function sendJson(int $statusCode, array $payload): void
{
    http_response_code($statusCode);
    echo json_encode($payload, JSON_UNESCAPED_UNICODE);
    exit;
}

function requireAuth(): void
{
    session_name('hospital_ms_session');
    session_set_cookie_params(['httponly' => true, 'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'), 'samesite' => 'Strict']);
    session_start();
    if (empty($_SESSION['authenticated'])) sendJson(401, ['ok' => false, 'error' => 'Authentication required. Open login.html first.']);
}

function getJsonInput(): array
{
    $raw = file_get_contents('php://input');
    if ($raw === false || $raw === '') return [];
    $decoded = json_decode($raw, true);
    if (!is_array($decoded)) sendJson(400, ['ok' => false, 'error' => 'Invalid JSON payload.']);
    return $decoded;
}

function runQuery(PDO $conn, string $sql, array $params = []): PDOStatement
{
    try {
        $stmt = $conn->prepare($sql);
        $stmt->execute($params);
        return $stmt;
    } catch (PDOException $e) {
        error_log('Database query failed: ' . $e->getMessage());
        sendJson(500, ['ok' => false, 'error' => 'Database operation failed.']);
    }
}

function fetchAllAssoc(PDOStatement $stmt): array { return $stmt->fetchAll(PDO::FETCH_ASSOC); }
function fetchOneAssoc(PDOStatement $stmt): ?array { $row = $stmt->fetch(PDO::FETCH_ASSOC); return $row === false ? null : $row; }
