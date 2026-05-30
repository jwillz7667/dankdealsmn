/* ============================================================
   DankDeals — Checkout wizard
   ============================================================ */
(function () {
  const IC = DD.IC;
  const D = DD_DELIVERY;
  const promo = sessionStorage.getItem('dd_promo') || '';

  if (!DD.cartItems().length) { location.replace('cart.html'); return; }

  const STEPS = ['Delivery', 'Time', 'Payment', 'Review'];
  let step = 0;

  const order = {
    name: '', phone: '', email: '',
    street: '', apt: '', city: 'Minneapolis', zip: '', notes: '',
    when: 'asap', window: '',
    id21: false, pay: 'cash', tip: 0.15,
  };

  const windows = ['Today · 4:00–5:00 PM', 'Today · 5:00–6:00 PM', 'Today · 6:00–7:00 PM', 'Today · 7:00–8:00 PM', 'Tomorrow · 11:00 AM–12:00 PM'];

  /* ---------- Steps bar ---------- */
  function renderBar() {
    document.getElementById('stepsBar').innerHTML = STEPS.map((s, i) => `
      <div class="stepdot ${i === step ? 'active' : ''} ${i < step ? 'done' : ''}">
        <div class="stepdot__n">${i < step ? '✓' : i + 1}</div>
        <div class="stepdot__l hide-sm">${s}</div>
      </div>
      ${i < STEPS.length - 1 ? '<div class="stepdot__bar"></div>' : ''}`).join('');
  }

  /* ---------- Order summary ---------- */
  function renderSummary() {
    const items = DD.cartItems();
    const t = DD.totals(promo);
    const tipAmt = t.sub * order.tip;
    document.getElementById('orderSummary').innerHTML = `
      <h3>Your order</h3>
      <div style="max-height:230px;overflow-y:auto;margin-inline:-4px;padding-inline:4px">
        ${items.map(i => `
          <div class="sum-line">
            <image-slot id="prod-${i.id}" shape="rounded" radius="9"></image-slot>
            <div><div class="nm">${i.name}</div><div class="qx">Qty ${i.qty} · ${i.size}</div></div>
            <b>${DD.money(i.price * i.qty)}</b>
          </div>`).join('')}
      </div>
      <hr class="divider" style="margin:12px 0">
      <div class="summary-row"><span>Subtotal</span><b>${DD.money(t.sub)}</b></div>
      ${t.discount > 0 ? `<div class="summary-row" style="color:var(--green-700)"><span>Discount (${promo.toUpperCase()})</span><b>−${DD.money(t.discount)}</b></div>` : ''}
      <div class="summary-row"><span>Delivery</span><b>${t.fee === 0 ? 'FREE' : DD.money(t.fee)}</b></div>
      <div class="summary-row"><span>Driver tip (${Math.round(order.tip * 100)}%)</span><b>${DD.money(tipAmt)}</b></div>
      <div class="summary-row muted"><span>Tax</span><span>${DD.money(t.tax)}</span></div>
      <div class="summary-row total"><span>Total</span><span>${DD.money(t.total + tipAmt)}</span></div>`;
  }

  /* ---------- Step views ---------- */
  function stepDelivery() {
    return `
      <div class="co-card">
        <h2>Delivery details</h2>
        <p class="sub">Where should we bring it?</p>
        <div class="grid2">
          <div class="field"><label>Full name</label><input class="input" data-f="name" value="${order.name}" placeholder="Alex Johnson"></div>
          <div class="field"><label>Phone</label><input class="input" data-f="phone" value="${order.phone}" placeholder="(612) 555-0199" inputmode="tel"></div>
          <div class="field full"><label>Email</label><input class="input" data-f="email" value="${order.email}" placeholder="you@email.com" inputmode="email"></div>
          <div class="field full"><label>Street address</label><input class="input" data-f="street" value="${order.street}" placeholder="123 Nicollet Ave"></div>
          <div class="field"><label>Apt / unit <span class="muted" style="font-weight:400">(optional)</span></label><input class="input" data-f="apt" value="${order.apt}" placeholder="Apt 4B"></div>
          <div class="field"><label>City</label><select class="select" data-f="city">${D.zones.map(z => `<option ${order.city === z ? 'selected' : ''}>${z}</option>`).join('')}</select></div>
          <div class="field"><label>ZIP code</label><input class="input" data-f="zip" value="${order.zip}" placeholder="55401" inputmode="numeric"></div>
          <div class="field full"><label>Delivery notes <span class="muted" style="font-weight:400">(optional)</span></label><textarea class="input" data-f="notes" rows="2" placeholder="Gate code, buzzer, where to leave it…">${order.notes}</textarea></div>
        </div>
        <div class="infonote"><span class="ic">${IC.pin}</span><span>We confirmed delivery is available to <b>the Twin Cities metro</b>. You'll get live tracking once a driver is assigned.</span></div>
        <div class="co-nav">
          <a class="btn btn--ghost" href="cart.html">${IC.chevL} Back to cart</a>
          <button class="btn grow" data-next>Continue ${IC.arrowR}</button>
        </div>
      </div>`;
  }

  function stepTime() {
    return `
      <div class="co-card">
        <h2>Delivery time</h2>
        <p class="sub">As soon as possible, or schedule a window.</p>
        <label class="opt ${order.when === 'asap' ? 'sel' : ''}" data-when="asap">
          <input type="radio" name="when" ${order.when === 'asap' ? 'checked' : ''}>
          <span class="opt__icon">${IC.bolt}</span>
          <span class="opt__main"><b>Deliver ASAP</b><span>Estimated arrival in 60–90 minutes</span></span>
          <span class="badge badge--new">Fastest</span>
        </label>
        <label class="opt ${order.when === 'schedule' ? 'sel' : ''}" data-when="schedule">
          <input type="radio" name="when" ${order.when === 'schedule' ? 'checked' : ''}>
          <span class="opt__icon">${IC.clock}</span>
          <span class="opt__main"><b>Schedule for later</b><span>Pick a 1-hour delivery window</span></span>
        </label>
        <div id="windowWrap" style="display:${order.when === 'schedule' ? 'block' : 'none'};margin:6px 0 0;padding-left:4px">
          <div class="field"><label>Delivery window</label><select class="select" data-f="window">${['Select a window…', ...windows].map(w => `<option ${order.window === w ? 'selected' : ''}>${w}</option>`).join('')}</select></div>
        </div>
        <div class="co-nav">
          <button class="btn btn--ghost" data-back>${IC.chevL} Back</button>
          <button class="btn grow" data-next>Continue ${IC.arrowR}</button>
        </div>
      </div>`;
  }

  function stepPayment() {
    const tips = [0, 0.1, 0.15, 0.2];
    return `
      <div class="co-card">
        <h2>ID &amp; payment</h2>
        <p class="sub">Minnesota law requires a valid 21+ ID at the door.</p>

        <div class="idbox" style="margin-bottom:18px">
          <div class="ic">${IC.shield}</div>
          <b style="font-family:var(--font-display);display:block;color:var(--ink)">Have your ID ready</b>
          <span style="font-size:.88rem">Your driver will scan a government-issued ID to verify you're 21+.</span>
        </div>
        <label class="opt ${order.id21 ? 'sel' : ''}" data-toggle="id21" style="margin-bottom:20px">
          <input type="checkbox" ${order.id21 ? 'checked' : ''}>
          <span class="opt__main"><b>I confirm I'm 21 or older</b><span>and will present a valid ID upon delivery.</span></span>
        </label>

        <h3 style="font-family:var(--font-display);font-size:1.1rem;margin-bottom:12px">Payment method</h3>
        <label class="opt ${order.pay === 'cash' ? 'sel' : ''}" data-pay="cash">
          <input type="radio" name="pay" ${order.pay === 'cash' ? 'checked' : ''}>
          <span class="opt__icon">${IC.cash}</span>
          <span class="opt__main"><b>Cash on delivery</b><span>Pay your driver in cash at the door</span></span>
        </label>
        <label class="opt ${order.pay === 'debit' ? 'sel' : ''}" data-pay="debit">
          <input type="radio" name="pay" ${order.pay === 'debit' ? 'checked' : ''}>
          <span class="opt__icon">${IC.card}</span>
          <span class="opt__main"><b>Debit at the door</b><span>Driver brings a card reader (debit only)</span></span>
        </label>

        <h3 style="font-family:var(--font-display);font-size:1.1rem;margin:20px 0 10px">Tip your driver</h3>
        <div class="tips">
          ${tips.map(tp => `<div class="tip ${order.tip === tp ? 'sel' : ''}" data-tip="${tp}">${tp === 0 ? 'None' : Math.round(tp * 100) + '%'}</div>`).join('')}
        </div>

        <div class="co-nav">
          <button class="btn btn--ghost" data-back>${IC.chevL} Back</button>
          <button class="btn grow" data-next>Review order ${IC.arrowR}</button>
        </div>
      </div>`;
  }

  function stepReview() {
    const t = DD.totals(promo);
    const tipAmt = t.sub * order.tip;
    const addr = `${order.street}${order.apt ? ', ' + order.apt : ''}, ${order.city} ${order.zip}`;
    const time = order.when === 'asap' ? 'ASAP · 60–90 min' : (order.window || 'Scheduled');
    const payLabel = order.pay === 'cash' ? 'Cash on delivery' : 'Debit at the door';
    return `
      <div class="co-card">
        <h2>Review &amp; place order</h2>
        <p class="sub">Double-check everything looks right.</p>
        <div class="review-row"><div><div class="k">Deliver to</div><div class="v" style="text-align:left;font-weight:700">${order.name || '—'}</div><div style="font-size:.88rem;color:var(--ink-2)">${addr}</div><div style="font-size:.85rem;color:var(--muted)">${order.phone}</div></div><button class="edit-link" data-goto="0">Edit</button></div>
        <div class="review-row"><div class="k">Delivery time</div><div class="row gap-8"><span class="v">${time}</span><button class="edit-link" data-goto="1">Edit</button></div></div>
        <div class="review-row"><div class="k">Payment</div><div class="row gap-8"><span class="v">${payLabel}</span><button class="edit-link" data-goto="2">Edit</button></div></div>
        <div class="review-row"><div class="k">Driver tip</div><span class="v">${DD.money(tipAmt)} (${Math.round(order.tip * 100)}%)</span></div>
        <div class="review-row total" style="border:none;padding-top:14px"><div class="k" style="font-family:var(--font-display);font-weight:800;font-size:1.2rem;color:var(--ink)">Total</div><div class="price">${DD.money(t.total + tipAmt)}</div></div>

        <button class="btn btn--lg btn--block" id="placeBtn" style="margin-top:8px">${IC.truck} Place order · ${DD.money(t.total + tipAmt)}</button>
        <div class="co-nav" style="margin-top:12px">
          <button class="btn btn--ghost grow" data-back>${IC.chevL} Back</button>
        </div>
        <p class="muted center" style="font-size:.78rem;margin-top:12px">By placing this order you confirm you're 21+ and agree to our Terms.</p>
      </div>`;
  }

  const VIEWS = [stepDelivery, stepTime, stepPayment, stepReview];

  function render() {
    renderBar();
    document.getElementById('stepHost').innerHTML = VIEWS[step]();
    renderSummary();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* ---------- Validation ---------- */
  function validate() {
    if (step === 0) {
      for (const f of ['name', 'phone', 'street', 'zip']) {
        if (!order[f]) { DD.toast('Please fill in your ' + (f === 'zip' ? 'ZIP code' : f), 'info'); return false; }
      }
    }
    if (step === 1 && order.when === 'schedule' && (!order.window || order.window === 'Select a window…')) {
      DD.toast('Pick a delivery window', 'info'); return false;
    }
    if (step === 2 && !order.id21) { DD.toast('Please confirm you are 21+', 'info'); return false; }
    return true;
  }

  /* ---------- Events ---------- */
  document.getElementById('stepHost').addEventListener('input', (e) => {
    const f = e.target.closest('[data-f]'); if (f) order[f.dataset.f] = e.target.value;
  });
  document.getElementById('stepHost').addEventListener('change', (e) => {
    const f = e.target.closest('[data-f]'); if (f) { order[f.dataset.f] = e.target.value; if (f.dataset.f === 'tip') renderSummary(); }
    const tg = e.target.closest('[data-toggle]'); if (tg) { order[tg.dataset.toggle] = e.target.checked; tg.classList.toggle('sel', e.target.checked); }
  });
  document.getElementById('stepHost').addEventListener('click', (e) => {
    if (e.target.closest('[data-next]')) { if (validate()) { step = Math.min(STEPS.length - 1, step + 1); render(); } return; }
    if (e.target.closest('[data-back]')) { step = Math.max(0, step - 1); render(); return; }
    const goto = e.target.closest('[data-goto]'); if (goto) { step = +goto.dataset.goto; render(); return; }

    const when = e.target.closest('[data-when]');
    if (when) { order.when = when.dataset.when; document.querySelectorAll('[data-when]').forEach(o => o.classList.toggle('sel', o === when)); document.getElementById('windowWrap').style.display = order.when === 'schedule' ? 'block' : 'none'; return; }
    const pay = e.target.closest('[data-pay]');
    if (pay) { order.pay = pay.dataset.pay; document.querySelectorAll('[data-pay]').forEach(o => o.classList.toggle('sel', o === pay)); return; }
    const tip = e.target.closest('[data-tip]');
    if (tip) { order.tip = +tip.dataset.tip; document.querySelectorAll('[data-tip]').forEach(o => o.classList.toggle('sel', o === tip)); renderSummary(); return; }

    if (e.target.closest('#placeBtn')) placeOrder();
  });

  function placeOrder() {
    const t = DD.totals(promo);
    const tipAmt = t.sub * order.tip;
    const items = DD.cartItems().map(i => ({ id: i.id, name: i.name, brand: i.brand, size: i.size, qty: i.qty, price: i.price }));
    const num = 'DD' + Math.floor(100000 + Math.random() * 899999);
    const eta = order.when === 'asap' ? Date.now() + 75 * 60000 : null;
    const record = {
      num, items, order,
      totals: { sub: t.sub, fee: t.fee, tax: t.tax, discount: t.discount, tip: tipAmt, total: t.total + tipAmt },
      placedAt: Date.now(), eta, promo,
    };
    localStorage.setItem('dd_order', JSON.stringify(record));
    DD.clearCart();
    sessionStorage.removeItem('dd_promo');
    location.href = 'confirmation.html';
  }

  render();
})();
