/* Shared API helpers */
const API = (() => {
  async function request(url, options = {}) {
    const response = await fetch(url, {
      headers: { 'Content-Type': 'application/json' },
      ...options
    });

    let payload = {};
    try {
      payload = await response.json();
    } catch (_) {
      payload = {};
    }

    if (response.status === 401) {
      window.location.replace('login.html');
      throw new Error('Your session has expired.');
    }

    if (!response.ok || payload.ok === false) {
      const message = payload.error || `Request failed: ${response.status}`;
      throw new Error(message);
    }
    return payload.data;
  }

  return {
    get: (url) => request(url),
    post: (url, body) => request(url, { method: 'POST', body: JSON.stringify(body) }),
    put: (url, body) => request(url, { method: 'PUT', body: JSON.stringify(body) }),
    del: (url, body) => request(url, { method: 'DELETE', body: JSON.stringify(body) })
  };
})();
