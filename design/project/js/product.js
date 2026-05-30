/* ============================================================
   DankDeals — Product detail
   ============================================================ */
(function () {
  const IC = DD.IC;
  const id = new URLSearchParams(location.search).get('id');
  const p = DD.productById(id) || DD_PRODUCTS[0];
  const cat = DD_CATEGORIES.find(c => c.id === p.cat);
  let qty = 1;

  document.title = `${p.name} — DankDeals`;

  document.getElementById('crumb').innerHTML =
    `<a href="index.html">Home</a> / <a href="shop.html?cat=${p.cat}">${cat.name}</a> / <span>${p.name}</span>`;

  const isAcc = p.cat === 'accessories';
  const unit = (p.cat === 'edibles' || p.cat === 'tinctures') ? 'mg' : '%';

  document.getElementById('pdp').innerHTML = `
    <div class="pdp__gallery">
      <image-slot id="prod-${p.id}" shape="rounded" radius="20" placeholder="Drop product photo"></image-slot>
      <div class="pdp__thumbs">
        <image-slot id="prod-${p.id}-ta" shape="rounded" radius="12" placeholder=""></image-slot>
        <image-slot id="prod-${p.id}-tb" shape="rounded" radius="12" placeholder=""></image-slot>
        <image-slot id="prod-${p.id}-tc" shape="rounded" radius="12" placeholder=""></image-slot>
      </div>
    </div>
    <div class="pdp__info">
      <div class="pdp__brand">${p.brand}</div>
      <h1>${p.name}</h1>
      <div class="pdp__rating">${DD.stars(p.rating)} <span>${p.rating.toFixed(1)} · ${p.reviews} reviews</span></div>
      <div class="pdp__pills">
        ${p.badges.map(DD.badgeHTML).join('')}
        ${!isAcc ? `<span class="badge badge--type">${DD.typeTag(p.type)}</span>` : ''}
        <span class="badge badge--type">${p.size}</span>
      </div>

      ${!isAcc ? `<div class="specs" style="margin-bottom:4px">
        <div class="specs__row"><span>THC</span><b>${p.thc}${unit}</b></div>
        ${p.cbd >= 1 ? `<div class="specs__row"><span>CBD</span><b>${p.cbd}${unit}</b></div>` : ''}
      </div>` : ''}

      <div class="pdp__price">
        <span class="price">${DD.money(p.price)}</span>
        ${p.old ? `<s style="color:var(--muted-2);font-size:1.1rem">${DD.money(p.old)}</s><span class="badge badge--deal">Save ${DD.money(p.old - p.price)}</span>` : ''}
      </div>

      <div class="pdp__buy">
        <div class="qty">
          <button data-q="-1" aria-label="Decrease">−</button>
          <span id="qtyVal">1</span>
          <button data-q="1" aria-label="Increase">+</button>
        </div>
        <button class="btn btn--lg grow" id="addBtn">${IC.cart} Add to cart</button>
      </div>

      ${p.effects.length ? `<h4 style="font-family:var(--font-display);font-size:1rem;margin:18px 0 10px">Effects</h4>
      <div class="effects">${p.effects.map(e => `<span class="effect">${e}</span>`).join('')}</div>` : ''}

      <h4 style="font-family:var(--font-display);font-size:1rem;margin:22px 0 6px">About this product</h4>
      <p class="pdp__desc">${p.desc}</p>

      <div class="specs">
        <div class="specs__row"><span>Brand</span><b>${p.brand}</b></div>
        <div class="specs__row"><span>Category</span><b>${cat.name}</b></div>
        ${!isAcc ? `<div class="specs__row"><span>Strain type</span><b>${p.type}</b></div>` : ''}
        <div class="specs__row"><span>Size</span><b>${p.size}</b></div>
        <div class="specs__row"><span>Lab tested</span><b style="color:var(--green-700)">✓ Verified</b></div>
      </div>

      <div class="infonote"><span class="ic">${IC.truck}</span><span>Order in the next few hours for <b>same-day delivery</b> — most Twin Cities orders arrive in 60–90 minutes.</span></div>
    </div>`;

  document.getElementById('buybar').innerHTML = `
    <div><div class="muted" style="font-size:.72rem;text-transform:uppercase;letter-spacing:.05em">${p.name}</div><span class="price">${DD.money(p.price)}</span></div>
    <button class="btn grow" id="addBtnBar">${IC.cart} Add to cart</button>`;

  // related
  const related = DD_PRODUCTS.filter(x => x.cat === p.cat && x.id !== p.id);
  const pool = related.length >= 4 ? related : DD_PRODUCTS.filter(x => x.id !== p.id);
  document.getElementById('related').innerHTML = pool.slice(0, 8).map(DD.productCard).join('');

  // qty + add
  function setQty(v) { qty = Math.max(1, v); document.getElementById('qtyVal').textContent = qty; }
  document.getElementById('pdp').addEventListener('click', (e) => {
    const q = e.target.closest('[data-q]'); if (q) setQty(qty + (+q.dataset.q));
  });
  function add() { DD.addToCart(p.id, qty); DD.toast(`${qty} × ${p.name} added`, 'cart'); DD.openCart(); }
  document.getElementById('addBtn').addEventListener('click', add);
  document.getElementById('addBtnBar').addEventListener('click', add);

  window.scrollTo(0, 0);
})();
