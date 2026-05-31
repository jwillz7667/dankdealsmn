import 'server-only';
import { api, ApiError, qs } from '@/lib/api/client';
import type {
  Brand,
  Category,
  Product,
  ProductList,
  ReviewList,
  StrainType,
} from '@/lib/api/types';

export interface ProductFilters {
  category?: string;
  brand?: string;
  strain?: StrainType;
  search?: string;
  badge?: 'DEAL' | 'NEW' | 'BEST';
  minPrice?: number;
  maxPrice?: number;
  sort?: 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'thc' | 'newest';
  cursor?: string;
  limit?: number;
}

const CATALOG_REVALIDATE = 300; // 5 min ISR — catalog changes are not second-by-second.

const EMPTY_LIST: ProductList = { items: [], nextCursor: null, total: 0 };

/** Listing read — degrades to an empty result if the API is unreachable (build/outage). */
export async function getProducts(filters: ProductFilters = {}): Promise<ProductList> {
  try {
    return await api.get<ProductList>(`/products${qs({ ...filters })}`, {
      next: { revalidate: CATALOG_REVALIDATE, tags: ['catalog', 'products'] },
    });
  } catch (err) {
    console.error('getProducts failed', err);
    return EMPTY_LIST;
  }
}

/** Detail read — returns null on 404 so the page can call notFound(); rethrows real errors. */
export async function getProduct(slug: string): Promise<Product | null> {
  try {
    return await api.get<Product>(`/products/${encodeURIComponent(slug)}`, {
      next: { revalidate: CATALOG_REVALIDATE, tags: ['catalog', `product:${slug}`] },
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 404) return null;
    throw err;
  }
}

export async function getRelatedProducts(slug: string, limit = 4): Promise<Product[]> {
  try {
    return await api.get<Product[]>(
      `/products/${encodeURIComponent(slug)}/related${qs({ limit })}`,
      { next: { revalidate: CATALOG_REVALIDATE, tags: ['catalog'] } },
    );
  } catch (err) {
    console.error('getRelatedProducts failed', err);
    return [];
  }
}

export async function getCategories(): Promise<Category[]> {
  try {
    return await api.get<Category[]>('/categories', {
      next: { revalidate: CATALOG_REVALIDATE, tags: ['catalog', 'categories'] },
    });
  } catch (err) {
    console.error('getCategories failed', err);
    return [];
  }
}

export async function getBrands(): Promise<Brand[]> {
  try {
    return await api.get<Brand[]>('/brands', {
      next: { revalidate: CATALOG_REVALIDATE, tags: ['catalog', 'brands'] },
    });
  } catch (err) {
    console.error('getBrands failed', err);
    return [];
  }
}

export async function getProductReviews(slug: string): Promise<ReviewList> {
  try {
    return await api.get<ReviewList>(`/products/${encodeURIComponent(slug)}/reviews`, {
      next: { revalidate: 120, tags: [`reviews:${slug}`] },
    });
  } catch (err) {
    console.error('getProductReviews failed', err);
    return { items: [], total: 0, ratingAvg: 0, ratingCount: 0 };
  }
}
