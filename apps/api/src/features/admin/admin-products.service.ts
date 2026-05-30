import { type Prisma, prisma } from '../../infrastructure/prisma.js';
import { AppError } from '../../shared/errors.js';
import { slugify, withSuffix } from '../../domain/slug.js';
import type { R2Storage } from '../../infrastructure/r2.js';
import { productInclude, serializeAdminProduct, type AdminProductDTO } from './admin.serialize.js';
import type { z } from 'zod';
import type {
  ImageReorderSchema,
  ProductCreateSchema,
  ProductImageCreateSchema,
  ProductUpdateSchema,
} from './admin.schema.js';

type CreateInput = z.infer<typeof ProductCreateSchema>;
type UpdateInput = z.infer<typeof ProductUpdateSchema>;

async function uniqueProductSlug(base: string, excludeId?: string): Promise<string> {
  const root = slugify(base) || 'product';
  for (let n = 1; ; n += 1) {
    const candidate = withSuffix(root, n);
    const existing = await prisma.product.findUnique({
      where: { slug: candidate },
      select: { id: true },
    });
    if (!existing || existing.id === excludeId) return candidate;
  }
}

export interface AdminProductFilters {
  search?: string;
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  categoryId?: string;
  page: number;
  pageSize: number;
}

export async function listAdminProducts(f: AdminProductFilters): Promise<{
  items: AdminProductDTO[];
  total: number;
  page: number;
  pageSize: number;
}> {
  const where: Prisma.ProductWhereInput = {};
  if (f.status) where.status = f.status;
  if (f.categoryId) where.categoryId = f.categoryId;
  if (f.search) {
    where.OR = [
      { name: { contains: f.search, mode: 'insensitive' } },
      { slug: { contains: f.search, mode: 'insensitive' } },
    ];
  }

  // Offset pagination: admin tables need page numbers + totals over a bounded,
  // authenticated dataset; the indexed filters keep each page cheap.
  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: [{ position: 'asc' }, { createdAt: 'desc' }],
      skip: (f.page - 1) * f.pageSize,
      take: f.pageSize,
    }),
    prisma.product.count({ where }),
  ]);

  return { items: rows.map(serializeAdminProduct), total, page: f.page, pageSize: f.pageSize };
}

export async function getAdminProduct(id: string): Promise<AdminProductDTO> {
  const product = await prisma.product.findUnique({ where: { id }, include: productInclude });
  if (!product) throw AppError.notFound('Product not found');
  return serializeAdminProduct(product);
}

async function assertCategory(categoryId: string): Promise<void> {
  const found = await prisma.category.findUnique({ where: { id: categoryId }, select: { id: true } });
  if (!found) throw AppError.badRequest('Unknown categoryId');
}

async function assertBrand(brandId: string): Promise<void> {
  const found = await prisma.brand.findUnique({ where: { id: brandId }, select: { id: true } });
  if (!found) throw AppError.badRequest('Unknown brandId');
}

export async function createProduct(input: CreateInput): Promise<AdminProductDTO> {
  await assertCategory(input.categoryId);
  if (input.brandId) await assertBrand(input.brandId);

  const slug = await uniqueProductSlug(input.slug ?? input.name);
  const created = await prisma.product.create({
    data: {
      slug,
      name: input.name,
      categoryId: input.categoryId,
      brandId: input.brandId ?? null,
      strainType: input.strainType,
      thcValue: input.thcValue ?? null,
      thcUnit: input.thcUnit,
      cbdValue: input.cbdValue ?? null,
      cbdUnit: input.cbdUnit,
      priceCents: input.priceCents,
      compareAtCents: input.compareAtCents ?? null,
      size: input.size,
      badges: input.badges,
      effects: input.effects,
      shortDescription: input.shortDescription ?? null,
      description: input.description,
      status: input.status,
      isFeatured: input.isFeatured,
      trackInventory: input.trackInventory,
      inventoryQty: input.inventoryQty,
      position: input.position,
      metaTitle: input.metaTitle ?? null,
      metaDescription: input.metaDescription ?? null,
    },
    include: productInclude,
  });
  return serializeAdminProduct(created);
}

export async function updateProduct(id: string, input: UpdateInput): Promise<AdminProductDTO> {
  const existing = await prisma.product.findUnique({ where: { id }, select: { id: true } });
  if (!existing) throw AppError.notFound('Product not found');

  if (input.categoryId) await assertCategory(input.categoryId);
  if (input.brandId) await assertBrand(input.brandId);

  const data: Prisma.ProductUpdateInput = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.slug !== undefined) data.slug = await uniqueProductSlug(input.slug, id);
  if (input.categoryId !== undefined) data.category = { connect: { id: input.categoryId } };
  if (input.brandId !== undefined) {
    data.brand = input.brandId ? { connect: { id: input.brandId } } : { disconnect: true };
  }
  if (input.strainType !== undefined) data.strainType = input.strainType;
  if (input.thcValue !== undefined) data.thcValue = input.thcValue;
  if (input.thcUnit !== undefined) data.thcUnit = input.thcUnit;
  if (input.cbdValue !== undefined) data.cbdValue = input.cbdValue;
  if (input.cbdUnit !== undefined) data.cbdUnit = input.cbdUnit;
  if (input.priceCents !== undefined) data.priceCents = input.priceCents;
  if (input.compareAtCents !== undefined) data.compareAtCents = input.compareAtCents;
  if (input.size !== undefined) data.size = input.size;
  if (input.badges !== undefined) data.badges = input.badges;
  if (input.effects !== undefined) data.effects = input.effects;
  if (input.shortDescription !== undefined) data.shortDescription = input.shortDescription;
  if (input.description !== undefined) data.description = input.description;
  if (input.status !== undefined) data.status = input.status;
  if (input.isFeatured !== undefined) data.isFeatured = input.isFeatured;
  if (input.trackInventory !== undefined) data.trackInventory = input.trackInventory;
  if (input.inventoryQty !== undefined) data.inventoryQty = input.inventoryQty;
  if (input.position !== undefined) data.position = input.position;
  if (input.metaTitle !== undefined) data.metaTitle = input.metaTitle;
  if (input.metaDescription !== undefined) data.metaDescription = input.metaDescription;

  const updated = await prisma.product.update({ where: { id }, data, include: productInclude });
  return serializeAdminProduct(updated);
}

/** Deletes a product and best-effort removes its images from object storage. */
export async function deleteProduct(id: string, storage: R2Storage | null): Promise<void> {
  const product = await prisma.product.findUnique({
    where: { id },
    select: { id: true, images: { select: { url: true } } },
  });
  if (!product) throw AppError.notFound('Product not found');

  await prisma.product.delete({ where: { id } });
  await cleanupStorage(
    product.images.map((i) => i.url),
    storage,
  );
}

export async function addProductImage(
  productId: string,
  input: z.infer<typeof ProductImageCreateSchema>,
): Promise<AdminProductDTO> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: { id: true, _count: { select: { images: true } } },
  });
  if (!product) throw AppError.notFound('Product not found');

  const isFirst = product._count.images === 0;
  const makePrimary = input.isPrimary || isFirst;

  await prisma.$transaction(async (tx) => {
    if (makePrimary) {
      await tx.productImage.updateMany({ where: { productId }, data: { isPrimary: false } });
    }
    await tx.productImage.create({
      data: {
        productId,
        url: input.url,
        alt: input.alt ?? null,
        width: input.width ?? null,
        height: input.height ?? null,
        isPrimary: makePrimary,
        position: product._count.images,
      },
    });
  });

  return getAdminProduct(productId);
}

export async function reorderProductImages(
  productId: string,
  input: z.infer<typeof ImageReorderSchema>,
): Promise<AdminProductDTO> {
  const images = await prisma.productImage.findMany({
    where: { productId },
    select: { id: true },
  });
  const owned = new Set(images.map((i) => i.id));
  for (const entry of input.order) {
    if (!owned.has(entry.id)) throw AppError.badRequest('Image does not belong to this product');
  }
  if (input.primaryId && !owned.has(input.primaryId)) {
    throw AppError.badRequest('primaryId does not belong to this product');
  }

  await prisma.$transaction(async (tx) => {
    for (const entry of input.order) {
      await tx.productImage.update({ where: { id: entry.id }, data: { position: entry.position } });
    }
    if (input.primaryId) {
      await tx.productImage.updateMany({ where: { productId }, data: { isPrimary: false } });
      await tx.productImage.update({ where: { id: input.primaryId }, data: { isPrimary: true } });
    }
  });

  return getAdminProduct(productId);
}

export async function deleteProductImage(
  productId: string,
  imageId: string,
  storage: R2Storage | null,
): Promise<AdminProductDTO> {
  const image = await prisma.productImage.findFirst({
    where: { id: imageId, productId },
    select: { id: true, url: true, isPrimary: true },
  });
  if (!image) throw AppError.notFound('Image not found');

  await prisma.$transaction(async (tx) => {
    await tx.productImage.delete({ where: { id: imageId } });
    if (image.isPrimary) {
      // Promote the next image (lowest position) to primary.
      const next = await tx.productImage.findFirst({
        where: { productId },
        orderBy: { position: 'asc' },
        select: { id: true },
      });
      if (next) await tx.productImage.update({ where: { id: next.id }, data: { isPrimary: true } });
    }
  });

  await cleanupStorage([image.url], storage);
  return getAdminProduct(productId);
}

async function cleanupStorage(urls: string[], storage: R2Storage | null): Promise<void> {
  if (!storage) return;
  await Promise.allSettled(
    urls.map((url) => {
      const key = storage.keyFromUrl(url);
      return key ? storage.delete(key) : Promise.resolve();
    }),
  );
}
