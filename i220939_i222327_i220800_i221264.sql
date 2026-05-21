-- IVOR PAINE MEMORIAL HOSPITAL Schema
-- Group Members: 22i-0939 | 22i-0800 | 22i-2327 | 22i-1264

-- ── Drop in reverse FK order 
DROP TABLE IF EXISTS performance_review;
DROP TABLE IF EXISTS doctor_experience;
DROP TABLE IF EXISTS patient_complaint_treatment;
DROP TABLE IF EXISTS patient;
DROP TABLE IF EXISTS bed;
DROP TABLE IF EXISTS care_unit;
DROP TABLE IF EXISTS nurse;
DROP TABLE IF EXISTS consultant;
DROP TABLE IF EXISTS doctor;
DROP TABLE IF EXISTS staff;
DROP TABLE IF EXISTS ward;
DROP TABLE IF EXISTS specialty;
DROP TABLE IF EXISTS complaint;
DROP TABLE IF EXISTS treatment;

-- 1. SPECIALTY
--    Lookup table for ward specialties (e.g. orthopedic, geriatric).
--    Relationship: one specialty → many wards (1:N).

CREATE TABLE specialty (
    specialty_id        INT             PRIMARY KEY,
    specialty_name      VARCHAR(100)    NOT NULL UNIQUE
);

-- 2. WARD
--    Each ward has a unique name and caters for exactly one specialty.
--    Relationship: WARD →(N:1)→ SPECIALTY

CREATE TABLE ward (
    ward_name           VARCHAR(100)    PRIMARY KEY,
    specialty_id        INT             NOT NULL,
    CONSTRAINT fk_ward_specialty
        FOREIGN KEY (specialty_id) REFERENCES specialty(specialty_id)
);

-- 3. STAFF  (IS A Supertype — disjoint, total)
--    Every staff member is either a NURSE or a DOCTOR.
--    Shared attributes live here; subtypes hold their own tables.

CREATE TABLE staff (
    staff_no            INT             PRIMARY KEY,
    staff_name          VARCHAR(100)    NOT NULL
);

-- 4. DOCTOR  (IS A Subtype of STAFF — disjoint, total)
--    Populated for every doctor. staff_no is PK + FK → staff.
--    Relationship: DOCTOR →(N:1)→ CONSULTANT (team membership).
--    Note: consultant_no is set AFTER consultant rows are inserted;
--          for consultants themselves it may be NULL or self-referencing
--          depending on application logic.

CREATE TABLE doctor (
    staff_no            INT             PRIMARY KEY,
    position            VARCHAR(30)     NOT NULL,
    date_joined_team    DATE            NOT NULL,
    consultant_no       INT,                               -- FK set below, after consultant
    CONSTRAINT ck_doctor_position
        CHECK (position IN ('Student', 'Junior Houseman', 'Senior Houseman',
                            'Asst Registrar', 'Registrar')),
    CONSTRAINT fk_doctor_staff
        FOREIGN KEY (staff_no) REFERENCES staff(staff_no)
);

-- 5. CONSULTANT  (IS A Subtype of DOCTOR — partial)
--    Not every doctor is a consultant.
--    staff_no is PK + FK → doctor.

CREATE TABLE consultant (
    staff_no            INT             PRIMARY KEY,
    specialty           VARCHAR(100)    NOT NULL,
    CONSTRAINT fk_consultant_doctor
        FOREIGN KEY (staff_no) REFERENCES doctor(staff_no)
);

-- Add the FK from doctor → consultant now that consultant table exists
ALTER TABLE doctor
    ADD CONSTRAINT fk_doctor_consultant
        FOREIGN KEY (consultant_no) REFERENCES consultant(staff_no);

-- 6. NURSE  (IS A Subtype of STAFF — disjoint, total)
--    A nurse works on exactly one ward and one care unit.
--    staff_no is PK + FK → staff.
--    care_unit_no FK is added after care_unit is created.

CREATE TABLE nurse (
    staff_no            INT             PRIMARY KEY,
    nurse_type          VARCHAR(20)     NOT NULL,
    ward_name           VARCHAR(100)    NOT NULL,
    care_unit_no        INT,                               -- FK added after care_unit
    CONSTRAINT ck_nurse_type
        CHECK (nurse_type IN ('Day Sister', 'Night Sister',
                              'Staff Nurse', 'Non-Registered')),
    CONSTRAINT fk_nurse_staff
        FOREIGN KEY (staff_no) REFERENCES staff(staff_no),
    CONSTRAINT fk_nurse_ward
        FOREIGN KEY (ward_name) REFERENCES ward(ward_name)
);

-- 7. CARE_UNIT
--    Each care unit has a unique number hospital-wide.
--    Belongs to one ward; one staff nurse is in charge.
--    Relationships:
--      CARE_UNIT →(N:1)→ WARD
--      CARE_UNIT →(N:1)→ NURSE  (in_charge_staff_no; NurseType = 'Staff Nurse')

CREATE TABLE care_unit (
    care_unit_no        INT             PRIMARY KEY,
    ward_name           VARCHAR(100)    NOT NULL,
    in_charge_staff_no  INT             NOT NULL,
    CONSTRAINT fk_careunit_ward
        FOREIGN KEY (ward_name) REFERENCES ward(ward_name),
    CONSTRAINT fk_careunit_nurse
        FOREIGN KEY (in_charge_staff_no) REFERENCES nurse(staff_no)
);

-- Add the FK from nurse → care_unit now that care_unit table exists

ALTER TABLE nurse
    ADD CONSTRAINT fk_nurse_careunit
        FOREIGN KEY (care_unit_no) REFERENCES care_unit(care_unit_no);

-- 8. BED
--    Each bed has a unique number hospital-wide.
--    Relationship: BED →(N:1)→ WARD

CREATE TABLE bed (
    bed_no              INT             PRIMARY KEY,
    ward_name           VARCHAR(100)    NOT NULL,
    CONSTRAINT fk_bed_ward
        FOREIGN KEY (ward_name) REFERENCES ward(ward_name)
);

-- 9. COMPLAINT
--    Lookup table for complaint types (codes from Patient Record form).

CREATE TABLE complaint (
    complaint_code      VARCHAR(20)     PRIMARY KEY,
    complaint_desc      VARCHAR(255)    NOT NULL
);

-- 10. TREATMENT
--     Lookup table for treatment types (codes from Patient Record form).

CREATE TABLE treatment (
    treatment_code      VARCHAR(20)     PRIMARY KEY,
    treatment_desc      VARCHAR(255)    NOT NULL
);

-- 11. PATIENT
--     From Patient Record + Ward Record forms.
--     Relationships:
--       PATIENT →(N:1)→ WARD
--       PATIENT →(N:1)→ CARE_UNIT
--       PATIENT →(1:1)→ BED         (UNIQUE enforces one patient per bed)
--       PATIENT →(N:1)→ DOCTOR      (in_charge_doctor_no)
--       PATIENT →(N:1)→ CONSULTANT

CREATE TABLE patient (
    patient_no              INT             PRIMARY KEY,
    patient_name            VARCHAR(100)    NOT NULL,
    date_of_birth           DATE            NOT NULL,
    date_admitted           DATE            NOT NULL,
    date_discharged         DATE,                          -- NULL = currently admitted
    ward_name               VARCHAR(100)    NOT NULL,
    care_unit_no            INT             NOT NULL,
    bed_no                  INT             NOT NULL UNIQUE,
    in_charge_doctor_no     INT             NOT NULL,
    consultant_no           INT             NOT NULL,
    CONSTRAINT ck_patient_dates
        CHECK (date_discharged IS NULL OR date_discharged >= date_admitted),
    CONSTRAINT fk_patient_ward
        FOREIGN KEY (ward_name) REFERENCES ward(ward_name),
    CONSTRAINT fk_patient_careunit
        FOREIGN KEY (care_unit_no) REFERENCES care_unit(care_unit_no),
    CONSTRAINT fk_patient_bed
        FOREIGN KEY (bed_no) REFERENCES bed(bed_no),
    CONSTRAINT fk_patient_doctor
        FOREIGN KEY (in_charge_doctor_no) REFERENCES doctor(staff_no),
    CONSTRAINT fk_patient_consultant
        FOREIGN KEY (consultant_no) REFERENCES consultant(staff_no)
);

-- 12. PATIENT_COMPLAINT_TREATMENT  (Ternary Associative / Weak Entity)
--     Records which treatment a patient receives for a complaint,
--     administered by which doctor, over what time period.
--     Composite PK: (patient_no, complaint_code, treatment_code, date_started)
--     This allows the same complaint to have multiple treatment episodes.
--     Constraint from spec:
--       "At any given time, for a particular complaint, a patient can only
--        be treated by one doctor and receive one type of treatment."

CREATE TABLE patient_complaint_treatment (
    patient_no          INT             NOT NULL,
    complaint_code      VARCHAR(20)     NOT NULL,
    treatment_code      VARCHAR(20)     NOT NULL,
    date_started        DATE            NOT NULL,
    doctor_no           INT             NOT NULL,
    date_ended          DATE,                              -- NULL = treatment ongoing
    PRIMARY KEY (patient_no, complaint_code, treatment_code, date_started),
    CONSTRAINT ck_pct_dates
        CHECK (date_ended IS NULL OR date_ended >= date_started),
    CONSTRAINT fk_pct_patient
        FOREIGN KEY (patient_no) REFERENCES patient(patient_no),
    CONSTRAINT fk_pct_complaint
        FOREIGN KEY (complaint_code) REFERENCES complaint(complaint_code),
    CONSTRAINT fk_pct_treatment
        FOREIGN KEY (treatment_code) REFERENCES treatment(treatment_code),
    CONSTRAINT fk_pct_doctor
        FOREIGN KEY (doctor_no) REFERENCES doctor(staff_no)
);

-- 13. DOCTOR_EXPERIENCE
--     Multi-valued repeating group from Consultant Team Record
--     (Previous Experience section). One doctor → many past roles.

CREATE TABLE doctor_experience (
    experience_id       INT             PRIMARY KEY,
    staff_no            INT             NOT NULL,
    from_date           DATE            NOT NULL,
    to_date             DATE,                              -- NULL = currently in this role
    position            VARCHAR(100)    NOT NULL,
    establishment       VARCHAR(255)    NOT NULL,
    CONSTRAINT ck_experience_dates
        CHECK (to_date IS NULL OR to_date >= from_date),
    CONSTRAINT fk_experience_doctor
        FOREIGN KEY (staff_no) REFERENCES doctor(staff_no)
);

-- 14. PERFORMANCE_REVIEW
--     Every six months a consultant assigns a performance grade
--     to a doctor in their team. One doctor → many reviews.

CREATE TABLE performance_review (
    review_id               INT             PRIMARY KEY,
    doctor_no               INT             NOT NULL,
    review_date             DATE            NOT NULL,
    performance_grade       VARCHAR(10)     NOT NULL,
    reviewed_by_consultant  INT             NOT NULL,
    CONSTRAINT fk_review_doctor
        FOREIGN KEY (doctor_no) REFERENCES doctor(staff_no),
    CONSTRAINT fk_review_consultant
        FOREIGN KEY (reviewed_by_consultant) REFERENCES consultant(staff_no)
);