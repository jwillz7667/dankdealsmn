/* ============================================================
   DankDeals — Cart page
   ============================================================ */
(function () {
  const IC = DD.IC;
  const D = DD_DELIVERY;
  let promo = sessionStorage.getItem('dd_promo') || '';

  function render() {
    const items = DD.cartItems();
    const root = document.getElementById('cartRoot');

    if (!items.length) {
      root.innerHTML = `
        <div class="empty">
          <div class="ic">${IC.cart}</div>
          <p style="font-family:var(--font-display);font-weight:800;font-size:1.4rem;color:var(--ink)">Your cart is empty</p>
          <p style="margin-bottom:18px">Browse our menu and we'll deliver to your door in under 90 minutes.</p>
          <a class="btn btn--lg" href="shop.html">${IC.leaf} Start shopping</a>
        </div>
        <section class="section" style="padding-bottom:0">
          <div class="sec-head"><div><span class="eyebrow">Popular right now</span><h2>Best sellers</h2></div></div>
          <div class="rail">${DD_PRODUCTS.filter(p => p.badges.includes('best')).map(DD.productCard).join('')}</div>
        </section>`;
      return;
    }

    const t = DD.totals(promo);
    const remain = D.freeOver - t.sub;
    const pct = Math.min(100, (t.sub / D.freeOver) * 100);
    const belowMin = t.sub < D.minOrder;

    root.innerHTML = `
      <div class="cart-wrap">
        <div>
          <div class="between" style="margin-bottom:6px">
            <span class="muted" style="font-weight:600">${items.length} item${items.length === 1 ? '' : 's'}</span>
            <button class="cline__rm" id="clearAll">Clear cart</button>
          </div>
          ${items.map(i => `
            <div class="cart-line" data-id="${i.id}">
              <a class="cart-line__media" href="product.html?id=${i.id}">${DD.slot(i)}</a>
              <div>
                <div class="between" style="align-items:flex-start">
                  <div>
                    <div class="cart-line__brand">${i.brand}</div>
                    <a class="cart-line__name" href="product.html?id=${i.id}">${i.name}</a>
                    <div class="muted" style="font-size:.85rem;margin-top:2px">${i.size}${i.cat !== 'accessories' ? ' · ' + i.type : ''}</div>
                  </div>
                  <div class="price">${DD.money(i.price * i.qty)}</div>
                </div>
                <div class="cart-line__foot">
                  <div class="qty qty--sm">
                    <button data-dec="${i.id}" aria-label="Decrease">−</button>
                    <span>${i.qty}</span>
                    <button data-inc="${i.id}" aria-label="Increase">+</button>
                  </div>
                  <button class="cline__rm" data-rm="${i.id}">${IC.trash} Remove</button>
                </div>
              </div>
            </div>`).join('')}
          <a class="btn btn--ghost" href="shop.html" style="margin-top:18px">${IC.chevL} Continue shopping</a>
        </div>

        <aside class="summary">
          <h3>Order summary</h3>
          <div class="badge ${remain > 0 ? 'badge--soft' : 'badge--soft'}" style="width:100%;justify-content:center;padding:9px;margin-bottom:4px">
            ${remain > 0 ? `${IC.truck} ${DD.money(remain)} away from FREE delivery` : `${IC.check} You unlocked free delivery!`}
          </div>
          <div class="progress"><i style="width:${pct}%"></i></div>

          <div class="promo">
            <input class="input" id="promoInput" placeholder="Promo code" value="${promo}">
            <button class="btn btn--dark btn--sm" id="applyPromo">Apply</button>
          </div>
          ${promo ? `<div class="muted" style="font-size:.82rem;margin-top:-6px;margin-bottom:10px">${t.discount > 0 || t.fee === 0 ? `<span style="color:var(--green-700);font-weight:700">✓ Code “${promo.toUpperCase()}” applied</span>` : `Code “${promo}” is not valid`}</div>` : ''}

          <div class="summary-row"><span>Subtotal</span><b>${DD.money(t.sub)}</b></div>
          ${t.discount > 0 ? `<div class="summary-row" style="color:var(--green-700)"><span>Discount</span><b>−${DD.money(t.discount)}</b></div>` : ''}
          <div class="summary-row"><span>Delivery</span><b>${t.fee === 0 ? 'FREE' : DD.money(t.fee)}</b></div>
          <div class="summary-row muted"><span>Estimated tax</span><span>${DD.money(t.tax)}</span></div>
          <div class="summary-row total"><span>Total</span><span>${DD.money(t.total)}</span></div>

          ${belowMin ? `<div class="infonote" style="background:#fdf1ec;color:var(--warn);margin-top:14px"><span class="ic" style="color:var(--warn)">${IC.info}</span><span>Minimum order is ${DD.money(D.minOrder)}. Add ${DD.money(D.minOrder - t.sub)} more to check out.</span></div>` : ''}

          <button class="btn btn--lg btn--block" id="checkoutBtn" style="margin-top:16px" ${belowMin ? 'disabled style="margin-top:16px;opacity:.5;pointer-events:none"' : ''}>Checkout · ${DD.money(t.total)}</button>
          <div class="row gap-8 muted" style="justify-content:center;margin-top:12px;font-size:.8rem">${IC.lock} Secure checkout</div>
        </aside>
      </div>`;
  }

  document.addEventListener('click', (e) => {
    const inc = e.target.closest('[data-inc]'); const dec = e.target.closest('[data-dec]'); const rm = e.target.closest('[data-rm]');
    if (inc) DD.setQty(inc.dataset.inc, (DD.getCart()[inc.dataset.inc] || 0) + 1);
    if (dec) DD.setQty(dec.dataset.dec, (DD.getCart()[dec.dataset.dec] || 0) - 1);
    if (rm) { DD.removeFromCart(rm.dataset.rm); DD.toast('Removed from cart', 'trash'); }
    if (e.target.closest('#clearAll')) { DD.clearCart(); DD.toast('Cart cleared', 'trash'); }
    if (e.target.closest('#applyPromo')) {
      const v = document.getElementById('promoInput').value.trim();
      promo = v; sessionStorage.setItem('dd_promo', v); render();
      const ok = ['dank15', 'freedrop'].includes(v.toLowerCase());
      DD.toast(ok ? 'Promo applied! 🎉' : 'Invalid code', ok ? 'check' : 'info');
    }
    if (e.target.closest('#checkoutBtn')) location.href = 'checkout.html';
  });

  document.addEventListener('cart:change', render);
  render();
})();
