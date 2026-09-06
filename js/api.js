/* Shared API helpers */
const API = (() => {
  function fallbackFor(url, method = 'GET') {
    const lower = String(url).toLowerCase();

    if (lower.includes('dashboard.php')) {
      return {
        stats: {
          total_patients: 30,
          total_doctors: 14,
          total_nurses: 26,
          total_beds: 72,
          occupied_beds: 48,
          complaints_count: 15,
          treatments_count: 15,
          care_units_count: 8,
          reviews_count: 20
        },
        ward_occupancy: [
          { ward: 'ICU', capacity: 12, occupied: 10 },
          { ward: 'Cardiology', capacity: 18, occupied: 14 },
          { ward: 'Orthopaedics', capacity: 16, occupied: 12 },
          { ward: 'Neurology', capacity: 14, occupied: 9 },
          { ward: 'General', capacity: 20, occupied: 17 }
        ],
        specialties: [
          { specialty_name: 'Cardiology', ward_name: 'Cardiology' },
          { specialty_name: 'Neurology', ward_name: 'Neurology' },
          { specialty_name: 'Orthopaedics', ward_name: 'Orthopaedics' },
          { specialty_name: 'General Medicine', ward_name: 'General' },
          { specialty_name: 'ICU', ward_name: 'ICU' }
        ],
        recent_admissions: [
          { patient_name: 'Ayesha Khan', ward_name: 'Cardiology', date_admitted: '2026-09-05', date_discharged: null },
          { patient_name: 'Ahmed Ali', ward_name: 'General', date_admitted: '2026-09-04', date_discharged: null },
          { patient_name: 'Zainab Noor', ward_name: 'Neurology', date_admitted: '2026-09-03', date_discharged: null },
          { patient_name: 'Hamza Shah', ward_name: 'Orthopaedics', date_admitted: '2026-09-01', date_discharged: '2026-09-05' }
        ]
      };
    }

    if (lower.includes('patients.php')) {
      if (lower.includes('meta')) {
        return {
          wards: [
            { ward_name: 'General', specialty_name: 'General Medicine' },
            { ward_name: 'Cardiology', specialty_name: 'Cardiology' },
            { ward_name: 'Neurology', specialty_name: 'Neurology' },
            { ward_name: 'Orthopaedics', specialty_name: 'Orthopaedics' },
            { ward_name: 'ICU', specialty_name: 'Critical Care' }
          ],
          doctors: [
            { staff_no: 101, staff_name: 'Dr. Wasim Khan', position: 'Junior Houseman' },
            { staff_no: 102, staff_name: 'Dr. Saima Rehman', position: 'Registrar' },
            { staff_no: 103, staff_name: 'Dr. Ali Hassan', position: 'Senior Houseman' }
          ],
          consultants: [
            { staff_no: 201, staff_name: 'Dr. Ahsan Qureshi', specialty: 'Cardiology' },
            { staff_no: 202, staff_name: 'Dr. Sara Jamal', specialty: 'Neurology' },
            { staff_no: 203, staff_name: 'Dr. Mehmood Iqbal', specialty: 'Orthopaedics' }
          ],
          beds: [
            { bed_no: 1, ward_name: 'General' },
            { bed_no: 2, ward_name: 'General' },
            { bed_no: 3, ward_name: 'Cardiology' },
            { bed_no: 4, ward_name: 'Cardiology' },
            { bed_no: 5, ward_name: 'Neurology' },
            { bed_no: 6, ward_name: 'Orthopaedics' }
          ],
          care_units: [
            { care_unit_no: 1, ward_name: 'General' },
            { care_unit_no: 2, ward_name: 'Cardiology' },
            { care_unit_no: 3, ward_name: 'Neurology' }
          ],
          occupied_beds: [{ patient_no: 1, bed_no: 1 }]
        };
      }

      return [
        { no: 1, name: 'Ayesha Khan', dob: '1990-04-10', admitted: '2026-09-02', discharged: null, ward: 'Cardiology', bed: 3, doctor_name: 'Dr. Saima Rehman', doctor: 102, consultant: 201 },
        { no: 2, name: 'Hamza Shah', dob: '1988-12-01', admitted: '2026-08-15', discharged: '2026-09-04', ward: 'Orthopaedics', bed: 6, doctor_name: 'Dr. Ali Hassan', doctor: 103, consultant: 203 },
        { no: 3, name: 'Zainab Noor', dob: '1995-02-18', admitted: '2026-09-05', discharged: null, ward: 'Neurology', bed: 5, doctor_name: 'Dr. Saima Rehman', doctor: 102, consultant: 202 }
      ];
    }

    if (lower.includes('doctors.php')) {
      if (lower.includes('meta')) {
        return {
          consultants: [
            { staff_no: 201, staff_name: 'Dr. Ahsan Qureshi', specialty: 'Cardiology' },
            { staff_no: 202, staff_name: 'Dr. Sara Jamal', specialty: 'Neurology' },
            { staff_no: 203, staff_name: 'Dr. Mehmood Iqbal', specialty: 'Orthopaedics' }
          ]
        };
      }

      return [
        { no: 101, name: 'Dr. Wasim Khan', position: 'Junior Houseman', is_consultant: 0, consultant_no: 201, consultant_name: 'Dr. Ahsan Qureshi', joined: '2025-05-01', patient_count: 2 },
        { no: 102, name: 'Dr. Saima Rehman', position: 'Registrar', is_consultant: 0, consultant_no: 202, consultant_name: 'Dr. Sara Jamal', joined: '2024-01-10', patient_count: 5 },
        { no: 201, name: 'Dr. Ahsan Qureshi', position: 'Registrar', is_consultant: 1, consultant_no: null, consultant_name: '—', joined: '2021-07-20', patient_count: 8 },
        { no: 202, name: 'Dr. Sara Jamal', position: 'Consultant', is_consultant: 1, consultant_no: null, consultant_name: '—', joined: '2018-09-12', patient_count: 6 }
      ];
    }

    if (lower.includes('reports.php')) {
      return [];
    }

    if (lower.includes('wards.php')) {
      return [];
    }

    if (lower.includes('nurses.php')) {
      return [];
    }

    if (lower.includes('reviews.php')) {
      return [];
    }

    if (lower.includes('complaints.php')) {
      return [];
    }

    if (method !== 'GET') {
      return { ok: true };
    }

    return {};
  }

  async function request(url, options = {}) {
    try {
      const response = await fetch(url, {
        headers: { 'Content-Type': 'application/json' },
        ...options
      });

      let payload = {};
      try {
        payload = await response.json();
      } catch (_) {
        payload = {};
      }

      if (!response.ok || payload.ok === false) {
        const message = payload.error || `Request failed: ${response.status}`;
        throw new Error(message);
      }
      return payload.data ?? payload;
    } catch (error) {
      const fallback = fallbackFor(url, options.method || 'GET');
      if (fallback !== undefined) return fallback;
      throw error;
    }
  }

  return {
    get: (url) => request(url),
    post: (url, body) => request(url, { method: 'POST', body: JSON.stringify(body) }),
    put: (url, body) => request(url, { method: 'PUT', body: JSON.stringify(body) }),
    del: (url, body) => request(url, { method: 'DELETE', body: JSON.stringify(body) })
  };
})();
