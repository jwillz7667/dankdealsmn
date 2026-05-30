'use client';

import { X } from 'lucide-react';
import type { Brand } from '@/lib/api/types';
import { hasActiveFilters, STRAIN_OPTIONS } from '@/features/catalog/shop-filters';
import { useShopNav } from './use-shop-nav';

export function AppliedFilters({ brands }: { brands: Brand[] }) {
  const { filters, setParams } = useShopNav();
  if (!hasActiveFilters(filters)) return null;

  const chips: { key: string; label: string }[] = [];
  if (filters.strain) {
    chips.push({ key: 'strain', label: STRAIN_OPTIONS.find((s) => s.value === filters.strain)?.label ?? filters.strain });
  }
  if (filters.brand) {
    chips.push({ key: 'brand', label: brands.find((b) => b.slug === filters.brand)?.name ?? filters.brand });
  }
  if (filters.badge === 'DEAL') chips.push({ key: 'badge', label: 'On sale' });
  if (filters.minPrice !== null) chips.push({ key: 'minPrice', label: `Min $${filters.minPrice}` });
  if (filters.maxPrice !== null) chips.push({ key: 'maxPrice', label: `Max $${filters.maxPrice}` });

  return (
    <div className="applied">
      {chips.map((c) => (
        <span className="chip" key={c.key}>
          {c.label}
          <button type="button" onClick={() => setParams({ [c.key]: null })} aria-label={`Remove ${c.label}`}>
            <X size={14} aria-hidden />
          </button>
        </span>
      ))}
      <button
        type="button"
        className="chip"
        onClick={() => setParams({ strain: null, brand: null, badge: null, minPrice: null, maxPrice: null })}
      >
        Clear all
      </button>
    </div>
  );
}
