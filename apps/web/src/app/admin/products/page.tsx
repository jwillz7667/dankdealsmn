import Link from 'next/link';
import { Plus, Package } from 'lucide-react';
import { getAdminToken } from '@/features/admin/server';
import { listProducts, listCategories, type AdminProductQuery } from '@/features/admin/api';
import { DeleteButton } from '@/features/admin/DeleteButton';
import { deleteProductAction } from '@/features/admin/actions';
import { money } from '@/lib/format';
import type { ProductStatus } from '@/lib/api/types';

export const metadata = { title: 'Products' };

const STATUS_OPTIONS: { value: ProductStatus; label: string }[] = [
  { value: 'ACTIVE', label: 'Active' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'ARCHIVED', label: 'Archived' },
];

const STATUS_CLASS: Record<ProductStatus, string> = {
  ACTIVE: 'is-active',
  DRAFT: 'is-draft',
  ARCHIVED: 'is-archived',
};

interface PageProps {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}

function first(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isStatus(value: string | undefined): value is ProductStatus {
  return value === 'ACTIVE' || value === 'DRAFT' || value === 'ARCHIVED';
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

export default async function AdminProductsPage({ searchParams }: PageProps) {
  const token = await getAdminToken();
  const raw = await searchParams;

  const search = first(raw.search)?.trim() || undefined;
  const statusRaw = first(raw.status);
  const status = isStatus(statusRaw) ? statusRaw : undefined;
  const categoryId = first(raw.categoryId) || undefined;
  const page = Math.max(1, Number(first(raw.page)) || 1);

  const query: AdminProductQuery = {
    ...(search ? { search } : {}),
    ...(status ? { status } : {}),
    ...(categoryId ? { categoryId } : {}),
    page,
    pageSize: 20,
  };

  const [list, categories] = await Promise.all([listProducts(token, query), listCategories(token)]);
  const totalPages = Math.max(1, Math.ceil(list.total / list.pageSize));
  const baseQuery = { search, status, categoryId };

  return (
    <div className="adminpage">
      <header className="adminpage__head">
        <div>
          <h1>Products</h1>
          <p>{list.total.toLocaleString()} total products in the catalog.</p>
        </div>
        <Link href="/admin/products/new" className="btn">
          <Plus className="ic" aria-hidden /> New product
        </Link>
      </header>

      <form className="adminfilters" method="get">
        <div className="field field--grow">
          <label htmlFor="f-search">Search</label>
          <input
            id="f-search"
            name="search"
            className="input"
            defaultValue={search ?? ''}
            placeholder="Name or slug…"
          />
        </div>
        <div className="field">
          <label htmlFor="f-status">Status</label>
          <select id="f-status" name="status" className="select" defaultValue={status ?? ''}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="f-category">Category</label>
          <select id="f-category" name="categoryId" className="select" defaultValue={categoryId ?? ''}>
            <option value="">All categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
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
          <Package className="ic" aria-hidden />
          <p>No products match these filters.</p>
        </div>
      ) : (
        <div className="adminbox" style={{ padding: 0 }}>
          <div className="tablewrap">
            <table className="datatable">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Category</th>
                  <th className="num">Price</th>
                  <th>Status</th>
                  <th className="num">Stock</th>
                  <th aria-label="Actions" />
                </tr>
              </thead>
              <tbody>
                {list.items.map((p) => {
                  const image = p.images.find((i) => i.isPrimary) ?? p.images[0];
                  return (
                    <tr key={p.id}>
                      <td>
                        <div className="celltitle">
                          <span className="thumb">
                            {image ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img src={image.url} alt="" loading="lazy" />
                            ) : (
                              <Package className="ic" aria-hidden />
                            )}
                          </span>
                          <span>
                            <Link href={`/admin/products/${p.id}`} className="celltitle__name">
                              {p.name}
                            </Link>
                            <span className="celltitle__sub">
                              {p.size}
                              {p.brand ? ` · ${p.brand.name}` : ''}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td>{p.category.name}</td>
                      <td className="num">{money(p.priceCents)}</td>
                      <td>
                        <span className={`tag ${STATUS_CLASS[p.status]}`}>{p.status}</span>
                        {!p.inStock && <span className="tag is-out" style={{ marginLeft: 6 }}>Out</span>}
                      </td>
                      <td className="num">{p.trackInventory ? p.inventoryQty : '—'}</td>
                      <td>
                        <div className="rowactions">
                          <Link href={`/admin/products/${p.id}`} className="btn btn--ghost btn--sm">
                            Edit
                          </Link>
                          <DeleteButton action={deleteProductAction} id={p.id} noun="product" />
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {totalPages > 1 && (
        <nav className="pager" aria-label="Pagination">
          {page > 1 ? (
            <Link href={`/admin/products${buildQuery(baseQuery, page - 1)}`} className="btn btn--ghost btn--sm">
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
            <Link href={`/admin/products${buildQuery(baseQuery, page + 1)}`} className="btn btn--ghost btn--sm">
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
