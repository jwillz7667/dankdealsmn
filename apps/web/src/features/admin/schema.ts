import { z } from 'zod';

/**
 * Client-safe input schemas mirroring apps/api `admin.schema.ts`. Shared by the
 * forms (typing) and the server actions (boundary validation) so there is one
 * source of truth for admin write payloads.
 */

export const StrainEnum = z.enum(['INDICA', 'SATIVA', 'HYBRID', 'CBD']);
export const UnitEnum = z.enum(['PERCENT', 'MG']);
export const BadgeEnum = z.enum(['DEAL', 'NEW', 'BEST']);
export const ProductStatusEnum = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']);
export const OrderStatusEnum = z.enum([
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
]);

// Empty string → undefined, so optional text inputs don't send "".
const optionalText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .optional()
    .transform((v) => (v ? v : undefined));

const nullableText = (max: number) =>
  z
    .string()
    .trim()
    .max(max)
    .nullable()
    .optional()
    .transform((v) => (v ? v : null));

export const ProductCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(160),
  slug: optionalText(180),
  categoryId: z.string().min(1, 'Choose a category'),
  brandId: z
    .string()
    .nullable()
    .optional()
    .transform((v) => (v ? v : null)),
  strainType: StrainEnum,
  thcValue: z.number().min(0).max(1000).nullable().optional(),
  thcUnit: UnitEnum.default('PERCENT'),
  cbdValue: z.number().min(0).max(1000).nullable().optional(),
  cbdUnit: UnitEnum.default('PERCENT'),
  priceCents: z.number().int().min(0),
  compareAtCents: z.number().int().min(0).nullable().optional(),
  size: z.string().trim().min(1, 'Size is required').max(60),
  badges: z.array(BadgeEnum).default([]),
  effects: z.array(z.string().trim().min(1).max(40)).default([]),
  shortDescription: nullableText(240),
  description: z.string().trim().min(1, 'Description is required').max(8000),
  status: ProductStatusEnum.default('ACTIVE'),
  isFeatured: z.boolean().default(false),
  trackInventory: z.boolean().default(false),
  inventoryQty: z.number().int().min(0).default(0),
  position: z.number().int().default(0),
  metaTitle: nullableText(70),
  metaDescription: nullableText(180),
});

export const ProductUpdateSchema = ProductCreateSchema.partial();

export const CategoryCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  slug: optionalText(100),
  blurb: nullableText(240),
  iconKey: nullableText(40),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  metaTitle: nullableText(70),
  metaDescription: nullableText(180),
});
export const CategoryUpdateSchema = CategoryCreateSchema.partial();

export const BrandCreateSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(80),
  slug: optionalText(100),
  logoUrl: z.string().url().nullable().optional(),
  description: nullableText(500),
  isActive: z.boolean().default(true),
});
export const BrandUpdateSchema = BrandCreateSchema.partial();

export const ProductImageCreateSchema = z.object({
  url: z.string().url(),
  alt: nullableText(160),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
  isPrimary: z.boolean().default(false),
});

export const PresignRequestSchema = z.object({
  contentType: z.enum(['image/jpeg', 'image/png', 'image/webp', 'image/avif']),
  contentLength: z.number().int().positive().max(8 * 1024 * 1024, 'Image must be 8 MB or smaller'),
  prefix: z.enum(['products', 'brands', 'categories']).default('products'),
});

export const OrderStatusUpdateSchema = z.object({
  status: OrderStatusEnum,
  message: optionalText(280),
});

export type ProductCreateInput = z.input<typeof ProductCreateSchema>;
export type ProductUpdateInput = z.input<typeof ProductUpdateSchema>;
export type CategoryCreateInput = z.input<typeof CategoryCreateSchema>;
export type BrandCreateInput = z.input<typeof BrandCreateSchema>;
export type ProductImageCreateInput = z.input<typeof ProductImageCreateSchema>;
export type OrderStatusUpdateInput = z.input<typeof OrderStatusUpdateSchema>;
