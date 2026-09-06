# Ivor Paine Memorial Hospital (IPMH) Management System

A premium hospital operations dashboard and full database-backed management platform for the Ivor Paine Memorial Hospital case study.

## Live Demo

- Live app: https://hospitalms-0899b.containers.snapdeploy.app
- Project repo: https://github.com/rohaan2802/Hospital-MS

## Project Summary

This project was built to simulate a real-world hospital information system with a modern recruiter-friendly frontend and a database-backed backend. It covers patient intake, doctor and nurse management, ward and bed allocation, complaints and treatment tracking, performance reviews, and required reporting queries.

The system is designed to feel operational, professional, and presentation-ready while still staying aligned with the academic database requirements.

## Core Features

- Executive dashboard with live summary cards
- Ward occupancy visualization
- Specialty overview and operational stats
- Patient admission and record management
- Doctor and consultant assignment workflows
- Nurse and unit coordination management
- Complaints and treatment logging
- Performance review tracking
- Required report querying page for all assignment queries
- Responsive UI for mobile, tablet, laptop, and desktop screens
- Database-driven CRUD operations powered by PHP + MySQL

## Stack

- Frontend: HTML, CSS, Vanilla JavaScript
- Backend: PHP 8+
- Database: MySQL 8+
- UI style: premium dashboard design with responsive layouts
- Deployment: Docker / PHP hosting / SnapDeploy-compatible setup

## Folder Structure

```text
Hospital-MS/
├── api/
│   ├── dashboard.php
│   ├── patients.php
│   ├── doctors.php
│   ├── nurses.php
│   ├── wards.php
│   ├── complaints.php
│   ├── reviews.php
│   ├── reports.php
│   └── helpers.php
├── config/
│   └── db.php
├── css/
│   ├── global.css
│   ├── dashboard.css
│   └── pages.css
├── js/
│   ├── api.js
│   ├── nav.js
│   ├── live-sync.js
│   ├── dashboard.js
│   ├── patients.js
│   ├── doctors.js
│   ├── nurses.js
│   ├── wards.js
│   ├── complaints.js
│   ├── reviews.js
│   ├── reports.js
│   └── data.js
├── sql/
│   ├── mysql_schema.sql
│   ├── seed_data.sql
│   └── reports_queries.sql
├── docs/
│   ├── ENTITY_MAPPING.md
│   └── TABLE_DESCRIPTIONS.md
├── .env.example
├── Dockerfile
├── index.html
├── patients.html
├── doctors.html
├── nurses.html
├── wards.html
├── complaints.html
├── reviews.html
├── reports.html
├── README.md
├── .gitignore
└── .vscode/
    ├── launch.json
    └── run-app.ps1
```

## How It Works

The app uses a structured PHP API layer to query and update the hospital database. Each page reads and writes through endpoint-specific handlers, while the front end renders dashboards and tables in a clean, operational format.

### Main Pages

- Dashboard: hospital KPIs and occupancy overview
- Patients: admissions, ward allocation, doctor assignment, bed status
- Doctors: staff records, consultant mapping, team structure
- Nurses: staff records and care-unit coverage
- Wards & Beds: occupancy and bed resource tracking
- Complaints & Treatments: clinical issue tracking workflow
- Reviews: staff performance review management
- Reports: required query execution page for academic assignment tasks

## Database Design Highlights

This system is built around the core hospital entity model:

- staff
- doctor
- nurse
- patient
- ward
- bed
- care_unit
- specialty
- complaint
- treatment
- performance_review
- consultant

The schema supports relational integrity, operational constraints, and assignment logic required by a realistic hospital workflow.

## Local Setup

### 1. Prepare the database

Create a MySQL database and import the schema from `sql/mysql_schema.sql`.

### 2. Configure database credentials

Update `config/db.php` or the environment variables used by your local environment.

### 3. Run the PHP app

Serve the project with PHP or Docker. A typical local flow is:

```bash
php -S localhost:8000
```

Then open:

```text
http://localhost:8000/index.html
```

## Deployment Notes

This project is designed to be deployable in a PHP-compatible hosting environment. The static frontend is lightweight and the backend APIs are simple, portable, and easy to host.

## Report Queries Included

The project includes required analytical queries for the assignment, including:

- consultant team structure
- ward and sister coverage
- patient complaints and treatment history
- doctor review analysis
- patient-specific medical summary
- treatment lookup by date range
- staff position counts

These are exposed through the `reports.html` UI and `api/reports.php`.

## Use Cases

This project is suitable for:

- academic database project submission
- hospital operations dashboard demonstration
- portfolio project showcasing data-backed CRUD workflows
- recruiter-facing front-end + backend project presentation

## Notes

- `js/data.js` is legacy mock data and is not the primary source of app data.
- Active pages use the live API layer and database-backed endpoints.
- The project keeps a balance between academic requirements and a premium visual presentation.

## Future Improvements

Potential upgrades for a next version:

- role-based authentication
- cloud sync or login flow
- PDF/Excel export
- advanced analytics charts
- drag-and-drop ward planning
- audit logging and user actions
- stronger server-side validation and admin roles

## Contributors

- Zohaib Hassan
- Mohammad Rohaan
- Shehryar Ahmad
- Tehreem Shakeel

## License

This project is intended for educational and portfolio use.

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
DB_HOST=mysql-1151d526-project-ec1.h.aivencloud.com
DB_PORT=25038
DB_NAME=hospitalms
DB_USER=avnadmin
DB_PASSWORD=<your Aiven MySQL password>
DB_SSL_CA=certs/aiven-ca.pem
```

4. Deploy and open the generated URL. The home directory opens the dashboard directly.

The repository now includes the public Aiven CA certificate at `certs/aiven-ca.pem`, and the app will use it automatically if `DB_SSL_CA_CONTENT` is not set. If your deployment platform lets you mount a different certificate path, you can still override `DB_SSL_CA`.

### 3. Live deployment details

Live URL: `ADD_YOUR_SNAPDEPLOY_URL_HERE`

Deployment notes:

- The app now opens directly without a sign-in screen.
- Database access uses the bundled Aiven CA certificate at `certs/aiven-ca.pem`.
- The database name for this deployment is `hospitalms`, not Aiven's default `defaultdb`.
- The `DB_PASSWORD` value above is the Aiven MySQL password shown in the console.
- If SnapDeploy redeploys from GitHub, make sure it is pulling the latest `main` branch.

### 4. Keeping the service warm

GitHub Actions can run scheduled workflows, but the shortest supported interval is once every 5 minutes, and scheduled runs may be delayed or dropped during heavy load. GitHub also notes that scheduled workflows only run from the default branch and can be disabled after 60 days of inactivity in public repositories.

So:

- `every 3 minutes` is not a good fit for GitHub Actions.
- `every 5 minutes` is the practical minimum on GitHub Actions.
- GitHub Actions is okay for a simple heartbeat to an HTTP endpoint, but it is not a guarantee that a free database or container will never sleep.
- If SnapDeploy or Aiven already provides a built-in keep-alive or health check, use that first.
- If you want a true heartbeat, use a scheduled workflow that calls the app URL or a health endpoint every 5 minutes.

This repository includes a DB health endpoint at `api/health.php`. If you want an automatic keep-alive, add a GitHub Actions workflow that calls that endpoint every 5 minutes and store the deployed URL in a GitHub Actions secret named `HEALTHCHECK_URL`, for example `https://your-app.example.com/api/health.php`.

Never commit `.env`, Aiven credentials, or a real patient dataset. The free services are suitable only for a portfolio/demo: SnapDeploy can sleep idle containers and Aiven Free has limited storage and no high-availability SLA.

## Submission Artifact Notes

- ER/EER diagram file should be added to this repository (for example in `docs/`).
- Relational mapping summary is documented in `docs/ENTITY_MAPPING.md`.
- Table descriptions are documented in `docs/TABLE_DESCRIPTIONS.md`.

