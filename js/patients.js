/* Patients page logic (SQL-backed) */
(function () {
  const ROWS = 8;
  let page = 1;
  let filtered = [];
  let deleteTarget = null;
  let patients = [];
  let meta = { wards: [], doctors: [], consultants: [], beds: [], care_units: [], occupied_beds: [] };

  const avatarColors = ['avatar-blue', 'avatar-green', 'avatar-purple', 'avatar-orange'];
  const wardFilter = document.getElementById('wardFilter');
  const pWard = document.getElementById('pWard');
  const pDoctor = document.getElementById('pDoctor');
  const pConsultant = document.getElementById('pConsultant');
  const pBed = document.getElementById('pBed');

  function careUnitByWard(wardName) {
    const unit = meta.care_units.find((u) => u.ward_name === wardName);
    return unit ? Number(unit.care_unit_no) : null;
  }

  function populateFormMeta() {
    wardFilter.innerHTML = '<option value="">All Wards</option>';
    pWard.innerHTML = '';
    meta.wards.forEach((w) => {
      wardFilter.innerHTML += `<option value="${w.ward_name}">${w.ward_name}</option>`;
      pWard.innerHTML += `<option value="${w.ward_name}">${w.ward_name} — ${w.specialty_name}</option>`;
    });

    pDoctor.innerHTML = '';
    meta.doctors.forEach((d) => {
      pDoctor.innerHTML += `<option value="${d.staff_no}">${d.staff_name} (${d.position})</option>`;
    });

    pConsultant.innerHTML = '';
    meta.consultants.forEach((c) => {
      pConsultant.innerHTML += `<option value="${c.staff_no}">${c.staff_name} — ${c.specialty}</option>`;
    });
  }

  function populateBeds() {
    const ward = pWard.value;
    const editNo = +document.getElementById('editPatientNo').value;
    const current = editNo ? patients.find((p) => p.no === editNo) : null;
    const currentBed = current ? current.bed : null;
    const used = new Set(meta.occupied_beds.map((b) => Number(b.bed_no)));

    pBed.innerHTML = '';
    meta.beds
      .filter((b) => b.ward_name === ward)
      .forEach((b) => {
        const bedNo = Number(b.bed_no);
        const occupied = used.has(bedNo) && bedNo !== currentBed;
        if (!occupied) {
          pBed.innerHTML += `<option value="${bedNo}">Bed ${bedNo}</option>`;
        }
      });
  }

  function render() {
    const q = document.getElementById('searchInput').value.toLowerCase();
    const ward = wardFilter.value;
    const status = document.getElementById('statusFilter').value;

    filtered = patients.filter((p) => {
      if (q && !p.name.toLowerCase().includes(q)) return false;
      if (ward && p.ward !== ward) return false;
      if (status === 'admitted' && p.discharged) return false;
      if (status === 'discharged' && !p.discharged) return false;
      return true;
    });

    const total = filtered.length;
    const totalPages = Math.max(1, Math.ceil(total / ROWS));
    page = Math.min(page, totalPages);
    const slice = filtered.slice((page - 1) * ROWS, page * ROWS);

    const tbody = document.getElementById('patientsTbody');
    if (slice.length === 0) {
      tbody.innerHTML = `<tr><td colspan="9"><div class="empty-state"><p>No patients found</p></div></td></tr>`;
    } else {
      tbody.innerHTML = slice
        .map((p) => {
          const color = avatarColors[p.no % avatarColors.length];
          const initials = p.name.split(' ').map((x) => x[0]).slice(0, 2).join('');
          const statusBadge = p.discharged
            ? `<span class="badge badge-green">Discharged</span>`
            : `<span class="badge badge-blue">Admitted</span>`;
          return `<tr>
          <td style="color:var(--text-3)">${p.no}</td>
          <td><div class="avatar-cell"><div class="avatar ${color}">${initials}</div><span class="name">${p.name}</span></div></td>
          <td>${p.dob}</td>
          <td>${p.ward}</td>
          <td>Bed ${p.bed}</td>
          <td>${p.doctor_name || '—'}</td>
          <td>${p.admitted}</td>
          <td>${statusBadge}</td>
          <td><div class="row-actions">
            <button class="icon-btn edit" title="Edit" onclick="editPatient(${p.no})">
              <svg viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/></svg>
            </button>
            <button class="icon-btn del" title="Delete" onclick="deletePatient(${p.no},'${p.name.replace(/'/g, "\\'")}')">
              <svg viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" stroke-width="2"/><path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="2"/></svg>
            </button>
          </div></td>
        </tr>`;
        })
        .join('');
    }

    const pg = document.getElementById('pagination');
    pg.innerHTML = `<span class="pg-info">Showing ${Math.min((page - 1) * ROWS + 1, total)}–${Math.min(page * ROWS, total)} of ${total}</span>`;
    pg.innerHTML += `<button class="pg-btn" onclick="changePage(${page - 1})" ${page === 1 ? 'disabled' : ''}>‹</button>`;
    for (let i = 1; i <= totalPages; i++) {
      pg.innerHTML += `<button class="pg-btn ${i === page ? 'active' : ''}" onclick="changePage(${i})">${i}</button>`;
    }
    pg.innerHTML += `<button class="pg-btn" onclick="changePage(${page + 1})" ${page === totalPages ? 'disabled' : ''}>›</button>`;
  }

  async function fetchSnapshot() {
    const [list, metaInfo] = await Promise.all([
      API.get('api/patients.php'),
      API.get('api/patients.php?meta=1')
    ]);
    return { list, metaInfo };
  }

  function applySnapshot(snapshot) {
    patients = snapshot.list;
    meta = snapshot.metaInfo;
    populateFormMeta();
    populateBeds();
  }

  async function loadAll() {
    try {
      applySnapshot(await fetchSnapshot());
      render();
    } catch (error) {
      showToast(error.message || 'Unable to load patients.', 'error');
    }
  }

  window.changePage = function (p) {
    page = p;
    render();
  };

  ['searchInput', 'wardFilter', 'statusFilter'].forEach((id) => {
    document.getElementById(id).addEventListener('input', () => {
      page = 1;
      render();
    });
  });

  pWard.addEventListener('change', populateBeds);

  function resetForm() {
    document.getElementById('editPatientNo').value = '';
    document.getElementById('patientModalTitle').textContent = 'Admit Patient';
    document.getElementById('patientSubmitBtn').textContent = 'Admit Patient';
    document.getElementById('patientForm').reset();
    document.getElementById('pAdmitted').value = new Date().toISOString().split('T')[0];
    populateBeds();
  }

  document.getElementById('patientForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const editNo = +document.getElementById('editPatientNo').value;
    const wardName = document.getElementById('pWard').value;
    const payload = {
      name: document.getElementById('pName').value.trim(),
      dob: document.getElementById('pDob').value,
      admitted: document.getElementById('pAdmitted').value,
      discharged: document.getElementById('pDischarged').value || null,
      ward: wardName,
      bed: +document.getElementById('pBed').value,
      doctor: +document.getElementById('pDoctor').value,
      consultant: +document.getElementById('pConsultant').value,
      unit: careUnitByWard(wardName)
    };

    try {
      if (editNo) {
        payload.no = editNo;
        await API.put('api/patients.php', payload);
        showToast('Patient updated successfully.');
      } else {
        await API.post('api/patients.php', payload);
        showToast('Patient admitted successfully.');
      }
      closeModal('patientModal');
      resetForm();
      await loadAll();
    } catch (error) {
      showToast(error.message || 'Failed to save patient.', 'error');
    }
  });

  window.editPatient = function (no) {
    const p = patients.find((x) => x.no === no);
    if (!p) return;
    document.getElementById('editPatientNo').value = no;
    document.getElementById('patientModalTitle').textContent = 'Edit Patient';
    document.getElementById('patientSubmitBtn').textContent = 'Save Changes';
    document.getElementById('pName').value = p.name;
    document.getElementById('pDob').value = p.dob;
    document.getElementById('pAdmitted').value = p.admitted;
    document.getElementById('pDischarged').value = p.discharged || '';
    document.getElementById('pWard').value = p.ward;
    populateBeds();
    document.getElementById('pBed').value = p.bed;
    document.getElementById('pDoctor').value = p.doctor;
    document.getElementById('pConsultant').value = p.consultant;
    openModal('patientModal');
  };

  window.deletePatient = function (no, name) {
    deleteTarget = no;
    document.getElementById('deletePatientName').textContent = name;
    openModal('deleteModal');
  };

  document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
    if (!deleteTarget) return;
    try {
      await API.del('api/patients.php', { no: deleteTarget });
      closeModal('deleteModal');
      showToast('Patient removed.');
      deleteTarget = null;
      await loadAll();
    } catch (error) {
      showToast(error.message || 'Failed to delete patient.', 'error');
    }
  });

  document.getElementById('addPatientBtn').addEventListener('click', resetForm);
  document.getElementById('pAdmitted').value = new Date().toISOString().split('T')[0];
  loadAll();

  LiveSync.start({
    intervalMs: 1000,
    fetchData: fetchSnapshot,
    applyData: applySnapshot,
    render
  });
})();
