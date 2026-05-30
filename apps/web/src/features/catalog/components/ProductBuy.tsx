'use client';

import { useState } from 'react';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '@/lib/api/types';
import { money } from '@/lib/format';
import { useCartStore } from '@/features/cart/store';
import { useUiStore } from '@/features/chrome/ui-store';

export function ProductBuy({ product }: { product: Product }) {
  const [qty, setQty] = useState(1);
  const add = useCartStore((s) => s.add);
  const toast = useUiStore((s) => s.toast);
  const openCart = useUiStore((s) => s.openCart);

  const addToCart = () => {
    if (!product.inStock) return;
    add(product, qty);
    toast(`${qty} × ${product.name} added`);
    openCart();
  };

  const stepper = (
    <div className="qty">
      <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label="Decrease quantity">
        −
      </button>
      <span>{qty}</span>
      <button type="button" onClick={() => setQty((q) => Math.min(99, q + 1))} aria-label="Increase quantity">
        +
      </button>
    </div>
  );

  return (
    <>
      <div className="pbuy">
        {stepper}
        <button type="button" className="btn btn--lg grow" onClick={addToCart} disabled={!product.inStock}>
          <ShoppingCart aria-hidden /> {product.inStock ? 'Add to cart' : 'Out of stock'}
        </button>
      </div>

      <div className="buybar">
        <div>
          <div className="muted" style={{ fontSize: '.72rem', textTransform: 'uppercase', letterSpacing: '.05em' }}>
            {product.name}
          </div>
          <span className="price">{money(product.priceCents)}</span>
        </div>
        <button type="button" className="btn grow" onClick={addToCart} disabled={!product.inStock}>
          <ShoppingCart aria-hidden /> {product.inStock ? 'Add to cart' : 'Out of stock'}
        </button>
      </div>
    </>
  );
}
