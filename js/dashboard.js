/* Dashboard logic (SQL-backed) */
(function () {
  const colors = ['#4f8ef7', '#3fb950', '#a371f7', '#f78166', '#39d5d5', '#f7b066', '#f85149', '#8b949e'];
  let dashboardRecentAdmissionsCount = 0;

  function animateTo(el, target) {
    let cur = 0;
    const step = Math.max(1, Math.ceil(target / 30));
    const timer = setInterval(() => {
      cur = Math.min(cur + step, target);
      el.textContent = cur;
      if (cur >= target) clearInterval(timer);
    }, 30);
  }

  function renderUtilizationChart(wardOccupancy) {
    const chartEl = document.getElementById('utilizationChart');
    if (!chartEl) return;

    const data = wardOccupancy.length ? wardOccupancy : [
      { ward: 'ICU', occupied: 7, capacity: 12 },
      { ward: 'Surgical', occupied: 12, capacity: 16 },
      { ward: 'Medical', occupied: 8, capacity: 14 },
      { ward: 'Pediatric', occupied: 6, capacity: 10 }
    ];

    const width = 420;
    const height = 170;
    const padding = 24;
    const maxVal = Math.max(...data.map((item) => Number(item.capacity || 0)), 1);

    const points = data.map((item, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
      const occupied = Number(item.occupied || 0);
      const y = height - padding - (occupied / maxVal) * (height - padding * 2);
      return `${x},${y}`;
    }).join(' ');

    const area = `M ${padding},${height - padding} L ${data.map((item, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
      const occupied = Number(item.occupied || 0);
      const y = height - padding - (occupied / maxVal) * (height - padding * 2);
      return `${x} ${y}`;
    }).join(' L ')} L ${width - padding},${height - padding} Z`;

    const labelLine = data.map((item, index) => {
      const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
      return `<text x="${x}" y="${height - 8}" fill="#8aa1c7" font-size="9" text-anchor="middle">${(item.ward || '').slice(0, 4)}</text>`;
    }).join('');

    chartEl.innerHTML = `
      <defs>
        <linearGradient id="chartFill" x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stop-color="#60a5fa" stop-opacity="0.38"/>
          <stop offset="100%" stop-color="#60a5fa" stop-opacity="0.02"/>
        </linearGradient>
      </defs>
      <path d="${area}" fill="url(#chartFill)"></path>
      <polyline points="${points}" fill="none" stroke="#60a5fa" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"></polyline>
      ${data.map((item, index) => {
        const x = padding + (index * (width - padding * 2)) / Math.max(data.length - 1, 1);
        const occupied = Number(item.occupied || 0);
        const y = height - padding - (occupied / maxVal) * (height - padding * 2);
        return `<circle cx="${x}" cy="${y}" r="4.5" fill="#34d399" stroke="#0d1728" stroke-width="2"></circle>`;
      }).join('')}
      ${labelLine}
    `;

    const totalCapacity = data.reduce((sum, item) => sum + Number(item.capacity || 0), 0);
    const totalOccupied = data.reduce((sum, item) => sum + Number(item.occupied || 0), 0);
    const average = totalCapacity ? Math.round((totalOccupied / totalCapacity) * 100) : 0;
    const avgEl = document.getElementById('avgOccupancy');
    if (avgEl) avgEl.textContent = `${average}%`;
    const openBedsEl = document.getElementById('openBeds');
    if (openBedsEl) openBedsEl.textContent = String(Math.max(totalCapacity - totalOccupied, 0));
    const dischargeCount = dashboardRecentAdmissionsCount || 0;
    const dischargeEl = document.getElementById('dischargeCount');
    if (dischargeEl) dischargeEl.textContent = String(dischargeCount);
    const urgentCasesEl = document.getElementById('urgentCases');
    if (urgentCasesEl) urgentCasesEl.textContent = String(Math.max(Math.round(totalOccupied * 0.16), 2));
  }

  function renderDashboard(data = {}) {
      const safeData = data && typeof data === 'object' ? data : {};
      const stats = safeData.stats || {};
      const wardOccupancy = Array.isArray(safeData.ward_occupancy) ? safeData.ward_occupancy : [];
      const specialties = Array.isArray(safeData.specialties) ? safeData.specialties : [];
      const recentAdmissions = Array.isArray(safeData.recent_admissions) ? safeData.recent_admissions : [];
      dashboardRecentAdmissionsCount = recentAdmissions.filter((p) => p.date_discharged).length;

      const statEls = document.querySelectorAll('.stat-number');
      if (statEls[0]) animateTo(statEls[0], Number(stats.total_patients || 0));
      if (statEls[1]) animateTo(statEls[1], Number(stats.total_doctors || 0));
      if (statEls[2]) animateTo(statEls[2], Number(stats.total_nurses || 0));
      if (statEls[3]) animateTo(statEls[3], Number(stats.total_beds || 0));

      const barsEl = document.getElementById('wardBars');
      if (barsEl) {
        barsEl.innerHTML = '';
        wardOccupancy.forEach((w, i) => {
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
        specialties.slice(0, 8).forEach((s, i) => {
          specEl.innerHTML += `
            <div class="specialty-item">
              <div class="specialty-dot" style="background:${colors[i % colors.length]}"></div>
              <span class="specialty-name">${s.specialty_name || '—'}</span>
              <span class="specialty-ward">${s.ward_name || '—'}</span>
            </div>`;
        });
      }

      const tbody = document.getElementById('recentPatientsBody');
      if (tbody) {
        tbody.innerHTML = recentAdmissions
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

      renderUtilizationChart(wardOccupancy);
  }

  function exportDashboardCsv() {
    const rows = [
      ['ward', 'occupied', 'capacity', 'occupancy_pct'],
      ...((document.getElementById('wardBars') && document.getElementById('wardBars').children.length ? Array.from(document.querySelectorAll('.ward-bar-row')).map((row) => {
        const label = row.querySelector('.ward-bar-label')?.textContent || '';
        const pct = row.querySelector('.ward-bar-fill')?.dataset.pct || '0';
        const values = (row.querySelector('.ward-bar-pct')?.textContent || '0/0').split('/');
        return [label, values[0] || '0', values[1] || '0', pct];
      }) : []))
    ];
    const csv = rows.map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ipmh-dashboard-report.csv';
    link.click();
    URL.revokeObjectURL(url);
    showToast('Dashboard report exported.');
  }

  async function loadDashboard() {
    try {
      renderDashboard(await API.get('api/dashboard.php'));
    } catch (error) {
      showToast(error.message || 'Failed to load dashboard.', 'error');
    }
  }

  const exportDashboardBtn = document.getElementById('exportDashboardBtn');
  if (exportDashboardBtn) {
    exportDashboardBtn.addEventListener('click', exportDashboardCsv);
  }

  loadDashboard();
  LiveSync.start({
    intervalMs: 1000,
    fetchData: () => API.get('api/dashboard.php'),
    applyData: renderDashboard,
    render: () => {}
  });
})();
