<?php
declare(strict_types=1);

// Wards API: ward cards with specialty, care unit, beds, and occupancy.
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/helpers.php';
requireAuth();

try {
    $conn = getConnection();
} catch (Throwable $e) {
    sendJson(500, ['ok' => false, 'error' => 'Database service unavailable.']);
}

$stmt = runQuery(
    $conn,
    "SELECT
        w.ward_name,
        s.specialty_name,
        cu.care_unit_no,
        st.staff_name AS in_charge_name
     FROM ward w
     JOIN specialty s ON s.specialty_id = w.specialty_id
     LEFT JOIN care_unit cu ON cu.ward_name = w.ward_name
     LEFT JOIN staff st ON st.staff_no = cu.in_charge_staff_no
     ORDER BY w.ward_name"
);
$wards = fetchAllAssoc($stmt);

$bedsStmt = runQuery($conn, "SELECT bed_no, ward_name FROM bed ORDER BY ward_name, bed_no");
$beds = fetchAllAssoc($bedsStmt);

$occupiedStmt = runQuery(
    $conn,
    "SELECT p.bed_no, p.patient_name
     FROM patient p
     WHERE p.date_discharged IS NULL"
);
$occupied = fetchAllAssoc($occupiedStmt);

sendJson(200, ['ok' => true, 'data' => ['wards' => $wards, 'beds' => $beds, 'occupied' => $occupied]]);
