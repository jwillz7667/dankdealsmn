import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../infrastructure/prisma.js';
import { ProductSchema } from '../catalog/catalog.schema.js';
import { productInclude, serializeProduct } from '../catalog/catalog.serialize.js';

// eslint-disable-next-line @typescript-eslint/require-await
export default async function favoriteRoutes(fastify: FastifyInstance): Promise<void> {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  // Every route in this file requires an authenticated user.
  app.addHook('onRequest', app.requireAuth);

  app.get(
    '/favorites',
    { schema: { tags: ['favorites'], response: { 200: z.array(ProductSchema) } } },
    async (req) => {
      const favorites = await prisma.favorite.findMany({
        where: { userId: req.auth!.userId },
        orderBy: { createdAt: 'desc' },
        include: { product: { include: productInclude } },
      });
      return favorites
        .filter((f) => f.product.status === 'ACTIVE')
        .map((f) => serializeProduct(f.product));
    },
  );

  app.post(
    '/favorites',
    {
      schema: {
        tags: ['favorites'],
        body: z.object({ productId: z.string().min(1) }),
        response: { 200: z.object({ favorited: z.literal(true) }) },
      },
    },
    async (req) => {
      const userId = req.auth!.userId;
      await prisma.favorite.upsert({
        where: { userId_productId: { userId, productId: req.body.productId } },
        create: { userId, productId: req.body.productId },
        update: {},
      });
      return { favorited: true as const };
    },
  );

  app.delete(
    '/favorites/:productId',
    {
      schema: {
        tags: ['favorites'],
        params: z.object({ productId: z.string().min(1) }),
        response: { 200: z.object({ favorited: z.literal(false) }) },
      },
    },
    async (req) => {
      await prisma.favorite.deleteMany({
        where: { userId: req.auth!.userId, productId: req.params.productId },
      });
      return { favorited: false as const };
    },
  );
}
