import type { MetadataRoute } from 'next';
import { getCategories, getProducts } from '@/features/catalog/api';
import { SITE } from '@/lib/site';

// Refresh the generated sitemap hourly; catalog churn is gradual, not real-time.
export const revalidate = 3600;

type ChangeFrequency = MetadataRoute.Sitemap[number]['changeFrequency'];

const STATIC_ROUTES: { path: string; priority: number; changeFrequency: ChangeFrequency }[] = [
  { path: '/', priority: 1.0, changeFrequency: 'daily' },
  { path: '/shop', priority: 0.9, changeFrequency: 'daily' },
  { path: '/about', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/contact', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/faq', priority: 0.5, changeFrequency: 'monthly' },
  { path: '/privacy', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/terms', priority: 0.3, changeFrequency: 'yearly' },
  { path: '/accessibility', priority: 0.3, changeFrequency: 'yearly' },
];

// Bounded pagination: cap total products in the sitemap and surface truncation in logs
// rather than silently dropping URLs or fanning out an unbounded request loop.
const PRODUCT_PAGE_SIZE = 50; // must stay within the API's max page size (catalog.schema limit.max=60).
const MAX_PRODUCT_PAGES = 60; // up to 3,000 products — well under the 50k sitemap limit.

async function collectProducts(): Promise<{ slug: string; lastModified: string }[]> {
  const out: { slug: string; lastModified: string }[] = [];
  let cursor: string | undefined;

  for (let page = 0; page < MAX_PRODUCT_PAGES; page += 1) {
    const res = await getProducts({ limit: PRODUCT_PAGE_SIZE, cursor, sort: 'newest' });
    for (const p of res.items) out.push({ slug: p.slug, lastModified: p.createdAt });
    if (!res.nextCursor) return out;
    cursor = res.nextCursor;
  }

  console.warn(`sitemap: product list truncated at ${MAX_PRODUCT_PAGES * PRODUCT_PAGE_SIZE} URLs`);
  return out;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [categories, products] = await Promise.all([getCategories(), collectProducts()]);
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = STATIC_ROUTES.map((r) => ({
    url: `${SITE.url}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));

  // Category landing pages share the /shop canonical with a ?category= param.
  const categoryEntries: MetadataRoute.Sitemap = categories.map((c) => ({
    url: `${SITE.url}/shop?category=${c.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const productEntries: MetadataRoute.Sitemap = products.map((p) => ({
    url: `${SITE.url}/product/${p.slug}`,
    lastModified: new Date(p.lastModified),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  return [...staticEntries, ...categoryEntries, ...productEntries];
}
