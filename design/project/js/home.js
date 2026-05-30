/* ============================================================
   DankDeals — Home page
   ============================================================ */
(function () {
  const IC = DD.IC;

  // generic [data-ic] filler
  document.querySelectorAll('[data-ic]').forEach(el => { el.innerHTML = IC[el.dataset.ic] || ''; });

  // hero car
  const heroCar = document.getElementById('heroCar');
  if (heroCar) heroCar.innerHTML = IC.truck;

  // Categories
  document.getElementById('catGrid').innerHTML = DD_CATEGORIES.map(c => `
    <a class="catcard" href="shop.html?cat=${c.id}">
      <span class="ico">${IC.cat(c.id)}</span>
      <b>${c.name}</b>
      <span>${c.blurb}</span>
      <span class="go">Shop ${IC.chevR}</span>
    </a>`).join('');

  // Best sellers rail
  const best = DD_PRODUCTS.filter(p => p.badges.includes('best')).slice(0, 8);
  document.getElementById('bestRail').innerHTML = best.map(DD.productCard).join('');

  // Deals rail
  const deals = DD_PRODUCTS.filter(p => p.old).slice(0, 8);
  document.getElementById('dealRail').innerHTML = deals.map(DD.productCard).join('');

  // Steps
  const steps = [
    { ic: 'leaf', t: 'Browse the menu', d: 'Explore lab-tested flower, edibles, vapes and more from trusted Minnesota brands.' },
    { ic: 'cart', t: 'Place your order', d: 'Add to cart, verify your ID once, and check out in under a minute. $30 minimum.' },
    { ic: 'truck', t: 'We deliver — fast', d: 'A discreet DankDeals driver brings it to your door in 60–90 minutes. Track every step.' },
  ];
  document.getElementById('steps').innerHTML = steps.map((s, i) => `
    <div class="step">
      <div class="step__n">${i + 1}<span class="ic">${IC[s.ic]}</span></div>
      <div><h3>${s.t}</h3><p>${s.d}</p></div>
    </div>`).join('');

  // Trust
  const trust = [
    { ic: 'shield', t: 'Lab-tested & legal', d: 'Every product is third-party tested and fully compliant with Minnesota law.' },
    { ic: 'bolt', t: 'Lightning fast', d: 'Most orders arrive within 60–90 minutes, seven days a week.' },
    { ic: 'lock', t: 'Discreet delivery', d: 'Unmarked vehicles and smell-proof, sealed packaging. Always private.' },
    { ic: 'tag', t: 'Honest pricing', d: 'Fair, transparent prices and daily deals — no surprise fees at the door.' },
  ];
  document.getElementById('trust').innerHTML = trust.map(t => `
    <div class="trust__item">
      <span class="ic">${IC[t.ic]}</span>
      <b>${t.t}</b><span>${t.d}</span>
    </div>`).join('');

  // Zones
  document.getElementById('zones').innerHTML = DD_DELIVERY.zones
    .map((z, i) => `<span class="${i < 2 ? 'on' : ''}">${z}</span>`).join('');
})();
