'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Check, ChevronLeft, Info, Leaf, Lock, ShoppingCart, Truck } from 'lucide-react';
import { ProductMedia } from '@/components/ProductMedia';
import { money } from '@/lib/format';
import { useHydrated } from '@/lib/use-hydrated';
import { cartItemList, cartSubtotalCents, useCartStore } from '@/features/cart/store';
import { usePromoStore } from './promo-store';
import { useQuote } from './use-quote';

interface CartViewProps {
  deliveryFeeCents: number;
  freeDeliveryThresholdCents: number;
  minOrderCents: number;
}

export function CartView({
  deliveryFeeCents,
  freeDeliveryThresholdCents,
  minOrderCents,
}: CartViewProps) {
  const items = useCartStore(cartItemList);
  const snapshotSubtotal = useCartStore(cartSubtotalCents);
  const setQty = useCartStore((s) => s.setQty);
  const remove = useCartStore((s) => s.remove);
  const clear = useCartStore((s) => s.clear);
  const hydrated = useHydrated();

  const code = usePromoStore((s) => s.code);
  const setCode = usePromoStore((s) => s.setCode);
  const [promoDraft, setPromoDraft] = useState(code);

  const lineInputs = items.map((i) => ({ productId: i.productId, quantity: i.qty }));
  const { quote, loading } = useQuote({
    items: lineInputs,
    promoCode: code,
    tipCents: 0,
    enabled: hydrated,
  });

  // Pre-hydration: render a stable placeholder so SSR and first paint agree.
  if (!hydrated) {
    return <div className="empty" aria-hidden="true" style={{ minHeight: 200 }} />;
  }

  if (items.length === 0) {
    return (
      <div className="empty">
        <div className="ic">
          <ShoppingCart aria-hidden style={{ width: '100%', height: '100%' }} />
        </div>
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 800,
            fontSize: '1.4rem',
            color: 'var(--ink)',
          }}
        >
          Your cart is empty
        </p>
        <p style={{ marginBottom: 18 }}>
          Browse our menu and we&apos;ll deliver to your door in under 90 minutes.
        </p>
        <Link className="btn btn--lg" href="/shop">
          <Leaf aria-hidden /> Start shopping
        </Link>
      </div>
    );
  }

  const totals = quote?.totals ?? null;
  const subtotal = totals?.subtotalCents ?? snapshotSubtotal;
  const threshold = quote?.freeDeliveryThresholdCents ?? freeDeliveryThresholdCents;
  const minOrder = quote?.minOrderCents ?? minOrderCents;
  const discount = totals?.discountCents ?? 0;
  const deliveryFee = totals?.deliveryFeeCents ?? (subtotal >= threshold ? 0 : deliveryFeeCents);
  const tax = totals?.taxCents ?? 0;
  const total = totals?.totalCents ?? subtotal + deliveryFee;
  const minOrderMet = quote?.minOrderMet ?? subtotal >= minOrder;
  const remaining = threshold - subtotal;
  const pct = Math.min(100, threshold > 0 ? (subtotal / threshold) * 100 : 100);
  const itemCount = items.reduce((n, i) => n + i.qty, 0);

  const applyPromo = () => setCode(promoDraft);

  return (
    <div className="cart-wrap">
      <div>
        <div className="between" style={{ marginBottom: 6 }}>
          <span className="muted" style={{ fontWeight: 600 }}>
            {itemCount} item{itemCount === 1 ? '' : 's'}
          </span>
          <button type="button" className="cline__rm" onClick={clear}>
            Clear cart
          </button>
        </div>

        {items.map((i) => (
          <div className="cline" key={i.productId}>
            <Link className="cline__media" href={`/product/${i.slug}`}>
              <ProductMedia src={i.image} alt={i.name} sizes="64px" />
            </Link>
            <div>
              <div className="cline__brand">{i.brand ?? 'DankDeals'}</div>
              <Link className="cline__name" href={`/product/${i.slug}`}>
                {i.name}
              </Link>
              <div className="muted" style={{ fontSize: '.82rem', margin: '2px 0 8px' }}>
                {i.size} · {money(i.priceCents)}
              </div>
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
            <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-end' }}>
              <div className="price" style={{ fontSize: '1.05rem' }}>
                {money(i.priceCents * i.qty)}
              </div>
              <button type="button" className="cline__rm" onClick={() => remove(i.productId)}>
                Remove
              </button>
            </div>
          </div>
        ))}

        <Link className="btn btn--ghost" href="/shop" style={{ marginTop: 18 }}>
          <ChevronLeft aria-hidden /> Continue shopping
        </Link>
      </div>

      <aside className="summary">
        <h3>Order summary</h3>

        <div
          className="badge badge--soft"
          style={{ width: '100%', justifyContent: 'center', padding: 9, marginBottom: 6 }}
        >
          {remaining > 0 ? (
            <>
              <Truck className="ic" aria-hidden /> {money(remaining)} away from FREE delivery
            </>
          ) : (
            <>
              <Check className="ic" aria-hidden /> You unlocked free delivery!
            </>
          )}
        </div>
        <div className="progress">
          <i style={{ width: `${pct}%` }} />
        </div>

        <div className="promo">
          <input
            className="input"
            placeholder="Promo code"
            value={promoDraft}
            onChange={(e) => setPromoDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') applyPromo();
            }}
            aria-label="Promo code"
          />
          <button type="button" className="btn btn--dark btn--sm" onClick={applyPromo}>
            Apply
          </button>
        </div>
        {code && quote?.promo && (
          <div className="muted" style={{ fontSize: '.82rem', marginTop: -6, marginBottom: 10 }}>
            {quote.promo.applied ? (
              <span style={{ color: 'var(--green-700)', fontWeight: 700 }}>
                ✓ Code “{quote.promo.code}” applied
              </span>
            ) : (
              <span>{quote.promo.description ?? `Code “${quote.promo.code}” is not valid`}</span>
            )}
          </div>
        )}

        <div className="summary-row">
          <span>Subtotal</span>
          <b>{money(subtotal)}</b>
        </div>
        {discount > 0 && (
          <div className="summary-row" style={{ color: 'var(--green-700)' }}>
            <span>Discount</span>
            <b>−{money(discount)}</b>
          </div>
        )}
        <div className="summary-row">
          <span>Delivery</span>
          <b>{deliveryFee === 0 ? 'FREE' : money(deliveryFee)}</b>
        </div>
        <div className="summary-row muted">
          <span>Estimated tax</span>
          <span>{money(tax)}</span>
        </div>
        <div className="summary-row total">
          <span>Total</span>
          <span>{money(total)}</span>
        </div>

        {!minOrderMet && (
          <div className="infonote infonote--warn" style={{ marginTop: 14 }}>
            <Info className="ic" aria-hidden />
            <span>
              Minimum order is {money(minOrder)}. Add {money(Math.max(0, minOrder - subtotal))} more to
              check out.
            </span>
          </div>
        )}

        {minOrderMet ? (
          <Link className="btn btn--lg btn--block" href="/checkout" style={{ marginTop: 16 }}>
            Checkout · {money(total)}
          </Link>
        ) : (
          <button type="button" className="btn btn--lg btn--block" disabled style={{ marginTop: 16 }}>
            Checkout · {money(total)}
          </button>
        )}
        <div
          className="row gap-8 muted"
          style={{ justifyContent: 'center', marginTop: 12, fontSize: '.8rem' }}
        >
          <Lock aria-hidden style={{ width: 15, height: 15 }} /> Secure checkout
          {loading ? ' · updating…' : ''}
        </div>
      </aside>
    </div>
  );
}
