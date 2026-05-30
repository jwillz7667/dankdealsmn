'use client';

import type { Category } from '@/lib/api/types';
import { useShopNav } from './use-shop-nav';

export function CategoryChips({ categories }: { categories: Category[] }) {
  const { filters, setParams } = useShopNav();

  const select = (slug: string | null) => {
    setParams({ category: slug });
    if (typeof window !== 'undefined') window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="filtergroup">
      <div className="chips" role="group" aria-label="Category">
        <button
          type="button"
          className={`chip${!filters.category ? ' is-active' : ''}`}
          aria-pressed={!filters.category}
          onClick={() => select(null)}
        >
          All
        </button>
        {categories.map((c) => (
          <button
            type="button"
            key={c.id}
            className={`chip${filters.category === c.slug ? ' is-active' : ''}`}
            aria-pressed={filters.category === c.slug}
            onClick={() => select(c.slug)}
          >
            {c.name}
          </button>
        ))}
      </div>
    </div>
  );
}
