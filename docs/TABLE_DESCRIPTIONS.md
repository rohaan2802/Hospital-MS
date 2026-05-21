# Table Descriptions

## `specialty`
- Purpose: Master list of medical specialties.
- Key columns: `specialty_id`, `specialty_name`.

## `ward`
- Purpose: Hospital wards and their assigned specialty.
- Key columns: `ward_name`, `specialty_id`.

## `staff`
- Purpose: Common identity table for all staff.
- Key columns: `staff_no`, `staff_name`.

## `doctor`
- Purpose: Doctor-specific attributes and consultant team membership.
- Key columns: `staff_no`, `position`, `date_joined_team`, `consultant_no`.

## `consultant`
- Purpose: Consultant doctors and their consultant specialty.
- Key columns: `staff_no`, `specialty`.

## `nurse`
- Purpose: Nurse records by type/ward/care-unit assignment.
- Key columns: `staff_no`, `nurse_type`, `ward_name`, `care_unit_no`.

## `care_unit`
- Purpose: Patient care groups within wards.
- Key columns: `care_unit_no`, `ward_name`, `in_charge_staff_no`.

## `bed`
- Purpose: Physical beds assigned to wards.
- Key columns: `bed_no`, `ward_name`.

## `patient`
- Purpose: Admission, assignment, and ownership of patient records.
- Key columns: `patient_no`, `patient_name`, `date_admitted`, `ward_name`, `care_unit_no`, `bed_no`, `in_charge_doctor_no`, `consultant_no`.

## `complaint`
- Purpose: Complaint catalog (diagnosis/problem types).
- Key columns: `complaint_code`, `complaint_desc`.

## `treatment`
- Purpose: Treatment catalog.
- Key columns: `treatment_code`, `treatment_desc`.

## `patient_complaint_treatment`
- Purpose: Medical history linkage of patient + complaint + treatment + doctor with timeline.
- Key columns: `patient_no`, `complaint_code`, `treatment_code`, `date_started`, `doctor_no`, `date_ended`.

## `doctor_experience`
- Purpose: Historical experience timeline for doctors.
- Key columns: `experience_id`, `staff_no`, `from_date`, `to_date`, `position`, `establishment`.

## `performance_review`
- Purpose: Consultant-assigned periodic grades for doctors.
- Key columns: `review_id`, `doctor_no`, `review_date`, `performance_grade`, `reviewed_by_consultant`.
