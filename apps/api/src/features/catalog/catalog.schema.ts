import { z } from 'zod';

export const SORTS = ['featured', 'price-asc', 'price-desc', 'rating', 'thc', 'newest'] as const;
export type Sort = (typeof SORTS)[number];

export const ProductQuerySchema = z.object({
  category: z.string().optional(),
  brand: z.string().optional(), // brand slug
  strain: z.enum(['INDICA', 'SATIVA', 'HYBRID', 'CBD']).optional(),
  search: z.string().trim().min(1).max(100).optional(),
  badge: z.enum(['DEAL', 'NEW', 'BEST']).optional(),
  minPrice: z.coerce.number().int().nonnegative().optional(), // dollars
  maxPrice: z.coerce.number().int().nonnegative().optional(),
  sort: z.enum(SORTS).default('featured'),
  cursor: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(60).default(24),
});
export type ProductQuery = z.infer<typeof ProductQuerySchema>;

export const ProductParamsSchema = z.object({ slug: z.string().min(1) });

// ---- response schemas (also feed OpenAPI) ----
const PotencySchema = z.object({ value: z.number().nullable(), unit: z.enum(['PERCENT', 'MG']) });
const ImageSchema = z.object({
  id: z.string(),
  url: z.string(),
  alt: z.string().nullable(),
  width: z.number().nullable(),
  height: z.number().nullable(),
  position: z.number(),
  isPrimary: z.boolean(),
});

export const ProductSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  brand: z.object({ name: z.string(), slug: z.string() }).nullable(),
  category: z.object({ name: z.string(), slug: z.string() }),
  strainType: z.enum(['INDICA', 'SATIVA', 'HYBRID', 'CBD']),
  thc: PotencySchema.nullable(),
  cbd: PotencySchema.nullable(),
  priceCents: z.number(),
  compareAtCents: z.number().nullable(),
  size: z.string(),
  badges: z.array(z.enum(['DEAL', 'NEW', 'BEST'])),
  effects: z.array(z.string()),
  shortDescription: z.string().nullable(),
  description: z.string(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']),
  isFeatured: z.boolean(),
  inStock: z.boolean(),
  ratingAvg: z.number(),
  ratingCount: z.number(),
  images: z.array(ImageSchema),
  createdAt: z.string(),
});

export const ProductListSchema = z.object({
  items: z.array(ProductSchema),
  nextCursor: z.string().nullable(),
  total: z.number(),
});

export const CategorySchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  blurb: z.string().nullable(),
  iconKey: z.string().nullable(),
  productCount: z.number(),
});

export const BrandSchema = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  productCount: z.number(),
});
