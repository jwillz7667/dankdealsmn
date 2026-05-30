'use client';

import { SORT_OPTIONS } from '@/features/catalog/shop-filters';
import { useShopNav } from './use-shop-nav';

export function SortSelect() {
  const { filters, setParams } = useShopNav();

  return (
    <select
      className="select"
      aria-label="Sort products"
      value={filters.sort}
      onChange={(e) => setParams({ sort: e.target.value === 'featured' ? null : e.target.value })}
    >
      {SORT_OPTIONS.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
