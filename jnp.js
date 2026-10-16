/* ============================================================================
 *  JNP CENTRAL HUB — shared client library (used by the Hub and every module)
 *  Include on every page:
 *    <link rel="stylesheet" href="https://jnpcargomovers-hub.github.io/Central_Hub/jnp.css">
 *    <script src="https://jnpcargomovers-hub.github.io/Central_Hub/jnp.js"></script>
 * ========================================================================== */
(function (w) {
  'use strict';

  // ---- 1. CONFIG — paste your Apps Script Web App URL once, here only ------
  const CONFIG = {
    API: 'https://script.google.com/macros/s/AKfycbx_C3-pacZYeA-Ki60UPxmEkh0VkJJ-e_oJzg8pkNQf5j0bd87obqqsMowq15LgYLw-Bg/exec',
    HUB: 'https://jnpcargomovers-hub.github.io/Central_Hub/',
    LOGO: 'https://jnpcargomovers-hub.github.io/Central_Hub/logo.png',
    DASHBOARD: 'https://jnpcargomovers-hub.github.io/jnpcargomovers-hub/',
    MASTERS_MAX_AGE_HRS: 12,
  };

  // ---- 2. MODULE REGISTRY — tile icon, folder, and interim (old) app link ---
  //  path   : new screen inside the Central_Hub repo (built module by module)
  //  legacy : old app that keeps working until the new screen is ready
  //  ready  : flip to true when the new screen is uploaded
  const MODULES = {
    'OPS-01': { icon: '🚚', path: 'loader/', legacy: 'https://jnpcargomovers-hub.github.io/loader-app/', ready: false },
    'OPS-02': { icon: '📦', path: 'delivery/', legacy: 'https://jnpcargomovers-hub.github.io/delivery-indent/', ready: false },
    'OPS-03': { icon: '🧾', path: 'builty/', ready: false },
    'OPS-04': { icon: '🔄', path: 'driver-change/', ready: false },
    'OPS-05': { icon: '💸', path: 'ops-expense/', ready: false },
    'OPS-06': { icon: '🚨', path: 'breakdown/', ready: false },
    'RM-01':  { icon: '🛠️', path: 'breakdown-resolution/', ready: false },
    'RM-02':  { icon: '🔧', path: 'maintenance/', legacy: 'https://jnpcargomovers-hub.github.io/Maintenance-Log/', ready: false },
    'RM-03':  { icon: '🧰', path: 'truck-expense/', legacy: 'https://jnpcargomovers-hub.github.io/expense-app/', ready: false },
    'RM-04':  { icon: '📥', path: 'depot-indent/', legacy: 'https://jnpcargomovers-hub.github.io/material-indent/', ready: false },
    'RM-05':  { icon: '📤', path: 'depot-issue/', legacy: 'https://jnpcargomovers-hub.github.io/Material-issuance/', ready: false },
    'FIN-01': { icon: '💵', path: 'driver-advance/', legacy: 'https://jnpcargomovers-hub.github.io/advance-request/', ready: false },
    'FIN-02': { icon: '🧮', path: 'billing/', ready: false },
  };
  const TILES = [
    { name: 'Operations', hindi: 'ऑपरेशन्स', color: 'var(--ops)', prefix: 'OPS-' },
    { name: 'Repair & Maintenance', hindi: 'रिपेयर और मेंटेनेंस', color: 'var(--rm)', prefix: 'RM-' },
    { name: 'Finance', hindi: 'फाइनेंस', color: 'var(--fin)', prefix: 'FIN-' },
  ];

  // ---- 3. SAFE STORAGE -----------------------------------------------------
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* private mode */ } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { } },
  };
  const S_KEY = 'jnp_session', M_KEY = 'jnp_masters';

  // ---- 4. API --------------------------------------------------------------
  async function api(action, payload) {
    if (!CONFIG.API || CONFIG.API.indexOf('http') !== 0) throw new Error('API URL not set in jnp.js');
    const s = store.get(S_KEY);
    const body = Object.assign({ action: action, token: s && s.token, device: device() }, payload || {});
    let res;
    try {
      // text/plain = "simple" request → no CORS preflight, response is readable
      res = await fetch(CONFIG.API, { method: 'POST', body: JSON.stringify(body) });
    } catch (e) {
      throw new Error('No internet / server not reachable. Data NOT saved — try again.');
    }
    let out;
    try { out = await res.json(); } catch (e) { throw new Error('Server reply was not readable. Check before re-trying.'); }
    if (!out.ok && out.code === 'AUTH' && action !== 'login') {
      store.del(S_KEY);
      goLogin();
      throw new Error(out.error);
    }
    return out;
  }

  // ---- 5. SESSION ----------------------------------------------------------
  function session() { return store.get(S_KEY); }

  async function login(mobile, entryCode) {
    const out = await api('login', { mobile: mobile, entryCode: entryCode });
    if (out.ok) store.set(S_KEY, { token: out.token, user: out.user, access: out.access, at: Date.now() });
    return out;
  }

  async function logout() {
    try { await api('logout'); } catch (e) { }
    store.del(S_KEY); store.del(M_KEY);
    goLogin();
  }

  function goLogin() {
    const here = location.href;
    if (here.indexOf(CONFIG.HUB) === 0 && /\/Central_Hub\/(index\.html)?(\?.*)?$/.test(location.pathname + location.search)) { location.reload(); return; }
    location.href = CONFIG.HUB + '?next=' + encodeURIComponent(here);
  }

  function rights(code) {
    const s = session();
    const a = s && s.access && s.access[code];
    return a ? a.rights.split(',').map(x => x.trim()).filter(x => x && x !== '-') : [];
  }
  function can(code, r) { return rights(code).indexOf(r) >= 0; }

  /** Call at the top of every module page. Redirects to login if needed. */
  async function requireModule(code) {
    const s = session();
    if (!s || !s.token) { goLogin(); return new Promise(() => { }); }
    const me = await api('me');                         // refreshes rights from the server
    if (me.ok) { s.user = me.user; s.access = me.access; store.set(S_KEY, s); }
    if (!rights(code).length) {
      alert('You do not have access to this screen.');
      location.href = CONFIG.HUB; return new Promise(() => { });
    }
    return { user: s.user, rights: rights(code), can: r => can(code, r) };
  }

  // ---- 6. MASTERS (dropdown data, cached on the phone) ---------------------
  async function masters(force) {
    const c = store.get(M_KEY);
    const fresh = c && (Date.now() - c.at) < CONFIG.MASTERS_MAX_AGE_HRS * 36e5;
    if (c && fresh && !force) return c.data;
    try {
      const out = await api('masters');
      if (out.ok) { store.set(M_KEY, { at: Date.now(), data: out.masters }); return out.masters; }
      throw new Error(out.error);
    } catch (e) {
      if (c) { toast('Offline — using saved lists', 'warn'); return c.data; }
      throw e;
    }
  }

  // ---- 7. UI HELPERS -------------------------------------------------------
  function header(el, title, hindi, opts) {
    opts = opts || {};
    const s = session();
    el.innerHTML =
      '<div class="topbar"><div class="wrap">' +
      '<a href="' + CONFIG.HUB + '"><img class="logo" src="' + CONFIG.LOGO + '" alt="JNP Cargo Movers"></a>' +
      '<div class="title"><b>' + esc(title) + '</b><span>' + esc(hindi || '') + '</span></div>' +
      '<div class="actions">' +
      (opts.sync ? '<button class="icon-btn" id="jnpSync" type="button">↻ Sync</button>' : '') +
      (opts.home !== false ? '<a class="icon-btn" href="' + CONFIG.HUB + '" style="text-decoration:none">⌂</a>' : '') +
      '</div></div></div>' +
      (s && s.user && opts.who !== false ? '<div class="wrap"><div class="hint" style="margin-top:8px">Logged in: <b>' + esc(s.user.name) + '</b> · ' + esc(s.user.role) + '</div></div>' : '');
    if (opts.sync) el.querySelector('#jnpSync').onclick = opts.sync;
  }

  let toastTimer;
  function toast(msg, type, ms) {
    let t = document.getElementById('jnpToast');
    if (!t) { t = document.createElement('div'); t.id = 'jnpToast'; document.body.appendChild(t); }
    t.className = 'toast ' + (type || '');
    t.textContent = msg;
    t.classList.remove('hidden');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.add('hidden'), ms || 3200);
  }

  function busy(on) {
    let b = document.getElementById('jnpBusy');
    if (!b) { b = document.createElement('div'); b.id = 'jnpBusy'; b.className = 'busy hidden'; b.innerHTML = '<div class="spinner"></div>'; document.body.appendChild(b); }
    b.classList.toggle('hidden', !on);
  }

  // ---- 8. WHATSAPP + FILE SHARE -------------------------------------------
  function whatsapp(text, phone) {
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const p = phone ? String(phone).replace(/\D/g, '').slice(-10) : '';
    const url = mobile
      ? 'whatsapp://send?' + (p ? 'phone=91' + p + '&' : '') + 'text=' + encodeURIComponent(text)
      : 'https://wa.me/' + (p ? '91' + p : '') + '?text=' + encodeURIComponent(text);
    location.href = url;
  }

  /** Shares a PDF (or any blob) straight into WhatsApp where the phone allows it. */
  async function shareFile(blob, filename, text) {
    const file = new File([blob], filename, { type: blob.type || 'application/pdf' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], text: text || '', title: filename }); return 'shared'; }
      catch (e) { if (e.name === 'AbortError') return 'cancelled'; }
    }
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
    toast('PDF downloaded — attach it in WhatsApp', 'warn', 5000);
    return 'downloaded';
  }

  // ---- 9. AUTOCOMPLETE with "Did you mean?" (keeps spaces!) ---------------
  //  items: [{label, sub, value, alt}]  alt = other spellings, comma separated
  //  opts:  {allowNew: true, upper: false, onPick(item)}
  function picker(input, getItems, opts) {
    opts = opts || {};
    const box = document.createElement('div');
    box.className = 'ac-list hidden';
    input.parentNode.appendChild(box);
    input.setAttribute('autocomplete', 'off');
    const close = () => box.classList.add('hidden');
    const render = () => {
      const items = getItems() || [];
      const raw = input.value.replace(/\s+/g, ' ').trim();
      const q = keyOf(raw);
      let list = q ? items.filter(it => keyOf(it.label).indexOf(q) >= 0 || keyOf(it.alt || '').indexOf(q) >= 0) : items.slice(0, 60);
      const exact = items.find(it => keyOf(it.label) === q || (it.alt || '').split(',').some(a => keyOf(a) === q));
      let html = list.slice(0, 60).map((it, i) => '<div class="ac-item" data-i="' + items.indexOf(it) + '"><span>' + esc(it.label) + '</span><small>' + esc(it.sub || '') + '</small></div>').join('');
      if (q && !exact) {
        const near = closest(raw, items);
        if (near && list.indexOf(near) < 0) html = '<div class="ac-item sugg" data-i="' + items.indexOf(near) + '"><span>Did you mean <b>' + esc(near.label) + '</b>?</span><small>tap</small></div>' + html;
        if (opts.allowNew) html += '<div class="ac-item new" data-new="1"><span>➕ Use “' + esc(opts.upper ? raw.toUpperCase() : titleCase(raw)) + '”</span><small>new</small></div>';
      }
      box.innerHTML = html || '<div class="ac-item"><small>No match</small></div>';
      box.classList.remove('hidden');
    };
    box.addEventListener('mousedown', e => e.preventDefault());
    box.addEventListener('click', e => {
      const el = e.target.closest('.ac-item'); if (!el) return;
      if (el.dataset.new) { input.value = opts.upper ? input.value.trim().toUpperCase() : titleCase(input.value); close(); opts.onPick && opts.onPick(null, input.value); return; }
      const it = (getItems() || [])[Number(el.dataset.i)]; if (!it) return;
      input.value = it.value !== undefined ? it.value : it.label; close();
      opts.onPick && opts.onPick(it, input.value);
      input.dispatchEvent(new Event('change'));
    });
    input.addEventListener('input', render);
    input.addEventListener('focus', render);
    input.addEventListener('blur', () => setTimeout(close, 150));
    return { refresh: render, close: close };
  }

  function closest(raw, items) {
    const k = keyOf(raw); if (k.length < 3) return null;
    let best = null, score = 0;
    items.forEach(it => {
      [it.label].concat((it.alt || '').split(',')).forEach(cand => {
        const s = similarity(k, keyOf(cand)); if (s > score) { score = s; best = it; }
      });
    });
    return score >= 0.72 ? best : null;
  }
  function similarity(a, b) {           // Dice coefficient on letter pairs
    if (!a || !b) return 0; if (a === b) return 1;
    const pairs = s => { const m = {}; for (let i = 0; i < s.length - 1; i++) { const p = s.substr(i, 2); m[p] = (m[p] || 0) + 1; } return m; };
    const A = pairs(a), B = pairs(b); let inter = 0, n = 0;
    Object.keys(A).forEach(p => { if (B[p]) inter += Math.min(A[p], B[p]); n += A[p]; });
    Object.keys(B).forEach(p => n += B[p]);
    return n ? 2 * inter / n : 0;
  }

  // ---- 10. SMALL UTILS -----------------------------------------------------
  function keyOf(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
  function titleCase(s) { return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase().replace(/\b([a-z])/g, m => m.toUpperCase()); }
  function esc(s) { return String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function uid() { return (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)).replace(/-/g, ''); }
  function device() { const u = navigator.userAgent; const m = u.match(/\(([^)]+)\)/); return (m ? m[1] : u).slice(0, 100); }
  function todayISO() { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }
  function normTruck(v) { return String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }

  w.JNP = {
    CONFIG, MODULES, TILES, api, session, login, logout, goLogin, rights, can, requireModule, masters,
    header, toast, busy, whatsapp, shareFile, picker, esc, uid, keyOf, titleCase, todayISO, normTruck, store,
  };
})(window);
