/* ============================================================
   DankDeals — Shop / catalog
   ============================================================ */
(function () {
  const IC = DD.IC;
  document.querySelectorAll('[data-ic]').forEach(el => { el.innerHTML = IC[el.dataset.ic] || ''; });

  const params = new URLSearchParams(location.search);
  const TYPES = ['Indica', 'Sativa', 'Hybrid', 'CBD'];
  const priceMax = Math.max(...DD_PRODUCTS.map(p => p.price));

  const state = {
    cat: params.get('cat') || null,
    types: new Set(),
    brands: new Set(),
    maxPrice: priceMax,
    dealOnly: params.get('deal') === '1',
    q: (params.get('q') || '').toLowerCase(),
    sort: 'featured',
  };

  /* ---------- Category chip row ---------- */
  function renderCatRow() {
    const all = `<a class="chip ${!state.cat ? 'is-active' : ''}" data-cat="">All</a>`;
    document.getElementById('catRow').innerHTML = all + DD_CATEGORIES.map(c =>
      `<a class="chip ${state.cat === c.id ? 'is-active' : ''}" data-cat="${c.id}">${c.name}</a>`).join('');
  }

  /* ---------- Filters panel (shared markup) ---------- */
  function filterHTML() {
    return `
      <div class="fgroup">
        <h4>Strain type</h4>
        <div class="fopts">
          ${TYPES.map(t => `<label class="chip ${state.types.has(t) ? 'is-active' : ''}" style="cursor:pointer"><input type="checkbox" data-filter="type" value="${t}" ${state.types.has(t) ? 'checked' : ''} hidden><span class="row gap-6">${DD.typeTag(t)}</span></label>`).join('')}
        </div>
      </div>
      <div class="fgroup">
        <h4>Max price · <span data-price-label>$${state.maxPrice}</span></h4>
        <div class="price-range">
          <span class="muted" style="font-size:.85rem">$0</span>
          <input type="range" min="5" max="${priceMax}" step="1" value="${state.maxPrice}" data-filter="price">
          <span class="muted" style="font-size:.85rem">$${priceMax}</span>
        </div>
      </div>
      <div class="fgroup">
        <h4>Brand</h4>
        ${DD_BRANDS.map(b => `<label class="fcheck"><input type="checkbox" data-filter="brand" value="${b}" ${state.brands.has(b) ? 'checked' : ''}>${b}</label>`).join('')}
      </div>
      <div class="fgroup">
        <h4>Offers</h4>
        <label class="fcheck"><input type="checkbox" data-filter="deal" ${state.dealOnly ? 'checked' : ''}>On sale only</label>
      </div>`;
  }
  function renderFilters() {
    document.getElementById('filtersDesktop').innerHTML = `<div style="border:1.5px solid var(--line);border-radius:var(--r-lg);padding:4px 18px;background:#fff">${filterHTML()}</div>`;
    document.getElementById('filtersMobile').innerHTML = filterHTML();
  }

  /* ---------- Filtering + sorting ---------- */
  function compute() {
    let list = DD_PRODUCTS.slice();
    if (state.cat) list = list.filter(p => p.cat === state.cat);
    if (state.types.size) list = list.filter(p => state.types.has(p.type));
    if (state.brands.size) list = list.filter(p => state.brands.has(p.brand));
    if (state.dealOnly) list = list.filter(p => p.old);
    if (state.maxPrice < priceMax) list = list.filter(p => p.price <= state.maxPrice);
    if (state.q) list = list.filter(p => (p.name + ' ' + p.brand + ' ' + p.type).toLowerCase().includes(state.q));
    switch (state.sort) {
      case 'price-asc': list.sort((a, b) => a.price - b.price); break;
      case 'price-desc': list.sort((a, b) => b.price - a.price); break;
      case 'rating': list.sort((a, b) => b.rating - a.rating); break;
      case 'thc': list.sort((a, b) => b.thc - a.thc); break;
      default: list.sort((a, b) => (b.badges.includes('best') - a.badges.includes('best')) || (!!b.old - !!a.old));
    }
    return list;
  }

  /* ---------- Applied chips ---------- */
  function renderApplied() {
    const chips = [];
    state.types.forEach(t => chips.push(['type:' + t, t]));
    state.brands.forEach(b => chips.push(['brand:' + b, b]));
    if (state.dealOnly) chips.push(['deal', 'On sale']);
    if (state.maxPrice < priceMax) chips.push(['price', 'Under $' + state.maxPrice]);
    const wrap = document.getElementById('applied');
    if (!chips.length) { wrap.innerHTML = ''; return; }
    wrap.innerHTML = chips.map(([k, l]) => `<span class="chip">${l}<button data-remove="${k}" aria-label="Remove">${IC.x}</button></span>`).join('') +
      `<button class="chip" data-clear style="cursor:pointer">Clear all</button>`;
  }

  /* ---------- Render ---------- */
  function render(opts) {
    opts = opts || {};
    const cat = state.cat ? DD_CATEGORIES.find(c => c.id === state.cat) : null;
    document.getElementById('shopTitle').textContent = state.dealOnly ? "Today's deals" : (cat ? cat.name : 'Shop all products');
    document.getElementById('crumbCat').textContent = state.dealOnly ? 'Deals' : (cat ? cat.name : 'Shop all');
    document.getElementById('shopSub').textContent = cat ? cat.blurb : (state.dealOnly ? 'Limited-time prices, restocked daily.' : 'Lab-tested cannabis, delivered across the Twin Cities.');
    renderCatRow();
    if (!opts.skipFilters) renderFilters();
    renderApplied();
    const list = compute();
    document.getElementById('resultCount').textContent = `${list.length} product${list.length === 1 ? '' : 's'}`;
    const grid = document.getElementById('shopGrid');
    grid.innerHTML = list.length
      ? list.map(DD.productCard).join('')
      : `<div class="empty empty-grid"><div class="ic">${IC.search}</div><p style="font-family:var(--font-display);font-weight:700;font-size:1.1rem;color:var(--ink)">No products match</p><p>Try clearing a filter or two.</p><button class="btn btn--outline" data-clear>Clear filters</button></div>`;
  }

  /* ---------- Events ---------- */
  document.addEventListener('click', (e) => {
    const cat = e.target.closest('[data-cat]');
    if (cat) { e.preventDefault(); state.cat = cat.dataset.cat || null; render(); window.scrollTo({ top: 0, behavior: 'smooth' }); }
    if (e.target.closest('[data-clear]')) { state.types.clear(); state.brands.clear(); state.dealOnly = false; state.maxPrice = priceMax; render(); }
    if (e.target.closest('#clearFiltersM')) { state.types.clear(); state.brands.clear(); state.dealOnly = false; state.maxPrice = priceMax; render(); }
    const rm = e.target.closest('[data-remove]');
    if (rm) {
      const [k, v] = rm.dataset.remove.split(':');
      if (k === 'type') state.types.delete(v);
      if (k === 'brand') state.brands.delete(v);
      if (k === 'deal') state.dealOnly = false;
      if (k === 'price') state.maxPrice = priceMax;
      render();
    }
    if (e.target.closest('[data-open-filters]')) document.getElementById('filterSheet').classList.add('open');
    if (e.target.closest('[data-close-filters]')) document.getElementById('filterSheet').classList.remove('open');
  });

  document.addEventListener('change', (e) => {
    const f = e.target.closest('[data-filter]');
    if (!f) return;
    const kind = f.dataset.filter;
    if (kind === 'type') { f.checked ? state.types.add(f.value) : state.types.delete(f.value); render(); }
    if (kind === 'brand') { f.checked ? state.brands.add(f.value) : state.brands.delete(f.value); render(); }
    if (kind === 'deal') { state.dealOnly = f.checked; render(); }
  });
  document.addEventListener('input', (e) => {
    const f = e.target.closest('[data-filter="price"]');
    if (f) {
      state.maxPrice = +f.value;
      document.querySelectorAll('[data-price-label]').forEach(l => l.textContent = '$' + f.value);
      // re-render grid without rebuilding the filter panel (keeps slider focus)
      clearTimeout(window.__pt); window.__pt = setTimeout(() => render({ skipFilters: true }), 90);
    }
  });
  document.getElementById('sortSelect').addEventListener('change', (e) => { state.sort = e.target.value; render(); });

  render();
})();
