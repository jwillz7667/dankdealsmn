'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Box, Check, Home, Leaf, Package, Phone, Truck } from 'lucide-react';
import { ProductMedia } from '@/components/ProductMedia';
import { ApiError } from '@/lib/api/client';
import { formatTime, money, statusLabel } from '@/lib/format';
import { SITE } from '@/lib/site';
import type { Order, OrderStatus } from '@/lib/api/types';
import { getOrder } from './api';
import { getOrderToken } from './order-storage';

const STAGES: { status: OrderStatus; label: string; desc: string; icon: typeof Check }[] = [
  { status: 'CONFIRMED', label: 'Order confirmed', desc: "We've received your order", icon: Check },
  { status: 'PREPARING', label: 'Preparing', desc: 'Your order is being packed & sealed', icon: Package },
  { status: 'OUT_FOR_DELIVERY', label: 'Out for delivery', desc: 'Your driver is on the way', icon: Truck },
  { status: 'DELIVERED', label: 'Delivered', desc: 'Enjoy responsibly!', icon: Home },
];

const STAGE_INDEX: Record<OrderStatus, number> = {
  PENDING: 0,
  CONFIRMED: 0,
  PREPARING: 1,
  OUT_FOR_DELIVERY: 2,
  DELIVERED: 3,
  CANCELLED: 0,
};

const POLL_MS = 20_000;

export function OrderTracker({ orderNumber }: { orderNumber: string }) {
  const params = useSearchParams();
  const urlToken = params.get('token');

  const [token, setToken] = useState<string | null>(null);
  const [resolved, setResolved] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [status, setStatus] = useState<'loading' | 'ok' | 'missing' | 'error'>('loading');
  const orderRef = useRef<Order | null>(null);

  // Resolve the capability token after mount (localStorage is client-only).
  useEffect(() => {
    setToken(urlToken ?? getOrderToken(orderNumber));
    setResolved(true);
  }, [urlToken, orderNumber]);

  const load = useCallback(async () => {
    try {
      const result = await getOrder(orderNumber, token ?? undefined);
      orderRef.current = result;
      setOrder(result);
      setStatus('ok');
    } catch (err) {
      // 404 is returned for both unknown and unauthorized orders (no enumeration).
      if (err instanceof ApiError && (err.status === 404 || err.status === 401)) {
        if (!orderRef.current) setStatus('missing');
      } else if (!orderRef.current) {
        setStatus('error');
      }
    }
  }, [orderNumber, token]);

  useEffect(() => {
    if (!resolved) return;
    void load();
    const id = setInterval(() => {
      const current = orderRef.current?.status;
      if (current === 'DELIVERED' || current === 'CANCELLED') return;
      void load();
    }, POLL_MS);
    return () => clearInterval(id);
  }, [resolved, load]);

  if (status === 'loading') {
    return <div className="empty" aria-hidden="true" style={{ minHeight: 280 }} />;
  }

  if (status === 'missing' || status === 'error' || !order) {
    return (
      <div className="empty">
        <div className="ic">
          <Box aria-hidden style={{ width: '100%', height: '100%' }} />
        </div>
        <p
          style={{
            fontFamily: 'var(--font-display)',
            fontWeight: 700,
            fontSize: '1.3rem',
            color: 'var(--ink)',
          }}
        >
          {status === 'error' ? 'Couldn’t load this order' : 'We can’t find that order'}
        </p>
        <p style={{ marginBottom: 18 }}>
          {status === 'error'
            ? 'Please check your connection and try again.'
            : 'This tracking link may have expired or belongs to a different device.'}
        </p>
        <Link className="btn btn--lg" href="/shop">
          <Leaf aria-hidden /> Start shopping
        </Link>
      </div>
    );
  }

  const cancelled = order.status === 'CANCELLED';
  const current = STAGE_INDEX[order.status];
  const eventTime = new Map<OrderStatus, string>();
  for (const ev of order.events) eventTime.set(ev.status, ev.createdAt);

  const firstName = order.customer.name.split(' ')[0] ?? '';
  const addr = `${order.address.street}${order.address.apt ? `, ${order.address.apt}` : ''}, ${order.address.city} ${order.address.zip}`;

  const etaText = (() => {
    if (cancelled) return null;
    if (order.deliveredAt) return `Delivered ${formatTime(order.deliveredAt)}`;
    if (order.scheduledWindow) return order.scheduledWindow;
    if (order.etaAt) {
      const mins = Math.max(0, Math.round((new Date(order.etaAt).getTime() - Date.now()) / 60_000));
      return order.status === 'OUT_FOR_DELIVERY'
        ? `Arriving in ~${mins} min`
        : `Estimated arrival in ~${mins} min`;
    }
    return 'Estimated 60–90 min';
  })();

  return (
    <div className="track">
      <div className="track__hero">
        <span className="conf-check" aria-hidden>
          <Check />
        </span>
        <h1>{cancelled ? 'Order cancelled' : 'Order confirmed!'}</h1>
        {!cancelled && (
          <p style={{ color: 'var(--green-200)', marginTop: 6 }}>
            Thanks{firstName ? `, ${firstName}` : ''} — we&apos;re on it. A confirmation was sent to{' '}
            {order.customer.email}.
          </p>
        )}
        <div className="track__num" style={{ marginTop: 10 }}>
          Order #{order.orderNumber}
        </div>
      </div>

      <div className="conf-grid">
        <div style={{ display: 'grid', gap: 22 }}>
          {!cancelled && (
            <section className="formcard">
              <div className="between" style={{ alignItems: 'center', marginBottom: 18 }}>
                <div>
                  <div
                    style={{
                      fontFamily: 'var(--font-display)',
                      fontWeight: 800,
                      fontSize: '1.6rem',
                      lineHeight: 1,
                    }}
                  >
                    {etaText}
                  </div>
                  <div className="muted" style={{ fontSize: '.85rem', marginTop: 4 }}>
                    {order.deliveredAt ? 'Thanks for ordering' : 'Estimated arrival'}
                  </div>
                </div>
                <span className={`statuspill s-${order.status}`}>{statusLabel(order.status)}</span>
              </div>

              <div className="timeline">
                {STAGES.map((stage, i) => {
                  const cls = i < current ? 'is-done' : i === current ? 'is-current' : '';
                  const ts = eventTime.get(stage.status);
                  const StageIcon = i < current ? Check : stage.icon;
                  return (
                    <div className={`tl-step ${cls}`} key={stage.status}>
                      <div className="tl-step__dot">
                        <i>
                          <StageIcon aria-hidden style={{ width: 11, height: 11, color: '#fff' }} />
                        </i>
                        <div className="tl-step__line" />
                      </div>
                      <div className="tl-step__body">
                        <b>{stage.label}</b>
                        <span>
                          {stage.desc}
                          {i <= current && ts ? ` · ${formatTime(ts)}` : ''}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {order.driver && (
                <div className="driver">
                  <span className="driver__ava" aria-hidden>
                    {order.driver.displayName.charAt(0)}
                  </span>
                  <div className="driver__info">
                    <b>{order.driver.displayName}</b>
                    <span>
                      ★ {order.driver.ratingAvg.toFixed(1)} · DankDeals driver
                      {order.driver.vehicleDescription ? ` · ${order.driver.vehicleDescription}` : ''}
                    </span>
                  </div>
                  {SITE.supportPhone && (
                    <a
                      className="icon-btn driver__call"
                      href={`tel:${SITE.supportPhone.replace(/[^\d+]/g, '')}`}
                      aria-label="Call driver"
                    >
                      <Phone aria-hidden />
                    </a>
                  )}
                </div>
              )}
            </section>
          )}

          <div className="row gap-12 wrap-flow">
            <Link className="btn" href="/shop">
              <Leaf aria-hidden /> Continue shopping
            </Link>
            <Link className="btn btn--ghost" href="/">
              <Home aria-hidden /> Back home
            </Link>
          </div>
        </div>

        <aside className="summary">
          <h3>Delivery details</h3>
          <div className="summary-row" style={{ alignItems: 'flex-start' }}>
            <span className="muted">Deliver to</span>
            <span style={{ textAlign: 'right', fontWeight: 600 }}>
              {order.customer.name}
              <br />
              <span className="muted" style={{ fontWeight: 400, fontSize: '.85rem' }}>
                {addr}
              </span>
            </span>
          </div>
          <div className="summary-row">
            <span className="muted">When</span>
            <b>{order.deliveryType === 'SCHEDULED' ? order.scheduledWindow ?? 'Scheduled' : 'ASAP'}</b>
          </div>
          <div className="summary-row">
            <span className="muted">Payment</span>
            <b>{order.paymentMethod === 'CASH' ? 'Cash on delivery' : 'Debit at door'}</b>
          </div>

          <h3 style={{ margin: '18px 0 10px' }}>Order summary</h3>
          {order.items.map((it, idx) => (
            <div className="sum-line" key={`${it.productId ?? it.name}-${idx}`}>
              <span className="sum-line__media">
                <ProductMedia src={it.image} alt={it.name} sizes="44px" />
              </span>
              <div>
                <div className="nm">{it.name}</div>
                <div className="qx">
                  Qty {it.quantity}
                  {it.size ? ` · ${it.size}` : ''}
                </div>
              </div>
              <b>{money(it.lineTotalCents)}</b>
            </div>
          ))}

          <hr className="divider" style={{ margin: '12px 0' }} />
          <div className="summary-row">
            <span>Subtotal</span>
            <b>{money(order.totals.subtotalCents)}</b>
          </div>
          {order.totals.discountCents > 0 && (
            <div className="summary-row" style={{ color: 'var(--green-700)' }}>
              <span>Discount</span>
              <b>−{money(order.totals.discountCents)}</b>
            </div>
          )}
          <div className="summary-row">
            <span>Delivery</span>
            <b>{order.totals.deliveryFeeCents === 0 ? 'FREE' : money(order.totals.deliveryFeeCents)}</b>
          </div>
          {order.totals.tipCents > 0 && (
            <div className="summary-row">
              <span>Driver tip</span>
              <b>{money(order.totals.tipCents)}</b>
            </div>
          )}
          <div className="summary-row muted">
            <span>Tax</span>
            <span>{money(order.totals.taxCents)}</span>
          </div>
          <div className="summary-row total">
            <span>Total</span>
            <span>{money(order.totals.totalCents)}</span>
          </div>
        </aside>
      </div>
    </div>
  );
}
