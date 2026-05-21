<?php
declare(strict_types=1);

// Reports API: executes assignment-required query sets q=1..12.
require_once __DIR__ . '/../config/db.php';
require_once __DIR__ . '/helpers.php';

try {
    $conn = getSqlServerConnection();
} catch (Throwable $e) {
    sendJson(500, ['ok' => false, 'error' => $e->getMessage()]);
}

$q = isset($_GET['q']) ? (int) $_GET['q'] : 0;
if ($q < 1 || $q > 12) {
    sendJson(400, ['ok' => false, 'error' => 'Query number q (1..12) is required.']);
}

$doctorNo = isset($_GET['doctor_no']) ? (int) $_GET['doctor_no'] : null;
$patientNo = isset($_GET['patient_no']) ? (int) $_GET['patient_no'] : null;
$complaintCode = $_GET['complaint_code'] ?? null;
$fromDate = $_GET['from_date'] ?? null;
$toDate = $_GET['to_date'] ?? null;

$sql = '';
$params = [];

switch ($q) {
    // Q1-Q12 correspond directly to the lab brief report list.
    case 1:
        $sql = "SELECT
                    c.staff_no AS consultant_no,
                    cs.staff_name AS consultant_name,
                    c.specialty,
                    d.staff_no AS doctor_no,
                    ds.staff_name AS doctor_name,
                    d.position,
                    d.date_joined_team
                FROM consultant c
                JOIN staff cs ON cs.staff_no = c.staff_no
                LEFT JOIN doctor d ON d.consultant_no = c.staff_no
                LEFT JOIN staff ds ON ds.staff_no = d.staff_no
                ORDER BY cs.staff_name, ds.staff_name";
        break;

    case 2:
        $sql = "SELECT
                    w.ward_name,
                    sp.specialty_name,
                    MAX(CASE WHEN n.nurse_type = 'Day Sister' THEN st.staff_name END) AS day_sister,
                    MAX(CASE WHEN n.nurse_type = 'Night Sister' THEN st.staff_name END) AS night_sister,
                    cu.care_unit_no,
                    ic.staff_name AS in_charge_staff_nurse
                FROM ward w
                JOIN specialty sp ON sp.specialty_id = w.specialty_id
                LEFT JOIN nurse n ON n.ward_name = w.ward_name
                LEFT JOIN staff st ON st.staff_no = n.staff_no
                LEFT JOIN care_unit cu ON cu.ward_name = w.ward_name
                LEFT JOIN staff ic ON ic.staff_no = cu.in_charge_staff_no
                GROUP BY w.ward_name, sp.specialty_name, cu.care_unit_no, ic.staff_name
                ORDER BY w.ward_name";
        break;

    case 3:
        $sql = "SELECT
                    p.patient_no,
                    p.patient_name,
                    pct.complaint_code,
                    c.complaint_desc,
                    pct.treatment_code,
                    t.treatment_desc,
                    pct.date_started,
                    pct.date_ended
                FROM patient p
                JOIN patient_complaint_treatment pct ON pct.patient_no = p.patient_no
                JOIN complaint c ON c.complaint_code = pct.complaint_code
                JOIN treatment t ON t.treatment_code = pct.treatment_code
                ORDER BY p.patient_no, pct.date_started";
        break;

    case 4:
        $sql = "SELECT
                    d.staff_no AS junior_houseman_no,
                    ds.staff_name AS junior_houseman_name,
                    p.patient_no,
                    p.patient_name,
                    p.care_unit_no,
                    ns.staff_name AS staff_nurse_name
                FROM doctor d
                JOIN staff ds ON ds.staff_no = d.staff_no
                JOIN patient p ON p.in_charge_doctor_no = d.staff_no
                LEFT JOIN care_unit cu ON cu.care_unit_no = p.care_unit_no
                LEFT JOIN staff ns ON ns.staff_no = cu.in_charge_staff_no
                WHERE d.position = 'Junior Houseman'
                ORDER BY ds.staff_name, p.patient_no";
        break;

    case 5:
        $sql = "SELECT
                    c.specialty,
                    c.staff_no AS consultant_no,
                    s.staff_name AS consultant_name
                FROM consultant c
                JOIN staff s ON s.staff_no = c.staff_no
                WHERE c.specialty IN (
                    SELECT specialty
                    FROM consultant
                    GROUP BY specialty
                    HAVING COUNT(*) = 1
                )
                ORDER BY c.specialty";
        break;

    case 6:
        $sql = "SELECT
                    c.complaint_code,
                    c.complaint_desc,
                    t.treatment_code,
                    t.treatment_desc,
                    d.staff_no AS doctor_no,
                    ds.staff_name AS doctor_name,
                    de.from_date,
                    de.to_date,
                    de.position AS experience_position,
                    de.establishment
                FROM patient_complaint_treatment pct
                JOIN complaint c ON c.complaint_code = pct.complaint_code
                JOIN treatment t ON t.treatment_code = pct.treatment_code
                JOIN doctor d ON d.staff_no = pct.doctor_no
                JOIN staff ds ON ds.staff_no = d.staff_no
                LEFT JOIN doctor_experience de ON de.staff_no = d.staff_no
                ORDER BY c.complaint_code, t.treatment_code, ds.staff_name, de.from_date";
        break;

    case 7:
        $sql = "SELECT
                    p.patient_no,
                    p.patient_name,
                    pct.complaint_code,
                    c.complaint_desc,
                    pct.treatment_code,
                    t.treatment_desc,
                    pct.date_started,
                    pct.date_ended
                FROM patient p
                JOIN patient_complaint_treatment pct ON pct.patient_no = p.patient_no
                JOIN complaint c ON c.complaint_code = pct.complaint_code
                JOIN treatment t ON t.treatment_code = pct.treatment_code
                WHERE p.patient_no IN (
                    SELECT patient_no
                    FROM patient_complaint_treatment
                    GROUP BY patient_no
                    HAVING COUNT(DISTINCT complaint_code) > 1
                )
                ORDER BY p.patient_no, pct.complaint_code, pct.date_started";
        break;

    case 8:
        $sql = "SELECT
                    pct.complaint_code,
                    c.complaint_desc,
                    pct.treatment_code,
                    t.treatment_desc,
                    p.patient_no,
                    p.patient_name
                FROM patient_complaint_treatment pct
                JOIN complaint c ON c.complaint_code = pct.complaint_code
                JOIN treatment t ON t.treatment_code = pct.treatment_code
                JOIN patient p ON p.patient_no = pct.patient_no
                ORDER BY pct.complaint_code, pct.treatment_code, p.patient_name";
        break;

    case 9:
        if (!$doctorNo) {
            sendJson(400, ['ok' => false, 'error' => 'doctor_no is required for q=9']);
        }
        $sql = "SELECT
                    pr.review_id,
                    pr.review_date,
                    pr.performance_grade,
                    pr.doctor_no,
                    ds.staff_name AS doctor_name,
                    pr.reviewed_by_consultant,
                    cs.staff_name AS consultant_name
                FROM performance_review pr
                JOIN staff ds ON ds.staff_no = pr.doctor_no
                JOIN staff cs ON cs.staff_no = pr.reviewed_by_consultant
                WHERE pr.doctor_no = ?
                ORDER BY pr.review_date";
        $params = [$doctorNo];
        break;

    case 10:
        if (!$patientNo) {
            sendJson(400, ['ok' => false, 'error' => 'patient_no is required for q=10']);
        }
        $sql = "SELECT
                    p.patient_no,
                    p.patient_name,
                    p.date_of_birth,
                    p.date_admitted,
                    p.date_discharged,
                    p.ward_name,
                    p.care_unit_no,
                    p.bed_no,
                    p.in_charge_doctor_no,
                    ds.staff_name AS in_charge_doctor_name,
                    p.consultant_no,
                    cs.staff_name AS consultant_name,
                    pct.complaint_code,
                    c.complaint_desc,
                    pct.treatment_code,
                    t.treatment_desc,
                    pct.date_started,
                    pct.date_ended,
                    pct.doctor_no AS treating_doctor_no,
                    ts.staff_name AS treating_doctor_name
                FROM patient p
                LEFT JOIN patient_complaint_treatment pct ON pct.patient_no = p.patient_no
                LEFT JOIN complaint c ON c.complaint_code = pct.complaint_code
                LEFT JOIN treatment t ON t.treatment_code = pct.treatment_code
                LEFT JOIN staff ds ON ds.staff_no = p.in_charge_doctor_no
                LEFT JOIN staff cs ON cs.staff_no = p.consultant_no
                LEFT JOIN staff ts ON ts.staff_no = pct.doctor_no
                WHERE p.patient_no = ?
                ORDER BY pct.date_started";
        $params = [$patientNo];
        break;

    case 11:
        if (!$complaintCode || !$fromDate || !$toDate) {
            sendJson(400, ['ok' => false, 'error' => 'complaint_code, from_date and to_date are required for q=11']);
        }
        $sql = "SELECT
                    pct.complaint_code,
                    c.complaint_desc,
                    pct.treatment_code,
                    t.treatment_desc,
                    pct.patient_no,
                    p.patient_name,
                    pct.date_started,
                    pct.date_ended,
                    pct.doctor_no,
                    ds.staff_name AS doctor_name
                FROM patient_complaint_treatment pct
                JOIN complaint c ON c.complaint_code = pct.complaint_code
                JOIN treatment t ON t.treatment_code = pct.treatment_code
                JOIN patient p ON p.patient_no = pct.patient_no
                JOIN staff ds ON ds.staff_no = pct.doctor_no
                WHERE pct.complaint_code = ?
                  AND pct.date_started BETWEEN ? AND ?
                ORDER BY t.treatment_desc, pct.date_started";
        $params = [$complaintCode, $fromDate, $toDate];
        break;

    case 12:
        $sql = "SELECT
                    position AS staff_position,
                    COUNT(*) AS staff_count
                FROM (
                    SELECT d.position
                    FROM doctor d
                    UNION ALL
                    SELECT n.nurse_type
                    FROM nurse n
                ) x
                GROUP BY position
                ORDER BY position";
        break;
}

$stmt = runQuery($conn, $sql, $params);
$rows = fetchAllAssoc($stmt);
sendJson(200, ['ok' => true, 'data' => $rows]);
