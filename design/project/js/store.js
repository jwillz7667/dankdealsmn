/* ============================================================
   DankDeals — Store engine (cart, icons, helpers)
   ============================================================ */
(function () {
  'use strict';

  /* ---------- Icons (Lucide-style, 24x24 stroke) ---------- */
  const S = (p, o) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ${o||''}>${p}</svg>`;
  const IC = {
    menu: S('<path d="M3 6h18M3 12h18M3 18h18"/>'),
    cart: S('<circle cx="9" cy="21" r="1.6"/><circle cx="18" cy="21" r="1.6"/><path d="M2.5 3h2.2l2.1 12.4a1.6 1.6 0 0 0 1.6 1.3h8.9a1.6 1.6 0 0 0 1.6-1.2l1.7-7.5H6"/>'),
    search: S('<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>'),
    user: S('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
    heart: S('<path d="M20.8 5.6a5.5 5.5 0 0 0-7.8 0L12 6.6l-1-1a5.5 5.5 0 1 0-7.8 7.8l1 1L12 21l7.8-6.6 1-1a5.5 5.5 0 0 0 0-7.8z"/>'),
    star: S('<path d="M12 2.5l2.9 6 6.6.9-4.8 4.6 1.2 6.5L12 21.4 6.1 20.5l1.2-6.5L2.5 9.4l6.6-.9z"/>', 'fill="currentColor" stroke="none"'),
    plus: S('<path d="M12 5v14M5 12h14"/>'),
    minus: S('<path d="M5 12h14"/>'),
    x: S('<path d="M18 6 6 18M6 6l12 12"/>'),
    check: S('<path d="M20 6 9 17l-5-5"/>'),
    chevR: S('<path d="m9 6 6 6-6 6"/>'),
    chevL: S('<path d="m15 6-6 6 6 6"/>'),
    chevD: S('<path d="m6 9 6 6 6-6"/>'),
    arrowR: S('<path d="M5 12h14M13 6l6 6-6 6"/>'),
    pin: S('<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0z"/><circle cx="12" cy="10" r="3"/>'),
    clock: S('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
    shield: S('<path d="M12 2.5 4 6v6c0 5 3.5 8 8 9.5 4.5-1.5 8-4.5 8-9.5V6z"/><path d="m9 12 2 2 4-4"/>'),
    bolt: S('<path d="M13 2 4 14h7l-1 8 9-12h-7z" fill="currentColor" stroke="none"/>'),
    leaf: S('<path d="M11 20A7 7 0 0 1 4 13c0-6 7-10.5 16-10.5C20 11 16 20 8 20"/><path d="M8 20c0-5 3-9 9-13"/>'),
    filter: S('<path d="M3 5h18M6 12h12M10 19h4"/>'),
    trash: S('<path d="M3 6h18M8 6V4h8v2M6 6l1 14h10l1-14"/>'),
    lock: S('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
    phone: S('<path d="M6 3h4l2 5-3 2a12 12 0 0 0 5 5l2-3 5 2v4a2 2 0 0 1-2 2A17 17 0 0 1 4 5a2 2 0 0 1 2-2z"/>'),
    tag: S('<path d="M3 3h7l11 11-7 7L3 10z"/><circle cx="8" cy="8" r="1.6" fill="currentColor"/>'),
    sparkle: S('<path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z" fill="currentColor" stroke="none"/>'),
    box: S('<path d="m3 7 9-4 9 4-9 4z"/><path d="M3 7v10l9 4 9-4V7"/><path d="M12 11v10"/>'),
    truck: S('<path d="M2 6h11v9H2z"/><path d="M13 9h4l3 3v3h-7z"/><circle cx="6" cy="18" r="1.8"/><circle cx="17" cy="18" r="1.8"/>'),
    home: S('<path d="M4 11 12 4l8 7"/><path d="M6 10v10h12V10"/>'),
    card: S('<rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>'),
    cash: S('<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>'),
    info: S('<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>'),
    gift: S('<rect x="3" y="9" width="18" height="12" rx="1"/><path d="M3 13h18M12 9v12M12 9S10 3 7 5s5 4 5 4M12 9s2-6 5-4-5 4-5 4"/>'),
    refresh: S('<path d="M21 12a9 9 0 1 1-3-6.7L21 8"/><path d="M21 3v5h-5"/>'),
    // category glyphs
    flower: S('<circle cx="12" cy="12" r="3"/><path d="M12 9c0-3 2-5 2-5s-2 0-2 0-2 0-2 0 2 2 2 5zM15 12c3 0 5-2 5-2s0 2 0 2 0 2 0 2-2-2-5-2zM12 15c0 3-2 5-2 5s2 0 2 0 2 0 2 0-2-2-2-5zM9 12c-3 0-5 2-5 2s0-2 0-2 0-2 0-2 2 2 5 2z"/>'),
    joint: S('<path d="M3 16l14-3 4-1 1 2-4 1-14 3z"/><path d="M3 16l0 2 3 0 0-1.4"/><path d="M19 12l1-2M21.5 12.5l1-2"/>'),
    gummy: S('<path d="M5 9a4 4 0 0 1 8 0v6a3 3 0 0 1-3 3 2 2 0 0 1-2-2 2 2 0 0 0-2-2 3 3 0 0 1-1-5z"/>'),
    vape: S('<rect x="9" y="3" width="6" height="18" rx="2"/><path d="M12 7v3"/>'),
    concentrate: S('<path d="M12 3c4 5 6 8 6 11a6 6 0 0 1-12 0c0-3 2-6 6-11z"/>'),
    dropper: S('<path d="M9 3h6v4l-1 1v7a2 2 0 0 1-4 0V8L9 7z"/><path d="M10 12h4"/>'),
    balm: S('<rect x="6" y="9" width="12" height="11" rx="2"/><path d="M9 9V6a3 3 0 0 1 6 0v3"/>'),
    grinder: S('<rect x="5" y="5" width="14" height="6" rx="2"/><rect x="5" y="13" width="14" height="6" rx="2"/><path d="M9 5v6M15 5v6"/>'),
  };
  IC.cat = (id) => IC[ (DD_CATEGORIES.find(c=>c.id===id)||{}).icon ] || IC.leaf;

  /* ---------- Money ---------- */
  const money = (n) => '$' + (Math.round(n * 100) / 100).toFixed(2);

  /* ---------- Cart (localStorage) ---------- */
  const CART_KEY = 'dd_cart_v1';
  const FAV_KEY = 'dd_favs_v1';
  function loadCart() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || {}; } catch { return {}; } }
  function saveCart(c) { localStorage.setItem(CART_KEY, JSON.stringify(c)); updateBadges(); document.dispatchEvent(new CustomEvent('cart:change')); }
  function getCart() { return loadCart(); }
  function productById(id) { return DD_PRODUCTS.find(p => p.id === id); }
  function cartItems() {
    const c = loadCart();
    return Object.keys(c).map(id => { const p = productById(id); return p ? { ...p, qty: c[id] } : null; }).filter(Boolean);
  }
  function cartCount() { const c = loadCart(); return Object.values(c).reduce((a, b) => a + b, 0); }
  function subtotal() { return cartItems().reduce((s, i) => s + i.price * i.qty, 0); }
  function addToCart(id, qty = 1) { const c = loadCart(); c[id] = (c[id] || 0) + qty; saveCart(c); }
  function setQty(id, qty) { const c = loadCart(); if (qty <= 0) delete c[id]; else c[id] = qty; saveCart(c); }
  function removeFromCart(id) { const c = loadCart(); delete c[id]; saveCart(c); }
  function clearCart() { localStorage.removeItem(CART_KEY); updateBadges(); document.dispatchEvent(new CustomEvent('cart:change')); }

  function totals(promo) {
    const sub = subtotal();
    const D = DD_DELIVERY;
    let fee = sub >= D.freeOver ? 0 : D.fee;
    let discount = 0;
    if (promo && promo.toUpperCase() === 'DANK15') discount = sub * 0.15;
    if (promo && promo.toUpperCase() === 'FREEDROP') fee = 0;
    const taxed = Math.max(0, sub - discount);
    const tax = taxed * D.taxRate;
    const total = taxed + fee + tax;
    return { sub, fee, tax, discount, total };
  }

  /* ---------- Favorites ---------- */
  function favs() { try { return JSON.parse(localStorage.getItem(FAV_KEY)) || []; } catch { return []; } }
  function isFav(id) { return favs().includes(id); }
  function toggleFav(id) { let f = favs(); f = f.includes(id) ? f.filter(x => x !== id) : [...f, id]; localStorage.setItem(FAV_KEY, JSON.stringify(f)); }

  /* ---------- UI helpers ---------- */
  function updateBadges() {
    const n = cartCount();
    document.querySelectorAll('[data-cart-count]').forEach(el => { el.textContent = n; el.dataset.n = n; });
  }
  function stars(rating) {
    return `<span class="stars">${IC.star}${rating.toFixed(1)}</span>`;
  }
  function typeTag(type) {
    const key = type.toLowerCase() === 'cbd' ? 'cbd' : type.toLowerCase();
    return `<span class="row gap-6"><span class="tdot ${key}"></span>${type}</span>`;
  }
  function slot(p, extra = '') {
    return `<image-slot id="prod-${p.id}" shape="rect" placeholder="${p.name}" ${extra}></image-slot>`;
  }
  function badgeHTML(b) {
    const map = { deal: ['badge--deal', 'Deal'], new: ['badge--new', 'New'], best: ['badge--best', 'Best Seller'] };
    const m = map[b]; if (!m) return '';
    return `<span class="badge ${m[0]}">${b === 'deal' ? IC.tag : ''}${m[1]}</span>`;
  }
  function potency(p) {
    if (p.cat === 'accessories' || (p.thc === 0 && p.cbd === 0)) return p.size;
    const parts = [];
    if (p.thc) parts.push(`THC ${p.thc}${p.cat==='edibles'||p.cat==='tinctures'?'mg':'%'}`);
    if (p.cbd >= 1) parts.push(`CBD ${p.cbd}${p.cat==='edibles'||p.cat==='tinctures'?'mg':'%'}`);
    return parts.join(' · ') || p.size;
  }

  function productCard(p) {
    const fav = isFav(p.id) ? ' is-on' : '';
    const badges = p.badges.map(badgeHTML).join('');
    return `
    <article class="pcard" data-id="${p.id}">
      <a class="pcard__media" href="product.html?id=${p.id}" aria-label="${p.name}">
        ${slot(p)}
        ${badges ? `<div class="pcard__badges">${badges}</div>` : ''}
      </a>
      <button class="pcard__fav${fav}" data-fav="${p.id}" aria-label="Save">${IC.heart}</button>
      <div class="pcard__body">
        <div class="pcard__brand">${p.brand}</div>
        <a class="pcard__name" href="product.html?id=${p.id}">${p.name}</a>
        <div class="pcard__meta">${p.cat==='accessories'?'':typeTag(p.type)} ${(p.thc||p.cbd)?`<span>${potency(p)}</span>`:''}</div>
        <div class="pcard__meta">${stars(p.rating)} <span>(${p.reviews})</span></div>
        <div class="pcard__foot">
          <div class="price">${p.old ? `<s>${money(p.old)}</s>` : ''}${money(p.price)}</div>
          <button class="add-btn" data-add="${p.id}" aria-label="Add ${p.name} to cart">${IC.plus}</button>
        </div>
      </div>
    </article>`;
  }

  /* ---------- Toast ---------- */
  let toastWrap;
  function toast(msg, icon = 'check') {
    if (!toastWrap) { toastWrap = document.createElement('div'); toastWrap.className = 'toast-wrap'; document.body.appendChild(toastWrap); }
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerHTML = `<span class="ic">${IC[icon] || IC.check}</span>${msg}`;
    toastWrap.appendChild(t);
    requestAnimationFrame(() => t.classList.add('show'));
    setTimeout(() => { t.classList.remove('show'); setTimeout(() => t.remove(), 320); }, 2200);
  }

  /* ---------- Global click delegation (add / fav) ---------- */
  document.addEventListener('click', (e) => {
    const add = e.target.closest('[data-add]');
    if (add) {
      e.preventDefault();
      const p = productById(add.dataset.add);
      addToCart(p.id, 1);
      toast(`${p.name} added`, 'cart');
      if (window.DD && DD.openCart) DD.openCart();
      return;
    }
    const fav = e.target.closest('[data-fav]');
    if (fav) {
      e.preventDefault();
      toggleFav(fav.dataset.fav);
      fav.classList.toggle('is-on');
    }
  });

  /* ---------- Expose ---------- */
  window.DD = Object.assign(window.DD || {}, {
    IC, money, getCart, cartItems, cartCount, subtotal, addToCart, setQty,
    removeFromCart, clearCart, totals, productById, favs, isFav, toggleFav,
    stars, typeTag, slot, potency, productCard, toast, updateBadges, badgeHTML,
  });

  document.addEventListener('DOMContentLoaded', updateBadges);
})();
