import type { Metadata } from 'next';
import Link from 'next/link';
import { CategoryChips } from '@/features/catalog/components/CategoryChips';
import { Filters } from '@/features/catalog/components/Filters';
import { SortSelect } from '@/features/catalog/components/SortSelect';
import { AppliedFilters } from '@/features/catalog/components/AppliedFilters';
import { ShopResults } from '@/features/catalog/components/ShopResults';
import { getBrands, getCategories, getProducts } from '@/features/catalog/api';
import { PAGE_SIZE, parseShopFilters, type RawSearchParams, type ShopFilters } from '@/features/catalog/shop-filters';

export const revalidate = 300;

interface ShopPageProps {
  searchParams: Promise<RawSearchParams>;
}

function headingFor(filters: ShopFilters, categoryName: string | null) {
  if (filters.search) {
    return { title: `Results for “${filters.search}”`, crumb: 'Search', sub: 'Matching products across our menu.' };
  }
  if (filters.badge === 'DEAL') {
    return { title: "Today's deals", crumb: 'Deals', sub: 'Limited-time prices, restocked daily.' };
  }
  if (categoryName) {
    return { title: categoryName, crumb: categoryName, sub: `Browse our ${categoryName.toLowerCase()} selection.` };
  }
  return {
    title: 'Shop all products',
    crumb: 'Shop all',
    sub: 'Lab-tested cannabis, delivered across the Twin Cities.',
  };
}

export async function generateMetadata({ searchParams }: ShopPageProps): Promise<Metadata> {
  const filters = parseShopFilters(await searchParams);
  const categories = await getCategories();
  const categoryName = filters.category
    ? (categories.find((c) => c.slug === filters.category)?.name ?? null)
    : null;
  const { title, sub } = headingFor(filters, categoryName);
  return {
    title,
    description: sub,
    alternates: { canonical: filters.category ? `/shop?category=${filters.category}` : '/shop' },
  };
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const filters = parseShopFilters(await searchParams);

  const [list, categories, brands] = await Promise.all([
    getProducts({
      category: filters.category ?? undefined,
      brand: filters.brand ?? undefined,
      strain: filters.strain ?? undefined,
      badge: filters.badge ?? undefined,
      search: filters.search ?? undefined,
      minPrice: filters.minPrice ?? undefined,
      maxPrice: filters.maxPrice ?? undefined,
      sort: filters.sort,
      limit: PAGE_SIZE,
    }),
    getCategories(),
    getBrands(),
  ]);

  const categoryName = filters.category
    ? (categories.find((c) => c.slug === filters.category)?.name ?? null)
    : null;
  const { title, crumb, sub } = headingFor(filters, categoryName);
  const filterKey = JSON.stringify(filters);

  return (
    <div className="wrap section">
      <nav className="crumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link> / <span>{crumb}</span>
      </nav>
      <h1>{title}</h1>
      <p className="muted" style={{ marginTop: 4 }}>
        {sub}
      </p>

      <div style={{ marginTop: 18 }}>
        <CategoryChips categories={categories} />
      </div>

      <div className="shop" style={{ marginTop: 18 }}>
        <aside>
          <Filters brands={brands} />
        </aside>

        <div>
          <div className="shop__toolbar">
            <span className="shop__count">
              {list.total} {list.total === 1 ? 'product' : 'products'}
            </span>
            <SortSelect />
          </div>
          <AppliedFilters brands={brands} />
          <ShopResults key={filterKey} initialItems={list.items} initialCursor={list.nextCursor} filters={filters} />
        </div>
      </div>
    </div>
  );
}
