(() => {
  const api = window.SMALI_CONFIG?.apiOrigin || '';
  const key = 'smali-admin:' + api;
  const supplied = new URLSearchParams(location.hash.slice(1)).get('token');
  if (supplied) {
    sessionStorage.setItem(key, supplied);
    history.replaceState(null, '', location.pathname + location.search);
  }
  const token = () => sessionStorage.getItem(key) || '';
  const status = document.querySelector('#status');
  const sessions = document.querySelector('#sessions');
  const request = async (path, options = {}) => {
    const response = await fetch(api + path, {
      ...options,
      credentials: 'omit',
      headers: {
        Authorization: 'Admin ' + token(),
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });
    const body = await response.json();
    if (!response.ok) throw new Error(body.error || 'Request failed');
    return body;
  };
  const load = async () => {
    sessions.replaceChildren();
    status.textContent = 'Loading…';
    try {
      const data = await request('/api/admin/sessions');
      status.textContent = data.sessions.length
        ? `${data.sessions.length} active login${data.sessions.length === 1 ? '' : 's'}`
        : 'No active logins';
      for (const login of data.sessions.sort((a, b) => a.name.localeCompare(b.name))) {
        const row = document.querySelector('#session-row').content.firstElementChild.cloneNode(true);
        row.querySelector('.name').textContent = login.name;
        row.querySelector('.details').textContent =
          `${login.kind === 'bearer' ? 'Web app' : 'Direct'} · expires ${new Date(login.expiresAt).toLocaleString()} · ${login.personId.slice(0, 8)}`;
        const kick = row.querySelector('.kick');
        kick.onclick = async () => {
          kick.disabled = true;
          kick.textContent = 'Kicking…';
          try {
            await request('/api/admin/kick', {
              method: 'POST',
              body: JSON.stringify({ sessionId: login.sessionId }),
            });
            row.remove();
            await load();
          } catch (error) {
            status.textContent = error.message;
            kick.disabled = false;
            kick.textContent = 'Kick';
          }
        };
        sessions.append(row);
      }
    } catch (error) {
      status.textContent = token() ? error.message : 'Open the complete admin link to authenticate.';
    }
  };
  document.querySelector('#refresh').onclick = load;
  load();
})();
