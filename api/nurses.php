<?php
declare(strict_types=1);

// Nurses API: listing, ward/care-unit metadata, and CRUD.
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/helpers.php';
requireAuth();

try {
    $conn = getConnection();
} catch (Throwable $e) {
    sendJson(500, ['ok' => false, 'error' => 'Database service unavailable.']);
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
        $wards = runQuery($conn, "SELECT ward_name FROM ward ORDER BY ward_name");
        $care = runQuery($conn, "SELECT care_unit_no, ward_name FROM care_unit ORDER BY ward_name, care_unit_no");
        sendJson(200, ['ok' => true, 'data' => ['wards' => fetchAllAssoc($wards), 'care_units' => fetchAllAssoc($care)]]);
    }

    $stmt = runQuery(
        $conn,
        "SELECT n.staff_no AS no, s.staff_name AS name, n.nurse_type AS type, n.ward_name AS ward, n.care_unit_no AS unit
         FROM nurse n
         JOIN staff s ON s.staff_no = n.staff_no
         ORDER BY s.staff_name"
    );
    sendJson(200, ['ok' => true, 'data' => fetchAllAssoc($stmt)]);
}

function handleCreate($conn): void
{
    $b = getJsonInput();
    foreach (['name', 'type', 'ward'] as $f) if (empty($b[$f])) sendJson(400, ['ok' => false, 'error' => "Missing field: {$f}"]);

    $unit = isset($b['unit']) && $b['unit'] !== '' ? (int) $b['unit'] : null;
    if ($unit === null) {
        $unitStmt = runQuery($conn, "SELECT care_unit_no FROM care_unit WHERE ward_name = ? ORDER BY care_unit_no LIMIT 1", [$b['ward']]);
        $unitRow = fetchOneAssoc($unitStmt);
        $unit = $unitRow ? (int) $unitRow['care_unit_no'] : null;
    }

    $next = runQuery($conn, "SELECT COALESCE(MAX(staff_no),0)+1 AS next_no FROM staff");
    $row = fetchOneAssoc($next);
    $no = (int) $row['next_no'];

    if (!$conn->beginTransaction()) sendJson(500, ['ok' => false, 'error' => 'Unable to start transaction.']);
    try {
        runQuery($conn, "INSERT INTO staff(staff_no, staff_name) VALUES (?,?)", [$no, $b['name']]);
        runQuery(
            $conn,
            "INSERT INTO nurse(staff_no, nurse_type, ward_name, care_unit_no) VALUES (?,?,?,?)",
            [$no, $b['type'], $b['ward'], $unit]
        );
        $conn->commit();
        sendJson(201, ['ok' => true, 'data' => ['staff_no' => $no]]);
    } catch (Throwable $e) {
        $conn->rollBack();
        sendJson(500, ['ok' => false, 'error' => 'Create nurse failed.']);
    }
}

function handleUpdate($conn): void
{
    $b = getJsonInput();
    foreach (['no', 'name', 'type', 'ward'] as $f) if (empty($b[$f]) && $b[$f] !== 0) sendJson(400, ['ok' => false, 'error' => "Missing field: {$f}"]);
    $unit = isset($b['unit']) && $b['unit'] !== '' ? (int) $b['unit'] : null;
    runQuery($conn, "UPDATE staff SET staff_name=? WHERE staff_no=?", [$b['name'], (int) $b['no']]);
    runQuery(
        $conn,
        "UPDATE nurse SET nurse_type=?, ward_name=?, care_unit_no=? WHERE staff_no=?",
        [$b['type'], $b['ward'], $unit, (int) $b['no']]
    );
    sendJson(200, ['ok' => true]);
}

function handleDelete($conn): void
{
    $b = getJsonInput();
    $no = isset($b['no']) ? (int) $b['no'] : 0;
    if ($no <= 0) sendJson(400, ['ok' => false, 'error' => 'Missing nurse number.']);
    if (!$conn->beginTransaction()) sendJson(500, ['ok' => false, 'error' => 'Unable to start transaction.']);
    try {
        runQuery($conn, "DELETE FROM nurse WHERE staff_no=?", [$no]);
        runQuery($conn, "DELETE FROM staff WHERE staff_no=?", [$no]);
        $conn->commit();
        sendJson(200, ['ok' => true]);
    } catch (Throwable $e) {
        $conn->rollBack();
        sendJson(409, ['ok' => false, 'error' => 'Cannot delete nurse due to linked records.']);
    }
}
