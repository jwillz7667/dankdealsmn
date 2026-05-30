'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SearchX } from 'lucide-react';
import type { Product, ProductList } from '@/lib/api/types';
import { ProductCard } from './ProductCard';
import { api, qs } from '@/lib/api/client';
import { PAGE_SIZE, toApiFilters, type ShopFilters } from '@/features/catalog/shop-filters';

interface ShopResultsProps {
  initialItems: Product[];
  initialCursor: string | null;
  filters: ShopFilters;
}

export function ShopResults({ initialItems, initialCursor, filters }: ShopResultsProps) {
  const [items, setItems] = useState<Product[]>(initialItems);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loading, setLoading] = useState(false);

  const loadMore = () => {
    if (!cursor || loading) return;
    setLoading(true);
    api
      .get<ProductList>(`/products${qs({ ...toApiFilters(filters), cursor, limit: PAGE_SIZE })}`)
      .then((list) => {
        setItems((prev) => [...prev, ...list.items]);
        setCursor(list.nextCursor);
      })
      .catch(() => undefined)
      .finally(() => setLoading(false));
  };

  if (items.length === 0) {
    return (
      <div className="empty">
        <div className="ic">
          <SearchX aria-hidden style={{ width: '100%', height: '100%' }} />
        </div>
        <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)' }}>
          No products match
        </p>
        <p>Try clearing a filter or two.</p>
        <Link className="btn btn--outline" href="/shop" style={{ marginTop: 8 }}>
          Clear filters
        </Link>
      </div>
    );
  }

  return (
    <>
      <div className="pgrid pgrid--shop">
        {items.map((p, i) => (
          <ProductCard key={p.id} product={p} priority={i < 4} />
        ))}
      </div>
      {cursor && (
        <div className="pager">
          <button type="button" className="btn btn--outline" onClick={loadMore} disabled={loading}>
            {loading ? 'Loading…' : 'Load more'}
          </button>
        </div>
      )}
    </>
  );
}
