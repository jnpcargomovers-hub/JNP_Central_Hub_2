/* ============================================================================
 *  JNP CENTRAL HUB 2 — shared client library (Hub + every screen)
 *  Every screen (one folder down) includes:
 *    <link rel="stylesheet" href="../jnp.css">  <script src="../jnp.js"></script>
 * ========================================================================== */
(function (w) {
  'use strict';

  // ---- 1. CONFIG — the four Apps Script web apps --------------------------------
  const SRC = (document.currentScript && document.currentScript.src) || location.href;
  const BASE = SRC.replace(/[^/]*([?#].*)?$/, '');
  const CONFIG = {
    APIS: {
      core: 'https://script.google.com/macros/s/AKfycbx_C3-pacZYeA-Ki60UPxmEkh0VkJJ-e_oJzg8pkNQf5j0bd87obqqsMowq15LgYLw-Bg/exec',   // DB_Master
      ops:  'https://script.google.com/macros/s/AKfycbylaAIfLfS3V3ColhDQvgaHSMHiSJhmyqbWoxkwaQuNQkKIVF31C0lkc-dPTS8UoDGTCw/exec',   // JNP_Ops_DB
      rm:   'https://script.google.com/macros/s/AKfycbxUndHEEBkajWBV8XnE0ySHvnWqjsXg9ndIsfDf2TmiLBchD1v6LfNPpaels6PE4cbmGw/exec',   // JNP_RM_DB
      fin:  'https://script.google.com/macros/s/AKfycbxbeUlvrn-rtMmluAyVbO482_Hjw78tMWH61ra7RFEKOAo9qS_fylRcAKNFTQMgY2qR/exec',   // JNP_Finance_DB
      adm:  'https://script.google.com/macros/s/AKfycbxvvJIQe5WQphAP8NCCuF4ukGNcSxbYGxr_D8-xTqO_zM09JjHN2_oux8BWGI3ictf2/exec',   // JNP_Admin_DB (Tasks, Challans, Extra Diesel)
    },
    HUB: BASE,
    LOGO: BASE + 'logo.png',
    DASHBOARD: BASE + 'dashboard/',
    MASTERS_MAX_AGE_HRS: 12,
  };

  // Which script answers which action (save/list/get/edit go by module code)
  const ACTION_DB = {
    login: 'core', me: 'core', masters: 'core', upload: 'core', punch: 'core', attendance: 'core', approvers: 'core', inbox: 'core', decide: 'core', pay: 'core', dash: 'core',
    nextLR: 'ops', lookupLR: 'ops', taskList: 'adm', taskAct: 'adm', taskLog: 'adm', taskCount: 'adm', challanPay: 'adm', admSummary: 'adm', cleanScan: 'core', cleanMerge: 'core', cleanCount: 'core',
    board: 'ops', portalPreview: 'ops', portalApply: 'ops', tripSet: 'ops', tripInfo: 'ops', tripMove: 'ops', tripUndo: 'ops', tripEscalate: 'ops', loaderGet: 'ops', loaderEdit: 'ops', lastIssue: 'ops', handoverItems: 'ops',
    bdUpdate: 'rm', openBreakdowns: 'rm', breakdownLog: 'rm', tyres: 'rm', stock: 'rm', openIndents: 'rm',
    inspChecklist: 'rm', inspTruck: 'rm', inspList: 'rm', inspDetail: 'rm', inspOpen: 'rm', inspFix: 'rm',
    advanceLimit: 'fin', settlementPreview: 'fin', ledger: 'fin', balances: 'fin', unbilledLRs: 'fin', receipt: 'fin', bills: 'fin', dieselAuditPrepare: 'fin',
  };
  function moduleDb(code) {
    code = String(code || '');
    if (code === 'OPS-06' || code.indexOf('RM-') === 0) return 'rm';
    if (code.indexOf('OPS-') === 0) return 'ops';
    if (code.indexOf('FIN-') === 0) return 'fin';
    if (code.indexOf('TSK-') === 0 || code.indexOf('ADM-') === 0) return 'adm';
    return 'core';
  }

  // ---- 2. SCREENS — tile icon + folder for every module code -------------------
  const MODULES = {
    'OPS-07': { icon: '📍', path: 'truck-status/' },
    'OPS-01': { icon: '🚚', path: 'loader/' },
    'OPS-03': { icon: '🧾', path: 'builty/' },
    'OPS-02': { icon: '📦', path: 'delivery/' },
    'OPS-04': { icon: '🔄', path: 'handover/' },
    'OPS-05': { icon: '💸', path: 'ops-expense/' },
    'OPS-06': { icon: '🚧', path: 'breakdown/' },
    'RM-01':  { icon: '🛠️', path: 'breakdown/?tab=resolve' },
    'RM-08':  { icon: '🔍', path: 'inspection/' },
    'RM-02':  { icon: '🔧', path: 'maintenance/' },
    'RM-03':  { icon: '🧰', path: 'truck-expense/' },
    'RM-04':  { icon: '📝', path: 'depot/?tab=indent' },
    'RM-07':  { icon: '📥', path: 'depot/?tab=receipt' },
    'RM-05':  { icon: '📤', path: 'depot/?tab=issue' },
    'RM-06':  { icon: '🛞', path: 'tyres/' },
    'FIN-01': { icon: '💵', path: 'driver-advance/' },
    'FIN-03': { icon: '📒', path: 'driver-ledger/' },
    'FIN-02': { icon: '🧮', path: 'billing/' },
    'FIN-04': { icon: '⛽', path: 'diesel-audit/' },
    'FIN-05': { icon: '🔗', path: 'portal/' },
    'ATT-01': { icon: '🕘', path: 'attendance/' },
    'APR-01': { icon: '✅', path: 'approvals/' },
    'TSK-01': { icon: '📋', path: 'tasks/' },
    'ADM-01': { icon: '🚨', path: 'challan/' },
    'ADM-02': { icon: '⛽', path: 'extra-diesel/' },
    'ADM-03': { icon: '🧹', path: 'clean-names/', hidden: true },     // no tile: opened from Dashboard › Explore
  };
  const TILES = [
    { name: 'Operations', hindi: 'ऑपरेशन्स', color: 'var(--ops)', prefix: 'OPS-' },
    { name: 'Repair & Maintenance', hindi: 'रिपेयर और मेंटेनेंस', color: 'var(--rm)', prefix: 'RM-' },
    { name: 'Finance', hindi: 'फाइनेंस', color: 'var(--fin)', prefix: 'FIN-' },
    { name: 'Challans & Diesel', hindi: 'चालान · डीज़ल', color: 'var(--ops)', prefix: 'ADM-' },
  ];

  // ---- 3. SAFE STORAGE ---------------------------------------------------------
  const store = {
    get(k) { try { return JSON.parse(localStorage.getItem(k) || 'null'); } catch (e) { return null; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { } },
    del(k) { try { localStorage.removeItem(k); } catch (e) { } },
  };
  const S_KEY = 'jnp2_session', M_KEY = 'jnp2_masters';

  // ---- 3b. INSTALL AS APP (home-screen icon) ---------------------------------
  (function () {
    try {
      const add = (rel, href, extra) => { if (document.querySelector('link[rel="' + rel + '"]')) return; const l = document.createElement('link'); l.rel = rel; l.href = href; Object.assign(l, extra || {}); document.head.appendChild(l); };
      add('manifest', BASE + 'manifest.webmanifest');
      const ap = document.querySelector('link[rel="apple-touch-icon"]'); if (ap) ap.href = BASE + 'apple-touch-icon.png'; else add('apple-touch-icon', BASE + 'apple-touch-icon.png');
      [['apple-mobile-web-app-capable', 'yes'], ['mobile-web-app-capable', 'yes'], ['apple-mobile-web-app-title', 'JNP Hub'], ['apple-mobile-web-app-status-bar-style', 'default']].forEach(([n, v]) => { if (!document.querySelector('meta[name="' + n + '"]')) { const m = document.createElement('meta'); m.name = n; m.content = v; document.head.appendChild(m); } });
      if ('serviceWorker' in navigator && location.protocol === 'https:') navigator.serviceWorker.register(BASE + 'sw.js', { scope: BASE }).catch(() => { });
    } catch (e) { }
    w.addEventListener('beforeinstallprompt', e => { e.preventDefault(); w.__jnpInstall = e; document.dispatchEvent(new Event('jnp-installable')); });
  })();
  const isApp = () => (w.matchMedia && w.matchMedia('(display-mode: standalone)').matches) || w.navigator.standalone === true;

  // ---- 4. API ------------------------------------------------------------------
  async function api(action, payload, db) {
    payload = payload || {};
    db = db || ((action === 'save' || action === 'list' || action === 'get' || action === 'edit') ? moduleDb(payload.module) : ACTION_DB[action] || 'core');
    let url = CONFIG.APIS[db];
    if (!url && db === 'adm') {          // 5th sheet: its link lives in DB_Master › Settings › Admin_API_URL
      url = (M().settings || {}).Admin_API_URL;
      if (!url) { try { await masters(true); } catch (e) { } url = (M().settings || {}).Admin_API_URL; }
      if (!url) throw new Error('Admin sheet link not set — HO: put Admin_API_URL in DB_Master › Settings');
    }
    if (!url || url.indexOf('http') !== 0) throw new Error('Web app link for "' + db + '" not set in jnp.js');
    const s = store.get(S_KEY);
    const body = Object.assign({ action: action, token: s && s.token, device: device() }, payload);
    let res;
    try { res = await fetch(url, { method: 'POST', body: JSON.stringify(body) }); }   // text/plain → no CORS preflight
    catch (e) { throw new Error('No internet / server not reachable. Data NOT saved — try again.'); }
    let out;
    try { out = await res.json(); } catch (e) { throw new Error('Server reply was not readable. Check the record before re-trying.'); }
    if (!out.ok && out.code === 'AUTH' && action !== 'login') { store.del(S_KEY); goLogin(); throw new Error(out.error); }
    return out;
  }
  /** api() that throws on {ok:false} */
  async function call(action, payload, db) { const o = await api(action, payload, db); if (!o.ok) { const e = new Error(o.error || 'Failed'); e.code = o.code; throw e; } return o; }

  // ---- 5. SESSION --------------------------------------------------------------
  function session() { return store.get(S_KEY); }
  async function login(mobile, entryCode) {
    const out = await api('login', { mobile: mobile, entryCode: entryCode });
    if (out.ok) store.set(S_KEY, { token: out.token, user: out.user, access: out.access, counts: out.counts, at: Date.now() });
    return out;
  }
  function logout() { store.del(S_KEY); store.del(M_KEY); goLogin(); }
  function goLogin() {
    const here = location.href.split('#')[0], bare = here.split('?')[0];
    if (bare === CONFIG.HUB || bare === CONFIG.HUB + 'index.html') { location.href = CONFIG.HUB; return; }
    location.href = CONFIG.HUB + '?next=' + encodeURIComponent(here);
  }
  function rights(code) {
    const s = session(), a = s && s.access && s.access[code];
    return a ? a.rights.split(',').map(x => x.trim()).filter(x => x && x !== '-') : [];
  }
  function can(code, r) { return rights(code).indexOf(r) >= 0; }
  async function refreshMe() {
    const me = await api('me'); const s = session();
    if (me.ok && s) { s.user = me.user; s.access = me.access; s.counts = me.counts; s.meAt = Date.now(); store.set(S_KEY, s); }
    return me;
  }
  /** Top of every screen. codes = one code or a list (screen opens if any is allowed). */
  async function requireModule(codes) {
    codes = [].concat(codes);
    const s = session();
    if (!s || !s.token) { goLogin(); return new Promise(() => { }); }
    // Access checked in the last 10 min → open the screen at once and re-check quietly in the background.
    // (The server still checks rights on every save, so nothing is skipped.)
    if (s.meAt && Date.now() - s.meAt < 10 * 60 * 1000 && codes.some(c => rights(c).length)) refreshMe().catch(() => { });
    else { try { await refreshMe(); } catch (e) { toast('Offline — using saved access', 'warn'); } }
    const ok = codes.filter(c => rights(c).length);
    if (!ok.length) { alert('You do not have access to this screen.'); location.href = CONFIG.HUB; return new Promise(() => { }); }
    const u = session().user;
    return { user: u, code: ok[0], rights: c => rights(c || ok[0]), can: (r, c) => can(c || ok[0], r), isL1: u.level === 'Level 1' };
  }

  // ---- 6. MASTERS (dropdown data cached on the phone) --------------------------
  let MEM = null, BG = null, FORCED = false;
  /** Name typed is not in the list → fetch the latest lists from the sheet once (someone may have just added it). */
  async function mastersRetry() { if (FORCED) return false; FORCED = true; try { await masters(true); return true; } catch (e) { return false; } }
  async function masters(force) {
    let c = store.get(M_KEY);
    if (c && !(c.data && Array.isArray(c.data.trucks))) { store.del(M_KEY); c = null; }      // broken / empty saved copy → fetch again
    const fresh = c && (Date.now() - c.at) < CONFIG.MASTERS_MAX_AGE_HRS * 36e5;
    if (c && fresh && !force) {
      // older than 5 min → use it now, fetch a fresh copy in the background (new drivers / trucks show up without logging out)
      if (Date.now() - c.at > 5 * 6e4 && !BG) { BG = call('masters').then(o => { if (o.masters && o.masters.trucks) { store.set(M_KEY, { at: Date.now(), data: o.masters }); MEM = o.masters; } }).catch(() => { }).finally(() => { BG = null; }); }
      return (MEM = c.data);
    }
    try {
      const out = await call('masters');
      if (!out.masters || !out.masters.trucks) throw new Error('Lists not received from the server — tap ↻ to try again');
      store.set(M_KEY, { at: Date.now(), data: out.masters }); return (MEM = out.masters);
    } catch (e) { if (c) { toast('Offline — using saved lists', 'warn'); return (MEM = c.data); } if (MEM) return MEM; throw e; }
  }
  const M = () => MEM || (store.get(M_KEY) || {}).data || { trucks: [], drivers: [], destinations: [], parties: [], faults: [], pm: [], parts: [], vendors: [], checklist: [], users: [], lists: {}, settings: {} };
  const findTruck = no => M().trucks.find(t => t.no === normTruck(no));
  const findDriver = n => M().drivers.find(d => keyOf(d.name) === keyOf(n) || (d.alt || '').split(',').some(a => a && keyOf(a) === keyOf(n)));
  const findDest = n => M().destinations.find(d => keyOf(d.name) === keyOf(n) || (d.alt || '').split(',').some(a => a && keyOf(a) === keyOf(n)));
  const list = name => (M().lists || {})[name] || [];

  // ---- 7. UI HELPERS -----------------------------------------------------------
  function header(el, title, hindi, opts) {
    opts = opts || {};
    const s = session();
    el.innerHTML = '<div class="topbar"><div class="wrap">' +
      '<a href="' + CONFIG.HUB + '"><img class="logo" src="' + CONFIG.LOGO + '" alt="JNP Cargo Movers"></a>' +
      '<div class="title"><b>' + esc(title) + '</b><span>' + esc(hindi || '') + '</span></div><div class="actions">' +
      (opts.sync ? '<button class="icon-btn" id="jnpSync" type="button">↻</button>' : '') +
      (opts.home !== false ? '<a class="icon-btn" href="' + CONFIG.HUB + '" style="text-decoration:none">⌂</a>' : '') +
      '</div></div></div>' +
      (s && s.user && opts.who !== false ? '<div class="wrap"><div class="hint" style="margin-top:8px">Logged in: <b>' + esc(s.user.name) + '</b> · ' + esc(s.user.role) + '</div></div>' : '');
    if (opts.sync) el.querySelector('#jnpSync').onclick = opts.sync;
  }
  let toastTimer;
  function toast(msg, type, ms) {
    let t = document.getElementById('jnpToast');
    if (!t) { t = document.createElement('div'); t.id = 'jnpToast'; document.body.appendChild(t); }
    t.className = 'toast ' + (type || ''); t.textContent = msg; t.classList.remove('hidden');
    clearTimeout(toastTimer); toastTimer = setTimeout(() => t.classList.add('hidden'), ms || 3200);
  }
  function busy(on, text) {
    let b = document.getElementById('jnpBusy');
    if (!b) { b = document.createElement('div'); b.id = 'jnpBusy'; b.className = 'busy hidden'; b.innerHTML = '<div><div class="spinner"></div><div class="busytxt"></div></div>'; document.body.appendChild(b); }
    b.querySelector('.busytxt').textContent = text || '';
    b.classList.toggle('hidden', !on);
  }
  /** Tabs: [{id,label}] → calls onTab(id). Returns select(id). */
  function tabs(el, items, onTab, start) {
    el.className = 'tabs';
    el.innerHTML = items.map(t => '<button type="button" data-t="' + t.id + '">' + esc(t.label) + '</button>').join('');
    const sel = id => { el.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.t === id)); onTab(id); };
    el.onclick = e => { const b = e.target.closest('button'); if (b) sel(b.dataset.t); };
    sel(start && items.some(i => i.id === start) ? start : items[0].id);
    return sel;
  }
  /** Result card after saving: {title, big, sub, lines:[], buttons:[{label, cls, onClick}], onNew} */
  function done(el, o) {
    el.innerHTML = '<div class="donebox"><div class="k">' + esc(o.title || 'SAVED') + '</div><div class="v">' + esc(o.big || '') + '</div><div class="s">' + esc(o.sub || '') + '</div></div>' +
      (o.lines && o.lines.length ? '<div class="kv">' + o.lines.map(l => '<span>' + esc(l[0]) + '</span><b>' + (l[2] ? l[1] : esc(l[1])) + '</b>').join('') + '</div>' : '') +
      '<div class="btns"></div>';
    const box = el.querySelector('.btns');
    (o.buttons || []).concat(o.onNew ? [{ label: '➕ New entry · नई एंट्री', cls: 'light', onClick: o.onNew }] : []).forEach(b => {
      const x = document.createElement('button'); x.type = 'button'; x.className = 'btn ' + (b.cls || 'green'); x.innerHTML = b.label;
      x.onclick = () => { b.onClick(); if (b.cls !== 'light') { x.classList.add('done'); if (!/✓/.test(x.innerHTML)) x.innerHTML = '✓ ' + x.innerHTML; } };
      box.appendChild(x);
    });
    el.classList.remove('hidden'); window.scrollTo(0, 0);
  }

  // ---- 8. WHATSAPP + FILE SHARE -----------------------------------------------
  // Always opens WhatsApp's own chat picker, so the user sends to whichever person or GROUP they want.
  function whatsapp(text) {
    const mobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
    const p = '';
    if (mobile) { location.href = 'whatsapp://send?' + (p ? 'phone=91' + p + '&' : '') + 'text=' + encodeURIComponent(text); return; }
    // Laptop: WhatsApp Web opens in ONE separate tab that is reused for every message, so the portal stays open
    // and the 2nd / 3rd message buttons are still there when the user comes back.
    const url = 'https://web.whatsapp.com/send?' + (p ? 'phone=91' + p + '&' : '') + 'text=' + encodeURIComponent(text);
    const win = window.open(url, 'jnp_whatsapp');
    if (win) { try { win.focus(); } catch (e) { } toast('Opened in the WhatsApp tab — come back to this tab for the next message', 'ok', 5000); }
    else location.href = url;   // pop-up blocked → old behaviour
  }
  async function shareFile(blob, filename, text) {
    const file = new File([blob], filename, { type: blob.type || 'application/pdf' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try { await navigator.share({ files: [file], text: text || '', title: filename }); return 'shared'; }
      catch (e) { if (e.name === 'AbortError') return 'cancelled'; }
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
    toast('PDF downloaded — attach it in WhatsApp', 'warn', 5000); return 'downloaded';
  }
  /** Standard WhatsApp text: title line, then "Key: value" lines (blank values skipped), then who/when. */
  function waText(title, pairs, footer) {
    const s = session(), u = s && s.user;
    const lines = ['*' + title + '*'];
    const isRef = p => /^(Ref|Record|ID)$/i.test(String(p[0] || '')) || /^[A-Z]{2,4}-\d{6}-\d{6}-[A-Z0-9]{3}$/.test(String(p[1]).trim());   // reference numbers stay in the sheet, not in WhatsApp
    pairs.forEach(p => { if (p && p[1] !== '' && p[1] !== undefined && p[1] !== null && !isRef(p)) lines.push(p[0] ? p[0] + ': ' + p[1] : String(p[1])); });
    if (footer) lines.push(footer);
    lines.push('— ' + (u ? u.name : '') + ' · ' + nowText());
    return lines.join('\n');
  }
  /** One share button after save — user picks the chat / group in WhatsApp. Approval requests carry the approver's name + link. */
  function approvalButtons(out, text) {
    const t = out && out.approver ? text + '\n\n⏳ Approval needed from *' + out.approver.name + '*\nApprove here: ' + CONFIG.HUB + 'approvals/' : text;
    return [{ label: '📲 Share on WhatsApp · भेजें', onClick: () => w.JNP.whatsapp(t) }];
  }

  // ---- 9. PHOTOS (compressed on the phone → Google Drive via DB_Master script) --
  function compress(file, maxSide, q) {
    maxSide = maxSide || 1280; q = q || 0.7;
    return new Promise((res, rej) => {
      const img = new Image(), url = URL.createObjectURL(file);
      img.onload = () => {
        let { width: W, height: H } = img; const k = Math.min(1, maxSide / Math.max(W, H)); W = Math.round(W * k); H = Math.round(H * k);
        const c = document.createElement('canvas'); c.width = W; c.height = H;
        const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, W, H); x.drawImage(img, 0, 0, W, H);
        URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', q));
      };
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Could not read the photo')); };
      img.src = url;
    });
  }
  async function uploadPhoto(file, module, label) {
    const dataUrl = await compress(file);
    const out = await call('upload', { dataUrl: dataUrl, module: module, label: label });
    return { url: out.url, thumb: out.thumb, preview: dataUrl };
  }
  function geo() {
    return new Promise((res, rej) => {
      if (!navigator.geolocation) return rej(new Error('This phone does not give location'));
      navigator.geolocation.getCurrentPosition(p => res({ lat: p.coords.latitude, lng: p.coords.longitude, acc: p.coords.accuracy }),
        e => rej(new Error(e.code === 1 ? 'Location permission denied — allow location for this site' : 'Could not get location — turn on GPS')),
        { enableHighAccuracy: true, timeout: 20000, maximumAge: 30000 });
    });
  }

  // ---- 10. AUTOCOMPLETE with "Did you mean?" (keeps spaces) -------------------
  function picker(input, getItems, opts) {
    opts = opts || {};
    const box = document.createElement('div'); box.className = 'ac-list hidden';
    input.parentNode.insertBefore(box, input.nextSibling);
    input.setAttribute('autocomplete', 'off');
    const close = () => box.classList.add('hidden');
    const render = () => {
      const items = getItems() || [], raw = input.value.replace(/\s+/g, ' ').trim(), q = keyOf(raw);
      const list = q ? items.filter(it => keyOf(it.label).indexOf(q) >= 0 || keyOf(it.alt || '').indexOf(q) >= 0 || keyOf(it.value || '').indexOf(q) >= 0) : items.slice(0, 60);
      const exact = items.find(it => keyOf(it.label) === q || keyOf(it.value || '') === q || (it.alt || '').split(',').some(a => a && keyOf(a) === q));
      let html = list.slice(0, 60).map(it => '<div class="ac-item" data-i="' + items.indexOf(it) + '"><span>' + esc(it.label) + '</span><small>' + esc(it.sub || '') + '</small></div>').join('');
      if (q && !exact) {
        const near = closest(raw, items);
        if (near && list.indexOf(near) < 0) html = '<div class="ac-item sugg" data-i="' + items.indexOf(near) + '"><span>Did you mean <b>' + esc(near.label) + '</b>?</span><small>tap</small></div>' + html;
        if (opts.allowNew) html += '<div class="ac-item new" data-new="1"><span>➕ Use “' + esc(opts.upper ? raw.toUpperCase() : titleCase(raw)) + '”</span><small>new</small></div>';
      }
      box.innerHTML = html || '<div class="ac-item"><small>No match</small></div>';
      box.classList.remove('hidden');
      if (q.length >= 3 && !list.length && !FORCED) mastersRetry().then(ok => { if (ok && document.activeElement === input) render(); });
    };
    box.addEventListener('mousedown', e => e.preventDefault());
    box.addEventListener('click', e => {
      const el = e.target.closest('.ac-item'); if (!el) return;
      if (el.dataset.new) { input.value = opts.upper ? input.value.trim().toUpperCase() : titleCase(input.value); close(); opts.onPick && opts.onPick(null, input.value); input.dispatchEvent(new Event('change')); return; }
      const it = (getItems() || [])[Number(el.dataset.i)]; if (!it) return;
      input.value = it.value !== undefined ? it.value : it.label; close();
      opts.onPick && opts.onPick(it, input.value); input.dispatchEvent(new Event('change'));
    });
    input.addEventListener('input', render); input.addEventListener('focus', render);
    input.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); close(); input.blur(); } });
    input.addEventListener('blur', () => setTimeout(close, 150));
    return { refresh: render, close: close };
  }
  function closest(raw, items) {
    const k = keyOf(raw); if (k.length < 3) return null;
    let best = null, score = 0;
    items.forEach(it => [it.label].concat((it.alt || '').split(',')).forEach(c => { const s = similarity(k, keyOf(c)); if (s > score) { score = s; best = it; } }));
    return score >= 0.72 ? best : null;
  }
  function similarity(a, b) {
    if (!a || !b) return 0; if (a === b) return 1;
    const pairs = s => { const m = {}; for (let i = 0; i < s.length - 1; i++) { const p = s.substr(i, 2); m[p] = (m[p] || 0) + 1; } return m; };
    const A = pairs(a), B = pairs(b); let inter = 0, n = 0;
    Object.keys(A).forEach(p => { if (B[p]) inter += Math.min(A[p], B[p]); n += A[p]; }); Object.keys(B).forEach(p => n += B[p]);
    return n ? 2 * inter / n : 0;
  }

  // ---- 11. FORM ENGINE ----------------------------------------------------------
  //  field: {k, label, hi, type, req, list|options, half, hint, ph, show(v), upper, module, amountKey, overLimit(v), multiple}
  //  types: text upper num dec date datetime month textarea select seg truck driver dest party vendor fault part symptom photo approver
  const PICK = {
    truck: () => M().trucks.map(t => ({ label: t.no, value: t.no, sub: [t.capacity ? t.capacity + 'T' : '', t.driver, t.opStatus && t.opStatus !== 'On Road' ? t.opStatus : ''].filter(Boolean).join(' · ') })),
    driver: () => M().drivers.filter(d => d.status !== 'Inactive').map(d => ({ label: d.name, alt: d.alt, sub: d.truck || '' })),
    dest: () => M().destinations.map(d => ({ label: d.name, alt: d.alt, sub: d.code })),
    party: () => M().parties.map(p => ({ label: p.name, alt: p.alt, sub: p.dest })),
    vendor: () => M().vendors.map(v => ({ label: v.name, sub: [v.type, v.location].filter(Boolean).join(' · ') })),
    fault: () => M().faults.map(f => ({ label: f.code + ' · ' + f.name, value: f.code, alt: f.name + ',' + f.hindi, sub: f.system })),
    part: () => M().parts.map(p => ({ label: p.code + ' · ' + p.name, value: p.code, alt: p.name + ',' + p.hindi, sub: p.unit + (p.rate ? ' · ₹' + p.rate : '') })),
  };
  const ALLOW_NEW = { truck: true, driver: true, dest: true, vendor: true, party: true };
  function form(el, fields, opts) {
    opts = opts || {};
    const F = {}, handlers = [], photosBusy = {};
    let html = '', i = 0;
    while (i < fields.length) {
      const f = fields[i];
      if (f.type === 'html') { html += '<div id="fx_' + f.k + '">' + (f.html || '') + '</div>'; i++; continue; }
      if (f.half && fields[i + 1] && fields[i + 1].half) { html += '<div class="row2">' + fieldHtml(f) + fieldHtml(fields[i + 1]) + '</div>'; i += 2; }
      else { html += fieldHtml(f); i++; }
    }
    el.innerHTML = html;
    function fieldHtml(f) {
      const id = 'fx_' + f.k, lab = '<label class="' + (f.req ? 'req' : '') + '" for="in_' + f.k + '">' + esc(f.label || f.k) + (f.hi ? ' <span class="hi">· ' + esc(f.hi) + '</span>' : '') + '</label>';
      let inp;
      const ph = f.ph ? ' placeholder="' + esc(f.ph) + '"' : '';
      switch (f.type) {
        case 'num': case 'dec': inp = '<input id="in_' + f.k + '" class="input" inputmode="' + (f.type === 'num' ? 'numeric' : 'decimal') + '"' + ph + '>'; break;
        case 'date': inp = '<input id="in_' + f.k + '" class="input" type="date">'; break;
        case 'datetime': inp = '<input id="in_' + f.k + '" class="input" type="datetime-local">'; break;
        case 'month': inp = '<input id="in_' + f.k + '" class="input" type="month">'; break;
        case 'textarea': inp = '<textarea id="in_' + f.k + '" class="input" rows="3"' + ph + '></textarea>'; break;
        case 'select': case 'symptom': case 'approver': inp = '<select id="in_' + f.k + '" class="input"><option value="">— select —</option></select>'; break;
        case 'seg': inp = '<div class="seg" id="in_' + f.k + '"></div>'; break;
        case 'photo': inp = '<div class="photos" id="ph_' + f.k + '"></div><div class="photo-btns"><label class="photo-add"><input type="file" accept="image/*" capture="' + (f.selfie ? 'user' : 'environment') + '"' + (f.multiple ? ' multiple' : '') + ' id="in_' + f.k + '" hidden>📷 Camera · कैमरा</label>' +
            (f.selfie ? '' : '<label class="photo-add"><input type="file" accept="image/*"' + (f.multiple ? ' multiple' : '') + ' id="in_' + f.k + '_g" hidden>🖼️ Upload · गैलरी</label>') + '</div>'; break;
        default: inp = '<input id="in_' + f.k + '" class="input' + (f.upper || f.type === 'upper' || f.type === 'truck' ? ' upper' : '') + '"' + ph + '>';
      }
      return '<div class="field" id="' + id + '">' + lab + inp + '<div class="sub-info" id="si_' + f.k + '">' + (f.hint ? '<span class="hint">' + esc(f.hint) + '</span>' : '') + '</div></div>';
    }
    const $in = k => el.querySelector('#in_' + k);
    function options(f) {
      const arr = typeof f.options === 'function' ? f.options() : f.options || (f.type === 'symptom' ? symptoms() : list(f.list));
      return arr.map(o => typeof o === 'object' ? o : { v: o, t: o });
    }
    function fill(f) {
      const s = $in(f.k), cur = F[f.k].get();
      if (f.type === 'seg') {
        s.innerHTML = options(f).map(o => '<button type="button" data-v="' + esc(o.v) + '">' + esc(o.t) + '</button>').join('');
        s.onclick = e => { const b = e.target.closest('button'); if (!b) return; F[f.k].set(b.dataset.v); fire(f.k); };
        if (cur) F[f.k].set(cur);
      } else if (f.type !== 'approver') {
        s.innerHTML = '<option value="">— select —</option>' + options(f).map(o => '<option value="' + esc(o.v) + '">' + esc(o.t) + '</option>').join('');
        if (cur) s.value = cur;
      }
    }
    fields.forEach(f => {
      if (f.type === 'html') { F[f.k] = { f, get: () => '', set: h => el.querySelector('#fx_' + f.k).innerHTML = h }; return; }
      const s = $in(f.k);
      let val = '';
      if (f.type === 'seg') F[f.k] = { f, get: () => val, set: v => { val = v || ''; s.querySelectorAll('button').forEach(b => b.classList.toggle('on', b.dataset.v === val)); } };
      else if (f.type === 'photo') {
        let urls = [];
        const box = el.querySelector('#ph_' + f.k);
        const draw = () => { box.innerHTML = urls.map((u, j) => '<span class="ph"><img src="' + esc(u.preview || u.thumb) + '"><button type="button" data-j="' + j + '">✕</button></span>').join(''); };
        box.onclick = e => { const b = e.target.closest('button'); if (!b) return; urls.splice(Number(b.dataset.j), 1); draw(); fire(f.k); };
        const g = el.querySelector('#in_' + f.k + '_g');
        s.onchange = async function () {
          const src = this && this.files ? this : s, files = [...src.files]; src.value = '';
          for (const file of files) {
            photosBusy[f.k] = (photosBusy[f.k] || 0) + 1; info(f.k, '<span class="warnline">Uploading photo…</span>');
            try { const up = await uploadPhoto(file, opts.module || 'GEN', f.k); if (f.multiple) urls.push(up); else urls = [up]; draw(); info(f.k, ''); fire(f.k); }
            catch (e) { info(f.k, '<span class="err">' + esc(e.message) + '</span>'); }
            finally { photosBusy[f.k]--; }
          }
        };
        if (g) g.onchange = s.onchange;
        F[f.k] = { f, get: () => urls.map(u => u.url).join(' '), set: v => { urls = String(v || '').split(/\s+/).filter(Boolean).map(u => ({ url: u, thumb: driveThumb(u) })); draw(); }, urls: () => urls };
      } else F[f.k] = { f, get: () => s.value.trim(), set: v => { s.value = v === undefined || v === null ? '' : v; } };
      if (f.type === 'select' || f.type === 'seg' || f.type === 'symptom') fill(f);
      if (PICK[f.type]) {
        picker(s, PICK[f.type], { allowNew: f.allowNew !== undefined ? f.allowNew : ALLOW_NEW[f.type], upper: f.type === 'truck' || f.type === 'dest' });
        s.addEventListener('blur', () => setTimeout(() => { normalise(f); fire(f.k); }, 160));
      }
      if (f.type !== 'seg' && f.type !== 'photo') { s.addEventListener('change', () => fire(f.k)); s.addEventListener('input', () => { if (!PICK[f.type]) fire(f.k, true); }); }
      if (f.value !== undefined) F[f.k].set(typeof f.value === 'function' ? f.value() : f.value);
    });
    function normalise(f) {
      const s = $in(f.k), v = s.value.trim(); if (!v) return;
      if (f.type === 'truck') s.value = normTruck(v);
      else if (f.type === 'driver') { const d = findDriver(v); s.value = d ? d.name : titleCase(v); }
      else if (f.type === 'dest') { const d = findDest(v); s.value = d ? d.name : v.replace(/\s+/g, ' ').toUpperCase(); }
      else if (f.type === 'party') { const p = M().parties.find(p => keyOf(p.name) === keyOf(v) || (p.alt || '').split(',').some(a => a && keyOf(a) === keyOf(v))); if (p) s.value = p.name; }
      else if (f.type === 'fault' || f.type === 'part') { const it = PICK[f.type]().find(x => keyOf(x.value) === keyOf(v) || keyOf(x.label) === keyOf(v)); if (it) s.value = it.value; }
    }
    function info(k, h) { const x = el.querySelector('#si_' + k); if (x) x.innerHTML = h || (F[k] && F[k].f.hint ? '<span class="hint">' + esc(F[k].f.hint) + '</span>' : ''); }
    let apTimer;
    function fire(k, typing) {
      refresh();
      handlers.forEach(h => h(k, api_));
      const ap = fields.find(f => f.type === 'approver');
      if (ap && (k === ap.amountKey || k === '_init') ) { clearTimeout(apTimer); apTimer = setTimeout(loadApprovers, typing ? 600 : 0); }
    }
    async function loadApprovers() {
      const f = fields.find(x => x.type === 'approver'); if (!f || !shown(f)) return;
      const s = $in(f.k), cur = s.value, amt = Number(F[f.amountKey] ? F[f.amountKey].get() : 0) || 0;
      try {
        const out = await call('approvers', { module: f.module || opts.module, amount: amt, overLimit: f.overLimit ? f.overLimit(values(true)) : false });
        s.innerHTML = '<option value="">— whose approval? —</option>' + out.approvers.map(a => '<option value="' + esc(a.name) + '">' + esc(a.name) + ' · ' + esc(a.role) + '</option>').join('');
        if (out.approvers.some(a => a.name === cur)) s.value = cur; else if (out.approvers.length === 1) s.value = out.approvers[0].name;
        const lim = Number(M().settings.Approval_Limit_Dept_Head) || 2000;
        info(f.k, amt > lim ? '<span class="hint">Above ₹' + lim.toLocaleString('en-IN') + ' — only HO (Level 1) can approve</span>' : '');
      } catch (e) { info(f.k, '<span class="err">' + esc(e.message) + '</span>'); }
    }
    const shown = f => !f.show || f.show(values(true));
    function refresh() { const v = values(true); fields.forEach(f => { const w = el.querySelector('#fx_' + f.k); if (w) w.classList.toggle('hidden', !!f.show && !f.show(v)); }); }
    function values(all) {
      const o = {};
      fields.forEach(f => { if (f.type !== 'html' && F[f.k]) o[f.k] = F[f.k].get(); });
      if (all) return o;
      const out = {};
      fields.forEach(f => { if (f.type !== 'html' && !f.noSend && (!f.show || f.show(o))) out[f.k] = o[f.k]; });
      return out;
    }
    function check() {
      if (Object.values(photosBusy).some(n => n > 0)) return 'Wait — photo still uploading';
      const v = values(true);
      for (const f of fields) {
        if (!shown(f) || f.type === 'html') continue;
        const x = v[f.k], req = typeof f.req === 'function' ? f.req(v) : f.req;
        if (req && (x === '' || x === undefined)) return (f.label || f.k) + ' is required';
        if ((f.type === 'num' || f.type === 'dec') && x !== '' && isNaN(Number(x))) return (f.label || f.k) + ' must be a number';
        if (f.type === 'truck' && x && !/^[A-Z]{2}\d{1,2}[A-Z]{0,3}\d{4}$/.test(x)) return 'Invalid truck number (e.g. MH40CQ8307)';
      }
      return '';
    }
    function reset() { fields.forEach(f => { if (F[f.k] && f.type !== 'html') F[f.k].set(f.value !== undefined ? (typeof f.value === 'function' ? f.value() : f.value) : ''); info(f.k, ''); }); fire('_init'); }
    const api_ = { F, val: k => F[k] ? F[k].get() : '', set: (k, v) => { if (F[k]) { F[k].set(v); } }, setFire: (k, v) => { F[k].set(v); fire(k); }, values: () => values(false), all: () => values(true),
      check, reset, info, refresh, on: h => handlers.push(h), input: $in, reloadApprovers: loadApprovers, fill: k => fill(fields.find(f => f.k === k)), field: k => el.querySelector('#fx_' + k) };
    setTimeout(() => fire('_init'), 0);
    return api_;
  }
  function symptoms() {
    const s = []; M().faults.forEach(f => { (f.symptom || '').split(/[\/,;]| or /).length; if (f.symptom && s.indexOf(f.symptom) < 0) s.push(f.symptom); });
    if (s.indexOf('Other') < 0) s.push('Other'); return s;
  }
  function driveThumb(u) { const m = String(u).match(/\/d\/([\w-]+)/) || String(u).match(/id=([\w-]+)/); return m ? 'https://drive.google.com/thumbnail?id=' + m[1] + '&sz=w400' : u; }

  /** Standard "save" button handler: checks the form, posts, shows error inside errEl. */
  async function submit(btn, errEl, fn) {
    errEl.classList.add('hidden');
    const label = btn.innerHTML; btn.disabled = true; btn.innerHTML = 'Saving…';
    try { return await fn(); }
    catch (e) { errEl.textContent = e.message; errEl.classList.remove('hidden'); errEl.scrollIntoView({ block: 'center' }); return null; }
    finally { btn.disabled = false; btn.innerHTML = label; }
  }

  // ---- 12. LISTS ----------------------------------------------------------------
  /** rows → card list. fmt(row) returns {t, s, tag, cls, click} */
  function rowsHtml(rows, fmt, empty) {
    if (!rows || !rows.length) return '<div class="muted">' + esc(empty || 'Nothing here.') + '</div>';
    return rows.map((r, i) => { const x = fmt(r, i); return '<div class="item' + (x.click ? ' tap' : '') + '" data-i="' + i + '"><div class="itop"><b>' + x.t + '</b>' + (x.tag ? '<span class="pill ' + (x.cls || '') + '">' + esc(x.tag) + '</span>' : '') + '</div><small>' + (x.s || '') + '</small>' + (x.extra || '') + '</div>'; }).join('');
  }
  function statusCls(s) { s = String(s || ''); return /Approved|Paid|Received$|Back on Road|Closed|OK|Fitted/.test(s) ? 'ok' : /Rejected|Over|Check|Breakdown|Missing/.test(s) ? 'bad' : /Pending|Hold|Part|Draft|Reported|Ack|Mechanic|Under/.test(s) ? 'warn' : ''; }

  // ---- 13. SMALL UTILS ------------------------------------------------------------
  function keyOf(s) { return String(s || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
  function titleCase(s) { return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase().replace(/\b([a-z])/g, m => m.toUpperCase()); }
  function esc(s) { return String(s === null || s === undefined ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c])); }
  function uid() { return (crypto.randomUUID ? crypto.randomUUID() : Date.now().toString(36) + Math.random().toString(36).slice(2)).replace(/-/g, ''); }
  function device() { const u = navigator.userAgent; const m = u.match(/\(([^)]+)\)/); return (m ? m[1] : u).slice(0, 100); }
  function todayISO() { const d = new Date(); d.setMinutes(d.getMinutes() - d.getTimezoneOffset()); return d.toISOString().slice(0, 10); }
  function monthISO() { return todayISO().slice(0, 7); }
  function nowText() { const d = new Date(), p = n => String(n).padStart(2, '0'); return p(d.getDate()) + '-' + p(d.getMonth() + 1) + '-' + d.getFullYear() + ' ' + p(d.getHours()) + ':' + p(d.getMinutes()); }
  function normTruck(v) { return String(v || '').toUpperCase().replace(/[^A-Z0-9]/g, ''); }
  function inr(n) { if (n === '' || n === null || n === undefined || isNaN(Number(n))) return ''; return '₹' + Number(n).toLocaleString('en-IN', { maximumFractionDigits: 2 }); }
  // ---- TRUCK JOURNEY (shared by Truck Status board and Dashboard) --------------
  const STAGES = [
    { k: 'WAIT_ORDER', icon: '🅿️', en: 'At depot – waiting for order', short: 'Waiting for order', hi: 'डिपो पर – ऑर्डर का इंतज़ार', wa: 'AT DEPOT · WAITING FOR ORDER', c: '#64748B' },
    { k: 'WAIT_LOADER', icon: '⏳', en: 'At depot – waiting for loader', short: 'Waiting for loader', hi: 'डिपो पर – लोडिंग का इंतज़ार', wa: 'AT DEPOT · WAITING FOR LOADER', c: '#B45309', next: 'LOADED' },
    { k: 'LOADED', icon: '🚚', en: 'Loaded – to destination', short: 'Loaded', hi: 'माल भरा – रास्ते में', wa: 'LOADED · TO DESTINATION', c: '#1D4ED8', next: 'UNLOADING' },
    { k: 'UNLOADING', icon: '📍', en: 'At party – unloading / waiting', short: 'At party', hi: 'पार्टी पर – खाली होना बाकी', wa: 'AT PARTY · UNLOADING / WAITING', c: '#7C3AED', next: 'RETURNING' },
    { k: 'RETURNING', icon: '↩️', en: 'Unloaded – returning (→ waiting for order)', short: 'Returning', hi: 'खाली – वापसी', wa: 'UNLOADED · RETURNING', c: '#0F766E', next: 'DONE' },
    { k: 'OFF', icon: '🔧', en: 'Off road', short: 'Off road', hi: 'गाड़ी बंद', wa: 'OFF ROAD', c: '#B91C1C' },
    { k: 'UNSET', icon: '❓', en: 'Status not set', short: 'Not set', hi: 'स्थिति नहीं डाली', wa: 'STATUS NOT UPDATED', c: '#9333EA' },
  ];
  const NEXT_BTN = { LOADED: '✅ Loaded · माल भर गया', UNLOADING: '📍 Reached party · पार्टी पर पहुँचा', RETURNING: '✅ Unloaded · खाली हो गया', DONE: '🏠 Reached depot · डिपो पहुँचा' };
  const stageOf = k => STAGES.find(x => x.k === k) || STAGES[0];
  const tDate = v => { if (!v) return null; const m = String(v).trim().match(/^(\d{1,2})[\/.\-](\d{1,2})[\/.\-](\d{4})(?:[ T,]+(\d{1,2}):(\d{2}))?/);
    if (m) return new Date(+m[3], +m[2] - 1, +m[1], +(m[4] || 0), +(m[5] || 0)); const d = new Date(String(v).trim().replace(' ', 'T')); return isNaN(d) ? null : d; };
  /** One status per truck. d = { trips, pending, off, locs, now }; list = trucks [{no, capacity|cap, ownership|own}] to show. */
  function truckStages(d, list) {
    const now = tDate(d.now) || new Date(), open = {}, done = {}, off = {}, pend = {};
    (d.trips || []).slice().sort((a, b) => (tDate(a.Order_At) || 0) - (tDate(b.Order_At) || 0)).forEach(t => { if (t.Stage === 'DONE') done[t.Truck_No] = t; else open[t.Truck_No] = t; });
    (d.off || []).forEach(b => off[b.Truck_No] = b);
    (d.pending || []).forEach(l => pend[l.Truck_No] = l);
    const seen = {}, all = [];
    const add = t => { if (!t || !t.no || seen[t.no]) return; seen[t.no] = 1; all.push(t); };
    (list || []).forEach(add);
    Object.keys(open).concat(Object.keys(off), Object.keys(pend)).forEach(no => add({ no: no }));
    return all.map(t => {
      const o = off[t.no], tr = open[t.no], p = pend[t.no], loc = (d.locs || {})[t.no], dn = done[t.no];
      let st, since, place;
      if (o) { st = 'OFF'; since = o.Created_At; place = (o.Off_Road_Type === 'Driver not available' ? 'No driver' : o.Off_Road_Type || 'Breakdown') + (o.Location ? ' · ' + o.Location : ''); }
      else if (tr) { st = tr.Stage; since = tr.Stage_At || tr.Order_At; place = tr.Location || (tr.Stage === 'LOADED' ? '' : tr.Destination); }
      else if (p) { st = 'WAIT_LOADER'; since = p.Created_At; place = 'Order LR ' + p.LR_No; }
      else { st = 'WAIT_ORDER'; since = (loc && loc.at) || (dn && dn.Returned_At) || ''; place = (loc && loc.loc) || 'Depot'; }
      const s0 = tDate(since), h = s0 ? Math.max(0, (now - s0) / 36e5) : NaN;
      return { no: t.no, cap: Number(t.capacity || t.cap) || '', own: /MARKET|HIRE|ATTACH/i.test(t.ownership || t.own || '') ? 'MARKET' : 'OWN', st: st, since: since, hrs: h,
        trip: tr || null, off: o || null, pend: p || null, place: place || '', dest: (tr && tr.Destination) || (p && p.Destination) || '',
        why: o ? (o.Off_Road_Type === 'Driver not available' ? 'No driver' : o.Off_Road_Type || 'Breakdown') : '',
        remark: tr ? (tr.Remark || '') : (!o && !p && loc ? loc.note || '' : ''), mt: Number(tr && tr.Qty_MT) || Number(t.capacity || t.cap) || 0 };
    });
  }
  const ago = h => isNaN(h) ? '' : h < 1 ? Math.round(h * 60) + ' min' : h < 48 ? Math.round(h) + ' h' : Math.round(h / 24) + ' d';
  /** WhatsApp text in the same layout the team already sends ("RETURNING VEHICLE STATUS"). */
  function stageReport(rows, title, escHrs) {
    const by = {}; rows.forEach(r => (by[r.st] = by[r.st] || []).push(r));
    const now = new Date(), p2 = n => String(n).padStart(2, '0');
    let t = '*' + (title || 'TRUCK STATUS') + ' · ' + p2(now.getDate()) + '-' + p2(now.getMonth() + 1) + ' ' + p2(now.getHours()) + ':' + p2(now.getMinutes()) + '*\n';
    STAGES.forEach(s => {
      const a = (by[s.k] || []).sort((x, y) => (y.hrs || 0) - (x.hrs || 0)); if (!a.length) return;
      t += '\n*' + s.wa + ' (' + a.length + ')*\n' + a.map(r => {
        const id = r.no.slice(-4) + (r.est ? '~' : ''), pl = String(r.place || '').toUpperCase();
        if (s.k === 'UNLOADING') { const day = Math.floor((r.hrs || 0) / 24) + 1; return id + ' - ' + (r.dest || pl).toUpperCase() + (r.trip && r.trip.Party ? ' · ' + String(r.trip.Party).toUpperCase() : '') + ' · Day-' + day + ((r.hrs || 0) >= (escHrs || 4) ? ' ⚠️' : ''); }
        if (s.k === 'LOADED' || s.k === 'WAIT_LOADER') return id + ' - ' + (s.k === 'LOADED' ? (r.dest || pl).toUpperCase() : pl) + (isNaN(r.hrs) ? '' : ' · ' + ago(r.hrs));
        if (s.k === 'RETURNING') return id + ' - ' + (r.dest ? r.dest.toUpperCase() + ' → DEPOT' : pl);
        if (s.k === 'OFF') return id + ' - ' + pl + (isNaN(r.hrs) ? '' : ' · ' + ago(r.hrs));
        return id + (pl ? ' - ' + pl : '');
      }).join('\n') + '\n';
    });
    if (rows.some(r => r.est)) t += '\n_~ = estimate (not yet updated on Truck Status board)_';
    return t.trim();
  }

  // ---- STATUS REPORT IMAGE (Truck Status board + Dashboard) -------------------
  let H2C = null;
  function loadH2C() {
    if (w.html2canvas) return Promise.resolve();
    return H2C || (H2C = new Promise((res, rej) => { const sc = document.createElement('script'); sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js'; sc.onload = res; sc.onerror = () => { H2C = null; rej(new Error('Could not load the image maker — check internet')); }; document.head.appendChild(sc); }));
  }
  /** Turns an element into a PNG and shares it (phone: share sheet → WhatsApp; laptop: copied for WhatsApp Web). */
  async function shareImage(el, name, caption) {
    await loadH2C();
    const cv = await w.html2canvas(el, { scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false });
    const blob = await new Promise(r => cv.toBlob(r, 'image/png')), file = new File([blob], name, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [file] })) { try { await navigator.share({ files: [file], text: caption }); return; } catch (e) { if (e.name === 'AbortError') return; } }
    try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); toast('Image copied — open WhatsApp and paste (Ctrl+V)', 'ok', 6000); w.open('https://web.whatsapp.com/', 'jnp_whatsapp'); return; } catch (e) { }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 4000);
    toast('Image downloaded — attach it in WhatsApp', 'warn', 6000);
  }
  const SR_CSS = '.srep{position:fixed;left:-10000px;top:0;width:460px;background:#fff;padding:18px;font-family:Barlow,Arial,sans-serif;color:#1B2430}' +
    '.srep .h{display:flex;align-items:center;gap:12px;padding-bottom:10px}.srep .h img{height:38px}.srep .h b{display:block;font:800 21px "Barlow Condensed",Arial,sans-serif;color:#022A5B}.srep .h span{font-size:13px;color:#5D6877}' +
    '.srep .st{display:flex;height:4px}.srep .st i{flex:1}.srep .kp{display:grid;grid-template-columns:repeat(3,1fr);gap:6px;margin-top:12px}' +
    '.srep .kp div{background:#F3F6FB;border-radius:10px;padding:7px 6px;text-align:center;border-top:3px solid var(--c)}.srep .kp small{display:block;font-size:10.5px;color:#5D6877;font-weight:700;line-height:1.2}' +
    '.srep .kp b{display:block;font:800 19px "Barlow Condensed",Arial,sans-serif;color:#022A5B}.srep .kp span{font-size:11px;color:#334155;font-weight:700}' +
    '.srep .sec{margin:14px 0 4px;font-size:12px;font-weight:800;letter-spacing:.4px;text-transform:uppercase;color:var(--c);display:flex;justify-content:space-between;border-bottom:2px solid var(--c);padding-bottom:3px}' +
    '.srep table{width:100%;border-collapse:collapse;font-size:12.5px}.srep td{padding:4px 3px;border-bottom:1px solid #EEF1F5;vertical-align:top}.srep td.n{font-weight:800;white-space:nowrap}.srep td.r{text-align:right;white-space:nowrap;color:#5D6877}.srep td.rm{color:#7C2D12;font-style:italic}.srep td.late{color:#B91C1C;font-weight:800}' +
    '.srep .f{margin-top:12px;font-size:11px;color:#7A8596;text-align:right}';
  /** Builds the status report element: totals for heads on top, one table per stage, off road as a size summary at the bottom. */
  function statusReportEl(rows, opt) {
    opt = opt || {};
    if (!document.getElementById('srepCss')) { const st = document.createElement('style'); st.id = 'srepCss'; st.textContent = SR_CSS; document.head.appendChild(st); }
    const by = {}; rows.forEach(r => (by[r.st] = by[r.st] || []).push(r));
    const mt = a => Math.round(a.reduce((x, r) => x + (Number(r.mt) || Number(r.cap) || 0), 0)), n = k => (by[k] || []).length;
    const now = new Date(), p2 = v => String(v).padStart(2, '0'), stamp = p2(now.getDate()) + '-' + p2(now.getMonth() + 1) + '-' + now.getFullYear() + ' ' + p2(now.getHours()) + ':' + p2(now.getMinutes());
    const kp = (k, label) => { const s = stageOf(k), a = by[k] || []; return '<div style="--c:' + s.c + '"><small>' + label + '</small><b>' + mt(a) + ' MT</b><span>' + a.length + ' truck' + (a.length === 1 ? '' : 's') + '</span></div>'; };
    const cls = r => r.cap ? Math.round(r.cap) + 'T' : '';
    const sect = k => {
      const s = stageOf(k), a = (by[k] || []).slice().sort((x, y) => (y.hrs || 0) - (x.hrs || 0)); if (!a.length) return '';
      return '<div class="sec" style="--c:' + s.c + '"><span>' + esc(s.en) + '</span><span>' + a.length + (a.length === 1 ? ' truck · ' : ' trucks · ') + mt(a) + ' MT</span></div><table>' + a.map(r => {
        const late = k === 'UNLOADING' && (r.hrs || 0) >= (opt.escHrs || 4);
        const where = k === 'WAIT_LOADER' ? 'LR ' + ((r.trip || r.pend || {}).LR_No || '') + ' → ' + (r.dest || '') : k === 'LOADED' ? '→ ' + (r.dest || '') : k === 'RETURNING' ? (r.dest || '') + ' → depot' : k === 'UNLOADING' ? (r.dest || r.place) + (r.trip && r.trip.Party ? ' · ' + r.trip.Party : '') : (r.place || '');
        return '<tr><td class="n">' + esc(r.no.slice(-4)) + (r.est ? '~' : '') + '</td><td>' + cls(r) + '</td><td>' + esc(where) + '</td><td class="' + (late ? 'late' : 'r') + '">' + (isNaN(r.hrs) ? '' : (k === 'UNLOADING' ? 'Day-' + (Math.floor((r.hrs || 0) / 24) + 1) + (late ? ' ⚠️' : '') : ago(r.hrs))) + '</td></tr>' +
          (r.remark ? '<tr><td></td><td colspan="3" class="rm">' + esc(r.remark) + '</td></tr>' : '');
      }).join('') + '</table>';
    };
    const off = by.OFF || [], why = {};          // off road: by reason — how much capacity each reason is holding (no truck list)
    off.forEach(r => { const c = r.why || 'Other'; (why[c] = why[c] || []).push(r); });
    const offHtml = off.length ? '<div class="sec" style="--c:#B91C1C"><span>Off road</span><span>' + off.length + ' trucks · ' + mt(off) + ' MT</span></div><table>' +
      Object.keys(why).sort((a, b) => mt(why[b]) - mt(why[a])).map(c => '<tr><td class="n">' + esc(c) + '</td><td>' + why[c].length + ' truck' + (why[c].length === 1 ? '' : 's') + '</td><td class="r">' + mt(why[c]) + ' MT</td></tr>').join('') + '</table>' : '';
    const box = document.createElement('div'); box.className = 'srep';
    box.innerHTML = '<div class="h"><img src="' + CONFIG.LOGO + '" alt=""><div><b>' + esc(opt.title || 'Truck status') + '</b><span>' + stamp + '</span></div></div>' +
      '<div class="st"><i style="background:#F7821A"></i><i style="background:#1565D8"></i><i style="background:#B9061E"></i></div>' +
      '<div class="kp">' + kp('WAIT_LOADER', 'Order received<br>waiting for loader') + kp('LOADED', 'Loaded<br>to destination') + kp('UNLOADING', 'At party<br>unloading') +
        kp('WAIT_ORDER', 'At depot<br>waiting for order') + '<div style="--c:#022A5B"><small>Fleet<br>total</small><b>' + mt(rows) + ' MT</b><span>' + rows.length + ' trucks</span></div>' + '<div style="--c:#B91C1C"><small>Off road</small><b>' + mt(off) + ' MT</b><span>' + off.length + ' trucks</span></div></div>' +
      ['WAIT_ORDER', 'WAIT_LOADER', 'LOADED', 'UNLOADING', 'RETURNING', 'UNSET'].map(sect).join('') + offHtml +
      (rows.some(r => r.est) ? '<div class="f" style="text-align:left">~ = estimate (not yet updated on the Truck Status board)</div>' : '') +
      '<div class="f">JNP Cargo Movers · ' + esc((session() || { user: {} }).user.name || '') + ' · ' + stamp + '</div>';
    const cap = '*' + (opt.title || 'Truck status') + ' · ' + stamp + '*\nOrder received (waiting for loader): ' + n('WAIT_LOADER') + ' trucks · ' + mt(by.WAIT_LOADER || []) + ' MT\nLoaded (to destination): ' + n('LOADED') + ' trucks · ' + mt(by.LOADED || []) + ' MT\nAt party: ' + n('UNLOADING') + ' · Waiting for order: ' + n('WAIT_ORDER') + ' · Off road: ' + off.length;
    return { el: box, caption: cap };
  }
  async function shareStatusImage(rows, opt) {
    busy(true, 'Making report image…');
    const r = statusReportEl(rows, opt); document.body.appendChild(r.el);
    try { await new Promise(x => setTimeout(x, 150)); busy(false); await shareImage(r.el, 'JNP_Truck_Status_' + todayISO() + '.png', r.caption); }
    catch (e) { busy(false); toast(e.message, 'bad'); } finally { r.el.remove(); }
  }

  function param(k) { return new URLSearchParams(location.search).get(k); }
  function dmy(v) { const s = String(v || ''); const m = s.match(/^(\d{4})-(\d\d)-(\d\d)(.*)$/); return m ? m[3] + '-' + m[2] + '-' + m[1] + m[4] : s; }

  w.JNP = {
    CONFIG, MODULES, TILES, api, call, session, login, logout, goLogin, rights, can, requireModule, refreshMe, masters, M, list,
    findTruck, findDriver, findDest, header, toast, busy, tabs, done, whatsapp, shareFile, waText, approvalButtons,
    compress, uploadPhoto, geo, picker, form, submit, rowsHtml, statusCls, driveThumb,
    isApp, STAGES, NEXT_BTN, stageOf, truckStages, stageReport, ago, tDate, shareImage, statusReportEl, shareStatusImage,
    esc, uid, keyOf, titleCase, todayISO, monthISO, nowText, normTruck, inr, param, dmy, store,
  };
})(window);
