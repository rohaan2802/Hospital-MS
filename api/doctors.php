<?php
declare(strict_types=1);

// Doctors API: doctor/consultant listings and CRUD operations.
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
    // Meta: consultant options for doctor assignment form.
    if (isset($_GET['meta'])) {
        $consultants = runQuery(
            $conn,
            "SELECT c.staff_no, s.staff_name, c.specialty
             FROM consultant c
             JOIN staff s ON s.staff_no = c.staff_no
             ORDER BY s.staff_name"
        );
        sendJson(200, ['ok' => true, 'data' => ['consultants' => fetchAllAssoc($consultants)]]);
    }

    $stmt = runQuery(
        $conn,
        "SELECT
            d.staff_no AS no,
            s.staff_name AS name,
            d.position,
            d.date_joined_team AS joined,
            d.consultant_no,
            cs.staff_name AS consultant_name,
            CASE WHEN c.staff_no IS NULL THEN 0 ELSE 1 END AS is_consultant,
            COUNT(p.patient_no) AS patient_count
         FROM doctor d
         JOIN staff s ON s.staff_no = d.staff_no
         LEFT JOIN consultant c ON c.staff_no = d.staff_no
         LEFT JOIN staff cs ON cs.staff_no = d.consultant_no
         LEFT JOIN patient p ON p.in_charge_doctor_no = d.staff_no
         GROUP BY d.staff_no, s.staff_name, d.position, d.date_joined_team, d.consultant_no, cs.staff_name, c.staff_no
         ORDER BY s.staff_name"
    );
    sendJson(200, ['ok' => true, 'data' => fetchAllAssoc($stmt)]);
}

function handleCreate($conn): void
{
    // Creates both staff and doctor records in one transaction.
    $b = getJsonInput();
    foreach (['name', 'position', 'joined'] as $f) {
        if (empty($b[$f])) sendJson(400, ['ok' => false, 'error' => "Missing field: {$f}"]);
    }
    $consultantNo = isset($b['consultant_no']) && $b['consultant_no'] !== '' ? (int) $b['consultant_no'] : null;

    $next = runQuery($conn, "SELECT COALESCE(MAX(staff_no),0)+1 AS next_no FROM staff");
    $row = fetchOneAssoc($next);
    $no = (int) $row['next_no'];

    if (!$conn->beginTransaction()) sendJson(500, ['ok' => false, 'error' => 'Unable to start transaction.']);
    $ok = true;
    $ok = $ok && runQuery($conn, "INSERT INTO staff(staff_no, staff_name) VALUES (?,?)", [$no, $b['name']]) !== false;
    $ok = $ok && runQuery(
        $conn,
        "INSERT INTO doctor(staff_no, position, date_joined_team, consultant_no) VALUES (?,?,?,?)",
        [$no, $b['position'], $b['joined'], $consultantNo]
    ) !== false;

    if ($ok && !empty($b['is_consultant']) && !empty($b['specialty'])) {
        $ok = $ok && runQuery(
            $conn,
            "INSERT INTO consultant(staff_no, specialty) VALUES (?,?)",
            [$no, $b['specialty']]
        ) !== false;
    }

    if ($ok) {
        $conn->commit();
        sendJson(201, ['ok' => true, 'data' => ['staff_no' => $no]]);
    }
    $conn->rollBack();
    sendJson(500, ['ok' => false, 'error' => 'Create doctor failed.']);
}

function handleUpdate($conn): void
{
    $b = getJsonInput();
    foreach (['no', 'name', 'position', 'joined'] as $f) {
        if (empty($b[$f]) && $b[$f] !== 0) sendJson(400, ['ok' => false, 'error' => "Missing field: {$f}"]);
    }
    $consultantNo = isset($b['consultant_no']) && $b['consultant_no'] !== '' ? (int) $b['consultant_no'] : null;
    runQuery($conn, "UPDATE staff SET staff_name=? WHERE staff_no=?", [$b['name'], (int) $b['no']]);
    runQuery(
        $conn,
        "UPDATE doctor SET position=?, date_joined_team=?, consultant_no=? WHERE staff_no=?",
        [$b['position'], $b['joined'], $consultantNo, (int) $b['no']]
    );
    sendJson(200, ['ok' => true]);
}

function handleDelete($conn): void
{
    // Deletes consultant/doctor/staff rows in dependency-safe order.
    $b = getJsonInput();
    $no = isset($b['no']) ? (int) $b['no'] : 0;
    if ($no <= 0) sendJson(400, ['ok' => false, 'error' => 'Missing doctor number.']);

    if (!$conn->beginTransaction()) sendJson(500, ['ok' => false, 'error' => 'Unable to start transaction.']);
    try {
        runQuery($conn, "DELETE FROM consultant WHERE staff_no = ?", [$no]);
        runQuery($conn, "DELETE FROM doctor WHERE staff_no = ?", [$no]);
        runQuery($conn, "DELETE FROM staff WHERE staff_no = ?", [$no]);
        $conn->commit();
        sendJson(200, ['ok' => true]);
    } catch (Throwable $e) {
        $conn->rollBack();
        sendJson(409, ['ok' => false, 'error' => 'Cannot delete this doctor due to linked records.']);
    }
}
