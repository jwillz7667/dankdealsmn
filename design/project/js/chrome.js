/* ============================================================
   DankDeals — Shared chrome (header / drawer / footer / age gate)
   ============================================================ */
(function () {
  'use strict';
  const IC = DD.IC;
  const LOGO = 'assets/dankdeals-logo.png';
  const CAR = 'assets/car-icon.png';
  const page = document.body.dataset.page || '';

  const NAV = [
    { id: 'shop', label: 'Shop', href: 'shop.html' },
    { id: 'deals', label: 'Deals', href: 'shop.html?deal=1' },
    { id: 'how', label: 'How it works', href: 'index.html#how' },
    { id: 'area', label: 'Delivery area', href: 'index.html#area' },
  ];

  /* ---------- Delivery strip + Header ---------- */
  const header = document.createElement('div');
  header.innerHTML = `
  <div class="delstrip">
    <div class="wrap delstrip__in">
      <img src="${CAR}" alt="" class="ic" style="height:18px;width:auto">
      <span>Free delivery over <b>$75</b> · Twin Cities &amp; metro · <b>60–90 min</b></span>
    </div>
  </div>
  <header class="hdr">
    <div class="wrap">
      <div class="hdr__bar">
        <div class="hdr__left row gap-8">
          <button class="icon-btn mobile-only" data-open-menu aria-label="Menu">${IC.menu}</button>
          <a class="hdr__logo hide-mobile" href="index.html"><img src="${LOGO}" alt="DankDeals"></a>
        </div>
        <div class="hdr__center">
          <a class="hdr__logo mobile-only" href="index.html"><img src="${LOGO}" alt="DankDeals"></a>
          <nav class="hdr__nav">
            ${NAV.map(n => `<a href="${n.href}" class="${page===n.id?'active':''}">${n.label}</a>`).join('')}
          </nav>
        </div>
        <div class="hdr__right row gap-4">
          <a class="chip hide-mobile" href="index.html#area" style="margin-right:4px">${IC.pin}<span>Minneapolis</span></a>
          <button class="icon-btn hide-mobile" data-open-search aria-label="Search">${IC.search}</button>
          <button class="icon-btn mobile-only" data-open-search aria-label="Search">${IC.search}</button>
          <button class="icon-btn" data-open-cart aria-label="Cart">${IC.cart}<span class="cart-count" data-cart-count data-n="0">0</span></button>
        </div>
      </div>
    </div>
  </header>`;
  document.body.prepend(header);

  /* ---------- Mobile menu ---------- */
  const mmenu = document.createElement('div');
  mmenu.className = 'mmenu';
  mmenu.innerHTML = `
    <div class="mmenu__scrim" data-close-menu></div>
    <nav class="mmenu__panel">
      <div class="between" style="margin-bottom:10px">
        <img src="${LOGO}" alt="DankDeals" style="height:22px">
        <button class="icon-btn" data-close-menu aria-label="Close">${IC.x}</button>
      </div>
      <a class="chip" href="index.html#area" style="align-self:flex-start;margin:6px 0 10px">${IC.pin}<span>Deliver to Minneapolis–St. Paul</span></a>
      <a class="mlink" href="index.html">${IC.home} Home <span></span></a>
      <a class="mlink" href="shop.html">${IC.leaf} Shop all <span>${IC.chevR}</span></a>
      <div style="font:700 .72rem/1 var(--font-display);letter-spacing:.14em;text-transform:uppercase;color:var(--muted);padding:16px 6px 8px">Categories</div>
      ${DD_CATEGORIES.map(c => `<a class="mlink" href="shop.html?cat=${c.id}" style="font-size:1rem;padding:12px 6px"><span class="row gap-12" style="color:var(--green)">${IC.cat(c.id)}<span style="color:var(--ink)">${c.name}</span></span><span>${IC.chevR}</span></a>`).join('')}
      <a class="mlink" href="shop.html?deal=1">${IC.tag} Today's deals <span>${IC.chevR}</span></a>
      <a class="mlink" href="index.html#how">${IC.truck} How it works <span></span></a>
      <div style="margin-top:auto;padding-top:18px">
        <a class="btn btn--block" href="shop.html">Start shopping</a>
      </div>
    </nav>`;
  document.body.appendChild(mmenu);

  /* ---------- Cart drawer ---------- */
  const drawer = document.createElement('div');
  drawer.className = 'drawer';
  drawer.innerHTML = `
    <div class="drawer__scrim" data-close-cart></div>
    <aside class="drawer__panel" aria-label="Cart">
      <div class="drawer__head">
        <h3 class="row gap-8">${IC.cart} Your cart <span data-cart-count style="font-family:var(--font-body);color:var(--muted);font-weight:600;font-size:1rem"></span></h3>
        <button class="icon-btn" data-close-cart aria-label="Close">${IC.x}</button>
      </div>
      <div class="drawer__body" data-cart-body></div>
      <div class="drawer__foot" data-cart-foot></div>
    </aside>`;
  document.body.appendChild(drawer);

  function renderDrawer() {
    const items = DD.cartItems();
    const body = drawer.querySelector('[data-cart-body]');
    const foot = drawer.querySelector('[data-cart-foot]');
    if (!items.length) {
      body.innerHTML = `<div class="empty"><div class="ic">${IC.cart}</div><p style="font-family:var(--font-display);font-weight:700;font-size:1.1rem;color:var(--ink)">Your cart is empty</p><p>Add something tasty and we'll bring it to your door.</p><a class="btn btn--outline" href="shop.html" data-close-cart>Browse products</a></div>`;
      foot.innerHTML = '';
      return;
    }
    body.innerHTML = items.map(i => `
      <div class="cline">
        <a class="cline__media" href="product.html?id=${i.id}">${DD.slot(i)}</a>
        <div>
          <div class="cline__brand">${i.brand}</div>
          <a class="cline__name" href="product.html?id=${i.id}">${i.name}</a>
          <div class="muted" style="font-size:.82rem;margin:2px 0 8px">${i.size} · ${DD.money(i.price)}</div>
          <div class="row between" style="max-width:160px">
            <div class="qty qty--sm">
              <button data-dec="${i.id}" aria-label="Decrease">−</button>
              <span>${i.qty}</span>
              <button data-inc="${i.id}" aria-label="Increase">+</button>
            </div>
          </div>
        </div>
        <div style="text-align:right;display:flex;flex-direction:column;gap:8px;align-items:flex-end">
          <div class="price" style="font-size:1.02rem">${DD.money(i.price * i.qty)}</div>
          <button class="cline__rm" data-rm="${i.id}">Remove</button>
        </div>
      </div>`).join('');
    const t = DD.totals();
    const remain = DD_DELIVERY.freeOver - t.sub;
    foot.innerHTML = `
      ${remain > 0 ? `<div class="badge badge--soft" style="margin-bottom:10px;width:100%;justify-content:center;padding:8px">${IC.truck} ${DD.money(remain)} away from free delivery</div>` : `<div class="badge badge--soft" style="margin-bottom:10px;width:100%;justify-content:center;padding:8px">${IC.check} You've unlocked free delivery!</div>`}
      <div class="summary-row"><span>Subtotal</span><b>${DD.money(t.sub)}</b></div>
      <div class="summary-row muted"><span>Delivery</span><span>${t.fee === 0 ? 'FREE' : DD.money(t.fee)}</span></div>
      <a class="btn btn--lg btn--block" href="checkout.html" style="margin-top:12px">Checkout · ${DD.money(t.total)}</a>
      <a class="btn btn--ghost btn--block btn--sm" href="cart.html" style="margin-top:8px">View full cart</a>`;
  }

  /* ---------- Search overlay (simple) ---------- */
  const search = document.createElement('div');
  search.className = 'drawer';
  search.innerHTML = `
    <div class="drawer__scrim" data-close-search></div>
    <aside class="drawer__panel" style="left:0;right:auto;width:min(96vw,460px);transform:translateX(-100%)" aria-label="Search">
      <div class="drawer__head"><h3>Search</h3><button class="icon-btn" data-close-search>${IC.x}</button></div>
      <div style="padding:16px 18px">
        <div class="row gap-8" style="border:1.5px solid var(--line-2);border-radius:var(--pill);padding:4px 6px 4px 14px">
          <span style="color:var(--muted)">${IC.search}</span>
          <input class="input" id="ddSearchInput" placeholder="Search flower, gummies, carts…" style="border:none;padding:10px 6px" autocomplete="off">
        </div>
        <div id="ddSearchResults" style="margin-top:14px;display:flex;flex-direction:column;gap:4px"></div>
      </div>
    </aside>`;
  search.querySelector('.drawer__panel').style.transition = 'transform .3s var(--ease)';
  document.body.appendChild(search);
  search.addEventListener('transitionstart', () => {});

  const sInput = search.querySelector('#ddSearchInput');
  const sRes = search.querySelector('#ddSearchResults');
  function runSearch() {
    const q = sInput.value.trim().toLowerCase();
    if (!q) { sRes.innerHTML = `<p class="muted" style="font-size:.9rem">Try “gummies”, “sativa”, “rosin”…</p>`; return; }
    const hits = DD_PRODUCTS.filter(p => (p.name + ' ' + p.brand + ' ' + p.type + ' ' + p.cat).toLowerCase().includes(q)).slice(0, 8);
    sRes.innerHTML = hits.length ? hits.map(p => `
      <a href="product.html?id=${p.id}" class="row gap-12" style="padding:8px;border-radius:12px">
        <span style="width:44px;height:44px;border-radius:10px;background:var(--surface);display:grid;place-items:center;color:var(--green)">${IC.cat(p.cat)}</span>
        <span class="grow"><span style="font-family:var(--font-display);font-weight:700;display:block;font-size:.95rem">${p.name}</span><span class="muted" style="font-size:.8rem">${p.brand}</span></span>
        <span class="price" style="font-size:1rem">${DD.money(p.price)}</span>
      </a>`).join('') : `<p class="muted" style="font-size:.9rem">No matches for “${q}”.</p>`;
  }
  sInput && sInput.addEventListener('input', runSearch);

  /* ---------- Footer ---------- */
  const footer = document.createElement('footer');
  footer.className = 'ftr';
  footer.innerHTML = `
    <div class="wrap ftr__top">
      <div class="ftr__brand">
        <div class="row gap-12" style="margin-bottom:14px">
          <img src="${CAR}" class="car" alt="" style="height:34px;width:auto">
          <img src="${LOGO}" alt="DankDeals" style="height:22px;width:auto;filter:brightness(0) invert(1)">
        </div>
        <p style="max-width:300px;color:#aab4a3;font-size:.92rem">Fast, licensed cannabis delivery across Minneapolis, St. Paul and the greater metro. Lab-tested products at your door in under 90 minutes.</p>
        <div class="row gap-8" style="margin-top:16px">
          <a class="chip" href="#" style="background:rgba(255,255,255,.08);border-color:rgba(255,255,255,.16);color:#fff">${IC.phone} (612) 555-DANK</a>
        </div>
      </div>
      <div><h4>Shop</h4><ul>${DD_CATEGORIES.slice(0,6).map(c=>`<li><a href="shop.html?cat=${c.id}">${c.name}</a></li>`).join('')}<li><a href="shop.html?deal=1">Today's Deals</a></li></ul></div>
      <div><h4>Company</h4><ul><li><a href="index.html#how">How it works</a></li><li><a href="index.html#area">Delivery area</a></li><li><a href="#">About us</a></li><li><a href="#">Careers</a></li><li><a href="#">Contact</a></li></ul></div>
      <div><h4>Support</h4><ul><li><a href="#">FAQ</a></li><li><a href="#">Track an order</a></li><li><a href="#">Returns</a></li><li><a href="#">Privacy</a></li><li><a href="#">Terms</a></li></ul></div>
    </div>
    <div class="wrap">
      <div class="ftr__legal">⚠️ For use only by adults 21 years of age and older. Keep out of reach of children. Do not drive a motor vehicle or operate machinery while using cannabis. This product has not been analyzed or approved by the FDA. License #MN-CAN-0421.</div>
    </div>
    <div class="wrap ftr__bottom">
      <span>© ${new Date().getFullYear()} DankDeals MN. All rights reserved.</span>
      <span class="row gap-16"><a href="#">Privacy</a><a href="#">Terms</a><a href="#">Accessibility</a></span>
    </div>`;
  document.body.appendChild(footer);

  /* ---------- Age gate ---------- */
  if (!localStorage.getItem('dd_age_ok')) {
    const gate = document.createElement('div');
    gate.className = 'agegate';
    gate.innerHTML = `
      <div class="agegate__card">
        <img src="${CAR}" class="car" alt="">
        <img src="${LOGO}" class="logo" alt="DankDeals">
        <h2>Are you 21 or older?</h2>
        <p>You must be of legal age to enter DankDeals and order cannabis delivery in Minnesota.</p>
        <div class="agegate__btns">
          <button class="btn btn--lg btn--block" data-age="yes">Yes, I'm 21+</button>
          <button class="btn btn--ghost btn--block" data-age="no" style="color:#fff;border-color:rgba(255,255,255,.3)">No, take me back</button>
        </div>
        <p style="font-size:.78rem;color:#7c857a;margin-top:14px">By entering you agree to our Terms &amp; Privacy Policy.</p>
      </div>`;
    document.body.appendChild(gate);
    document.documentElement.style.overflow = 'hidden';
    gate.addEventListener('click', (e) => {
      if (e.target.closest('[data-age="yes"]')) { localStorage.setItem('dd_age_ok', '1'); gate.remove(); document.documentElement.style.overflow = ''; }
      if (e.target.closest('[data-age="no"]')) { gate.querySelector('.agegate__card').innerHTML = `<img src="${CAR}" class="car" alt=""><h2>Come back soon</h2><p>You must be 21 or older to use DankDeals.</p>`; }
    });
  }

  /* ---------- Open/close wiring ---------- */
  function lock(on) { document.documentElement.style.overflow = on ? 'hidden' : ''; }
  function openMenu() { mmenu.classList.add('open'); lock(true); }
  function closeMenu() { mmenu.classList.remove('open'); lock(false); }
  function openCart() { renderDrawer(); drawer.classList.add('open'); lock(true); }
  function closeCart() { drawer.classList.remove('open'); lock(false); }
  function openSearch() { search.classList.add('open'); runSearch(); setTimeout(() => sInput && sInput.focus(), 280); lock(true); }
  function closeSearch() { search.classList.remove('open'); lock(false); }

  document.addEventListener('click', (e) => {
    if (e.target.closest('[data-open-menu]')) openMenu();
    if (e.target.closest('[data-close-menu]')) closeMenu();
    if (e.target.closest('[data-open-cart]')) openCart();
    if (e.target.closest('[data-close-cart]')) closeCart();
    if (e.target.closest('[data-open-search]')) openSearch();
    if (e.target.closest('[data-close-search]')) closeSearch();
    if (e.target.closest('.mlink')) closeMenu();
  });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { closeMenu(); closeCart(); closeSearch(); } });

  // cart drawer qty controls
  drawer.addEventListener('click', (e) => {
    const inc = e.target.closest('[data-inc]'); const dec = e.target.closest('[data-dec]'); const rm = e.target.closest('[data-rm]');
    if (inc) { const c = DD.getCart(); DD.setQty(inc.dataset.inc, (c[inc.dataset.inc] || 0) + 1); }
    if (dec) { const c = DD.getCart(); DD.setQty(dec.dataset.dec, (c[dec.dataset.dec] || 0) - 1); }
    if (rm) { DD.removeFromCart(rm.dataset.rm); }
  });
  document.addEventListener('cart:change', () => { if (drawer.classList.contains('open')) renderDrawer(); });

  window.DD = Object.assign(window.DD || {}, { openCart, closeCart, openMenu, openSearch });
})();
