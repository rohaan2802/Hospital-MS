<?php
declare(strict_types=1);

require_once __DIR__ . '/helpers.php';

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') {
    sendJson(200, ['ok' => true, 'data' => ['enabled' => false, 'authenticated' => true]]);
}
if ($method === 'DELETE') {
    sendJson(200, ['ok' => true]);
}
if ($method !== 'POST') sendJson(405, ['ok' => false, 'error' => 'Method not allowed.']);

sendJson(200, ['ok' => true, 'data' => ['enabled' => false]]);
