/* Wards page (SQL-backed) */
(function(){
  const colors=['#4f8ef7','#3fb950','#a371f7','#f78166','#39d5d5','#f7b066','#f85149','#8b949e','#58a6ff','#bc8cff'];

  function renderWards(data) {
      const occupiedMap = new Map();
      data.occupied.forEach(o => occupiedMap.set(Number(o.bed_no), o.patient_name));
      const grid = document.getElementById('wardsGrid');
      grid.innerHTML = '';

      data.wards.forEach((w,i)=>{
        const wardBeds = data.beds.filter(b=>b.ward_name===w.ward_name);
        const occCount = wardBeds.filter(b=>occupiedMap.has(Number(b.bed_no))).length;
        const freeCount = wardBeds.length - occCount;
        const pct = wardBeds.length ? Math.round(occCount/wardBeds.length*100) : 0;
        const color = colors[i % colors.length];

        const bedHtml = wardBeds.map(b=>{
          const bedNo = Number(b.bed_no);
          const occ = occupiedMap.has(bedNo);
          const patient = occupiedMap.get(bedNo);
          const tip = patient ? patient : `Bed ${bedNo} — Free`;
          return `<div class="bed-chip ${occ?'bed-occupied':'bed-free'}" title="${tip}">B${bedNo}</div>`;
        }).join('');

        grid.innerHTML += `
          <div class="ward-card">
            <div class="ward-card-header">
              <div>
                <div class="ward-name">${w.ward_name}</div>
                <div class="ward-specialty">${w.specialty_name}</div>
              </div>
              <span class="badge" style="background:${color}22;color:${color}">Unit ${w.care_unit_no || '—'}</span>
            </div>
            <div class="ward-stats">
              <div class="ward-stat"><div class="ws-num" style="color:${color}">${wardBeds.length}</div><div class="ws-label">Total Beds</div></div>
              <div class="ward-stat"><div class="ws-num" style="color:var(--red)">${occCount}</div><div class="ws-label">Occupied</div></div>
              <div class="ward-stat"><div class="ws-num" style="color:var(--green)">${freeCount}</div><div class="ws-label">Available</div></div>
            </div>
            <div class="beds-grid">${bedHtml||'<span style="color:var(--text-3);font-size:.8rem">No beds assigned</span>'}</div>
            <div class="ward-footer">
              <span style="font-size:.72rem;color:var(--text-3)">${pct}% full</span>
              <div class="occ-bar-track"><div class="occ-bar-fill" style="width:${pct}%;background:${color}"></div></div>
              <span style="font-size:.7rem;color:var(--text-3)" title="In-charge nurse">${(w.in_charge_name || '—').split(' ').pop()}</span>
            </div>
          </div>`;
      });
  }

  async function load() {
    try {
      renderWards(await API.get('api/wards.php'));
    } catch (error) {
      showToast(error.message || 'Failed to load wards.', 'error');
    }
  }

  load();
  LiveSync.start({
    intervalMs: 1000,
    fetchData: () => API.get('api/wards.php'),
    applyData: renderWards,
    render: () => {}
  });
})();
