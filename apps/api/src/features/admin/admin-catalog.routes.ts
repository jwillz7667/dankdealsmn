import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../infrastructure/prisma.js';
import { AppError } from '../../shared/errors.js';
import { slugify, withSuffix } from '../../domain/slug.js';
import {
  BrandCreateSchema,
  BrandSchemaAdmin,
  BrandUpdateSchema,
  CategoryCreateSchema,
  CategorySchemaAdmin,
  CategoryUpdateSchema,
} from './admin.schema.js';
import { recordAudit } from './audit.js';

const IdParams = z.object({ id: z.string().min(1) });

async function uniqueSlug(
  table: 'category' | 'brand',
  base: string,
  excludeId?: string,
): Promise<string> {
  const root = slugify(base) || table;
  for (let n = 1; ; n += 1) {
    const candidate = withSuffix(root, n);
    const existing =
      table === 'category'
        ? await prisma.category.findUnique({ where: { slug: candidate }, select: { id: true } })
        : await prisma.brand.findUnique({ where: { slug: candidate }, select: { id: true } });
    if (!existing || existing.id === excludeId) return candidate;
  }
}

// eslint-disable-next-line @typescript-eslint/require-await
export default async function adminCatalogRoutes(fastify: FastifyInstance): Promise<void> {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  app.addHook('onRequest', app.requireRole('ADMIN'));

  // ---------- Categories ----------
  app.get(
    '/admin/categories',
    { schema: { tags: ['admin'], response: { 200: z.array(CategorySchemaAdmin) } } },
    async () => {
      const rows = await prisma.category.findMany({
        orderBy: { sortOrder: 'asc' },
        include: { _count: { select: { products: true } } },
      });
      return rows.map((c) => ({
        id: c.id,
        slug: c.slug,
        name: c.name,
        blurb: c.blurb,
        iconKey: c.iconKey,
        sortOrder: c.sortOrder,
        isActive: c.isActive,
        metaTitle: c.metaTitle,
        metaDescription: c.metaDescription,
        productCount: c._count.products,
      }));
    },
  );

  app.post(
    '/admin/categories',
    {
      schema: {
        tags: ['admin'],
        body: CategoryCreateSchema,
        response: { 201: CategorySchemaAdmin },
      },
    },
    async (req, reply) => {
      const slug = await uniqueSlug('category', req.body.slug ?? req.body.name);
      const c = await prisma.category.create({
        data: {
          slug,
          name: req.body.name,
          blurb: req.body.blurb ?? null,
          iconKey: req.body.iconKey ?? null,
          sortOrder: req.body.sortOrder,
          isActive: req.body.isActive,
          metaTitle: req.body.metaTitle ?? null,
          metaDescription: req.body.metaDescription ?? null,
        },
      });
      await recordAudit(req, { action: 'category.create', entityType: 'Category', entityId: c.id });
      return reply.code(201).send({ ...c, productCount: 0 });
    },
  );

  app.patch(
    '/admin/categories/:id',
    {
      schema: {
        tags: ['admin'],
        params: IdParams,
        body: CategoryUpdateSchema,
        response: { 200: CategorySchemaAdmin },
      },
    },
    async (req) => {
      const existing = await prisma.category.findUnique({
        where: { id: req.params.id },
        select: { id: true },
      });
      if (!existing) throw AppError.notFound('Category not found');

      const c = await prisma.category.update({
        where: { id: req.params.id },
        data: {
          ...(req.body.name !== undefined ? { name: req.body.name } : {}),
          ...(req.body.slug !== undefined
            ? { slug: await uniqueSlug('category', req.body.slug, req.params.id) }
            : {}),
          ...(req.body.blurb !== undefined ? { blurb: req.body.blurb } : {}),
          ...(req.body.iconKey !== undefined ? { iconKey: req.body.iconKey } : {}),
          ...(req.body.sortOrder !== undefined ? { sortOrder: req.body.sortOrder } : {}),
          ...(req.body.isActive !== undefined ? { isActive: req.body.isActive } : {}),
          ...(req.body.metaTitle !== undefined ? { metaTitle: req.body.metaTitle } : {}),
          ...(req.body.metaDescription !== undefined
            ? { metaDescription: req.body.metaDescription }
            : {}),
        },
        include: { _count: { select: { products: true } } },
      });
      await recordAudit(req, { action: 'category.update', entityType: 'Category', entityId: c.id });
      return { ...c, productCount: c._count.products };
    },
  );

  app.delete(
    '/admin/categories/:id',
    {
      schema: {
        tags: ['admin'],
        params: IdParams,
        response: { 200: z.object({ deleted: z.literal(true) }) },
      },
    },
    async (req) => {
      const count = await prisma.product.count({ where: { categoryId: req.params.id } });
      if (count > 0) {
        throw AppError.conflict('Reassign or remove its products before deleting this category.');
      }
      await prisma.category.delete({ where: { id: req.params.id } });
      await recordAudit(req, {
        action: 'category.delete',
        entityType: 'Category',
        entityId: req.params.id,
      });
      return { deleted: true as const };
    },
  );

  // ---------- Brands ----------
  app.get(
    '/admin/brands',
    { schema: { tags: ['admin'], response: { 200: z.array(BrandSchemaAdmin) } } },
    async () => {
      const rows = await prisma.brand.findMany({
        orderBy: { name: 'asc' },
        include: { _count: { select: { products: true } } },
      });
      return rows.map((b) => ({
        id: b.id,
        slug: b.slug,
        name: b.name,
        logoUrl: b.logoUrl,
        description: b.description,
        isActive: b.isActive,
        productCount: b._count.products,
      }));
    },
  );

  app.post(
    '/admin/brands',
    { schema: { tags: ['admin'], body: BrandCreateSchema, response: { 201: BrandSchemaAdmin } } },
    async (req, reply) => {
      const slug = await uniqueSlug('brand', req.body.slug ?? req.body.name);
      const b = await prisma.brand.create({
        data: {
          slug,
          name: req.body.name,
          logoUrl: req.body.logoUrl ?? null,
          description: req.body.description ?? null,
          isActive: req.body.isActive,
        },
      });
      await recordAudit(req, { action: 'brand.create', entityType: 'Brand', entityId: b.id });
      return reply.code(201).send({ ...b, productCount: 0 });
    },
  );

  app.patch(
    '/admin/brands/:id',
    {
      schema: {
        tags: ['admin'],
        params: IdParams,
        body: BrandUpdateSchema,
        response: { 200: BrandSchemaAdmin },
      },
    },
    async (req) => {
      const existing = await prisma.brand.findUnique({
        where: { id: req.params.id },
        select: { id: true },
      });
      if (!existing) throw AppError.notFound('Brand not found');

      const b = await prisma.brand.update({
        where: { id: req.params.id },
        data: {
          ...(req.body.name !== undefined ? { name: req.body.name } : {}),
          ...(req.body.slug !== undefined
            ? { slug: await uniqueSlug('brand', req.body.slug, req.params.id) }
            : {}),
          ...(req.body.logoUrl !== undefined ? { logoUrl: req.body.logoUrl } : {}),
          ...(req.body.description !== undefined ? { description: req.body.description } : {}),
          ...(req.body.isActive !== undefined ? { isActive: req.body.isActive } : {}),
        },
        include: { _count: { select: { products: true } } },
      });
      await recordAudit(req, { action: 'brand.update', entityType: 'Brand', entityId: b.id });
      return { ...b, productCount: b._count.products };
    },
  );

  app.delete(
    '/admin/brands/:id',
    {
      schema: {
        tags: ['admin'],
        params: IdParams,
        response: { 200: z.object({ deleted: z.literal(true) }) },
      },
    },
    async (req) => {
      // Products keep their snapshots; brandId is set null by the FK rule.
      await prisma.brand.delete({ where: { id: req.params.id } });
      await recordAudit(req, { action: 'brand.delete', entityType: 'Brand', entityId: req.params.id });
      return { deleted: true as const };
    },
  );
}
