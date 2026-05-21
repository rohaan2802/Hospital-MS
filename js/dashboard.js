/* Dashboard logic (SQL-backed) */
(function () {
  const colors = ['#4f8ef7', '#3fb950', '#a371f7', '#f78166', '#39d5d5', '#f7b066', '#f85149', '#8b949e'];

  function animateTo(el, target) {
    let cur = 0;
    const step = Math.max(1, Math.ceil(target / 30));
    const timer = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = cur;
      if (cur >= target) clearInterval(timer);
    }, 30);
  }

  function renderDashboard(data) {
      const stats = data.stats || {};

      const statEls = document.querySelectorAll('.stat-number');
      if (statEls[0]) animateTo(statEls[0], Number(stats.total_patients || 0));
      if (statEls[1]) animateTo(statEls[1], Number(stats.total_doctors || 0));
      if (statEls[2]) animateTo(statEls[2], Number(stats.total_nurses || 0));
      if (statEls[3]) animateTo(statEls[3], Number(stats.total_beds || 0));

      const barsEl = document.getElementById('wardBars');
      if (barsEl) {
        barsEl.innerHTML = '';
        data.ward_occupancy.forEach((w, i) => {
          const capacity = Number(w.capacity || 0);
          const occupied = Number(w.occupied || 0);
          const pct = capacity ? Math.round((occupied / capacity) * 100) : 0;
          const color = colors[i % colors.length];
          barsEl.innerHTML += `
            <div class="ward-bar-row">
              <span class="ward-bar-label">${w.ward}</span>
              <div class="ward-bar-track">
                <div class="ward-bar-fill" style="width:0%;background:${color}" data-pct="${pct}"></div>
              </div>
              <span class="ward-bar-pct">${occupied}/${capacity}</span>
            </div>`;
        });
        setTimeout(() => {
          document.querySelectorAll('.ward-bar-fill').forEach((el) => {
            el.style.width = `${el.dataset.pct}%`;
          });
        }, 100);
      }

      const specEl = document.getElementById('specialtyList');
      if (specEl) {
        specEl.innerHTML = '';
        data.specialties.slice(0, 8).forEach((s, i) => {
          specEl.innerHTML += `
            <div class="specialty-item">
              <div class="specialty-dot" style="background:${colors[i % colors.length]}"></div>
              <span class="specialty-name">${s.specialty_name}</span>
              <span class="specialty-ward">${s.ward_name || '—'}</span>
            </div>`;
        });
      }

      const tbody = document.getElementById('recentPatientsBody');
      if (tbody) {
        tbody.innerHTML = data.recent_admissions
          .map((p) => {
            const status = p.date_discharged
              ? `<span class="badge badge-green">Discharged</span>`
              : `<span class="badge badge-blue">Admitted</span>`;
            return `<tr>
              <td><span class="name">${p.patient_name}</span></td>
              <td>${p.ward_name}</td>
              <td>${p.date_admitted}</td>
              <td>${status}</td>
            </tr>`;
          })
          .join('');
      }
  }

  async function loadDashboard() {
    try {
      renderDashboard(await API.get('api/dashboard.php'));
    } catch (error) {
      showToast(error.message || 'Failed to load dashboard.', 'error');
    }
  }

  loadDashboard();
  LiveSync.start({
    intervalMs: 1000,
    fetchData: () => API.get('api/dashboard.php'),
    applyData: renderDashboard,
    render: () => {}
  });
})();
