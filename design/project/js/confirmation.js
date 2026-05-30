/* ============================================================
   DankDeals — Order confirmation + live tracking
   ============================================================ */
(function () {
  const IC = DD.IC;
  const CAR = 'assets/car-icon.png';
  let rec;
  try { rec = JSON.parse(localStorage.getItem('dd_order')); } catch { rec = null; }

  /* ---------- No order fallback ---------- */
  if (!rec) {
    document.getElementById('confHead').innerHTML = `
      <h1>No active order</h1>
      <p class="muted" style="margin-top:8px">Looks like you haven't placed an order yet.</p>`;
    document.getElementById('confRoot').innerHTML = `
      <div class="empty" style="grid-column:1/-1"><div class="ic">${IC.box}</div>
      <p style="font-family:var(--font-display);font-weight:700;font-size:1.1rem;color:var(--ink)">Nothing to track</p>
      <a class="btn btn--lg" href="shop.html" style="margin-top:12px">${IC.leaf} Start shopping</a></div>`;
    return;
  }

  const STAGES = [
    { k: 'Order confirmed', d: "We've received your order", ic: 'check' },
    { k: 'Preparing', d: 'Your order is being packed & sealed', ic: 'box' },
    { k: 'Out for delivery', d: 'Your driver is on the way', ic: 'truck' },
    { k: 'Delivered', d: 'Enjoy responsibly!', ic: 'home' },
  ];

  // Determine current stage from elapsed time (demo: advances quickly, caps at "Out for delivery")
  function currentStage() {
    const elapsed = (Date.now() - rec.placedAt) / 1000;
    if (elapsed < 5) return 0;
    if (elapsed < 11) return 1;
    return 2; // stays out for delivery
  }

  /* ---------- Header ---------- */
  const scheduled = rec.order.when !== 'asap';
  document.getElementById('confHead').innerHTML = `
    <div class="conf-check">${IC.check}</div>
    <h1>Order confirmed!</h1>
    <p class="muted" style="margin-top:8px;font-size:1.05rem">Thanks${rec.order.name ? ', ' + rec.order.name.split(' ')[0] : ''} — we're on it. A confirmation was sent to ${rec.order.email || 'your email'}.</p>
    <div class="ordno">${IC.tag} Order <b>#${rec.num}</b></div>`;

  /* ---------- Body ---------- */
  const addr = `${rec.order.street}${rec.order.apt ? ', ' + rec.order.apt : ''}, ${rec.order.city} ${rec.order.zip}`;
  const t = rec.totals;
  document.getElementById('confRoot').innerHTML = `
    <div>
      <div class="track">
        <div class="track__eta">
          <span class="carwrap"><img src="${CAR}" alt=""></span>
          <div>
            <div class="big" id="etaBig">—</div>
            <div class="lbl" id="etaLbl">Estimated arrival</div>
          </div>
          <a class="btn btn--outline btn--sm" href="tel:+16125553265" style="margin-left:auto">${IC.phone} Contact</a>
        </div>

        <div class="progress-track">
          <i id="progFill" style="width:0%"></i>
          <span class="progress-car" id="progCar" style="left:0%"><img src="${CAR}" alt=""></span>
        </div>
        <div class="progress-nodes" id="progNodes"></div>

        <div class="timeline" id="timeline"></div>

        <div class="driver" id="driverCard" style="display:none">
          <span class="driver__ava">M</span>
          <div class="driver__info"><b>Marcus D.</b><span>${IC.star ? '★' : ''} 4.9 · DankDeals driver · Green hatchback</span></div>
          <div class="driver__actions">
            <a class="icon-btn" href="tel:+16125553265" aria-label="Call">${IC.phone}</a>
          </div>
        </div>
      </div>

      <div class="map" style="margin-top:22px">
        <image-slot id="trackmap" shape="rounded" radius="20" placeholder="Drop a map screenshot of the Twin Cities"></image-slot>
        <div class="map__pin"><img src="${CAR}" alt="">Driver · 2.4 mi away</div>
      </div>

      <div class="row gap-12 wrap-flow" style="margin-top:22px">
        <a class="btn" href="shop.html">${IC.leaf} Continue shopping</a>
        <a class="btn btn--ghost" href="index.html">${IC.home} Back home</a>
      </div>
    </div>

    <aside class="conf-side">
      <h3>Delivery details</h3>
      <div class="review-row" style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--line)"><span class="muted" style="font-size:.85rem">Deliver to</span><span style="text-align:right;font-weight:600">${rec.order.name}<br><span style="font-weight:400;font-size:.85rem;color:var(--muted)">${addr}</span></span></div>
      <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid var(--line)"><span class="muted" style="font-size:.85rem">When</span><b>${scheduled ? rec.order.window : 'ASAP'}</b></div>
      <div style="display:flex;justify-content:space-between;padding:10px 0"><span class="muted" style="font-size:.85rem">Payment</span><b>${rec.order.pay === 'cash' ? 'Cash on delivery' : 'Debit at door'}</b></div>

      <h3 style="margin:18px 0 10px">Order summary</h3>
      ${rec.items.map(i => `
        <div class="sum-line">
          <image-slot id="prod-${i.id}" shape="rounded" radius="9"></image-slot>
          <div><div class="nm">${i.name}</div><div class="qx">Qty ${i.qty} · ${i.size}</div></div>
          <b>${DD.money(i.price * i.qty)}</b>
        </div>`).join('')}
      <hr class="divider" style="margin:12px 0">
      <div class="summary-row"><span>Subtotal</span><b>${DD.money(t.sub)}</b></div>
      ${t.discount > 0 ? `<div class="summary-row" style="color:var(--green-700)"><span>Discount</span><b>−${DD.money(t.discount)}</b></div>` : ''}
      <div class="summary-row"><span>Delivery</span><b>${t.fee === 0 ? 'FREE' : DD.money(t.fee)}</b></div>
      <div class="summary-row"><span>Tip</span><b>${DD.money(t.tip)}</b></div>
      <div class="summary-row muted"><span>Tax</span><span>${DD.money(t.tax)}</span></div>
      <div class="summary-row total"><span>Total</span><span>${DD.money(t.total)}</span></div>
    </aside>`;

  /* ---------- Render tracking state ---------- */
  const nodesEl = document.getElementById('progNodes');
  nodesEl.innerHTML = STAGES.map(s => `<div class="pnode"><span class="dot"></span>${s.k}</div>`).join('');

  function fmtTime(ms) {
    const d = new Date(ms);
    return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  function update() {
    const stage = currentStage();
    const pct = [4, 38, 78, 100][stage];
    document.getElementById('progFill').style.width = pct + '%';
    document.getElementById('progCar').style.left = pct + '%';
    nodesEl.querySelectorAll('.pnode').forEach((n, i) => n.classList.toggle('on', i <= stage));

    // timeline
    document.getElementById('timeline').innerHTML = STAGES.map((s, i) => {
      const cls = i < stage ? 'done' : (i === stage ? 'active' : '');
      const tStamp = i <= stage ? fmtTime(rec.placedAt + i * 6 * 60000) : '';
      return `<div class="tl-item ${cls}">
        <div class="tl-item__rail"><div class="tl-item__dot">${i < stage ? IC.check : IC[s.ic]}</div><div class="tl-item__line"></div></div>
        <div class="tl-item__body"><b>${s.k}</b><span>${i <= stage ? (s.d + (tStamp ? ' · ' + tStamp : '')) : s.d}</span></div>
      </div>`;
    }).join('');

    // ETA
    const etaBig = document.getElementById('etaBig');
    const etaLbl = document.getElementById('etaLbl');
    if (rec.eta) {
      const mins = Math.max(0, Math.round((rec.eta - Date.now()) / 60000));
      etaBig.textContent = scheduled ? rec.order.window.split('· ')[1] || '—' : `${mins} min`;
      etaLbl.textContent = stage >= 2 ? 'Arriving soon · ' + fmtTime(rec.eta) : 'Estimated arrival';
    } else {
      etaBig.textContent = (rec.order.window || 'Scheduled');
      etaLbl.textContent = 'Scheduled delivery';
    }

    // driver appears once out for delivery
    document.getElementById('driverCard').style.display = stage >= 2 ? 'flex' : 'none';
  }

  update();
  setInterval(update, 1500);
})();
