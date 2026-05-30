import type { Product } from '@/lib/api/types';
import { ProductCard } from './ProductCard';

export function ProductGrid({
  products,
  shop = false,
  priorityCount = 0,
}: {
  products: Product[];
  shop?: boolean;
  priorityCount?: number;
}) {
  return (
    <div className={`pgrid${shop ? ' pgrid--shop' : ''}`}>
      {products.map((p, i) => (
        <ProductCard key={p.id} product={p} priority={i < priorityCount} />
      ))}
    </div>
  );
}

export function ProductRail({ products }: { products: Product[] }) {
  return (
    <div className="rail">
      {products.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
