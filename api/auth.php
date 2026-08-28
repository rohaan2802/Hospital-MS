<?php
declare(strict_types=1);

require_once __DIR__ . '/helpers.php';

session_name('hospital_ms_session');
session_set_cookie_params(['httponly' => true, 'secure' => (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off'), 'samesite' => 'Strict']);
session_start();

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') {
    sendJson(200, ['ok' => true, 'data' => ['authenticated' => !empty($_SESSION['authenticated'])]]);
}
if ($method === 'DELETE') {
    $_SESSION = [];
    session_destroy();
    sendJson(200, ['ok' => true]);
}
if ($method !== 'POST') sendJson(405, ['ok' => false, 'error' => 'Method not allowed.']);

$body = getJsonInput();
$username = trim((string) ($body['username'] ?? ''));
$password = (string) ($body['password'] ?? '');
$expectedUsername = getenv('APP_USERNAME') ?: 'admin';
$expectedPassword = getenv('APP_PASSWORD') ?: '';

if ($expectedPassword === '') sendJson(503, ['ok' => false, 'error' => 'Application login is not configured.']);
if (!hash_equals($expectedUsername, $username) || !hash_equals($expectedPassword, $password)) {
    usleep(300000);
    sendJson(401, ['ok' => false, 'error' => 'Invalid username or password.']);
}

session_regenerate_id(true);
$_SESSION['authenticated'] = true;
sendJson(200, ['ok' => true]);
