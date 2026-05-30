/* ============================================================
   DankDeals — Theme + Tweaks (vanilla, cross-page)
   Persists to localStorage so the look carries across pages.
   Hooks the host "Tweaks" toolbar toggle via postMessage.
   ============================================================ */
(function () {
  'use strict';
  const KEY = 'dd_theme_v1';

  const DEFAULTS = { accent: 'brand', corners: 'soft', font: 'Archivo', deals: 'tasteful' };

  const ACCENTS = {
    brand:   { label: 'DankDeals', sw: '#3B9322', g: '#3B9322', d6: '#338019', d7: '#296914', d8: '#1f5210', l50: '#eef7e9', l100: '#dcefd0', l200: '#bfe2ac' },
    forest:  { label: 'Forest',    sw: '#1f6b2e', g: '#1f6b2e', d6: '#1a5a27', d7: '#154a20', d8: '#103a19', l50: '#e9f3ec', l100: '#cfe6d6', l200: '#a7d2b5' },
    lime:    { label: 'Lime',      sw: '#5fb519', g: '#5fb519', d6: '#52a014', d7: '#458511', d8: '#356a0d', l50: '#f1f8e6', l100: '#e0f0c8', l200: '#c6e398' },
    emerald: { label: 'Emerald',   sw: '#0f9d6b', g: '#0f9d6b', d6: '#0c895d', d7: '#0a704d', d8: '#08583c', l50: '#e6f6f0', l100: '#c8ece0', l200: '#97dcc3' },
  };
  const CORNERS = {
    sharp: { label: 'Sharp', sm: '4px', r: '7px', lg: '10px', xl: '14px', pill: '10px', card: '10px' },
    soft:  { label: 'Soft',  sm: '9px', r: '14px', lg: '22px', xl: '30px', pill: '999px', card: '22px' },
    round: { label: 'Round', sm: '14px', r: '20px', lg: '28px', xl: '36px', pill: '999px', card: '28px' },
  };
  const FONTS = {
    'Archivo':       { label: 'Archivo', url: null },
    'Space Grotesk': { label: 'Grotesk', url: 'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&display=swap' },
    'Sora':          { label: 'Sora',    url: 'https://fonts.googleapis.com/css2?family=Sora:wght@600;700;800&display=swap' },
  };

  function load() { try { return Object.assign({}, DEFAULTS, JSON.parse(localStorage.getItem(KEY)) || {}); } catch { return Object.assign({}, DEFAULTS); } }
  let theme = load();

  const loadedFonts = new Set();
  function ensureFont(name) {
    const f = FONTS[name]; if (!f || !f.url || loadedFonts.has(name)) return;
    const l = document.createElement('link'); l.rel = 'stylesheet'; l.href = f.url; document.head.appendChild(l); loadedFonts.add(name);
  }

  function apply() {
    const r = document.documentElement.style;
    const a = ACCENTS[theme.accent] || ACCENTS.brand;
    r.setProperty('--green', a.g);
    r.setProperty('--green-600', a.d6);
    r.setProperty('--green-700', a.d7);
    r.setProperty('--green-800', a.d8);
    r.setProperty('--green-50', a.l50);
    r.setProperty('--green-100', a.l100);
    r.setProperty('--green-200', a.l200);
    const c = CORNERS[theme.corners] || CORNERS.soft;
    r.setProperty('--r-sm', c.sm); r.setProperty('--r', c.r); r.setProperty('--r-lg', c.lg); r.setProperty('--r-xl', c.xl); r.setProperty('--pill', c.pill);
    ensureFont(theme.font);
    r.setProperty('--font-display', `'${theme.font}', system-ui, sans-serif`);
    document.documentElement.dataset.deals = theme.deals;
  }
  function save() { localStorage.setItem(KEY, JSON.stringify(theme)); apply(); renderPanel(); }
  apply();

  // hide deal badges if "minimal"
  const dealCSS = document.createElement('style');
  dealCSS.textContent = `[data-deals="minimal"] .badge--deal, [data-deals="minimal"] .pcard s { display:none !important; }`;
  document.head.appendChild(dealCSS);

  /* ---------- Panel ---------- */
  let panel, open = false;
  const STYLE = `
    .ddtweaks{position:fixed;right:16px;bottom:16px;z-index:2147483646;width:268px;
      background:rgba(255,255,255,.86);-webkit-backdrop-filter:blur(22px) saturate(160%);backdrop-filter:blur(22px) saturate(160%);
      border:1px solid rgba(0,0,0,.08);border-radius:16px;box-shadow:0 14px 44px rgba(0,0,0,.22);
      font-family:'Hanken Grotesk',system-ui,sans-serif;color:#0c0f0b;overflow:hidden;display:none}
    .ddtweaks.open{display:block}
    .ddtweaks__hd{display:flex;align-items:center;justify-content:space-between;padding:13px 12px 13px 16px;border-bottom:1px solid rgba(0,0,0,.06)}
    .ddtweaks__hd b{font-family:'Archivo',sans-serif;font-weight:800;font-size:.95rem;letter-spacing:-.01em}
    .ddtweaks__hd .dd-logo{height:15px;margin-left:6px;vertical-align:-2px}
    .ddtweaks__x{appearance:none;border:0;background:transparent;width:26px;height:26px;border-radius:7px;font-size:16px;color:#687062;cursor:pointer}
    .ddtweaks__x:hover{background:rgba(0,0,0,.06);color:#0c0f0b}
    .ddtweaks__b{padding:14px 16px 16px;display:flex;flex-direction:column;gap:16px;max-height:70vh;overflow-y:auto}
    .ddt-row>label{display:block;font-size:.72rem;font-weight:700;letter-spacing:.04em;text-transform:uppercase;color:#687062;margin-bottom:7px}
    .ddt-seg{display:flex;gap:6px;flex-wrap:wrap}
    .ddt-seg button{flex:1;min-width:54px;appearance:none;border:1.5px solid #e4e8de;background:#fff;border-radius:9px;padding:8px 6px;font:inherit;font-size:.82rem;font-weight:600;color:#20271d;cursor:pointer;transition:.12s}
    .ddt-seg button:hover{border-color:var(--green)}
    .ddt-seg button.on{border-color:var(--green);background:var(--green-50);color:var(--green-700)}
    .ddt-sw{display:flex;gap:8px}
    .ddt-sw button{width:38px;height:38px;border-radius:10px;border:2px solid transparent;cursor:pointer;position:relative;outline:1.5px solid #e4e8de;outline-offset:-1.5px}
    .ddt-sw button.on{outline:2.5px solid var(--green);outline-offset:2px}
    .ddt-hint{font-size:.72rem;color:#9aa394;margin-top:2px}
  `;
  function buildPanel() {
    const st = document.createElement('style'); st.textContent = STYLE; document.head.appendChild(st);
    panel = document.createElement('div');
    panel.className = 'ddtweaks';
    document.body.appendChild(panel);
    renderPanel();
  }
  function seg(name, opts, cur) {
    return `<div class="ddt-seg">${opts.map(([v, l]) => `<button data-set="${name}" data-val="${v}" class="${cur === v ? 'on' : ''}">${l}</button>`).join('')}</div>`;
  }
  function renderPanel() {
    if (!panel) return;
    panel.innerHTML = `
      <div class="ddtweaks__hd"><b>Tweaks</b><button class="ddtweaks__x" data-twk-close aria-label="Close">✕</button></div>
      <div class="ddtweaks__b">
        <div class="ddt-row"><label>Accent color</label>
          <div class="ddt-sw">${Object.entries(ACCENTS).map(([k, a]) => `<button data-set="accent" data-val="${k}" class="${theme.accent === k ? 'on' : ''}" style="background:${a.sw}" title="${a.label}"></button>`).join('')}</div>
        </div>
        <div class="ddt-row"><label>Corner style</label>
          ${seg('corners', Object.entries(CORNERS).map(([k, c]) => [k, c.label]), theme.corners)}
        </div>
        <div class="ddt-row"><label>Display font</label>
          ${seg('font', Object.entries(FONTS).map(([k, f]) => [k, f.label]), theme.font)}
        </div>
        <div class="ddt-row"><label>Deals emphasis</label>
          ${seg('deals', [['minimal', 'Minimal'], ['tasteful', 'Tasteful'], ['loud', 'Loud']], theme.deals)}
          <div class="ddt-hint">Controls sale badges &amp; strikethrough prices.</div>
        </div>
      </div>`;
  }
  buildPanel();

  panel.addEventListener('click', (e) => {
    const set = e.target.closest('[data-set]');
    if (set) { theme[set.dataset.set] = set.dataset.val; save(); }
    if (e.target.closest('[data-twk-close]')) { open = false; panel.classList.remove('open'); try { window.parent.postMessage({ type: '__edit_mode_dismissed' }, '*'); } catch {} }
  });

  /* ---------- Host protocol ---------- */
  window.addEventListener('message', (e) => {
    const t = e && e.data && e.data.type;
    if (t === '__activate_edit_mode') { open = true; panel.classList.add('open'); }
    else if (t === '__deactivate_edit_mode') { open = false; panel.classList.remove('open'); }
  });
  try { window.parent.postMessage({ type: '__edit_mode_available' }, '*'); } catch {}
})();
