<?php
declare(strict_types=1);

// Performance reviews API: list/meta and CRUD for review entries.
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/helpers.php';

try {
    $conn = getSqlServerConnection();
} catch (Throwable $e) {
    sendJson(500, ['ok' => false, 'error' => $e->getMessage()]);
}

$method = $_SERVER['REQUEST_METHOD'];
if ($method === 'GET') handleGet($conn);
if ($method === 'POST') handleCreate($conn);
if ($method === 'PUT') handleUpdate($conn);
if ($method === 'DELETE') handleDelete($conn);
sendJson(405, ['ok' => false, 'error' => 'Method not allowed.']);

function handleGet($conn): void
{
    if (isset($_GET['meta'])) {
        $consultants = runQuery(
            $conn,
            "SELECT c.staff_no, s.staff_name, c.specialty
             FROM consultant c
             JOIN staff s ON s.staff_no = c.staff_no
             ORDER BY s.staff_name"
        );
        $doctors = runQuery(
            $conn,
            "SELECT d.staff_no, s.staff_name, d.position
             FROM doctor d
             JOIN staff s ON s.staff_no = d.staff_no
             WHERE d.staff_no NOT IN (SELECT staff_no FROM consultant)
             ORDER BY s.staff_name"
        );
        sendJson(200, ['ok' => true, 'data' => ['consultants' => fetchAllAssoc($consultants), 'doctors' => fetchAllAssoc($doctors)]]);
    }

    $stmt = runQuery(
        $conn,
        "SELECT
            pr.review_id AS id,
            pr.doctor_no AS doctor,
            ds.staff_name AS doctor_name,
            pr.reviewed_by_consultant AS reviewer,
            rs.staff_name AS reviewer_name,
            pr.review_date AS date,
            pr.performance_grade AS grade
         FROM performance_review pr
         JOIN staff ds ON ds.staff_no = pr.doctor_no
         JOIN staff rs ON rs.staff_no = pr.reviewed_by_consultant
         ORDER BY pr.review_date DESC, pr.review_id DESC"
    );
    sendJson(200, ['ok' => true, 'data' => fetchAllAssoc($stmt)]);
}

function handleCreate($conn): void
{
    $b = getJsonInput();
    foreach (['doctor', 'reviewer', 'date', 'grade'] as $f) if (empty($b[$f]) && $b[$f] !== 0) sendJson(400, ['ok' => false, 'error' => "Missing field: {$f}"]);
    $next = runQuery($conn, "SELECT ISNULL(MAX(review_id),0)+1 AS next_id FROM performance_review");
    $row = sqlsrv_fetch_array($next, SQLSRV_FETCH_ASSOC);
    $id = (int) $row['next_id'];
    runQuery(
        $conn,
        "INSERT INTO performance_review(review_id, doctor_no, review_date, performance_grade, reviewed_by_consultant)
         VALUES (?,?,?,?,?)",
        [$id, (int) $b['doctor'], $b['date'], $b['grade'], (int) $b['reviewer']]
    );
    sendJson(201, ['ok' => true, 'data' => ['review_id' => $id]]);
}

function handleUpdate($conn): void
{
    $b = getJsonInput();
    foreach (['id', 'doctor', 'reviewer', 'date', 'grade'] as $f) if (empty($b[$f]) && $b[$f] !== 0) sendJson(400, ['ok' => false, 'error' => "Missing field: {$f}"]);
    runQuery(
        $conn,
        "UPDATE performance_review
         SET doctor_no=?, review_date=?, performance_grade=?, reviewed_by_consultant=?
         WHERE review_id=?",
        [(int) $b['doctor'], $b['date'], $b['grade'], (int) $b['reviewer'], (int) $b['id']]
    );
    sendJson(200, ['ok' => true]);
}

function handleDelete($conn): void
{
    $b = getJsonInput();
    $id = isset($b['id']) ? (int) $b['id'] : 0;
    if ($id <= 0) sendJson(400, ['ok' => false, 'error' => 'Missing review id.']);
    runQuery($conn, "DELETE FROM performance_review WHERE review_id = ?", [$id]);
    sendJson(200, ['ok' => true]);
}
