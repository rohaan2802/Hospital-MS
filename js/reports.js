/* Required reports page (12 assignment queries) */
(function () {
  const queryNo = document.getElementById('queryNo');
  const doctorNo = document.getElementById('doctorNo');
  const patientNo = document.getElementById('patientNo');
  const complaintCode = document.getElementById('complaintCode');
  const fromDate = document.getElementById('fromDate');
  const toDate = document.getElementById('toDate');
  const head = document.getElementById('reportHead');
  const body = document.getElementById('reportBody');

  function toHeader(label) {
    return label.replace(/_/g, ' ').replace(/\b\w/g, (m) => m.toUpperCase());
  }

  function renderRows(rows) {
    if (!rows.length) {
      head.innerHTML = '';
      body.innerHTML = '<tr><td><div class="empty-state"><p>No records returned</p></div></td></tr>';
      return;
    }

    const cols = Object.keys(rows[0]);
    head.innerHTML = `<tr>${cols.map((c) => `<th>${toHeader(c)}</th>`).join('')}</tr>`;
    body.innerHTML = rows
      .map((row) => `<tr>${cols.map((c) => `<td>${row[c] ?? ''}</td>`).join('')}</tr>`)
      .join('');
  }

  async function fetchCurrentRows() {
    const params = new URLSearchParams();
    params.set('q', queryNo.value);
    if (doctorNo.value) params.set('doctor_no', doctorNo.value);
    if (patientNo.value) params.set('patient_no', patientNo.value);
    if (complaintCode.value) params.set('complaint_code', complaintCode.value.trim());
    if (fromDate.value) params.set('from_date', fromDate.value);
    if (toDate.value) params.set('to_date', toDate.value);
    return API.get(`api/reports.php?${params.toString()}`);
  }

  function applyRows(rows) {
    renderRows(rows);
  }

  async function runReport(showToastMsg = true) {
    try {
      applyRows(await fetchCurrentRows());
      if (showToastMsg) showToast('Report loaded.');
    } catch (error) {
      showToast(error.message || 'Failed to run report.', 'error');
    }
  }

  document.getElementById('runReportBtn').addEventListener('click', () => runReport(true));
  runReport(false);

  LiveSync.start({
    intervalMs: 1000,
    fetchData: fetchCurrentRows,
    applyData: applyRows,
    render: () => {}
  });
})();
