

USE master;
GO
IF DB_ID('HospitalDB') IS NOT NULL
    DROP DATABASE HospitalDB;
GO
CREATE DATABASE HospitalDB;
GO
USE HospitalDB;
GO

-- DROP TABLES

IF OBJECT_ID('performance_review',          'U') IS NOT NULL DROP TABLE performance_review;
IF OBJECT_ID('doctor_experience',           'U') IS NOT NULL DROP TABLE doctor_experience;
IF OBJECT_ID('patient_complaint_treatment', 'U') IS NOT NULL DROP TABLE patient_complaint_treatment;
IF OBJECT_ID('patient',                     'U') IS NOT NULL DROP TABLE patient;
IF OBJECT_ID('bed',                         'U') IS NOT NULL DROP TABLE bed;

-- Break nurse care_unit circle before dropping
IF OBJECT_ID('nurse', 'U') IS NOT NULL
BEGIN
    ALTER TABLE nurse DROP CONSTRAINT IF EXISTS fk_nurse_careunit;
END

IF OBJECT_ID('care_unit', 'U') IS NOT NULL DROP TABLE care_unit;
IF OBJECT_ID('nurse',     'U') IS NOT NULL DROP TABLE nurse;

-- Break doctor consultant circle before dropping
IF OBJECT_ID('doctor', 'U') IS NOT NULL
BEGIN
    ALTER TABLE doctor DROP CONSTRAINT IF EXISTS fk_doctor_consultant;
END

IF OBJECT_ID('consultant', 'U') IS NOT NULL DROP TABLE consultant;
IF OBJECT_ID('doctor',     'U') IS NOT NULL DROP TABLE doctor;

IF OBJECT_ID('staff',     'U') IS NOT NULL DROP TABLE staff;
IF OBJECT_ID('ward',      'U') IS NOT NULL DROP TABLE ward;
IF OBJECT_ID('specialty', 'U') IS NOT NULL DROP TABLE specialty;
IF OBJECT_ID('complaint', 'U') IS NOT NULL DROP TABLE complaint;
IF OBJECT_ID('treatment', 'U') IS NOT NULL DROP TABLE treatment;
GO

-- SECTION 2 : CREATE TABLES

-- 1. SPECIALTY
CREATE TABLE specialty (
    specialty_id    INT          NOT NULL,
    specialty_name  VARCHAR(100) NOT NULL,
    CONSTRAINT pk_specialty PRIMARY KEY (specialty_id),
    CONSTRAINT uq_specialty UNIQUE      (specialty_name)
);

-- 2. WARD
CREATE TABLE ward (
    ward_name    VARCHAR(100) NOT NULL,
    specialty_id INT          NOT NULL,
    CONSTRAINT pk_ward           PRIMARY KEY (ward_name),
    CONSTRAINT fk_ward_specialty FOREIGN KEY (specialty_id)
        REFERENCES specialty(specialty_id)
);

-- 3. STAFF (supertype)
CREATE TABLE staff (
    staff_no   INT          NOT NULL,
    staff_name VARCHAR(100) NOT NULL,
    CONSTRAINT pk_staff PRIMARY KEY (staff_no)
);

-- 4. DOCTOR (subtype of STAFF)
CREATE TABLE doctor (
    staff_no         INT         NOT NULL,
    position         VARCHAR(30) NOT NULL,
    date_joined_team DATE        NOT NULL,
    consultant_no    INT         NULL,
    CONSTRAINT pk_doctor          PRIMARY KEY (staff_no),
    CONSTRAINT ck_doctor_position CHECK (position IN (
        'Student','Junior Houseman','Senior Houseman',
        'Asst Registrar','Registrar')),
    CONSTRAINT fk_doctor_staff    FOREIGN KEY (staff_no)
        REFERENCES staff(staff_no)
);

-- 5. CONSULTANT (subtype of DOCTOR — partial)
CREATE TABLE consultant (
    staff_no  INT          NOT NULL,
    specialty VARCHAR(100) NOT NULL,
    CONSTRAINT pk_consultant        PRIMARY KEY (staff_no),
    CONSTRAINT fk_consultant_doctor FOREIGN KEY (staff_no)
        REFERENCES doctor(staff_no)
);

-- Close the circle: doctor -> consultant
ALTER TABLE doctor
    ADD CONSTRAINT fk_doctor_consultant
        FOREIGN KEY (consultant_no) REFERENCES consultant(staff_no);

-- 6. NURSE (subtype of STAFF)
CREATE TABLE nurse (
    staff_no     INT          NOT NULL,
    nurse_type   VARCHAR(20)  NOT NULL,
    ward_name    VARCHAR(100) NOT NULL,
    care_unit_no INT          NULL,
    CONSTRAINT pk_nurse       PRIMARY KEY (staff_no),
    CONSTRAINT ck_nurse_type  CHECK (nurse_type IN (
        'Day Sister','Night Sister','Staff Nurse','Non-Registered')),
    CONSTRAINT fk_nurse_staff FOREIGN KEY (staff_no)
        REFERENCES staff(staff_no),
    CONSTRAINT fk_nurse_ward  FOREIGN KEY (ward_name)
        REFERENCES ward(ward_name)
);

-- 7. CARE_UNIT
CREATE TABLE care_unit (
    care_unit_no       INT          NOT NULL,
    ward_name          VARCHAR(100) NOT NULL,
    in_charge_staff_no INT          NOT NULL,
    CONSTRAINT pk_care_unit       PRIMARY KEY (care_unit_no),
    CONSTRAINT fk_careunit_ward   FOREIGN KEY (ward_name)
        REFERENCES ward(ward_name),
    CONSTRAINT fk_careunit_nurse  FOREIGN KEY (in_charge_staff_no)
        REFERENCES nurse(staff_no)
);

-- Close the circle: nurse -> care_unit
ALTER TABLE nurse
    ADD CONSTRAINT fk_nurse_careunit
        FOREIGN KEY (care_unit_no) REFERENCES care_unit(care_unit_no);

-- 8. BED
CREATE TABLE bed (
    bed_no    INT          NOT NULL,
    ward_name VARCHAR(100) NOT NULL,
    CONSTRAINT pk_bed      PRIMARY KEY (bed_no),
    CONSTRAINT fk_bed_ward FOREIGN KEY (ward_name)
        REFERENCES ward(ward_name)
);

-- 9. COMPLAINT
CREATE TABLE complaint (
    complaint_code VARCHAR(20)  NOT NULL,
    complaint_desc VARCHAR(255) NOT NULL,
    CONSTRAINT pk_complaint PRIMARY KEY (complaint_code)
);

-- 10. TREATMENT
CREATE TABLE treatment (
    treatment_code VARCHAR(20)  NOT NULL,
    treatment_desc VARCHAR(255) NOT NULL,
    CONSTRAINT pk_treatment PRIMARY KEY (treatment_code)
);

-- 11. PATIENT
CREATE TABLE patient (
    patient_no           INT          NOT NULL,
    patient_name         VARCHAR(100) NOT NULL,
    date_of_birth        DATE         NOT NULL,
    date_admitted        DATE         NOT NULL,
    date_discharged      DATE         NULL,
    ward_name            VARCHAR(100) NOT NULL,
    care_unit_no         INT          NOT NULL,
    bed_no               INT          NOT NULL,
    in_charge_doctor_no  INT          NOT NULL,
    consultant_no        INT          NOT NULL,
    CONSTRAINT pk_patient           PRIMARY KEY (patient_no),
    CONSTRAINT uq_patient_bed       UNIQUE      (bed_no),
    CONSTRAINT ck_patient_dates     CHECK (date_discharged IS NULL
                                           OR date_discharged >= date_admitted),
    CONSTRAINT fk_patient_ward      FOREIGN KEY (ward_name)
        REFERENCES ward(ward_name),
    CONSTRAINT fk_patient_careunit  FOREIGN KEY (care_unit_no)
        REFERENCES care_unit(care_unit_no),
    CONSTRAINT fk_patient_bed       FOREIGN KEY (bed_no)
        REFERENCES bed(bed_no),
    CONSTRAINT fk_patient_doctor    FOREIGN KEY (in_charge_doctor_no)
        REFERENCES doctor(staff_no),
    CONSTRAINT fk_patient_consultant FOREIGN KEY (consultant_no)
        REFERENCES consultant(staff_no)
);

-- 12. PATIENT_COMPLAINT_TREATMENT 
CREATE TABLE patient_complaint_treatment (
    patient_no     INT         NOT NULL,
    complaint_code VARCHAR(20) NOT NULL,
    treatment_code VARCHAR(20) NOT NULL,
    date_started   DATE        NOT NULL,
    doctor_no      INT         NOT NULL,
    date_ended     DATE        NULL,
    CONSTRAINT pk_pct           PRIMARY KEY (patient_no, complaint_code,
                                              treatment_code, date_started),
    CONSTRAINT ck_pct_dates     CHECK (date_ended IS NULL
                                       OR date_ended >= date_started),
    CONSTRAINT fk_pct_patient   FOREIGN KEY (patient_no)
        REFERENCES patient(patient_no),
    CONSTRAINT fk_pct_complaint  FOREIGN KEY (complaint_code)
        REFERENCES complaint(complaint_code),
    CONSTRAINT fk_pct_treatment  FOREIGN KEY (treatment_code)
        REFERENCES treatment(treatment_code),
    CONSTRAINT fk_pct_doctor    FOREIGN KEY (doctor_no)
        REFERENCES doctor(staff_no)
);

-- 13. DOCTOR_EXPERIENCE
CREATE TABLE doctor_experience (
    experience_id INT          NOT NULL,
    staff_no      INT          NOT NULL,
    from_date     DATE         NOT NULL,
    to_date       DATE         NULL,
    position      VARCHAR(100) NOT NULL,
    establishment VARCHAR(255) NOT NULL,
    CONSTRAINT pk_experience        PRIMARY KEY (experience_id),
    CONSTRAINT ck_experience_dates  CHECK (to_date IS NULL OR to_date >= from_date),
    CONSTRAINT fk_experience_doctor FOREIGN KEY (staff_no)
        REFERENCES doctor(staff_no)
);

-- 14. PERFORMANCE_REVIEW
CREATE TABLE performance_review (
    review_id              INT         NOT NULL,
    doctor_no              INT         NOT NULL,
    review_date            DATE        NOT NULL,
    performance_grade      VARCHAR(10) NOT NULL,
    reviewed_by_consultant INT         NOT NULL,
    CONSTRAINT pk_review            PRIMARY KEY (review_id),
    CONSTRAINT fk_review_doctor     FOREIGN KEY (doctor_no)
        REFERENCES doctor(staff_no),
    CONSTRAINT fk_review_consultant FOREIGN KEY (reviewed_by_consultant)
        REFERENCES consultant(staff_no)
);
GO

-- SECTION 3 : SAMPLE DATA

-- ── SPECIALTY (10 records)
INSERT INTO specialty VALUES
(1,  'Orthopedics'),
(2,  'Geriatrics'),
(3,  'Cardiology'),
(4,  'Neurology'),
(5,  'Oncology'),
(6,  'Pediatrics'),
(7,  'Dermatology'),
(8,  'Pulmonology'),
(9,  'Gastroenterology'),
(10, 'Endocrinology');

-- ── WARD (10 records)
INSERT INTO ward VALUES
('Ward A', 1),   -- Orthopedics
('Ward B', 2),   -- Geriatrics
('Ward C', 3),   -- Cardiology
('Ward D', 4),   -- Neurology
('Ward E', 5),   -- Oncology
('Ward F', 6),   -- Pediatrics
('Ward G', 7),   -- Dermatology
('Ward H', 8),   -- Pulmonology
('Ward I', 9),   -- Gastroenterology
('Ward J', 10);  -- Endocrinology

-- ── STAFF (14 doctors/consultants + 15 nurses = 29) 
INSERT INTO staff VALUES
-- Doctors
(1,  'Dr. James Carter'),
(2,  'Dr. Sarah Mitchell'),
(3,  'Dr. Omar Hassan'),
(4,  'Dr. Priya Patel'),
(5,  'Dr. Tom Reynolds'),
(6,  'Dr. Maria Lopez'),
(7,  'Dr. David Kim'),
(8,  'Dr. Claire Donovan'),
(9,  'Dr. Samuel Osei'),
(10, 'Dr. Nadia Farouk'),
-- Consultants (also doctors)
(11, 'Dr. Richard Blake'),
(12, 'Dr. Helen Thornton'),
(13, 'Dr. Alex Murphy'),
(14, 'Dr. Fatima Zahra'),
-- Nurses
(101,'Nurse Emma Watson'),
(102,'Nurse John Ahmed'),
(103,'Nurse Lisa Nguyen'),
(104,'Nurse Paul Okeke'),
(105,'Nurse Anna Petrova'),
(106,'Nurse James Okafor'),
(107,'Nurse Mei Lin'),
(108,'Nurse Chris Owens'),
(109,'Nurse Fatou Diallo'),
(110,'Nurse Mark Spencer'),
(111,'Nurse Grace Mensah'),
(112,'Nurse Ben Adeyemi'),
(113,'Nurse Olivia White'),
(114,'Nurse Sam Khan'),
(115,'Nurse Diane Ferreira');

-- ── DOCTOR  
INSERT INTO doctor(staff_no, position, date_joined_team, consultant_no) VALUES
-- Consultants inserted first so non-consultant doctors can FK to them
(11, 'Registrar',       '2015-03-01', NULL),
(12, 'Registrar',       '2014-07-15', NULL),
(13, 'Registrar',       '2013-05-20', NULL),
(14, 'Registrar',       '2012-09-10', NULL),
-- Non-consultant doctors
(1,  'Junior Houseman', '2022-08-01', NULL),
(2,  'Senior Houseman', '2021-06-15', NULL),
(3,  'Asst Registrar',  '2020-01-10', NULL),
(4,  'Junior Houseman', '2023-02-01', NULL),
(5,  'Senior Houseman', '2019-11-20', NULL),
(6,  'Asst Registrar',  '2021-03-05', NULL),
(7,  'Junior Houseman', '2023-07-01', NULL),
(8,  'Senior Houseman', '2022-01-15', NULL),
(9,  'Registrar',       '2018-04-01', NULL),
(10, 'Asst Registrar',  '2020-09-01', NULL);

-- ── CONSULTANT 
INSERT INTO consultant VALUES
(11, 'Orthopedics'),
(12, 'Cardiology'),
(13, 'Neurology'),
(14, 'Oncology');

-- Link doctors to their consultants
UPDATE doctor SET consultant_no = 11 WHERE staff_no IN (1, 2, 3);
UPDATE doctor SET consultant_no = 12 WHERE staff_no IN (4, 5, 6);
UPDATE doctor SET consultant_no = 13 WHERE staff_no IN (7, 8, 9);
UPDATE doctor SET consultant_no = 14 WHERE staff_no IN (10);



INSERT INTO staff VALUES
(116,'Nurse Rachel Singh'),
(117,'Nurse Kevin Abubakar'),
(118,'Nurse Tina Kwame'),
(119,'Nurse Leo Castillo'),
(120,'Nurse Rosa Ferreira'),
(121,'Nurse Yusuf Diallo'),
(122,'Nurse Chloe Mensah'),
(123,'Nurse Patrick Osei'),
(124,'Nurse Amara Blake'),
(125,'Nurse Derek Pham'),
(126,'Nurse Nadia Owens'),
(127,'Nurse Joe Nakamura');

INSERT INTO nurse(staff_no, nurse_type, ward_name, care_unit_no) VALUES
-- Ward A
(101, 'Day Sister',     'Ward A', NULL),
(102, 'Night Sister',   'Ward A', NULL),
(103, 'Staff Nurse',    'Ward A', NULL),
(104, 'Non-Registered', 'Ward A', NULL),
-- Ward B
(105, 'Day Sister',     'Ward B', NULL),
(106, 'Night Sister',   'Ward B', NULL),
(107, 'Staff Nurse',    'Ward B', NULL),
(108, 'Non-Registered', 'Ward B', NULL),
-- Ward C
(109, 'Day Sister',     'Ward C', NULL),
(110, 'Night Sister',   'Ward C', NULL),
(111, 'Staff Nurse',    'Ward C', NULL),
(112, 'Non-Registered', 'Ward C', NULL),
-- Ward D
(113, 'Day Sister',     'Ward D', NULL),
(114, 'Staff Nurse',    'Ward D', NULL),
(115, 'Night Sister',   'Ward D', NULL),
-- Ward E  (FIX: own nurses, not borrowed from Ward C/D)
(116, 'Day Sister',     'Ward E', NULL),
(117, 'Staff Nurse',    'Ward E', NULL),
(118, 'Non-Registered', 'Ward E', NULL),
-- Ward F  (FIX)
(119, 'Day Sister',     'Ward F', NULL),
(120, 'Staff Nurse',    'Ward F', NULL),
(121, 'Night Sister',   'Ward F', NULL),
-- Ward G  (FIX)
(122, 'Day Sister',     'Ward G', NULL),
(123, 'Staff Nurse',    'Ward G', NULL),
(124, 'Non-Registered', 'Ward G', NULL),
-- Ward H  (FIX)
(125, 'Day Sister',     'Ward H', NULL),
(126, 'Staff Nurse',    'Ward H', NULL),
(127, 'Night Sister',   'Ward H', NULL);

-- ── CARE_UNIT
INSERT INTO care_unit VALUES
(1, 'Ward A', 103),   -- Nurse Lisa Nguyen (Staff Nurse, Ward A)
(2, 'Ward B', 107),   -- Nurse Mei Lin     (Staff Nurse, Ward B)
(3, 'Ward C', 111),   -- Nurse Grace Mensah(Staff Nurse, Ward C)
(4, 'Ward D', 114),   -- Nurse Sam Khan    (Staff Nurse, Ward D)
(5, 'Ward E', 117),   -- Nurse Kevin Abubakar (Staff Nurse, Ward E) [FIX]
(6, 'Ward F', 120),   -- Nurse Rosa Ferreira  (Staff Nurse, Ward F) [FIX]
(7, 'Ward G', 123),   -- Nurse Patrick Osei   (Staff Nurse, Ward G) [FIX]
(8, 'Ward H', 126);   -- Nurse Nadia Owens    (Staff Nurse, Ward H) [FIX]

-- Link nurses back to their care units
UPDATE nurse SET care_unit_no = 1 WHERE staff_no IN (101,102,103,104);
UPDATE nurse SET care_unit_no = 2 WHERE staff_no IN (105,106,107,108);
UPDATE nurse SET care_unit_no = 3 WHERE staff_no IN (109,110,111,112);
UPDATE nurse SET care_unit_no = 4 WHERE staff_no IN (113,114,115);
UPDATE nurse SET care_unit_no = 5 WHERE staff_no IN (116,117,118);  -- FIX
UPDATE nurse SET care_unit_no = 6 WHERE staff_no IN (119,120,121);  -- FIX
UPDATE nurse SET care_unit_no = 7 WHERE staff_no IN (122,123,124);  -- FIX
UPDATE nurse SET care_unit_no = 8 WHERE staff_no IN (125,126,127);  -- FIX

--  BED (50 beds across all wards)
INSERT INTO bed VALUES
-- Ward A (8 beds)
(1,'Ward A'),(2,'Ward A'),(3,'Ward A'),(4,'Ward A'),
(5,'Ward A'),(6,'Ward A'),(7,'Ward A'),(8,'Ward A'),
-- Ward B (7 beds)
(9,'Ward B'),(10,'Ward B'),(11,'Ward B'),(12,'Ward B'),
(13,'Ward B'),(14,'Ward B'),(15,'Ward B'),
-- Ward C (7 beds)
(16,'Ward C'),(17,'Ward C'),(18,'Ward C'),(19,'Ward C'),
(20,'Ward C'),(21,'Ward C'),(22,'Ward C'),
-- Ward D (5 beds)
(23,'Ward D'),(24,'Ward D'),(25,'Ward D'),(26,'Ward D'),(27,'Ward D'),
-- Ward E (5 beds)
(28,'Ward E'),(29,'Ward E'),(30,'Ward E'),(31,'Ward E'),(32,'Ward E'),
-- Ward F (4 beds)
(33,'Ward F'),(34,'Ward F'),(35,'Ward F'),(36,'Ward F'),
-- Ward G (4 beds)  [FIX: Ward G now has beds]
(37,'Ward G'),(38,'Ward G'),(39,'Ward G'),(40,'Ward G'),
-- Ward H (4 beds)
(41,'Ward H'),(42,'Ward H'),(43,'Ward H'),(44,'Ward H'),
-- Ward I (3 beds)
(45,'Ward I'),(46,'Ward I'),(47,'Ward I'),
-- Ward J (3 beds)
(48,'Ward J'),(49,'Ward J'),(50,'Ward J');

-- COMPLAINT (15 records) 
INSERT INTO complaint VALUES
('C001','Hip Fracture'),
('C002','Knee Osteoarthritis'),
('C003','Spinal Stenosis'),
('C004','Heart Failure'),
('C005','Atrial Fibrillation'),
('C006','Hypertension'),
('C007','Stroke'),
('C008','Epilepsy'),
('C009','Lung Cancer'),
('C010','Asthma'),
('C011','Pneumonia'),
('C012','Dementia'),
('C013','Diabetes Type 2'),
('C014','Deep Vein Thrombosis'),
('C015','Appendicitis');

--  TREATMENT (15 records) 
INSERT INTO treatment VALUES
('T001','Hip Replacement Surgery'),
('T002','Physiotherapy'),
('T003','Pain Management'),
('T004','ACE Inhibitors'),
('T005','Beta Blockers'),
('T006','Cardioversion'),
('T007','Anticoagulant Therapy'),
('T008','Anti-epileptic Drugs'),
('T009','Chemotherapy'),
('T010','Radiation Therapy'),
('T011','Bronchodilators'),
('T012','IV Antibiotics'),
('T013','Cognitive Therapy'),
('T014','Insulin Therapy'),
('T015','Appendectomy');


INSERT INTO patient VALUES
-- Ward A — Orthopedics — Consultant Blake (11) — Doctors 1,2,3
(1,  'Alice Thompson',    '1948-03-12','2025-01-05',NULL,        'Ward A',1,1,  1,11),
(2,  'Brian Okafor',      '1952-07-22','2025-01-08',NULL,        'Ward A',1,2,  2,11),
(3,  'Catherine Yip',     '1965-11-03','2025-01-15','2025-02-10','Ward A',1,3,  3,11),
(4,  'David Mensah',      '1970-05-17','2025-01-20',NULL,        'Ward A',1,4,  1,11),
(5,  'Erika Jansson',     '1980-09-28','2025-02-01',NULL,        'Ward A',1,5,  2,11),
(27, 'Aaron Blake',       '1988-10-20','2025-04-01',NULL,        'Ward A',1,6,  1,11),
-- Ward B — Geriatrics — Consultant Thornton (12) — Doctors 4,5,6
(6,  'Frank Diallo',      '1955-12-10','2025-02-03',NULL,        'Ward B',2,9,  5,12),
(7,  'Grace Abubakar',    '1940-04-02','2025-02-05',NULL,        'Ward B',2,10, 6,12),
(8,  'Henry Peterson',    '1938-08-30','2025-02-07',NULL,        'Ward B',2,11, 5,12),
(9,  'Irene Castillo',    '1945-01-25','2025-02-10','2025-03-01','Ward B',2,12, 6,12),
(10, 'James Nakamura',    '1950-06-14','2025-02-14',NULL,        'Ward B',2,13, 5,12),
(28, 'Bethany Cross',     '1975-01-05','2025-04-03',NULL,        'Ward B',2,14, 6,12),
-- Ward C — Cardiology — Consultant Thornton (12) — Doctors 4,5,6
(11, 'Karen Adeyemi',     '1972-10-08','2025-02-20',NULL,        'Ward C',3,16, 4,12),
(12, 'Liam Farouk',       '1960-03-19','2025-02-22',NULL,        'Ward C',3,17, 6,12),
(13, 'Maria Sousa',       '1985-07-11','2025-03-01',NULL,        'Ward C',3,18, 4,12),
(14, 'Nils Bjornsson',    '1943-02-28','2025-03-03',NULL,        'Ward C',3,19, 5,12),
(15, 'Olivia Pham',       '1990-12-05','2025-03-05','2025-03-20','Ward C',3,20, 6,12),
(29, 'Carlos Rivera',     '1962-04-27','2025-04-05',NULL,        'Ward C',3,21, 4,12),
-- Ward D — Neurology — Consultant Murphy (13) — Doctors 7,8,9
(16, 'Patrick Owens',     '1957-04-16','2025-03-07',NULL,        'Ward D',4,23, 7,13),
(17, 'Queen Eze',         '1963-09-22','2025-03-09',NULL,        'Ward D',4,24, 8,13),
(18, 'Robert Singh',      '1948-11-30','2025-03-11',NULL,        'Ward D',4,25, 9,13),
(19, 'Sandra Ferreira',   '1978-06-07','2025-03-13',NULL,        'Ward D',4,26, 7,13),
(20, 'Thomas Kwame',      '1935-01-18','2025-03-15',NULL,        'Ward D',4,27, 8,13),
-- Ward E — Oncology — Consultant Zahra (14) — Doctor 10
(21, 'Uma Krishnan',      '1969-08-24','2025-03-17',NULL,        'Ward E',5,28,10,14),
(22, 'Victor Anand',      '1955-02-13','2025-03-19',NULL,        'Ward E',5,29,10,14),
(23, 'Wendy Osei',        '1940-05-09','2025-03-20',NULL,        'Ward E',5,30,10,14),
(24, 'Xavier Blanc',      '1972-11-01','2025-03-22',NULL,        'Ward E',5,31,10,14),
(25, 'Yemi Adebayo',      '1980-07-30','2025-03-25',NULL,        'Ward E',5,32,10,14),
-- Ward F — Pediatrics 
(26, 'Zara Hussain',      '1995-03-14','2025-03-28',NULL,        'Ward F',6,33, 3,12),
-- Ward G — Dermatology — Consultant Murphy (13) — Doctor 9
(30, 'Diana Chukwu',      '1953-08-15','2025-04-07',NULL,        'Ward G',7,37, 9,13);


-- PATIENT_COMPLAINT_TREATMENT (38 records) 
INSERT INTO patient_complaint_treatment VALUES
-- Patient 1: Alice Thompson — Hip Fracture, Surgery + Physio
(1,  'C001','T001','2025-01-06', 1,  NULL),
(1,  'C001','T002','2025-01-20', 1,  NULL),
-- Patient 2: Brian Okafor — Knee Osteoarthritis
(2,  'C002','T003','2025-01-09', 2,  '2025-02-15'),
(2,  'C002','T002','2025-02-16', 2,  NULL),
-- Patient 3: Catherine Yip — Spinal Stenosis
(3,  'C003','T003','2025-01-16', 3,  '2025-02-08'),
-- Patient 4: David Mensah — Hip Fracture + Hypertension
(4,  'C001','T001','2025-01-21', 1,  NULL),
(4,  'C006','T005','2025-01-25', 1,  NULL),
-- Patient 5: Erika Jansson — Knee Osteoarthritis
(5,  'C002','T002','2025-02-02', 2,  NULL),
-- Patient 6: Frank Diallo — Heart Failure + Hypertension
(6,  'C004','T004','2025-02-04', 5,  NULL),
(6,  'C006','T005','2025-02-04', 5,  NULL),
-- Patient 7: Grace Abubakar — Dementia
(7,  'C012','T013','2025-02-06', 6,  NULL),
-- Patient 8: Henry Peterson — Heart Failure
(8,  'C004','T004','2025-02-08', 5,  NULL),
-- Patient 9: Irene Castillo — Atrial Fibrillation
(9,  'C005','T006','2025-02-11', 6,  '2025-02-28'),
-- Patient 10: James Nakamura — Heart Failure + DVT
(10, 'C004','T004','2025-02-15', 5,  NULL),
(10, 'C014','T007','2025-02-15', 5,  NULL),
-- Patient 11: Karen Adeyemi — Atrial Fibrillation + Hypertension
(11, 'C005','T005','2025-02-21', 4,  NULL),
(11, 'C006','T004','2025-02-21', 4,  NULL),
-- Patient 12: Liam Farouk — Heart Failure
(12, 'C004','T004','2025-02-23', 6,  NULL),
-- Patient 13: Maria Sousa — Atrial Fibrillation
(13, 'C005','T006','2025-03-02', 4,  NULL),
-- Patient 14: Nils Bjornsson — Heart Failure + Hypertension
(14, 'C004','T004','2025-03-04', 5,  NULL),
(14, 'C006','T005','2025-03-04', 5,  NULL),
-- Patient 15: Olivia Pham — Atrial Fibrillation + DVT
(15, 'C005','T007','2025-03-06', 6,  '2025-03-18'),
-- Patient 16: Patrick Owens — Stroke
(16, 'C007','T002','2025-03-08', 7,  NULL),
-- Patient 17: Queen Eze — Epilepsy
(17, 'C008','T008','2025-03-10', 8,  NULL),
-- Patient 18: Robert Singh — Stroke
(18, 'C007','T003','2025-03-12', 9,  NULL),
-- Patient 19: Sandra Ferreira — Epilepsy
(19, 'C008','T008','2025-03-14', 7,  NULL),
-- Patient 20: Thomas Kwame — Dementia
(20, 'C012','T013','2025-03-16', 8,  NULL),
-- Patients 21-25: Oncology Ward — Lung Cancer
(21, 'C009','T009','2025-03-18',10,  NULL),
(22, 'C009','T010','2025-03-20',10,  NULL),
(23, 'C009','T009','2025-03-21',10,  NULL),
(24, 'C009','T009','2025-03-23',10,  NULL),
(24, 'C006','T005','2025-03-23',10,  NULL),
(25, 'C009','T010','2025-03-26',10,  NULL),
-- Patient 26: Zara Hussain — Asthma (Pediatrics)
(26, 'C010','T011','2025-03-29', 3,  NULL),
-- Patient 27: Aaron Blake — Hip Fracture
(27, 'C001','T001','2025-04-02', 1,  NULL),
-- Patient 28: Bethany Cross — Heart Failure
(28, 'C004','T004','2025-04-04', 6,  NULL),
-- Patient 29: Carlos Rivera — Atrial Fibrillation
(29, 'C005','T006','2025-04-06', 4,  NULL),
-- Patient 30: Diana Chukwu — Pneumonia (Dermatology/co-morbidity)
(30, 'C011','T012','2025-04-08', 9,  NULL);

--  DOCTOR_EXPERIENCE (20 records) 
INSERT INTO doctor_experience VALUES
(1,  1,  '2018-09-01','2020-07-31','Student',         'City General Hospital'),
(2,  1,  '2020-08-01','2021-07-31','Junior Houseman',  'Royal Infirmary'),
(3,  1,  '2021-08-01','2022-07-31','Senior Houseman',  'St. Mary Medical'),
(4,  2,  '2017-09-01','2019-08-31','Student',          'Northern General'),
(5,  2,  '2019-09-01','2021-05-31','Junior Houseman',  'County Hospital'),
(6,  3,  '2016-01-01','2018-12-31','Student',          'Metro Medical Centre'),
(7,  3,  '2019-01-01','2020-06-30','Junior Houseman',  'University Hospital'),
(8,  4,  '2019-08-01','2021-07-31','Student',          'Greenfield Clinic'),
(9,  5,  '2015-06-01','2017-05-31','Student',          'Highland General'),
(10, 5,  '2017-06-01','2019-05-31','Junior Houseman',  'Valley Medical'),
(11, 6,  '2017-01-01','2018-12-31','Student',          'Central Hospital'),
(12, 6,  '2019-01-01','2020-12-31','Junior Houseman',  'West Side Clinic'),
(13, 7,  '2020-07-01','2022-06-30','Student',          'East Medical College'),
(14, 8,  '2019-01-01','2021-06-30','Student',          'Riverdale Hospital'),
(15, 9,  '2014-01-01','2016-06-30','Student',          'Oakwood General'),
(16, 9,  '2016-07-01','2018-03-31','Junior Houseman',  'Mount Vernon Hospital'),
(17, 10, '2017-09-01','2019-08-31','Student',          'Lakeside Medical'),
(18, 11, '2008-08-01','2010-07-31','Junior Houseman',  'St. Luke Hospital'),
(19, 11, '2010-08-01','2013-07-31','Senior Houseman',  'National Medical Centre'),
(20, 12, '2006-06-01','2009-05-31','Junior Houseman',  'Harborview Hospital');

-- PERFORMANCE_REVIEW (20 records) 
INSERT INTO performance_review VALUES
(1,  1,  '2023-01-15','B+',11),
(2,  1,  '2023-07-15','A-',11),
(3,  2,  '2023-01-20','B', 11),
(4,  2,  '2023-07-20','B+',11),
(5,  3,  '2023-02-10','A', 11),
(6,  3,  '2023-08-10','A', 11),
(7,  4,  '2023-03-01','C+',12),
(8,  4,  '2023-09-01','B-',12),
(9,  5,  '2023-02-15','B+',12),
(10, 5,  '2023-08-15','A-',12),
(11, 6,  '2023-03-20','B', 12),
(12, 6,  '2023-09-20','B+',12),
(13, 7,  '2023-04-01','B-',13),
(14, 7,  '2023-10-01','B', 13),
(15, 8,  '2023-04-15','A', 13),
(16, 8,  '2023-10-15','A', 13),
(17, 9,  '2023-05-01','B+',13),
(18, 9,  '2023-11-01','A-',13),
(19, 10, '2023-05-15','B', 14),
(20, 10, '2023-11-15','B+',14);
GO

PRINT 'Schema and data loaded successfully.';
GO


