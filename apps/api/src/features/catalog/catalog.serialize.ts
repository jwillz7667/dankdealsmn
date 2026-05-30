import { type Prisma } from '../../infrastructure/prisma.js';

const dec = (d: Prisma.Decimal | null): number | null => (d === null ? null : d.toNumber());

// Prisma query shapes (with relations) used across catalog endpoints.
export const productInclude = {
  brand: { select: { name: true, slug: true } },
  category: { select: { name: true, slug: true } },
  images: { orderBy: [{ isPrimary: 'desc' }, { position: 'asc' }] },
} satisfies Prisma.ProductInclude;

export type ProductWithRelations = Prisma.ProductGetPayload<{ include: typeof productInclude }>;

export function serializeImage(img: ProductWithRelations['images'][number]) {
  return {
    id: img.id,
    url: img.url,
    alt: img.alt,
    width: img.width,
    height: img.height,
    position: img.position,
    isPrimary: img.isPrimary,
  };
}

export function serializeProduct(p: ProductWithRelations) {
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand: p.brand,
    category: p.category,
    strainType: p.strainType,
    thc: p.thcValue === null ? null : { value: dec(p.thcValue), unit: p.thcUnit },
    cbd: p.cbdValue === null ? null : { value: dec(p.cbdValue), unit: p.cbdUnit },
    priceCents: p.priceCents,
    compareAtCents: p.compareAtCents,
    size: p.size,
    badges: p.badges,
    effects: p.effects,
    shortDescription: p.shortDescription,
    description: p.description,
    status: p.status,
    isFeatured: p.isFeatured,
    inStock: !p.trackInventory || p.inventoryQty > 0,
    ratingAvg: dec(p.ratingAvg) ?? 0,
    ratingCount: p.ratingCount,
    images: p.images.map(serializeImage),
    createdAt: p.createdAt.toISOString(),
  };
}

export type ProductDTO = ReturnType<typeof serializeProduct>;
