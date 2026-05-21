# Entity Mapping Summary

This document summarizes ER/EER-to-relational mapping used in this project.

## Core Entities

- `specialty(specialty_id PK, specialty_name UQ)`
- `ward(ward_name PK, specialty_id FK -> specialty)`
- `staff(staff_no PK, staff_name)`
- `doctor(staff_no PK/FK -> staff, consultant_no FK -> consultant)`
- `consultant(staff_no PK/FK -> doctor, specialty)`
- `nurse(staff_no PK/FK -> staff, ward_name FK -> ward, care_unit_no FK -> care_unit)`
- `care_unit(care_unit_no PK, ward_name FK -> ward, in_charge_staff_no FK -> nurse)`
- `bed(bed_no PK, ward_name FK -> ward)`
- `patient(patient_no PK, ward_name FK, care_unit_no FK, bed_no UQ/FK, in_charge_doctor_no FK, consultant_no FK)`
- `complaint(complaint_code PK, complaint_desc)`
- `treatment(treatment_code PK, treatment_desc)`
- `patient_complaint_treatment(composite PK, patient/complaint/treatment/doctor FKs, dates)`
- `doctor_experience(experience_id PK, staff_no FK -> doctor, experience timeline)`
- `performance_review(review_id PK, doctor_no FK, reviewed_by_consultant FK)`

## Supertype/Subtype Notes

- `staff` is the supertype for `doctor` and `nurse`.
- `consultant` is a subtype of `doctor` (partial specialization).

## Key Constraints Captured

- One patient per bed: `UNIQUE (bed_no)` in `patient`.
- Date validation checks for discharge/treatment/experience ranges.
- Enumerated checks for doctor positions and nurse types.

## Assignment Alignment

- Supports all required operational forms.
- Supports all 12 required report queries via `api/reports.php` and `sql/reports_queries.sql`.
