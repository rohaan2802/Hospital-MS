<?php
declare(strict_types=1);

// Patients API: list/meta, create, update, and delete patient records.
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/helpers.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    sendJson(200, ['ok' => true]);
}

try {
    $conn = getSqlServerConnection();
} catch (Throwable $e) {
    sendJson(500, ['ok' => false, 'error' => $e->getMessage()]);
}

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    handleGet($conn);
} elseif ($method === 'POST') {
    handleCreate($conn);
} elseif ($method === 'PUT') {
    handleUpdate($conn);
} elseif ($method === 'DELETE') {
    handleDelete($conn);
} else {
    sendJson(405, ['ok' => false, 'error' => 'Method not allowed.']);
}

function handleGet($conn): void
{
    // Metadata endpoint used by patient form dropdowns.
    if (isset($_GET['meta'])) {
        $wardsStmt = runQuery(
            $conn,
            "SELECT w.ward_name, s.specialty_name
             FROM ward w
             JOIN specialty s ON s.specialty_id = w.specialty_id
             ORDER BY w.ward_name"
        );
        $doctorsStmt = runQuery(
            $conn,
            "SELECT d.staff_no, st.staff_name, d.position
             FROM doctor d
             JOIN staff st ON st.staff_no = d.staff_no
             ORDER BY st.staff_name"
        );
        $consultantsStmt = runQuery(
            $conn,
            "SELECT c.staff_no, st.staff_name, c.specialty
             FROM consultant c
             JOIN staff st ON st.staff_no = c.staff_no
             ORDER BY st.staff_name"
        );
        $bedsStmt = runQuery(
            $conn,
            "SELECT bed_no, ward_name
             FROM bed
             ORDER BY ward_name, bed_no"
        );
        $careUnitsStmt = runQuery(
            $conn,
            "SELECT care_unit_no, ward_name
             FROM care_unit
             ORDER BY ward_name, care_unit_no"
        );
        $occupiedStmt = runQuery(
            $conn,
            "SELECT patient_no, bed_no
             FROM patient
             WHERE date_discharged IS NULL"
        );

        sendJson(200, [
            'ok' => true,
            'data' => [
                'wards' => fetchAllAssoc($wardsStmt),
                'doctors' => fetchAllAssoc($doctorsStmt),
                'consultants' => fetchAllAssoc($consultantsStmt),
                'beds' => fetchAllAssoc($bedsStmt),
                'care_units' => fetchAllAssoc($careUnitsStmt),
                'occupied_beds' => fetchAllAssoc($occupiedStmt)
            ]
        ]);
    }

    // Main list endpoint for patient table rendering.
    $stmt = runQuery(
        $conn,
        "SELECT
            p.patient_no,
            p.patient_name,
            p.date_of_birth,
            p.date_admitted,
            p.date_discharged,
            p.ward_name,
            p.care_unit_no,
            p.bed_no,
            p.in_charge_doctor_no,
            ds.staff_name AS doctor_name,
            p.consultant_no,
            cs.staff_name AS consultant_name
         FROM patient p
         JOIN staff ds ON ds.staff_no = p.in_charge_doctor_no
         JOIN staff cs ON cs.staff_no = p.consultant_no
         ORDER BY p.patient_no"
    );

    $rows = fetchAllAssoc($stmt);
    $data = array_map(static function (array $r): array {
        return [
            'no' => (int) $r['patient_no'],
            'name' => $r['patient_name'],
            'dob' => $r['date_of_birth'],
            'admitted' => $r['date_admitted'],
            'discharged' => $r['date_discharged'],
            'ward' => $r['ward_name'],
            'unit' => (int) $r['care_unit_no'],
            'bed' => (int) $r['bed_no'],
            'doctor' => (int) $r['in_charge_doctor_no'],
            'doctor_name' => $r['doctor_name'],
            'consultant' => (int) $r['consultant_no'],
            'consultant_name' => $r['consultant_name']
        ];
    }, $rows);

    sendJson(200, ['ok' => true, 'data' => $data]);
}

function handleCreate($conn): void
{
    // Creates a new patient using the next available patient number.
    $body = getJsonInput();
    validatePatientPayload($body, false);

    $discharged = empty($body['discharged']) ? null : $body['discharged'];
    $bedNo = (int) $body['bed'];

    if (!sqlsrv_begin_transaction($conn)) {
        sendJson(500, ['ok' => false, 'error' => 'Could not start transaction.']);
    }

    try {
        ensureBedAvailable($conn, $bedNo, null, $discharged);

        $nextStmt = runQuery($conn, "SELECT ISNULL(MAX(patient_no), 0) + 1 AS next_no FROM patient");
        $nextRow = sqlsrv_fetch_array($nextStmt, SQLSRV_FETCH_ASSOC);
        $nextNo = (int) ($nextRow['next_no'] ?? 1);

        runQuery(
            $conn,
            "INSERT INTO patient (
                patient_no, patient_name, date_of_birth, date_admitted, date_discharged,
                ward_name, care_unit_no, bed_no, in_charge_doctor_no, consultant_no
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            [
                $nextNo,
                $body['name'],
                $body['dob'],
                $body['admitted'],
                $discharged,
                $body['ward'],
                (int) $body['unit'],
                $bedNo,
                (int) $body['doctor'],
                (int) $body['consultant']
            ]
        );

        if (!sqlsrv_commit($conn)) {
            sqlsrv_rollback($conn);
            sendJson(500, ['ok' => false, 'error' => 'Could not commit patient admission.']);
        }
    } catch (Throwable $e) {
        sqlsrv_rollback($conn);
        sendJson(500, ['ok' => false, 'error' => 'Admit failed. ' . $e->getMessage()]);
    }

    sendJson(201, ['ok' => true, 'data' => ['patient_no' => $nextNo]]);
}

function handleUpdate($conn): void
{
    // Updates all editable patient fields.
    $body = getJsonInput();
    validatePatientPayload($body, true);

    $discharged = empty($body['discharged']) ? null : $body['discharged'];
    $bedNo = (int) $body['bed'];
    $patientNo = (int) $body['no'];

    if (!sqlsrv_begin_transaction($conn)) {
        sendJson(500, ['ok' => false, 'error' => 'Could not start transaction.']);
    }

    try {
        ensureBedAvailable($conn, $bedNo, $patientNo, $discharged);

        runQuery(
            $conn,
            "UPDATE patient
             SET patient_name = ?, date_of_birth = ?, date_admitted = ?, date_discharged = ?,
                 ward_name = ?, care_unit_no = ?, bed_no = ?, in_charge_doctor_no = ?, consultant_no = ?
             WHERE patient_no = ?",
            [
                $body['name'],
                $body['dob'],
                $body['admitted'],
                $discharged,
                $body['ward'],
                (int) $body['unit'],
                $bedNo,
                (int) $body['doctor'],
                (int) $body['consultant'],
                $patientNo
            ]
        );

        if (!sqlsrv_commit($conn)) {
            sqlsrv_rollback($conn);
            sendJson(500, ['ok' => false, 'error' => 'Could not commit patient update.']);
        }
    } catch (Throwable $e) {
        sqlsrv_rollback($conn);
        sendJson(500, ['ok' => false, 'error' => 'Update failed. ' . $e->getMessage()]);
    }

    sendJson(200, ['ok' => true]);
}

function ensureBedAvailable($conn, int $bedNo, ?int $excludePatientNo, ?string $dischargedDate): void
{
    // A discharged patient does not occupy the bed, so no conflict possible.
    if ($dischargedDate !== null && $dischargedDate !== '') {
        return;
    }

    $sql = "SELECT TOP 1 patient_no, patient_name
            FROM patient
            WHERE bed_no = ? AND date_discharged IS NULL";
    $params = [$bedNo];

    if ($excludePatientNo !== null) {
        $sql .= " AND patient_no <> ?";
        $params[] = $excludePatientNo;
    }

    $stmt = runQuery($conn, $sql, $params);
    $row = sqlsrv_fetch_array($stmt, SQLSRV_FETCH_ASSOC);
    if ($row) {
        sqlsrv_rollback($conn);
        sendJson(409, [
            'ok' => false,
            'error' => "Bed {$bedNo} is currently occupied by {$row['patient_name']} (Patient #{$row['patient_no']}). Discharge that patient first or choose another bed."
        ]);
    }
}

function handleDelete($conn): void
{
    // Deletes child treatment rows first to satisfy foreign keys.
    $body = getJsonInput();
    $patientNo = isset($body['no']) ? (int) $body['no'] : 0;
    if ($patientNo <= 0) {
        sendJson(400, ['ok' => false, 'error' => 'Missing patient number for delete.']);
    }

    if (!sqlsrv_begin_transaction($conn)) {
        sendJson(500, ['ok' => false, 'error' => 'Delete failed. Could not start transaction.']);
    }
    try {
        runQuery($conn, "DELETE FROM patient_complaint_treatment WHERE patient_no = ?", [$patientNo]);
        runQuery($conn, "DELETE FROM patient WHERE patient_no = ?", [$patientNo]);
        if (!sqlsrv_commit($conn)) {
            sqlsrv_rollback($conn);
            sendJson(500, ['ok' => false, 'error' => 'Delete failed. Could not commit transaction.']);
        }
    } catch (Throwable $e) {
        sqlsrv_rollback($conn);
        sendJson(500, ['ok' => false, 'error' => 'Delete failed. ' . $e->getMessage()]);
    }

    sendJson(200, ['ok' => true]);
}

function validatePatientPayload(array $body, bool $requireNo): void
{
    $required = ['name', 'dob', 'admitted', 'ward', 'bed', 'doctor', 'consultant', 'unit'];
    if ($requireNo) {
        $required[] = 'no';
    }

    foreach ($required as $field) {
        if (!array_key_exists($field, $body) || $body[$field] === '' || $body[$field] === null) {
            sendJson(400, ['ok' => false, 'error' => "Missing required field: {$field}"]);
        }
    }
}
