import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  BrandSchema,
  CategorySchema,
  ProductListSchema,
  ProductParamsSchema,
  ProductQuerySchema,
  ProductSchema,
} from './catalog.schema.js';
import {
  getProductBySlug,
  getRelatedProducts,
  listBrands,
  listCategories,
  listProducts,
} from './catalog.service.js';

// eslint-disable-next-line @typescript-eslint/require-await
export default async function catalogRoutes(fastify: FastifyInstance): Promise<void> {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    '/products',
    {
      schema: {
        tags: ['catalog'],
        querystring: ProductQuerySchema,
        response: { 200: ProductListSchema },
      },
    },
    async (req) => listProducts(req.query),
  );

  app.get(
    '/products/:slug',
    {
      schema: { tags: ['catalog'], params: ProductParamsSchema, response: { 200: ProductSchema } },
    },
    async (req) => getProductBySlug(req.params.slug),
  );

  app.get(
    '/products/:slug/related',
    {
      schema: {
        tags: ['catalog'],
        params: ProductParamsSchema,
        querystring: z.object({ limit: z.coerce.number().int().min(1).max(12).default(4) }),
        response: { 200: z.array(ProductSchema) },
      },
    },
    async (req) => getRelatedProducts(req.params.slug, req.query.limit),
  );

  app.get(
    '/categories',
    { schema: { tags: ['catalog'], response: { 200: z.array(CategorySchema) } } },
    async () => listCategories(),
  );

  app.get(
    '/brands',
    { schema: { tags: ['catalog'], response: { 200: z.array(BrandSchema) } } },
    async () => listBrands(),
  );
}
