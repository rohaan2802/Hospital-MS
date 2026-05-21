/* Nurses page (SQL-backed) */
(function(){
  const ROWS=10; let page=1; let filtered=[]; let deleteTarget=null;
  const typeColors={'Day Sister':'badge-blue','Night Sister':'badge-purple','Staff Nurse':'badge-green','Non-Registered':'badge-orange'};
  const avatarColors=['avatar-blue','avatar-green','avatar-purple','avatar-orange'];
  let nurses = [];
  let wards = [];
  let careUnits = [];

  const wardFilter=document.getElementById('wardFilter');
  const nWard=document.getElementById('nWard');
  function populateMeta(){
    wardFilter.innerHTML = '<option value="">All Wards</option>';
    nWard.innerHTML = '';
    wards.forEach(w=>{
      wardFilter.innerHTML+=`<option value="${w.ward_name}">${w.ward_name}</option>`;
      nWard.innerHTML+=`<option value="${w.ward_name}">${w.ward_name}</option>`;
    });
  }

  function render(){
    const q=document.getElementById('searchInput').value.toLowerCase();
    const ward=wardFilter.value;
    const type=document.getElementById('typeFilter').value;
    filtered=nurses.filter(n=>{
      const name=n.name.toLowerCase();
      if(q && !name.includes(q)) return false;
      if(ward && n.ward!==ward) return false;
      if(type && n.type!==type) return false;
      return true;
    });
    const total=filtered.length;
    const totalPages=Math.max(1,Math.ceil(total/ROWS));
    page=Math.min(page,totalPages);
    const slice=filtered.slice((page-1)*ROWS,page*ROWS);
    const tbody=document.getElementById('nursesTbody');
    if(!slice.length){
      tbody.innerHTML=`<tr><td colspan="5"><div class="empty-state"><p>No nurses found</p></div></td></tr>`;
    } else {
      tbody.innerHTML=slice.map(n=>{
        const name=n.name;
        const initials=name.split(' ').filter(x=>/[A-Z]/.test(x[0])).map(x=>x[0]).slice(0,2).join('');
        const color=avatarColors[n.no%avatarColors.length];
        const badge=typeColors[n.type]||'badge-blue';
        const unit=n.unit?`Unit ${n.unit}`:'—';
        return `<tr>
          <td><div class="avatar-cell"><div class="avatar ${color}">${initials}</div><span class="name">${name}</span></div></td>
          <td><span class="badge ${badge}">${n.type}</span></td>
          <td>${n.ward}</td>
          <td style="color:var(--text-2)">${unit}</td>
          <td><div class="row-actions">
            <button class="icon-btn edit" onclick="editNurse(${n.no})"><svg viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/></svg></button>
            <button class="icon-btn del" onclick="deleteNurse(${n.no},'${name.replace(/'/g,"\\'")}')"><svg viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" stroke-width="2"/></svg></button>
          </div></td>
        </tr>`;
      }).join('');
    }
    const pg=document.getElementById('pagination');
    pg.innerHTML=`<span class="pg-info">${Math.min((page-1)*ROWS+1,total)}–${Math.min(page*ROWS,total)} of ${total}</span>`;
    pg.innerHTML+=`<button class="pg-btn" onclick="changePage(${page-1})" ${page===1?'disabled':''}>‹</button>`;
    for(let i=1;i<=totalPages;i++) pg.innerHTML+=`<button class="pg-btn ${i===page?'active':''}" onclick="changePage(${i})">${i}</button>`;
    pg.innerHTML+=`<button class="pg-btn" onclick="changePage(${page+1})" ${page===totalPages?'disabled':''}>›</button>`;
  }

  window.changePage=p=>{page=p;render();};
  ['searchInput','wardFilter','typeFilter'].forEach(id=>document.getElementById(id).addEventListener('input',()=>{page=1;render();}));

  function unitByWard(ward){
    const cu = careUnits.find(u=>u.ward_name===ward);
    return cu ? Number(cu.care_unit_no) : null;
  }

  document.getElementById('nurseForm').addEventListener('submit', async e=>{
    e.preventDefault();
    const editNo=+document.getElementById('editNurseNo').value;
    const name=document.getElementById('nName').value.trim();
    const type=document.getElementById('nType').value;
    const ward=document.getElementById('nWard').value;
    const unit=unitByWard(ward);
    try {
      if(editNo){
        await API.put('api/nurses.php', { no: editNo, name, type, ward, unit });
        showToast('Nurse updated.');
      } else {
        await API.post('api/nurses.php', { name, type, ward, unit });
        showToast('Nurse added.');
      }
      await loadData();
      closeModal('nurseModal');
      render();
    } catch (error) {
      showToast(error.message || 'Failed to save nurse.', 'error');
    }
  });

  window.editNurse=function(no){
    const n=nurses.find(x=>Number(x.no)===Number(no));
    if(!n) return;
    document.getElementById('editNurseNo').value=no;
    document.getElementById('nurseModalTitle').textContent='Edit Nurse';
    document.getElementById('nurseSubmitBtn').textContent='Save Changes';
    document.getElementById('nName').value=n.name;
    document.getElementById('nType').value=n.type;
    document.getElementById('nWard').value=n.ward;
    openModal('nurseModal');
  };

  window.deleteNurse=function(no,name){
    deleteTarget=no;
    document.getElementById('deleteNurseName').textContent=name;
    openModal('deleteNurseModal');
  };

  document.getElementById('confirmDeleteNurseBtn').addEventListener('click', async ()=>{
    if(!deleteTarget) return;
    try {
      await API.del('api/nurses.php', { no: deleteTarget });
      closeModal('deleteNurseModal');
      showToast('Nurse removed.');
      deleteTarget=null;
      await loadData();
      render();
    } catch (error) {
      showToast(error.message || 'Failed to delete nurse.', 'error');
    }
  });

  async function fetchSnapshot() {
    const list = await API.get('api/nurses.php');
    const meta = await API.get('api/nurses.php?meta=1');
    return { list, wards: meta.wards || [], careUnits: meta.care_units || [] };
  }

  function applySnapshot(snapshot) {
    nurses = snapshot.list;
    wards = snapshot.wards;
    careUnits = snapshot.careUnits;
    populateMeta();
  }

  async function loadData(){
    applySnapshot(await fetchSnapshot());
  }

  loadData().then(render).catch(e=>showToast(e.message || 'Failed to load nurses.','error'));

  LiveSync.start({
    intervalMs: 1000,
    fetchData: fetchSnapshot,
    applyData: applySnapshot,
    render
  });
})();
