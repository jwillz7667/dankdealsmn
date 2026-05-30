import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getAdminToken } from '@/features/admin/server';
import { getOrder } from '@/features/admin/api';
import { OrderStatusForm } from '@/features/admin/OrderStatusForm';
import { ApiError } from '@/lib/api/client';
import { money, moneyExact, statusLabel, formatDateTime } from '@/lib/format';

export const metadata = { title: 'Order' };

interface PageProps {
  params: Promise<{ orderNumber: string }>;
}

const PAYMENT_LABEL: Record<string, string> = { CASH: 'Cash on delivery', DEBIT: 'Debit on delivery' };

export default async function AdminOrderDetailPage({ params }: PageProps) {
  const { orderNumber } = await params;
  const token = await getAdminToken();

  const order = await getOrder(token, orderNumber).catch((err) => {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  });

  const t = order.totals;

  return (
    <div className="adminpage">
      <header className="adminpage__head">
        <div>
          <Link href="/admin/orders" className="link">
            <ChevronLeft className="ic" aria-hidden style={{ verticalAlign: 'middle' }} /> Orders
          </Link>
          <h1>Order #{order.orderNumber}</h1>
          <p>Placed {formatDateTime(order.placedAt)}</p>
        </div>
        <span className={`statuspill s-${order.status}`}>{statusLabel(order.status)}</span>
      </header>

      <div className="ordergrid">
        <div className="stack gap-16">
          <section className="adminbox">
            <h2 className="adminbox__title">Items</h2>
            <div className="tablewrap">
              <table className="datatable">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th className="num">Qty</th>
                    <th className="num">Unit</th>
                    <th className="num">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {order.items.map((item, i) => (
                    <tr key={`${item.productId ?? 'x'}-${i}`}>
                      <td>
                        <span className="celltitle__name">{item.name}</span>
                        <span className="celltitle__sub">
                          {[item.brand, item.size].filter(Boolean).join(' · ')}
                        </span>
                      </td>
                      <td className="num">{item.quantity}</td>
                      <td className="num">{moneyExact(item.unitPriceCents)}</td>
                      <td className="num">{moneyExact(item.lineTotalCents)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <dl className="kv" style={{ marginTop: 14 }}>
              <div>
                <dt>Subtotal</dt>
                <dd>{moneyExact(t.subtotalCents)}</dd>
              </div>
              {t.discountCents > 0 && (
                <div>
                  <dt>Discount{order.promoCode ? ` (${order.promoCode})` : ''}</dt>
                  <dd>−{moneyExact(t.discountCents)}</dd>
                </div>
              )}
              <div>
                <dt>Delivery</dt>
                <dd>{t.deliveryFeeCents === 0 ? 'Free' : moneyExact(t.deliveryFeeCents)}</dd>
              </div>
              <div>
                <dt>Tax</dt>
                <dd>{moneyExact(t.taxCents)}</dd>
              </div>
              {t.tipCents > 0 && (
                <div>
                  <dt>Tip</dt>
                  <dd>{moneyExact(t.tipCents)}</dd>
                </div>
              )}
              <div>
                <dt>
                  <b>Total</b>
                </dt>
                <dd>{money(t.totalCents)}</dd>
              </div>
            </dl>
          </section>

          <section className="adminbox">
            <h2 className="adminbox__title">Timeline</h2>
            {order.events.length === 0 ? (
              <p className="muted">No status history yet.</p>
            ) : (
              <div className="timeline">
                {order.events.map((event, i) => (
                  <div className="tl-step is-done" key={`${event.status}-${i}`}>
                    <div className="tl-step__dot">
                      <i />
                      {i < order.events.length - 1 && <span className="tl-step__line" />}
                    </div>
                    <div className="tl-step__body">
                      <b>{statusLabel(event.status)}</b>
                      <span>{formatDateTime(event.createdAt)}</span>
                      {event.message && <span>{event.message}</span>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        <div className="stack gap-16">
          <section className="adminbox">
            <h2 className="adminbox__title">Manage</h2>
            <OrderStatusForm
              orderNumber={order.orderNumber}
              currentStatus={order.status}
              currentDriver={order.driver?.displayName ?? null}
            />
          </section>

          <section className="adminbox">
            <h2 className="adminbox__title">Customer</h2>
            <dl className="kv">
              <div>
                <dt>Name</dt>
                <dd>{order.customer.name}</dd>
              </div>
              <div>
                <dt>Phone</dt>
                <dd>
                  <a href={`tel:${order.customer.phone}`} className="link">
                    {order.customer.phone}
                  </a>
                </dd>
              </div>
              <div>
                <dt>Email</dt>
                <dd>
                  <a href={`mailto:${order.customer.email}`} className="link">
                    {order.customer.email}
                  </a>
                </dd>
              </div>
              <div>
                <dt>ID verified</dt>
                <dd>{order.idVerified ? 'Yes' : 'No'}</dd>
              </div>
            </dl>
          </section>

          <section className="adminbox">
            <h2 className="adminbox__title">Delivery</h2>
            <dl className="kv">
              <div>
                <dt>Address</dt>
                <dd style={{ textAlign: 'right' }}>
                  {order.address.street}
                  {order.address.apt ? `, ${order.address.apt}` : ''}
                  <br />
                  {order.address.city}, MN {order.address.zip}
                </dd>
              </div>
              {order.address.notes && (
                <div>
                  <dt>Notes</dt>
                  <dd style={{ textAlign: 'right' }}>{order.address.notes}</dd>
                </div>
              )}
              <div>
                <dt>Fulfillment</dt>
                <dd>
                  {order.deliveryType === 'SCHEDULED'
                    ? (order.scheduledWindow ?? 'Scheduled')
                    : 'ASAP'}
                </dd>
              </div>
              <div>
                <dt>Payment</dt>
                <dd>{PAYMENT_LABEL[order.paymentMethod] ?? order.paymentMethod}</dd>
              </div>
              {order.etaAt && (
                <div>
                  <dt>ETA</dt>
                  <dd>{formatDateTime(order.etaAt)}</dd>
                </div>
              )}
            </dl>
          </section>
        </div>
      </div>
    </div>
  );
}
