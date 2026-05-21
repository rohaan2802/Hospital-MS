/* Non-disruptive live sync polling helper */
const LiveSync = (() => {
  function isInteractiveElement(el) {
    if (!el) return false;
    const tag = (el.tagName || '').toLowerCase();
    if (['input', 'textarea', 'select', 'button'].includes(tag)) return true;
    if (el.isContentEditable) return true;
    return false;
  }

  function userIsInteracting() {
    const active = document.activeElement;
    if (isInteractiveElement(active)) return true;
    if (document.querySelector('.modal-overlay.open')) return true;
    return false;
  }

  function preserveAndRender(renderFn) {
    const active = document.activeElement;
    const activeId = active ? active.id : null;
    const start = active && typeof active.selectionStart === 'number' ? active.selectionStart : null;
    const end = active && typeof active.selectionEnd === 'number' ? active.selectionEnd : null;

    renderFn();

    if (activeId) {
      const el = document.getElementById(activeId);
      if (el) {
        el.focus({ preventScroll: true });
        if (start !== null && end !== null && typeof el.setSelectionRange === 'function') {
          el.setSelectionRange(start, end);
        }
      }
    }
  }

  function start({ intervalMs = 1000, fetchData, applyData, render }) {
    let lastHash = '';
    let pendingData = null;
    let running = false;

    async function tick() {
      if (running) return;
      running = true;
      try {
        const data = await fetchData();
        const hash = JSON.stringify(data);
        if (hash !== lastHash) {
          if (userIsInteracting()) {
            pendingData = data;
          } else {
            applyData(data);
            preserveAndRender(render);
            pendingData = null;
            lastHash = hash;
          }
        }
      } catch (_) {
        // Keep UI responsive; next tick retries.
      } finally {
        running = false;
      }
    }

    function flushPending() {
      if (!pendingData || userIsInteracting()) return;
      const hash = JSON.stringify(pendingData);
      applyData(pendingData);
      preserveAndRender(render);
      lastHash = hash;
      pendingData = null;
    }

    const id = setInterval(tick, intervalMs);
    document.addEventListener('focusin', flushPending, true);
    document.addEventListener('click', flushPending, true);
    window.addEventListener('blur', flushPending);
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        tick();
        flushPending();
      }
    });

    tick();
    return () => clearInterval(id);
  }

  return { start };
})();
