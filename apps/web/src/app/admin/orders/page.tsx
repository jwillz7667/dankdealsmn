import Link from 'next/link';
import { Receipt } from 'lucide-react';
import { getAdminToken } from '@/features/admin/server';
import { listOrders, type AdminOrderQuery } from '@/features/admin/api';
import { money, statusLabel, formatDateTime } from '@/lib/format';
import type { OrderStatus } from '@/lib/api/types';

export const metadata = { title: 'Orders' };

const STATUS_OPTIONS: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
];

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isOrderStatus(value: string | undefined): value is OrderStatus {
  return value !== undefined && (STATUS_OPTIONS as string[]).includes(value);
}

function buildQuery(base: Record<string, string | undefined>, page: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(base)) {
    if (value) params.set(key, value);
  }
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs ? `?${qs}` : '';
}

export default async function AdminOrdersPage({ searchParams }: PageProps) {
  const token = await getAdminToken();
  const raw = await searchParams;

  const search = first(raw.search)?.trim() || undefined;
  const statusRaw = first(raw.status);
  const status = isOrderStatus(statusRaw) ? statusRaw : undefined;
  const page = Math.max(1, Number(first(raw.page)) || 1);

  const query: AdminOrderQuery = {
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
    page,
    pageSize: 20,
  };

  const list = await listOrders(token, query);
  const totalPages = Math.max(1, Math.ceil(list.total / list.pageSize));
  const baseQuery = { search, status };

  return (
    <div className="adminpage">
      <header className="adminpage__head">
        <div>
          <h1>Orders</h1>
          <p>{list.total.toLocaleString()} orders placed.</p>
        </div>
      </header>

      <form className="adminfilters" method="get">
        <div className="field field--grow">
          <label htmlFor="f-search">Search</label>
          <input
            id="f-search"
            name="search"
            className="input"
            defaultValue={search ?? ''}
            placeholder="Order number or customer…"
          />
        </div>
        <div className="field">
          <label htmlFor="f-status">Status</label>
          <select id="f-status" name="status" className="select" defaultValue={status ?? ''}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {statusLabel(s)}
              </option>
            ))}
          </select>
        </div>
        <button type="submit" className="btn btn--ghost">
          Filter
        </button>
      </form>

      {list.items.length === 0 ? (
        <div className="empty">
          <Receipt className="ic" aria-hidden />
          <p>No orders match these filters.</p>
        </div>
      ) : (
        <div className="adminbox" style={{ padding: 0 }}>
          <div className="tablewrap">
            <table className="datatable">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>City</th>
                  <th>Status</th>
                  <th className="num">Items</th>
                  <th className="num">Total</th>
                  <th>Placed</th>
                  <th>Driver</th>
                </tr>
              </thead>
              <tbody>
                {list.items.map((o) => (
                  <tr key={o.orderNumber}>
                    <td>
                      <Link href={`/admin/orders/${o.orderNumber}`} className="celltitle__name link">
                        #{o.orderNumber}
                      </Link>
                    </td>
                    <td>{o.customerName}</td>
                    <td>{o.city}</td>
                    <td>
                      <span className={`statuspill s-${o.status}`}>{statusLabel(o.status)}</span>
                    </td>
                    <td className="num">{o.itemCount}</td>
                    <td className="num">{money(o.totalCents)}</td>
                    <td>{formatDateTime(o.placedAt)}</td>
                    <td className="muted">{o.driver ?? '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="pager" aria-label="Pagination">
          {page > 1 ? (
            <Link href={`/admin/orders${buildQuery(baseQuery, page - 1)}`} className="btn btn--ghost btn--sm">
              Previous
            </Link>
          ) : (
            <span className="btn btn--ghost btn--sm" aria-disabled>
              Previous
            </span>
          )}
          <span className="muted">
            Page {page} of {totalPages}
          </span>
          {page < totalPages ? (
            <Link href={`/admin/orders${buildQuery(baseQuery, page + 1)}`} className="btn btn--ghost btn--sm">
              Next
            </Link>
          ) : (
            <span className="btn btn--ghost btn--sm" aria-disabled>
              Next
            </span>
          )}
        </nav>
      )}
    </div>
  );
}
