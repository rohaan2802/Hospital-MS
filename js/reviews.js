/* Reviews page (SQL-backed) */
(function(){
  const ROWS=10; let page=1; let filtered=[]; let deleteTarget=null;
  let reviews = [];
  let meta = { consultants: [], doctors: [] };

  const revFilter=document.getElementById('reviewerFilter');
  const rReviewer=document.getElementById('rReviewer');
  const rDoctor=document.getElementById('rDoctor');
  function populateMeta() {
    revFilter.innerHTML = '<option value="">All Consultants</option>';
    rReviewer.innerHTML = '';
    rDoctor.innerHTML = '';
    meta.consultants.forEach(c=>{
      revFilter.innerHTML+=`<option value="${c.staff_no}">${c.staff_name}</option>`;
      rReviewer.innerHTML+=`<option value="${c.staff_no}">${c.staff_name} — ${c.specialty}</option>`;
    });
    meta.doctors.forEach(d=>{
      rDoctor.innerHTML+=`<option value="${d.staff_no}">${d.staff_name} (${d.position})</option>`;
    });
  }

  document.getElementById('rDate').value=new Date().toISOString().split('T')[0];

  function gradeClass(g){
    if(g.startsWith('A')) return 'grade-A';
    if(g.startsWith('B')) return 'grade-B';
    if(g.startsWith('C')) return 'grade-C';
    return 'grade-D';
  }

  function render(){
    const q=document.getElementById('searchInput').value.toLowerCase();
    const grade=document.getElementById('gradeFilter').value;
    const reviewer=document.getElementById('reviewerFilter').value;

    filtered=reviews.filter(r=>{
      const dname=(r.doctor_name || '').toLowerCase();
      if(q && !dname.includes(q)) return false;
      if(grade && r.grade!==grade) return false;
      if(reviewer && Number(r.reviewer)!==Number(reviewer)) return false;
      return true;
    });

    const total=filtered.length;
    const totalPages=Math.max(1,Math.ceil(total/ROWS));
    page=Math.min(page,totalPages);
    const slice=filtered.slice((page-1)*ROWS,page*ROWS);
    const tbody=document.getElementById('reviewsTbody');

    if(!slice.length){
      tbody.innerHTML=`<tr><td colspan="5"><div class="empty-state"><p>No reviews found</p></div></td></tr>`;
    } else {
      tbody.innerHTML=slice.map(r=>{
        const doctorName=r.doctor_name;
        const reviewerName=r.reviewer_name;
        const gc=gradeClass(r.grade);
        return `<tr>
          <td><span class="name">${doctorName}</span></td>
          <td style="color:var(--text-2)">${reviewerName}</td>
          <td style="color:var(--text-2)">${r.date}</td>
          <td><span class="badge ${gc}" style="font-size:0.9rem;font-weight:700">${r.grade}</span></td>
          <td><div class="row-actions">
            <button class="icon-btn edit" onclick="editReview(${r.id})"><svg viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" stroke="currentColor" stroke-width="2"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" stroke="currentColor" stroke-width="2"/></svg></button>
            <button class="icon-btn del" onclick="deleteReview(${r.id})"><svg viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="currentColor" stroke-width="2"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" stroke="currentColor" stroke-width="2"/></svg></button>
          </div></td>
        </tr>`;
      }).join('');
    }

    const pg=document.getElementById('reviewsPagination');
    pg.innerHTML=`<span class="pg-info">${Math.min((page-1)*ROWS+1,total)}–${Math.min(page*ROWS,total)} of ${total}</span>`;
    pg.innerHTML+=`<button class="pg-btn" onclick="reviewPage(${page-1})" ${page===1?'disabled':''}>‹</button>`;
    for(let i=1;i<=totalPages;i++) pg.innerHTML+=`<button class="pg-btn ${i===page?'active':''}" onclick="reviewPage(${i})">${i}</button>`;
    pg.innerHTML+=`<button class="pg-btn" onclick="reviewPage(${page+1})" ${page===totalPages?'disabled':''}>›</button>`;
  }

  window.reviewPage=p=>{page=p;render();};
  ['searchInput','gradeFilter','reviewerFilter'].forEach(id=>document.getElementById(id).addEventListener('input',()=>{page=1;render();}));

  document.getElementById('reviewForm').addEventListener('submit', async e=>{
    e.preventDefault();
    const editId=+document.getElementById('editReviewId').value;
    const data={
      doctor:+document.getElementById('rDoctor').value,
      reviewer:+document.getElementById('rReviewer').value,
      date:document.getElementById('rDate').value,
      grade:document.getElementById('rGrade').value
    };
    try {
      if(editId){
        data.id = editId;
        await API.put('api/reviews.php', data);
        showToast('Review updated.');
      } else {
        await API.post('api/reviews.php', data);
        showToast('Review saved.');
      }
      closeModal('reviewModal');
      resetReviewForm();
      await loadData();
      render();
    } catch (error) {
      showToast(error.message || 'Failed to save review.', 'error');
    }
  });

  function resetReviewForm(){
    document.getElementById('editReviewId').value='';
    document.getElementById('reviewModalTitle').textContent='New Review';
    document.getElementById('reviewSubmitBtn').textContent='Save Review';
    document.getElementById('reviewForm').reset();
    document.getElementById('rDate').value=new Date().toISOString().split('T')[0];
  }

  window.editReview=function(id){
    const r=reviews.find(x=>Number(x.id)===Number(id));
    if(!r) return;
    document.getElementById('editReviewId').value=id;
    document.getElementById('reviewModalTitle').textContent='Edit Review';
    document.getElementById('reviewSubmitBtn').textContent='Save Changes';
    document.getElementById('rDoctor').value=r.doctor;
    document.getElementById('rReviewer').value=r.reviewer;
    document.getElementById('rDate').value=r.date;
    document.getElementById('rGrade').value=r.grade;
    openModal('reviewModal');
  };

  window.deleteReview=function(id){
    deleteTarget=id;
    openModal('deleteReviewModal');
  };

  document.getElementById('confirmDeleteReviewBtn').addEventListener('click', async ()=>{
    if(!deleteTarget) return;
    try {
      await API.del('api/reviews.php', { id: deleteTarget });
      closeModal('deleteReviewModal');
      showToast('Review deleted.');
      deleteTarget=null;
      await loadData();
      render();
    } catch (error) {
      showToast(error.message || 'Failed to delete review.', 'error');
    }
  });

  // Reset form on open
  document.querySelector('[onclick="openModal(\'reviewModal\')"]')?.addEventListener('click', resetReviewForm);

  async function fetchSnapshot() {
    const list = await API.get('api/reviews.php');
    const metaInfo = await API.get('api/reviews.php?meta=1');
    return { list, metaInfo };
  }

  function applySnapshot(snapshot) {
    reviews = snapshot.list;
    meta = snapshot.metaInfo;
    populateMeta();
  }

  async function loadData(){
    applySnapshot(await fetchSnapshot());
  }

  loadData().then(render).catch(e=>showToast(e.message || 'Failed to load reviews.','error'));

  LiveSync.start({
    intervalMs: 1000,
    fetchData: fetchSnapshot,
    applyData: applySnapshot,
    render
  });
})();
