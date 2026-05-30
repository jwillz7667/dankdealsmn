import { type Prisma, prisma } from '../../infrastructure/prisma.js';
import { AppError } from '../../shared/errors.js';
import { productInclude, serializeProduct, type ProductDTO } from './catalog.serialize.js';
import type { ProductQuery, Sort } from './catalog.schema.js';

function orderByFor(sort: Sort): Prisma.ProductOrderByWithRelationInput[] {
  switch (sort) {
    case 'price-asc':
      return [{ priceCents: 'asc' }, { id: 'asc' }];
    case 'price-desc':
      return [{ priceCents: 'desc' }, { id: 'asc' }];
    case 'rating':
      return [{ ratingAvg: 'desc' }, { id: 'asc' }];
    case 'thc':
      return [{ thcValue: { sort: 'desc', nulls: 'last' } }, { id: 'asc' }];
    case 'newest':
      return [{ createdAt: 'desc' }, { id: 'asc' }];
    case 'featured':
    default:
      return [{ isFeatured: 'desc' }, { position: 'asc' }, { ratingAvg: 'desc' }, { id: 'asc' }];
  }
}

function whereFor(q: ProductQuery): Prisma.ProductWhereInput {
  const where: Prisma.ProductWhereInput = { status: 'ACTIVE' };
  if (q.category) where.category = { slug: q.category };
  if (q.brand) where.brand = { slug: q.brand };
  if (q.strain) where.strainType = q.strain;
  if (q.badge) where.badges = { has: q.badge };
  if (q.minPrice !== undefined || q.maxPrice !== undefined) {
    where.priceCents = {
      ...(q.minPrice !== undefined ? { gte: q.minPrice * 100 } : {}),
      ...(q.maxPrice !== undefined ? { lte: q.maxPrice * 100 } : {}),
    };
  }
  if (q.search) {
    const contains = { contains: q.search, mode: 'insensitive' as const };
    where.OR = [
      { name: contains },
      { description: contains },
      { brand: { name: contains } },
      { effects: { has: q.search } },
    ];
  }
  return where;
}

export interface ProductList {
  items: ProductDTO[];
  nextCursor: string | null;
  total: number;
}

export async function listProducts(q: ProductQuery): Promise<ProductList> {
  const where = whereFor(q);
  const [rows, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: productInclude,
      orderBy: orderByFor(q.sort),
      take: q.limit + 1,
      ...(q.cursor ? { cursor: { id: q.cursor }, skip: 1 } : {}),
    }),
    prisma.product.count({ where }),
  ]);

  const hasMore = rows.length > q.limit;
  const page = hasMore ? rows.slice(0, q.limit) : rows;
  return {
    items: page.map(serializeProduct),
    nextCursor: hasMore ? (page.at(-1)?.id ?? null) : null,
    total,
  };
}

export async function getProductBySlug(slug: string): Promise<ProductDTO> {
  const product = await prisma.product.findFirst({
    where: { slug, status: 'ACTIVE' },
    include: productInclude,
  });
  if (!product) throw AppError.notFound('Product not found');
  return serializeProduct(product);
}

export async function getRelatedProducts(slug: string, limit = 4): Promise<ProductDTO[]> {
  const base = await prisma.product.findFirst({
    where: { slug, status: 'ACTIVE' },
    select: { id: true, categoryId: true },
  });
  if (!base) return [];
  const rows = await prisma.product.findMany({
    where: { status: 'ACTIVE', categoryId: base.categoryId, id: { not: base.id } },
    include: productInclude,
    orderBy: [{ ratingAvg: 'desc' }, { id: 'asc' }],
    take: limit,
  });
  return rows.map(serializeProduct);
}

export async function listCategories(): Promise<
  Array<{ id: string; slug: string; name: string; blurb: string | null; iconKey: string | null; productCount: number }>
> {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    include: { _count: { select: { products: { where: { status: 'ACTIVE' } } } } },
  });
  return categories.map((c) => ({
    id: c.id,
    slug: c.slug,
    name: c.name,
    blurb: c.blurb,
    iconKey: c.iconKey,
    productCount: c._count.products,
  }));
}

export async function listBrands(): Promise<
  Array<{ id: string; slug: string; name: string; productCount: number }>
> {
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: { where: { status: 'ACTIVE' } } } } },
  });
  return brands
    .map((b) => ({ id: b.id, slug: b.slug, name: b.name, productCount: b._count.products }))
    .filter((b) => b.productCount > 0);
}
