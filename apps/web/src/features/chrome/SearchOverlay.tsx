'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Search, X } from 'lucide-react';
import { ProductMedia } from '@/components/ProductMedia';
import { money } from '@/lib/format';
import { api, qs } from '@/lib/api/client';
import type { Product, ProductList } from '@/lib/api/types';
import { useUiStore } from '@/features/chrome/ui-store';

const DEBOUNCE_MS = 250;

export function SearchOverlay() {
  const isOpen = useUiStore((s) => s.overlay === 'search');
  const close = useUiStore((s) => s.closeOverlay);
  const inputRef = useRef<HTMLInputElement>(null);

  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);

  // Focus the field shortly after the panel finishes its slide-in transition.
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(() => inputRef.current?.focus(), 280);
    return () => clearTimeout(t);
  }, [isOpen]);

  // Debounced, race-safe live search. A stale response is discarded by token check.
  useEffect(() => {
    const q = query.trim();
    if (!q) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    let active = true;
    const t = setTimeout(() => {
      api
        .get<ProductList>(`/products${qs({ search: q, limit: 8 })}`)
        .then((list) => {
          if (active) setResults(list.items);
        })
        .catch(() => {
          if (active) setResults([]);
        })
        .finally(() => {
          if (active) setLoading(false);
        });
    }, DEBOUNCE_MS);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [query]);

  const trimmed = query.trim();

  return (
    <div className={`drawer drawer--left${isOpen ? ' open' : ''}`} aria-hidden={!isOpen}>
      <div className="drawer__scrim" onClick={close} />
      <aside className="drawer__panel" aria-label="Search">
        <div className="drawer__head">
          <h3>Search</h3>
          <button type="button" className="icon-btn" onClick={close} aria-label="Close search">
            <X aria-hidden />
          </button>
        </div>
        <div style={{ padding: '16px 18px' }}>
          <div
            className="row gap-8"
            style={{ border: '1.5px solid var(--line-2)', borderRadius: 'var(--pill)', padding: '4px 6px 4px 14px' }}
          >
            <span style={{ color: 'var(--muted)', display: 'inline-flex' }}>
              <Search size={18} aria-hidden />
            </span>
            <input
              ref={inputRef}
              className="input"
              placeholder="Search flower, gummies, carts…"
              style={{ border: 'none', padding: '10px 6px' }}
              autoComplete="off"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
          </div>

          <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 4 }}>
            {!trimmed && (
              <p className="muted" style={{ fontSize: '.9rem' }}>
                Try &ldquo;gummies&rdquo;, &ldquo;sativa&rdquo;, &ldquo;rosin&rdquo;…
              </p>
            )}
            {trimmed && loading && results.length === 0 && (
              <p className="muted" style={{ fontSize: '.9rem' }}>
                Searching…
              </p>
            )}
            {trimmed && !loading && results.length === 0 && (
              <p className="muted" style={{ fontSize: '.9rem' }}>
                No matches for &ldquo;{trimmed}&rdquo;.
              </p>
            )}
            {results.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                onClick={close}
                className="row gap-12"
                style={{ padding: 8, borderRadius: 12 }}
              >
                <span
                  style={{ width: 44, height: 44, borderRadius: 10, overflow: 'hidden', background: 'var(--surface)', position: 'relative', flexShrink: 0 }}
                >
                  <ProductMedia src={p.images[0]?.url ?? null} alt={p.name} sizes="44px" />
                </span>
                <span className="grow">
                  <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, display: 'block', fontSize: '.95rem' }}>
                    {p.name}
                  </span>
                  <span className="muted" style={{ fontSize: '.8rem' }}>
                    {p.brand?.name ?? p.category.name}
                  </span>
                </span>
                <span className="price" style={{ fontSize: '1rem' }}>
                  {money(p.priceCents)}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </aside>
    </div>
  );
}
