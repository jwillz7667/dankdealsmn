import Link from 'next/link';
import { Package, Clock, Truck, CheckCircle2, AlertTriangle, Star } from 'lucide-react';
import { getAdminToken } from '@/features/admin/server';
import { getStats } from '@/features/admin/api';
import { money, statusLabel, formatDateTime } from '@/lib/format';

export const metadata = { title: 'Dashboard' };

export default async function AdminDashboardPage() {
  const token = await getAdminToken();
  const stats = await getStats(token);

  const orderStats = [
    { label: 'Total orders', value: stats.orders.total.toLocaleString(), icon: Package },
    { label: 'Pending', value: stats.orders.pending.toLocaleString(), icon: Clock },
    { label: 'In progress', value: stats.orders.active.toLocaleString(), icon: Truck },
    { label: 'Delivered today', value: stats.orders.deliveredToday.toLocaleString(), icon: CheckCircle2 },
  ];

  return (
    <div className="adminpage">
      <header className="adminpage__head">
        <h1>Dashboard</h1>
      </header>

      <section className="statgrid" aria-label="Order metrics">
        {orderStats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="statcard">
            <span className="statcard__ic">
              <Icon aria-hidden />
            </span>
            <div>
              <span className="statcard__value">{value}</span>
              <span className="statcard__label">{label}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="admincols">
        <div className="adminbox">
          <h2 className="adminbox__title">Revenue</h2>
          <dl className="kv">
            <div>
              <dt>Gross (all time)</dt>
              <dd>{money(stats.revenue.grossCentsAllTime)}</dd>
            </div>
            <div>
              <dt>Gross (last 30 days)</dt>
              <dd>{money(stats.revenue.grossCentsLast30Days)}</dd>
            </div>
          </dl>
        </div>

        <div className="adminbox">
          <h2 className="adminbox__title">Catalog</h2>
          <dl className="kv">
            <div>
              <dt>Active products</dt>
              <dd>{stats.catalog.activeProducts}</dd>
            </div>
            <div>
              <dt>Drafts</dt>
              <dd>{stats.catalog.draftProducts}</dd>
            </div>
            <div>
              <dt>
                <AlertTriangle className="ic" aria-hidden /> Out of stock
              </dt>
              <dd>{stats.catalog.outOfStock}</dd>
            </div>
            <div>
              <dt>
                <Star className="ic" aria-hidden /> Reviews to moderate
              </dt>
              <dd>{stats.catalog.pendingReviews}</dd>
            </div>
          </dl>
        </div>
      </section>

      <section className="adminbox">
        <div className="adminbox__bar">
          <h2 className="adminbox__title">Recent orders</h2>
          <Link href="/admin/orders" className="link">
            View all
          </Link>
        </div>
        {stats.recentOrders.length === 0 ? (
          <p className="muted">No orders yet.</p>
        ) : (
          <div className="tablewrap">
            <table className="datatable">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Placed</th>
                  <th className="num">Total</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((o) => (
                  <tr key={o.orderNumber}>
                    <td>
                      <Link href={`/admin/orders/${o.orderNumber}`} className="link">
                        #{o.orderNumber}
                      </Link>
                    </td>
                    <td>{o.customerName}</td>
                    <td>
                      <span className={`statuspill s-${o.status}`}>{statusLabel(o.status)}</span>
                    </td>
                    <td>{formatDateTime(o.placedAt)}</td>
                    <td className="num">{money(o.totalCents)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
