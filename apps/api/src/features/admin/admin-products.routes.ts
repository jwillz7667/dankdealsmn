import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  AdminProductListSchema,
  AdminProductSchema,
  ImageReorderSchema,
  ProductCreateSchema,
  ProductImageCreateSchema,
  ProductUpdateSchema,
} from './admin.schema.js';
import {
  addProductImage,
  createProduct,
  deleteProduct,
  deleteProductImage,
  getAdminProduct,
  listAdminProducts,
  reorderProductImages,
  updateProduct,
} from './admin-products.service.js';
import { recordAudit } from './audit.js';

const IdParams = z.object({ id: z.string().min(1) });

// eslint-disable-next-line @typescript-eslint/require-await
export default async function adminProductRoutes(fastify: FastifyInstance): Promise<void> {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  app.addHook('onRequest', app.requireRole('ADMIN'));

  app.get(
    '/admin/products',
    {
      schema: {
        tags: ['admin'],
        querystring: z.object({
          search: z.string().trim().min(1).max(100).optional(),
          status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']).optional(),
          categoryId: z.string().optional(),
          page: z.coerce.number().int().min(1).default(1),
          pageSize: z.coerce.number().int().min(1).max(100).default(25),
        }),
        response: { 200: AdminProductListSchema },
      },
    },
    async (req) => listAdminProducts(req.query),
  );

  app.get(
    '/admin/products/:id',
    { schema: { tags: ['admin'], params: IdParams, response: { 200: AdminProductSchema } } },
    async (req) => getAdminProduct(req.params.id),
  );

  app.post(
    '/admin/products',
    { schema: { tags: ['admin'], body: ProductCreateSchema, response: { 201: AdminProductSchema } } },
    async (req, reply) => {
      const product = await createProduct(req.body);
      await recordAudit(req, { action: 'product.create', entityType: 'Product', entityId: product.id });
      return reply.code(201).send(product);
    },
  );

  app.patch(
    '/admin/products/:id',
    {
      schema: {
        tags: ['admin'],
        params: IdParams,
        body: ProductUpdateSchema,
        response: { 200: AdminProductSchema },
      },
    },
    async (req) => {
      const product = await updateProduct(req.params.id, req.body);
      await recordAudit(req, {
        action: 'product.update',
        entityType: 'Product',
        entityId: product.id,
      });
      return product;
    },
  );

  app.delete(
    '/admin/products/:id',
    {
      schema: {
        tags: ['admin'],
        params: IdParams,
        response: { 200: z.object({ deleted: z.literal(true) }) },
      },
    },
    async (req) => {
      await deleteProduct(req.params.id, app.services.storage);
      await recordAudit(req, {
        action: 'product.delete',
        entityType: 'Product',
        entityId: req.params.id,
      });
      return { deleted: true as const };
    },
  );

  app.post(
    '/admin/products/:id/images',
    {
      schema: {
        tags: ['admin'],
        params: IdParams,
        body: ProductImageCreateSchema,
        response: { 200: AdminProductSchema },
      },
    },
    async (req) => {
      const product = await addProductImage(req.params.id, req.body);
      await recordAudit(req, {
        action: 'product.image.add',
        entityType: 'Product',
        entityId: req.params.id,
      });
      return product;
    },
  );

  app.patch(
    '/admin/products/:id/images/reorder',
    {
      schema: {
        tags: ['admin'],
        params: IdParams,
        body: ImageReorderSchema,
        response: { 200: AdminProductSchema },
      },
    },
    async (req) => reorderProductImages(req.params.id, req.body),
  );

  app.delete(
    '/admin/products/:id/images/:imageId',
    {
      schema: {
        tags: ['admin'],
        params: z.object({ id: z.string().min(1), imageId: z.string().min(1) }),
        response: { 200: AdminProductSchema },
      },
    },
    async (req) => {
      const product = await deleteProductImage(req.params.id, req.params.imageId, app.services.storage);
      await recordAudit(req, {
        action: 'product.image.delete',
        entityType: 'Product',
        entityId: req.params.id,
        metadata: { imageId: req.params.imageId },
      });
      return product;
    },
  );
}
