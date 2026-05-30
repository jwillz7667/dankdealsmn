import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Package, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { requireUser, getApiToken } from '@/features/auth/server';
import { getMyOrders } from '@/features/account/api';
import { money, statusLabel, formatDateTime } from '@/lib/format';

export const metadata: Metadata = {
  title: 'Order history',
  robots: { index: false, follow: false },
};

export default async function OrderHistoryPage() {
  await requireUser('/account/orders');

  const token = await getApiToken();
  if (!token) redirect('/signin?callbackUrl=%2Faccount%2Forders');

  const { items, nextCursor } = await getMyOrders(token);

  return (
    <div className="wrap section">
      <PageHeader title="Order history" intro="Track active deliveries and revisit past orders." />

      {items.length === 0 ? (
        <div className="empty">
          <div className="ic">
            <Package aria-hidden style={{ width: '100%', height: '100%' }} />
          </div>
          <p style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.1rem', color: 'var(--ink)' }}>
            No orders yet
          </p>
          <p style={{ marginBottom: 18 }}>When you place your first order, it&apos;ll show up here.</p>
          <Link className="btn" href="/shop">
            Browse the menu
          </Link>
        </div>
      ) : (
        <div className="acct">
          {items.map((o) => (
            <Link
              key={o.orderNumber}
              className="orderrow"
              href={`/order/${o.orderNumber}?token=${encodeURIComponent(o.trackingToken)}`}
            >
              <div className="orderrow__meta">
                <b>#{o.orderNumber}</b>
                <span className="muted">
                  {formatDateTime(o.placedAt)} · {o.itemCount} {o.itemCount === 1 ? 'item' : 'items'}
                </span>
              </div>
              <div className="row gap-12">
                <span className={`statuspill s-${o.status}`}>{statusLabel(o.status)}</span>
                <b>{money(o.totalCents)}</b>
                <ChevronRight className="ic" aria-hidden />
              </div>
            </Link>
          ))}

          {nextCursor && (
            <p className="muted" style={{ textAlign: 'center', fontSize: '0.85rem' }}>
              Showing your most recent orders.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
