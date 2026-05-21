<?php
declare(strict_types=1);

// Complaints/Treatments API: record list, lookups, create, and delete.
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
if ($method === 'DELETE') handleDelete($conn);
sendJson(405, ['ok' => false, 'error' => 'Method not allowed.']);

function handleGet($conn): void
{
    if (isset($_GET['meta'])) {
        $patients = runQuery($conn, "SELECT patient_no, patient_name FROM patient ORDER BY patient_name");
        $complaints = runQuery($conn, "SELECT complaint_code, complaint_desc FROM complaint ORDER BY complaint_desc");
        $treatments = runQuery($conn, "SELECT treatment_code, treatment_desc FROM treatment ORDER BY treatment_desc");
        $doctors = runQuery(
            $conn,
            "SELECT d.staff_no, s.staff_name
             FROM doctor d
             JOIN staff s ON s.staff_no = d.staff_no
             ORDER BY s.staff_name"
        );
        sendJson(200, [
            'ok' => true,
            'data' => [
                'patients' => fetchAllAssoc($patients),
                'complaints' => fetchAllAssoc($complaints),
                'treatments' => fetchAllAssoc($treatments),
                'doctors' => fetchAllAssoc($doctors)
            ]
        ]);
    }

    if (isset($_GET['lookup'])) {
        $comp = runQuery(
            $conn,
            "SELECT c.complaint_code, c.complaint_desc, COUNT(pct.patient_no) AS occurrences
             FROM complaint c
             LEFT JOIN patient_complaint_treatment pct ON pct.complaint_code = c.complaint_code
             GROUP BY c.complaint_code, c.complaint_desc
             ORDER BY c.complaint_code"
        );
        $trt = runQuery(
            $conn,
            "SELECT t.treatment_code, t.treatment_desc, COUNT(pct.patient_no) AS times_used
             FROM treatment t
             LEFT JOIN patient_complaint_treatment pct ON pct.treatment_code = t.treatment_code
             GROUP BY t.treatment_code, t.treatment_desc
             ORDER BY t.treatment_code"
        );
        sendJson(200, ['ok' => true, 'data' => ['complaints' => fetchAllAssoc($comp), 'treatments' => fetchAllAssoc($trt)]]);
    }

    $stmt = runQuery(
        $conn,
        "SELECT
            pct.patient_no AS patient,
            p.patient_name,
            pct.complaint_code AS complaint,
            c.complaint_desc,
            pct.treatment_code AS treatment,
            t.treatment_desc,
            pct.date_started AS started,
            pct.date_ended AS ended,
            pct.doctor_no AS doctor,
            s.staff_name AS doctor_name
         FROM patient_complaint_treatment pct
         JOIN patient p ON p.patient_no = pct.patient_no
         JOIN complaint c ON c.complaint_code = pct.complaint_code
         JOIN treatment t ON t.treatment_code = pct.treatment_code
         JOIN staff s ON s.staff_no = pct.doctor_no
         ORDER BY pct.date_started DESC"
    );
    sendJson(200, ['ok' => true, 'data' => fetchAllAssoc($stmt)]);
}

function handleCreate($conn): void
{
    $b = getJsonInput();
    foreach (['patient', 'complaint', 'treatment', 'started', 'doctor'] as $f) {
        if (empty($b[$f]) && $b[$f] !== 0) sendJson(400, ['ok' => false, 'error' => "Missing field: {$f}"]);
    }
    runQuery(
        $conn,
        "INSERT INTO patient_complaint_treatment(patient_no, complaint_code, treatment_code, date_started, doctor_no, date_ended)
         VALUES (?,?,?,?,?,?)",
        [(int) $b['patient'], $b['complaint'], $b['treatment'], $b['started'], (int) $b['doctor'], empty($b['ended']) ? null : $b['ended']]
    );
    sendJson(201, ['ok' => true]);
}

function handleDelete($conn): void
{
    $b = getJsonInput();
    foreach (['patient', 'complaint', 'treatment', 'started'] as $f) {
        if (empty($b[$f]) && $b[$f] !== 0) sendJson(400, ['ok' => false, 'error' => "Missing field: {$f}"]);
    }
    runQuery(
        $conn,
        "DELETE FROM patient_complaint_treatment
         WHERE patient_no = ? AND complaint_code = ? AND treatment_code = ? AND date_started = ?",
        [(int) $b['patient'], $b['complaint'], $b['treatment'], $b['started']]
    );
    sendJson(200, ['ok' => true]);
}
