/* Complaints & Treatments page (SQL-backed) */
(function(){
  const ROWS=10; let page=1; let filtered=[];
  let records = [];
  let meta = { patients: [], complaints: [], treatments: [], doctors: [] };
  let lookup = { complaints: [], treatments: [] };

  function fillMeta() {
    const cf=document.getElementById('complaintFilter');
    cf.innerHTML = '<option value="">All Complaints</option>';
    const pctPatient = document.getElementById('pctPatient');
    const pctComplaint = document.getElementById('pctComplaint');
    const pctTreatment = document.getElementById('pctTreatment');
    const pctDoctor = document.getElementById('pctDoctor');
    pctPatient.innerHTML = '';
    pctComplaint.innerHTML = '';
    pctTreatment.innerHTML = '';
    pctDoctor.innerHTML = '';

    meta.complaints.forEach(c=>{
      cf.innerHTML+=`<option value="${c.complaint_code}">${c.complaint_desc}</option>`;
      pctComplaint.innerHTML+=`<option value="${c.complaint_code}">${c.complaint_code} — ${c.complaint_desc}</option>`;
    });
    meta.patients.forEach(p=>{ pctPatient.innerHTML+=`<option value="${p.patient_no}">${p.patient_name}</option>`; });
    meta.treatments.forEach(t=>{ pctTreatment.innerHTML+=`<option value="${t.treatment_code}">${t.treatment_code} — ${t.treatment_desc}</option>`; });
    meta.doctors.forEach(d=>{ pctDoctor.innerHTML+=`<option value="${d.staff_no}">${d.staff_name}</option>`; });
    document.getElementById('pctStarted').value=new Date().toISOString().split('T')[0];
  }

  window.switchTab=function(tab){
    ['records','complaints','treatments'].forEach(t=>{
      document.getElementById('panel'+t.charAt(0).toUpperCase()+t.slice(1)).style.display=t===tab?'':'none';
      const btn=document.getElementById('tab'+t.charAt(0).toUpperCase()+t.slice(1));
      btn.className=t===tab?'btn btn-primary btn-sm':'btn btn-ghost btn-sm';
    });
    if(tab==='complaints') renderComplaintsLookup();
    if(tab==='treatments') renderTreatmentsLookup();
  };

  function renderComplaintsLookup(){
    document.getElementById('complaintsTbody').innerHTML=lookup.complaints.map(c=>{
      return `<tr><td><span class="badge badge-blue">${c.complaint_code}</span></td><td class="name">${c.complaint_desc}</td><td><span class="badge badge-orange">${c.occurrences}</span></td></tr>`;
    }).join('');
  }

  function renderTreatmentsLookup(){
    document.getElementById('treatmentsTbody').innerHTML=lookup.treatments.map(t=>{
      return `<tr><td><span class="badge badge-purple">${t.treatment_code}</span></td><td class="name">${t.treatment_desc}</td><td><span class="badge badge-orange">${t.times_used}</span></td></tr>`;
    }).join('');
  }

  function render(){
    const q=document.getElementById('searchInput').value.toLowerCase();
    const comp=document.getElementById('complaintFilter').value;
    const status=document.getElementById('statusFilter').value;

    filtered=records.filter(r=>{
      if(q && !r.patient_name.toLowerCase().includes(q)) return false;
      if(comp && r.complaint!==comp) return false;
      if(status==='ongoing' && r.ended) return false;
      if(status==='ended' && !r.ended) return false;
      return true;
    });

    const total=filtered.length;
    const totalPages=Math.max(1,Math.ceil(total/ROWS));
    page=Math.min(page,totalPages);
    const slice=filtered.slice((page-1)*ROWS,page*ROWS);
    const tbody=document.getElementById('pctTbody');

    if(!slice.length){
      tbody.innerHTML=`<tr><td colspan="8"><div class="empty-state"><p>No records found</p></div></td></tr>`;
    } else {
      tbody.innerHTML=slice.map(r=>{
        const statusBadge=r.ended
          ?`<span class="badge badge-green">Ended</span>`
          :`<span class="badge badge-orange">Ongoing</span>`;
        return `<tr>
          <td><span class="name">${r.patient_name||'—'}</span></td>
          <td><span class="badge badge-blue">${r.complaint}</span><br><small style="color:var(--text-3)">${r.complaint_desc}</small></td>
          <td><span class="badge badge-purple">${r.treatment}</span><br><small style="color:var(--text-3)">${r.treatment_desc}</small></td>
          <td style="color:var(--text-2)">${r.doctor_name}</td>
          <td style="color:var(--text-2)">${r.started}</td>
          <td style="color:var(--text-2)">${r.ended||'—'}</td>
          <td>${statusBadge}</td>
          <td><button class="icon-btn del" onclick="deletePct(${r.patient},'${r.complaint}','${r.treatment}','${r.started}')"><svg viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" stroke-width="2"/></svg></button></td>
        </tr>`;
      }).join('');
    }

    const pg=document.getElementById('pctPagination');
    pg.innerHTML=`<span class="pg-info">${Math.min((page-1)*ROWS+1,total)}–${Math.min(page*ROWS,total)} of ${total}</span>`;
    pg.innerHTML+=`<button class="pg-btn" onclick="pctPage(${page-1})" ${page===1?'disabled':''}>‹</button>`;
    for(let i=1;i<=totalPages;i++) pg.innerHTML+=`<button class="pg-btn ${i===page?'active':''}" onclick="pctPage(${i})">${i}</button>`;
    pg.innerHTML+=`<button class="pg-btn" onclick="pctPage(${page+1})" ${page===totalPages?'disabled':''}>›</button>`;
  }

  window.pctPage=p=>{page=p;render();};
  ['searchInput','complaintFilter','statusFilter'].forEach(id=>document.getElementById(id).addEventListener('input',()=>{page=1;render();}));

  window.deletePct=async function(patient,complaint,treatment,started){
    try {
      await API.del('api/complaints.php', { patient, complaint, treatment, started });
      showToast('Record deleted.');
      await loadData();
      render();
    } catch (error) {
      showToast(error.message || 'Failed to delete record.', 'error');
    }
  };

  document.getElementById('pctForm').addEventListener('submit', async e=>{
    e.preventDefault();
    const payload = {
      patient:+document.getElementById('pctPatient').value,
      complaint:document.getElementById('pctComplaint').value,
      treatment:document.getElementById('pctTreatment').value,
      started:document.getElementById('pctStarted').value,
      doctor:+document.getElementById('pctDoctor').value,
      ended:document.getElementById('pctEnded').value||null
    };
    try {
      await API.post('api/complaints.php', payload);
      closeModal('pctModal');
      showToast('Treatment logged.');
      await loadData();
      render();
    } catch (error) {
      showToast(error.message || 'Failed to log treatment.', 'error');
    }
  });

  async function fetchSnapshot() {
    const list = await API.get('api/complaints.php');
    const metaInfo = await API.get('api/complaints.php?meta=1');
    const lookupInfo = await API.get('api/complaints.php?lookup=1');
    return { list, metaInfo, lookupInfo };
  }

  function applySnapshot(snapshot) {
    records = snapshot.list;
    meta = snapshot.metaInfo;
    lookup = snapshot.lookupInfo;
    fillMeta();
  }

  async function loadData(){
    applySnapshot(await fetchSnapshot());
  }

  loadData().then(render).catch(e=>showToast(e.message || 'Failed to load complaint records.','error'));

  LiveSync.start({
    intervalMs: 1000,
    fetchData: fetchSnapshot,
    applyData: applySnapshot,
    render
  });
})();
