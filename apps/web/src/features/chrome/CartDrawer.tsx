'use client';

import Link from 'next/link';
import { ShoppingCart, X, Truck, Check } from 'lucide-react';
import { ProductMedia } from '@/components/ProductMedia';
import { money } from '@/lib/format';
import { cartItemList, cartSubtotalCents, useCartStore } from '@/features/cart/store';
import { useUiStore } from '@/features/chrome/ui-store';
import { useHydrated } from '@/lib/use-hydrated';

interface CartDrawerProps {
  deliveryFeeCents: number;
  freeDeliveryThresholdCents: number;
}

export function CartDrawer({ deliveryFeeCents, freeDeliveryThresholdCents }: CartDrawerProps) {
  const isOpen = useUiStore((s) => s.overlay === 'cart');
  const close = useUiStore((s) => s.closeOverlay);
  const items = useCartStore(cartItemList);
  const subtotal = useCartStore(cartSubtotalCents);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const hydrated = useHydrated();

  // Estimate only — checkout calls /cart/quote for authoritative tax/tip/total.
  const fee = subtotal >= freeDeliveryThresholdCents ? 0 : deliveryFeeCents;
  const remaining = freeDeliveryThresholdCents - subtotal;
  const estimatedTotal = subtotal + fee;
  const isEmpty = !hydrated || items.length === 0;

  return (
    <div className={`drawer${isOpen ? ' open' : ''}`} aria-hidden={!isOpen}>
      <div className="drawer__scrim" onClick={close} />
      <aside className="drawer__panel" aria-label="Cart">
        <div className="drawer__head">
          <h3 className="row gap-8">
            <ShoppingCart aria-hidden /> Your cart
            {!isEmpty && (
              <span style={{ fontFamily: 'var(--font-body)', color: 'var(--muted)', fontWeight: 600, fontSize: '1rem' }}>
                {items.reduce((n, i) => n + i.qty, 0)}
              </span>
            )}
          </h3>
          <button type="button" className="icon-btn" onClick={close} aria-label="Close cart">
            <X aria-hidden />
          </button>
        </div>

        {isEmpty ? (
          <div className="drawer__body">
            <div className="empty">
              <div className="ic">
                <ShoppingCart aria-hidden style={{ width: '100%', height: '100%' }} />
              </div>
              <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)' }}>
                Your cart is empty
              </p>
              <p>Add something tasty and we&apos;ll bring it to your door.</p>
              <Link className="btn btn--outline" href="/shop" onClick={close} style={{ marginTop: 8 }}>
                Browse products
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className="drawer__body">
              {items.map((i) => (
                <div className="cline" key={i.productId}>
                  <Link className="cline__media" href={`/product/${i.slug}`} onClick={close}>
                    <ProductMedia src={i.image} alt={i.name} sizes="64px" />
                  </Link>
                  <div>
                    <div className="cline__brand">{i.brand ?? 'DankDeals'}</div>
                    <Link className="cline__name" href={`/product/${i.slug}`} onClick={close}>
                      {i.name}
                    </Link>
                    <div className="muted" style={{ fontSize: '.82rem', margin: '2px 0 8px' }}>
                      {i.size} · {money(i.priceCents)}
                    </div>
                    <div className="row between" style={{ maxWidth: 160 }}>
                      <div className="qty qty--sm">
                        <button type="button" onClick={() => setQty(i.productId, i.qty - 1)} aria-label="Decrease quantity">
                          −
                        </button>
                        <span>{i.qty}</span>
                        <button type="button" onClick={() => setQty(i.productId, i.qty + 1)} aria-label="Increase quantity">
                          +
                        </button>
                      </div>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
                    <div className="price" style={{ fontSize: '1.02rem' }}>
                      {money(i.priceCents * i.qty)}
                    </div>
                    <button type="button" className="cline__rm" onClick={() => remove(i.productId)}>
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="drawer__foot">
              {remaining > 0 ? (
                <div
                  className="badge badge--soft"
                  style={{ marginBottom: 10, width: '100%', justifyContent: 'center', padding: 8 }}
                >
                  <Truck className="ic" aria-hidden /> {money(remaining)} away from free delivery
                </div>
              ) : (
                <div
                  className="badge badge--soft"
                  style={{ marginBottom: 10, width: '100%', justifyContent: 'center', padding: 8 }}
                >
                  <Check className="ic" aria-hidden /> You&apos;ve unlocked free delivery!
                </div>
              )}
              <div className="summary-row">
                <span>Subtotal</span>
                <b>{money(subtotal)}</b>
              </div>
              <div className="summary-row muted">
                <span>Delivery</span>
                <span>{fee === 0 ? 'FREE' : money(fee)}</span>
              </div>
              <Link className="btn btn--lg btn--block" href="/checkout" onClick={close} style={{ marginTop: 12 }}>
                Checkout · {money(estimatedTotal)}
              </Link>
              <Link className="btn btn--ghost btn--block btn--sm" href="/cart" onClick={close} style={{ marginTop: 8 }}>
                View full cart
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
