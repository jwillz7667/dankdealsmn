import { z } from 'zod';
import { ProductSchema } from '../catalog/catalog.schema.js';

const StrainEnum = z.enum(['INDICA', 'SATIVA', 'HYBRID', 'CBD']);
const UnitEnum = z.enum(['PERCENT', 'MG']);
const BadgeEnum = z.enum(['DEAL', 'NEW', 'BEST']);
const StatusEnum = z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']);

// ---- products ----
export const AdminProductSchema = ProductSchema.extend({
  categoryId: z.string(),
  brandId: z.string().nullable(),
  trackInventory: z.boolean(),
  inventoryQty: z.number(),
  position: z.number(),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  updatedAt: z.string(),
});

export const AdminProductListSchema = z.object({
  items: z.array(AdminProductSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

export const ProductCreateSchema = z.object({
  name: z.string().trim().min(1).max(160),
  slug: z.string().trim().min(1).max(180).optional(),
  categoryId: z.string().min(1),
  brandId: z.string().min(1).nullable().optional(),
  strainType: StrainEnum,
  thcValue: z.number().min(0).max(1000).nullable().optional(),
  thcUnit: UnitEnum.default('PERCENT'),
  cbdValue: z.number().min(0).max(1000).nullable().optional(),
  cbdUnit: UnitEnum.default('PERCENT'),
  priceCents: z.number().int().min(0),
  compareAtCents: z.number().int().min(0).nullable().optional(),
  size: z.string().trim().min(1).max(60),
  badges: z.array(BadgeEnum).default([]),
  effects: z.array(z.string().trim().min(1).max(40)).default([]),
  shortDescription: z.string().trim().max(240).nullable().optional(),
  description: z.string().trim().min(1).max(8000),
  status: StatusEnum.default('ACTIVE'),
  isFeatured: z.boolean().default(false),
  trackInventory: z.boolean().default(false),
  inventoryQty: z.number().int().min(0).default(0),
  position: z.number().int().default(0),
  metaTitle: z.string().trim().max(70).nullable().optional(),
  metaDescription: z.string().trim().max(180).nullable().optional(),
});

export const ProductUpdateSchema = ProductCreateSchema.partial();

export const ProductImageCreateSchema = z.object({
  url: z.string().url(),
  alt: z.string().trim().max(160).nullable().optional(),
  width: z.number().int().positive().nullable().optional(),
  height: z.number().int().positive().nullable().optional(),
  isPrimary: z.boolean().default(false),
});

export const ImageReorderSchema = z.object({
  order: z.array(z.object({ id: z.string().min(1), position: z.number().int().min(0) })).min(1),
  primaryId: z.string().min(1).optional(),
});

// ---- categories ----
export const CategorySchemaAdmin = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  blurb: z.string().nullable(),
  iconKey: z.string().nullable(),
  sortOrder: z.number(),
  isActive: z.boolean(),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  productCount: z.number(),
});

export const CategoryCreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  slug: z.string().trim().min(1).max(100).optional(),
  blurb: z.string().trim().max(240).nullable().optional(),
  iconKey: z.string().trim().max(40).nullable().optional(),
  sortOrder: z.number().int().default(0),
  isActive: z.boolean().default(true),
  metaTitle: z.string().trim().max(70).nullable().optional(),
  metaDescription: z.string().trim().max(180).nullable().optional(),
});
export const CategoryUpdateSchema = CategoryCreateSchema.partial();

// ---- brands ----
export const BrandSchemaAdmin = z.object({
  id: z.string(),
  slug: z.string(),
  name: z.string(),
  logoUrl: z.string().nullable(),
  description: z.string().nullable(),
  isActive: z.boolean(),
  productCount: z.number(),
});

export const BrandCreateSchema = z.object({
  name: z.string().trim().min(1).max(80),
  slug: z.string().trim().min(1).max(100).optional(),
  logoUrl: z.string().url().nullable().optional(),
  description: z.string().trim().max(500).nullable().optional(),
  isActive: z.boolean().default(true),
});
export const BrandUpdateSchema = BrandCreateSchema.partial();

// ---- promos ----
export const PromoSchemaAdmin = z.object({
  id: z.string(),
  code: z.string(),
  description: z.string().nullable(),
  type: z.enum(['PERCENT_OFF', 'AMOUNT_OFF', 'FREE_DELIVERY']),
  value: z.number(),
  minSubtotalCents: z.number().nullable(),
  isActive: z.boolean(),
  startsAt: z.string().nullable(),
  endsAt: z.string().nullable(),
  usageLimit: z.number().nullable(),
  usedCount: z.number(),
  perUserLimit: z.number().nullable(),
});

export const PromoCreateSchema = z.object({
  code: z.string().trim().min(2).max(40),
  description: z.string().trim().max(160).nullable().optional(),
  type: z.enum(['PERCENT_OFF', 'AMOUNT_OFF', 'FREE_DELIVERY']),
  value: z.number().int().min(0).default(0),
  minSubtotalCents: z.number().int().min(0).nullable().optional(),
  isActive: z.boolean().default(true),
  startsAt: z.string().datetime().nullable().optional(),
  endsAt: z.string().datetime().nullable().optional(),
  usageLimit: z.number().int().min(0).nullable().optional(),
  perUserLimit: z.number().int().min(0).nullable().optional(),
});
export const PromoUpdateSchema = PromoCreateSchema.partial();

// ---- zones ----
export const ZoneSchemaAdmin = z.object({
  id: z.string(),
  city: z.string(),
  isActive: z.boolean(),
  sortOrder: z.number(),
});
export const ZoneCreateSchema = z.object({
  city: z.string().trim().min(1).max(80),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().default(0),
});
export const ZoneUpdateSchema = ZoneCreateSchema.partial();

// ---- settings ----
export const SettingsSchema = z.object({
  deliveryFeeCents: z.number(),
  freeDeliveryThresholdCents: z.number(),
  minOrderCents: z.number(),
  taxRateBps: z.number(),
  defaultTipBps: z.number(),
  deliveryEtaMinutes: z.number(),
  licenseNumber: z.string(),
  supportPhone: z.string().nullable(),
  supportEmail: z.string().nullable(),
  announcement: z.string().nullable(),
});
export const SettingsUpdateSchema = z.object({
  deliveryFeeCents: z.number().int().min(0).optional(),
  freeDeliveryThresholdCents: z.number().int().min(0).optional(),
  minOrderCents: z.number().int().min(0).optional(),
  taxRateBps: z.number().int().min(0).max(10_000).optional(),
  defaultTipBps: z.number().int().min(0).max(10_000).optional(),
  deliveryEtaMinutes: z.number().int().min(1).max(1440).optional(),
  licenseNumber: z.string().trim().min(1).max(60).optional(),
  supportPhone: z.string().trim().max(40).nullable().optional(),
  supportEmail: z.string().email().nullable().optional(),
  announcement: z.string().trim().max(280).nullable().optional(),
});

// ---- reviews (moderation) ----
export const AdminReviewSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productName: z.string(),
  authorName: z.string(),
  rating: z.number(),
  title: z.string().nullable(),
  body: z.string(),
  status: z.enum(['PENDING', 'PUBLISHED', 'REJECTED']),
  createdAt: z.string(),
});

// ---- uploads ----
export const PresignRequestSchema = z.object({
  contentType: z.string().min(1),
  contentLength: z.number().int().positive(),
  prefix: z.enum(['products', 'brands', 'categories']).default('products'),
});
export const PresignResponseSchema = z.object({
  uploadUrl: z.string(),
  publicUrl: z.string(),
  key: z.string(),
  expiresInSeconds: z.number(),
});
