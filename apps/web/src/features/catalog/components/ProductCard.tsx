'use client';

import Link from 'next/link';
import { Heart, Plus } from 'lucide-react';
import type { Badge, Product } from '@/lib/api/types';
import { money, potency, strainDotClass, strainLabel } from '@/lib/format';
import { ProductMedia } from '@/components/ProductMedia';
import { Stars } from '@/components/Stars';
import { useCartStore } from '@/features/cart/store';
import { useFavoritesStore } from '@/features/favorites/store';
import { useUiStore } from '@/features/chrome/ui-store';
import { useHydrated } from '@/lib/use-hydrated';

const BADGE_LABEL: Record<Badge, string> = { DEAL: 'Deal', NEW: 'New', BEST: 'Best seller' };

export function ProductCard({ product, priority = false }: { product: Product; priority?: boolean }) {
  const add = useCartStore((s) => s.add);
  const toggleFav = useFavoritesStore((s) => s.toggle);
  const savedIds = useFavoritesStore((s) => s.ids);
  const toast = useUiStore((s) => s.toast);
  const hydrated = useHydrated();

  const isSaved = hydrated && savedIds.includes(product.id);
  const thc = potency(product.thc);
  const href = `/product/${product.slug}`;

  return (
    <article className="pcard">
      <Link className="pcard__media" href={href} aria-label={product.name}>
        <ProductMedia
          src={product.images[0]?.url ?? null}
          alt={product.images[0]?.alt ?? product.name}
          priority={priority}
        />
        {product.badges.length > 0 && (
          <span className="pcard__badges">
            {product.badges.map((b) => (
              <span key={b} className={`badge badge--${b.toLowerCase()}`}>
                {BADGE_LABEL[b]}
              </span>
            ))}
          </span>
        )}
      </Link>

      <button
        type="button"
        className={`pcard__fav${isSaved ? ' is-on' : ''}`}
        aria-pressed={isSaved}
        aria-label={isSaved ? 'Remove from saved' : 'Save for later'}
        onClick={() => {
          const nowSaved = toggleFav(product.id);
          toast(nowSaved ? 'Saved to favorites' : 'Removed from favorites');
        }}
      >
        <Heart size={18} />
      </button>

      <div className="pcard__body">
        {product.brand && <span className="pcard__brand">{product.brand.name}</span>}
        <Link href={href}>
          <h3 className="pcard__name">{product.name}</h3>
        </Link>
        <div className="pcard__meta">
          <span className="row gap-4">
            <span className={`tdot ${strainDotClass(product.strainType)}`} />
            {strainLabel(product.strainType)}
          </span>
          {thc && <span>· {thc}</span>}
          <span>· {product.size}</span>
        </div>
        {product.ratingCount > 0 && <Stars rating={product.ratingAvg} count={product.ratingCount} />}

        <div className="pcard__foot">
          <span className="price">
            {product.compareAtCents && product.compareAtCents > product.priceCents && (
              <s>{money(product.compareAtCents)}</s>
            )}
            {money(product.priceCents)}
          </span>
          <button
            type="button"
            className="add-btn"
            aria-label={`Add ${product.name} to cart`}
            disabled={!product.inStock}
            onClick={() => {
              add(product);
              toast(`Added ${product.name} to cart`);
            }}
          >
            <Plus />
          </button>
        </div>
      </div>
    </article>
  );
}
