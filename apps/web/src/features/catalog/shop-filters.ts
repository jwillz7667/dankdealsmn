import type { Badge, StrainType } from '@/lib/api/types';

export type SortOption = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'thc' | 'newest';

export const SORT_OPTIONS: ReadonlyArray<{ value: SortOption; label: string }> = [
  { value: 'featured', label: 'Featured' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'rating', label: 'Top rated' },
  { value: 'thc', label: 'Highest THC' },
  { value: 'newest', label: 'Newest' },
];

export const STRAIN_OPTIONS: ReadonlyArray<{ value: StrainType; label: string }> = [
  { value: 'INDICA', label: 'Indica' },
  { value: 'SATIVA', label: 'Sativa' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'CBD', label: 'CBD' },
];

export const PAGE_SIZE = 24;

export interface ShopFilters {
  category: string | null;
  strain: StrainType | null;
  brand: string | null;
  badge: Badge | null;
  search: string | null;
  minPrice: number | null;
  maxPrice: number | null;
  sort: SortOption;
}

export type RawSearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined): string | null {
  if (Array.isArray(value)) return value[0] ?? null;
  return value ?? null;
}

const STRAINS = new Set<StrainType>(['INDICA', 'SATIVA', 'HYBRID', 'CBD']);
const BADGES = new Set<Badge>(['DEAL', 'NEW', 'BEST']);
const SORTS = new Set<SortOption>(SORT_OPTIONS.map((o) => o.value));

function positiveInt(raw: string | null): number | null {
  if (raw === null) return null;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? Math.floor(n) : null;
}

/** Normalize raw URL search params into a validated, typed filter object. */
export function parseShopFilters(raw: RawSearchParams): ShopFilters {
  const strain = (first(raw.strain) ?? '').toUpperCase() as StrainType;
  const badge = (first(raw.badge) ?? '').toUpperCase() as Badge;
  const sort = (first(raw.sort) ?? 'featured') as SortOption;

  return {
    category: first(raw.category),
    strain: STRAINS.has(strain) ? strain : null,
    brand: first(raw.brand),
    badge: BADGES.has(badge) ? badge : null,
    search: first(raw.search) ?? first(raw.q),
    minPrice: positiveInt(first(raw.minPrice)),
    maxPrice: positiveInt(first(raw.maxPrice)),
    sort: SORTS.has(sort) ? sort : 'featured',
  };
}

/** Build the API query object (drops nulls; only includes the default sort when non-default). */
export function toApiFilters(f: ShopFilters): Record<string, string | number> {
  const out: Record<string, string | number> = {};
  if (f.category) out.category = f.category;
  if (f.strain) out.strain = f.strain;
  if (f.brand) out.brand = f.brand;
  if (f.badge) out.badge = f.badge;
  if (f.search) out.search = f.search;
  if (f.minPrice !== null) out.minPrice = f.minPrice;
  if (f.maxPrice !== null) out.maxPrice = f.maxPrice;
  if (f.sort !== 'featured') out.sort = f.sort;
  return out;
}

export function hasActiveFilters(f: ShopFilters): boolean {
  return Boolean(f.strain || f.brand || f.badge || f.minPrice !== null || f.maxPrice !== null);
}
