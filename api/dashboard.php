<?php
declare(strict_types=1);

// Dashboard API: aggregate stats and summary widgets.
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/helpers.php';

try {
    $conn = getSqlServerConnection();
} catch (Throwable $e) {
    sendJson(500, ['ok' => false, 'error' => $e->getMessage()]);
}

$statsStmt = runQuery(
    $conn,
    "SELECT
        (SELECT COUNT(*) FROM patient) AS total_patients,
        (SELECT COUNT(*) FROM doctor) AS total_doctors,
        (SELECT COUNT(*) FROM nurse) AS total_nurses,
        (SELECT COUNT(*) FROM bed) AS total_beds,
        (SELECT COUNT(*) FROM patient WHERE date_discharged IS NULL) AS occupied_beds,
        (SELECT COUNT(*) FROM complaint) AS complaints_count,
        (SELECT COUNT(*) FROM treatment) AS treatments_count,
        (SELECT COUNT(*) FROM care_unit) AS care_units_count,
        (SELECT COUNT(*) FROM performance_review) AS reviews_count"
);
$stats = sqlsrv_fetch_array($statsStmt, SQLSRV_FETCH_ASSOC);

$wardOccStmt = runQuery(
    $conn,
    "SELECT
        w.ward_name AS ward,
        COUNT(b.bed_no) AS capacity,
        SUM(CASE WHEN p.patient_no IS NULL OR p.date_discharged IS NOT NULL THEN 0 ELSE 1 END) AS occupied
     FROM ward w
     LEFT JOIN bed b ON b.ward_name = w.ward_name
     LEFT JOIN patient p ON p.bed_no = b.bed_no
     GROUP BY w.ward_name
     ORDER BY w.ward_name"
);

$specialtiesStmt = runQuery(
    $conn,
    "SELECT s.specialty_name, MIN(w.ward_name) AS ward_name
     FROM specialty s
     LEFT JOIN ward w ON w.specialty_id = s.specialty_id
     GROUP BY s.specialty_name
     ORDER BY s.specialty_name"
);

$recentStmt = runQuery(
    $conn,
    "SELECT TOP 6 patient_name, ward_name, date_admitted, date_discharged
     FROM patient
     ORDER BY date_admitted DESC, patient_no DESC"
);

sendJson(200, [
    'ok' => true,
    'data' => [
        'stats' => [
            'total_patients' => (int) $stats['total_patients'],
            'total_doctors' => (int) $stats['total_doctors'],
            'total_nurses' => (int) $stats['total_nurses'],
            'total_beds' => (int) $stats['total_beds'],
            'occupied_beds' => (int) $stats['occupied_beds'],
            'complaints_count' => (int) $stats['complaints_count'],
            'treatments_count' => (int) $stats['treatments_count'],
            'care_units_count' => (int) $stats['care_units_count'],
            'reviews_count' => (int) $stats['reviews_count']
        ],
        'ward_occupancy' => fetchAllAssoc($wardOccStmt),
        'specialties' => fetchAllAssoc($specialtiesStmt),
        'recent_admissions' => fetchAllAssoc($recentStmt)
    ]
]);
