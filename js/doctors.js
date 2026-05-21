/* Doctors page logic (SQL-backed) */
(function () {
  const ROWS = 8; let page = 1; let filtered = []; let deleteTarget = null;
  const avatarColors = ['avatar-blue', 'avatar-green', 'avatar-purple', 'avatar-orange'];
  let doctors = [];
  let consultants = [];
  const dCons = document.getElementById('dConsultant');

  function populateConsultants() {
    dCons.innerHTML = '<option value="">None (is consultant)</option>';
    consultants.forEach((c) => {
      dCons.innerHTML += `<option value="${c.staff_no}">${c.staff_name} — ${c.specialty}</option>`;
    });
  }

  function render(){
    const q = document.getElementById('searchInput').value.toLowerCase();
    const pos = document.getElementById('posFilter').value;
    const type = document.getElementById('typeFilter').value;

    filtered = doctors.filter(d=>{
      const name = d.name.toLowerCase();
      if(q && !name.includes(q)) return false;
      if(pos && d.position !== pos) return false;
      if(type==='consultant' && !Number(d.is_consultant)) return false;
      if(type==='doctor' && Number(d.is_consultant)) return false;
      return true;
    });

    const total = filtered.length;
    const totalPages = Math.max(1,Math.ceil(total/ROWS));
    page = Math.min(page,totalPages);
    const slice = filtered.slice((page-1)*ROWS, page*ROWS);
    const tbody = document.getElementById('doctorsTbody');

    if(!slice.length){
      tbody.innerHTML=`<tr><td colspan="7"><div class="empty-state"><p>No doctors found</p></div></td></tr>`;
    } else {
      tbody.innerHTML = slice.map(d=>{
        const name = d.name;
        const initials = name.split(' ').filter(x=>x.match(/[A-Z]/)).map(x=>x[0]).slice(0,2).join('');
        const color = avatarColors[d.no % avatarColors.length];
        const isConsultant = Number(d.is_consultant) === 1;
        const typeBadge = isConsultant
          ? `<span class="badge badge-purple">Consultant</span>`
          : `<span class="badge badge-blue">Doctor</span>`;
        const consultantName = d.consultant_name || '—';
        const patientCount = Number(d.patient_count || 0);
        return `<tr>
          <td><div class="avatar-cell"><div class="avatar ${color}">${initials}</div><span class="name">${name}</span></div></td>
          <td><span class="badge badge-orange">${d.position}</span></td>
          <td>${typeBadge}</td>
          <td style="color:var(--text-2)">${consultantName}</td>
          <td style="color:var(--text-2)">${d.joined}</td>
          <td><span class="badge badge-cyan">${patientCount}</span></td>
          <td><div class="row-actions">
            <button class="icon-btn edit" title="Edit" onclick="editDoctor(${d.no})">
              <svg viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/></svg>
            </button>
            <button class="icon-btn del" title="Delete" onclick="deleteDoctor(${d.no},'${name.replace(/'/g,"\\'")}')">
              <svg viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" stroke-width="2"/><path d="M10 11v6M14 11v6" stroke="currentColor" stroke-width="2"/></svg>
            </button>
          </div></td>
        </tr>`;
      }).join('');
    }

    const pg = document.getElementById('pagination');
    pg.innerHTML = `<span class="pg-info">Showing ${Math.min((page-1)*ROWS+1,total)}–${Math.min(page*ROWS,total)} of ${total}</span>`;
    pg.innerHTML += `<button class="pg-btn" onclick="changePage(${page-1})" ${page===1?'disabled':''}>‹</button>`;
    for(let i=1;i<=totalPages;i++) pg.innerHTML+=`<button class="pg-btn ${i===page?'active':''}" onclick="changePage(${i})">${i}</button>`;
    pg.innerHTML += `<button class="pg-btn" onclick="changePage(${page+1})" ${page===totalPages?'disabled':''}>›</button>`;
  }

  window.changePage = p=>{ page=p; render(); };
  ['searchInput','posFilter','typeFilter'].forEach(id=>document.getElementById(id).addEventListener('input',()=>{page=1;render();}));

  window.openAddDoctor = function(){
    document.getElementById('editDoctorNo').value='';
    document.getElementById('doctorModalTitle').textContent='Add Doctor';
    document.getElementById('doctorSubmitBtn').textContent='Add Doctor';
    document.getElementById('doctorForm').reset();
    openModal('doctorModal');
  };

  window.editDoctor = function(no){
    const d = doctors.find(x=>Number(x.no)===Number(no));
    if(!d) return;
    document.getElementById('editDoctorNo').value=no;
    document.getElementById('doctorModalTitle').textContent='Edit Doctor';
    document.getElementById('doctorSubmitBtn').textContent='Save Changes';
    document.getElementById('dName').value=d.name;
    document.getElementById('dPosition').value=d.position;
    document.getElementById('dJoined').value=d.joined;
    document.getElementById('dConsultant').value=d.consultant_no||'';
    openModal('doctorModal');
  };

  document.getElementById('doctorForm').addEventListener('submit', async e=>{
    e.preventDefault();
    const editNo=+document.getElementById('editDoctorNo').value;
    const name=document.getElementById('dName').value.trim();
    const position=document.getElementById('dPosition').value;
    const joined=document.getElementById('dJoined').value;
    const cons=document.getElementById('dConsultant').value || null;

    try {
      if(editNo){
        await API.put('api/doctors.php', { no: editNo, name, position, joined, consultant_no: cons ? Number(cons) : null });
        showToast('Doctor updated.');
      } else {
        await API.post('api/doctors.php', { name, position, joined, consultant_no: cons ? Number(cons) : null });
        showToast('Doctor added.');
      }
      await loadData();
      closeModal('doctorModal');
      render();
    } catch (error) {
      showToast(error.message || 'Failed to save doctor.', 'error');
    }
  });

  window.deleteDoctor = function(no,name){
    deleteTarget=no;
    document.getElementById('deleteDoctorName').textContent=name;
    openModal('deleteDoctorModal');
  };

  document.getElementById('confirmDeleteDoctorBtn').addEventListener('click', async ()=>{
    if(!deleteTarget) return;
    try {
      await API.del('api/doctors.php', { no: deleteTarget });
      closeModal('deleteDoctorModal');
      showToast('Doctor removed.');
      deleteTarget = null;
      await loadData();
      render();
    } catch (error) {
      showToast(error.message || 'Failed to delete doctor.', 'error');
    }
  });

  async function fetchSnapshot() {
    const list = await API.get('api/doctors.php');
    const meta = await API.get('api/doctors.php?meta=1');
    return { list, consultants: meta.consultants || [] };
  }

  function applySnapshot(snapshot) {
    doctors = snapshot.list;
    consultants = snapshot.consultants;
    populateConsultants();
  }

  async function loadData(){
    applySnapshot(await fetchSnapshot());
  }

  loadData().then(render).catch((e)=>showToast(e.message || 'Failed to load doctors.','error'));

  LiveSync.start({
    intervalMs: 1000,
    fetchData: fetchSnapshot,
    applyData: applySnapshot,
    render
  });
})();
