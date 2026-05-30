'use client';

import { useEffect, useState } from 'react';
import type { Brand } from '@/lib/api/types';
import { STRAIN_OPTIONS } from '@/features/catalog/shop-filters';
import { useShopNav } from './use-shop-nav';

export function Filters({ brands }: { brands: Brand[] }) {
  const { filters, setParams } = useShopNav();

  const [minPrice, setMinPrice] = useState(filters.minPrice?.toString() ?? '');
  const [maxPrice, setMaxPrice] = useState(filters.maxPrice?.toString() ?? '');

  // Keep local price inputs in sync when the URL changes elsewhere (e.g. Clear all).
  useEffect(() => {
    setMinPrice(filters.minPrice?.toString() ?? '');
    setMaxPrice(filters.maxPrice?.toString() ?? '');
  }, [filters.minPrice, filters.maxPrice]);

  const commitPrice = () => {
    const min = minPrice.trim() === '' ? null : Math.max(0, Math.floor(Number(minPrice)));
    const max = maxPrice.trim() === '' ? null : Math.max(0, Math.floor(Number(maxPrice)));
    setParams({
      minPrice: min && Number.isFinite(min) ? min : null,
      maxPrice: max && Number.isFinite(max) ? max : null,
    });
  };

  return (
    <div className="shop__filters">
      <div className="filtergroup">
        <h4>Strain type</h4>
        <div className="chips">
          {STRAIN_OPTIONS.map((s) => {
            const active = filters.strain === s.value;
            return (
              <button
                type="button"
                key={s.value}
                className={`chip${active ? ' is-active' : ''}`}
                aria-pressed={active}
                onClick={() => setParams({ strain: active ? null : s.value })}
              >
                <span className={`tdot ${s.value.toLowerCase()}`} />
                {s.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="filtergroup">
        <h4>Brand</h4>
        <select
          className="select"
          aria-label="Filter by brand"
          value={filters.brand ?? ''}
          onChange={(e) => setParams({ brand: e.target.value || null })}
        >
          <option value="">All brands</option>
          {brands.map((b) => (
            <option key={b.id} value={b.slug}>
              {b.name}
            </option>
          ))}
        </select>
      </div>

      <div className="filtergroup">
        <h4>Price (USD)</h4>
        <div className="row gap-8">
          <input
            className="input"
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Min"
            aria-label="Minimum price"
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            onBlur={commitPrice}
            onKeyDown={(e) => e.key === 'Enter' && commitPrice()}
          />
          <input
            className="input"
            type="number"
            min={0}
            inputMode="numeric"
            placeholder="Max"
            aria-label="Maximum price"
            value={maxPrice}
            onChange={(e) => setMaxPrice(e.target.value)}
            onBlur={commitPrice}
            onKeyDown={(e) => e.key === 'Enter' && commitPrice()}
          />
        </div>
      </div>

      <div className="filtergroup">
        <h4>Offers</h4>
        <label className="chip" style={{ cursor: 'pointer' }}>
          <input
            type="checkbox"
            checked={filters.badge === 'DEAL'}
            onChange={(e) => setParams({ badge: e.target.checked ? 'DEAL' : null })}
            style={{ accentColor: 'var(--green)' }}
          />
          On sale only
        </label>
      </div>
    </div>
  );
}
