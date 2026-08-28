# Ivor Paine Memorial Hospital (IPMH) - Database Project

## Overview

This project implements a Hospital Management System for the **Ivor Paine Memorial Hospital** case study.  
It is built as a milestone-based academic project covering:

- Requirement analysis
- ER/EER to relational mapping
- SQL schema design + normalization + constraints
- Initial dataset population
- Frontend development
- Backend/API integration with SQL Server

This repository is the **Milestone 3 implementation** with integrated frontend + backend APIs.

---

## Project Objectives

The system is designed to manage:

- Wards, specialties, care units, beds
- Staff hierarchy (staff, doctors, consultants, nurses)
- Patient admissions and assignments
- Complaints and treatment history
- Doctor experience and performance reviews

It also supports operational queries and reports required by the lab brief.

---

## Milestone Breakdown

### Milestone 1
- ER/EER design
- Relational mapping

### Milestone 2
- Database schema (DDL)
- Constraints (PK/FK/UNIQUE/CHECK)
- Seed data insertion

### Milestone 3 (this repo)
- Frontend screens (dashboard + modules)
- Backend REST-style APIs in PHP
- MySQL integration
- CRUD operations wired to live DB

---

## Tech Stack

- **Frontend:** HTML, CSS, Vanilla JavaScript
- **Backend:** PHP 8.3 (PDO MySQL)
- **Database:** MySQL 8+ (Aiven-compatible)
- **Deployment:** Docker + SnapDeploy
- **IDE Debug Launch:** VS Code/Cursor `.vscode` configuration

---

## Current Project Structure

```text
MileStone 3/
  api/
    complaints.php
    dashboard.php
    doctors.php
    helpers.php
    nurses.php
    patients.php
    reviews.php
    wards.php
  config/
    db.php
  css/
  js/
    api.js
    complaints.js
    dashboard.js
    doctors.js
    nav.js
    nurses.js
    patients.js
    reviews.js
    wards.js
    data.js (legacy mock data; no longer used by pages)
  .vscode/
    launch.json
    run-app.ps1
  docs/
    ENTITY_MAPPING.md
    TABLE_DESCRIPTIONS.md
  *.html
```

---

## Database Configuration

Configured in `config/db.php`:

- Database: `HospitalDB`
- Username: `scott`
- Password: `tiger1234`
- Server: `localhost` (change if using named instance)

If needed for named instance, set server like:
- `localhost\\SQLEXPRESS`

---

## Modules Implemented

### 1) Dashboard
- Hospital totals (patients, doctors, nurses, beds)
- Ward occupancy
- Specialties summary
- Recent admissions

### 2) Patients
- List/search/filter patients
- Add (admit), update, delete
- Ward/bed/doctor/consultant binding from live DB metadata

### 3) Doctors
- List/search/filter doctors
- Add/update/delete doctor records
- Consultant assignment

### 4) Nurses
- List/search/filter nurses
- Add/update/delete nurse records
- Ward and care-unit mapping

### 5) Wards & Beds
- Ward cards with specialty + care unit
- Bed occupancy visualization (occupied/free)

### 6) Complaints & Treatments
- Complaint-treatment records listing
- Add treatment logs
- Delete treatment logs
- Complaint/treatment lookup tabs with usage counts

### 7) Performance Reviews
- Review listing/filtering
- Add/update/delete performance reviews

### 8) Required Reports (12 Queries)
- Dedicated page: `reports.html`
- API endpoint: `api/reports.php?q=1..12`
- Supports parameterized required queries:
  - q9 uses `doctor_no`
  - q10 uses `patient_no`
  - q11 uses `complaint_code`, `from_date`, `to_date`
- SQL deliverable file included: `sql/reports_queries.sql`

---

## API Endpoints

### `GET` endpoints

- `api/dashboard.php`
- `api/patients.php`
- `api/patients.php?meta=1`
- `api/doctors.php`
- `api/doctors.php?meta=1`
- `api/nurses.php`
- `api/nurses.php?meta=1`
- `api/wards.php`
- `api/complaints.php`
- `api/complaints.php?meta=1`
- `api/complaints.php?lookup=1`
- `api/reviews.php`
- `api/reviews.php?meta=1`
- `api/reports.php?q=1..12`

### `POST / PUT / DELETE`

- `api/patients.php`
- `api/doctors.php`
- `api/nurses.php`
- `api/complaints.php` (POST/DELETE)
- `api/reviews.php`
 
Reports are read-only via:
- `api/reports.php`

---

## Running the Project

## 1) Start MySQL

Create a MySQL 8+ database and import `sql/mysql_schema.sql`.

## 2) Configure environment

Copy `.env.example` to `.env` and set local MySQL credentials. For Aiven, follow the deployment section below.

## 3) Start the app

Build and run the included Dockerfile, or serve the folder through Apache with PHP 8.3 and `pdo_mysql` enabled. Open `index.html` directly.

---

## Run & Debug (Dynamic Path)

This project includes a dynamic launch config:

- `.vscode/launch.json`
- `.vscode/run-app.ps1`

Use **Run and Debug** -> **Run Hospital App (Dynamic)**.

It:
- Uses current `${workspaceFolder}` dynamically
- Starts a local PHP server on a free port
- Opens browser automatically
- Avoids hardcoded project folder URL path

---

## Frontend Integration Notes

- `js/data.js` is legacy mock dataset and is no longer loaded by pages.
- All active modules use API calls through `js/api.js`.
- Each page now performs live CRUD against SQL Server-backed endpoints.

---

## Data Integrity / Constraint Considerations

The DB schema enforces:

- PK/FK relations
- unique bed assignment per patient
- date validity checks
- staff subtype structure

Backend returns SQL-level errors when constraints fail (e.g., delete blocked by dependencies).

---

## Known Limitations / Next Improvements

- Add a dedicated `api/reports.php` for all 12 required assignment queries in one place
- Add server-side validation helpers per entity (centralized)
- Add pagination/filtering on API side for larger datasets
- Add auth/roles if required by future scope
- Add transaction-safe standardized error envelopes

---

## Contributor Onboarding Checklist

1. Clone/open project in Cursor/VS Code
2. Create a MySQL database and import `sql/mysql_schema.sql`
3. Set local `.env` values (never commit the file)
4. Confirm PHP has `pdo_mysql` enabled
5. Open `index.html` and validate module CRUD paths
6. Add/adjust APIs before touching UI assumptions

---

## Academic Context

This implementation is aligned with the hospital case brief requirements:

- relationally mapped hospital model
- integrated data operations
- frontend forms/reports structure
- live backend communication instead of static mock state

It is intended as a maintainable base for further refinement and grading/demo use.

---

## Free deployment: Aiven MySQL + SnapDeploy

This repository is prepared for a demo deployment using Aiven's free MySQL plan and a SnapDeploy free container. The production code uses PHP 8.3, PDO MySQL, Docker, and environment variables; it no longer uses SQL Server or `sqlsrv`.

### 1. Create and seed Aiven MySQL

1. Create an **Aiven for MySQL** free service.
2. Open its connection information and create/select the `defaultdb` database.
3. Run [`sql/mysql_schema.sql`](sql/mysql_schema.sql) against that database. It creates the schema and demo records.
4. Download the public Aiven CA certificate from `https://cdn.aiven.io/ca.pem`.

On Windows with XAMPP, you can instead run the included prompt-based importer. It keeps all connection values in the current terminal process only:

```powershell
.\scripts\import-aiven-schema.ps1
```

If the certificate download is blocked by your network, download the CA certificate from Aiven Console > your MySQL service > Connection information and pass its path instead:

```powershell
.\scripts\import-aiven-schema.ps1 -CaCertificatePath "C:\Users\YourName\Downloads\ca.pem"
```

### 2. Deploy with SnapDeploy

1. Connect the GitHub repository and select `main`.
2. SnapDeploy detects the included `Dockerfile`.
3. Add these environment variables in the SnapDeploy dashboard:

```text
DB_HOST=<Aiven host>
DB_PORT=<Aiven port>
DB_NAME=defaultdb
DB_USER=<Aiven username>
DB_PASSWORD=<Aiven password>
DB_SSL_CA_CONTENT=<entire contents of ca.pem>
DB_SSL_CA=/tmp/aiven-ca.pem
```

4. Deploy and open the generated URL. The home directory opens the dashboard directly.

If your platform supports mounting a certificate file instead of storing the PEM text in an environment variable, use `DB_SSL_CA` and point it at the absolute path to `ca.pem`. For example:

```text
DB_SSL_CA=/app/certs/ca.pem
```

For SnapDeploy, set `DB_SSL_CA` to a harmless placeholder such as `/tmp/aiven-ca.pem` if the dashboard insists on a value, and put the real certificate text in `DB_SSL_CA_CONTENT`. The app will use the pasted certificate content and create a temporary PEM file at runtime.

Never commit `.env`, Aiven credentials, or a real patient dataset. The free services are suitable only for a portfolio/demo: SnapDeploy can sleep idle containers and Aiven Free has limited storage and no high-availability SLA.

## Submission Artifact Notes

- ER/EER diagram file should be added to this repository (for example in `docs/`).
- Relational mapping summary is documented in `docs/ENTITY_MAPPING.md`.
- Table descriptions are documented in `docs/TABLE_DESCRIPTIONS.md`.

