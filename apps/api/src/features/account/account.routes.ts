import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../infrastructure/prisma.js';
import { orderTrackingToken } from '../../shared/tokens.js';

const OrderSummarySchema = z.object({
  orderNumber: z.string(),
  status: z.string(),
  placedAt: z.string(),
  itemCount: z.number(),
  totalCents: z.number(),
  etaAt: z.string().nullable(),
  // Capability token so the owner can open the tracking page (which polls
  // client-side and therefore cannot carry the server-only per-user JWT).
  trackingToken: z.string(),
});

// eslint-disable-next-line @typescript-eslint/require-await
export default async function accountRoutes(fastify: FastifyInstance): Promise<void> {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  const trackingSecret = app.services.config.AUTH_API_JWT_SECRET;
  app.addHook('onRequest', app.requireAuth);

  app.get(
    '/account/orders',
    {
      schema: {
        tags: ['account'],
        querystring: z.object({
          cursor: z.string().optional(),
          limit: z.coerce.number().int().min(1).max(50).default(20),
        }),
        response: {
          200: z.object({ items: z.array(OrderSummarySchema), nextCursor: z.string().nullable() }),
        },
      },
    },
    async (req) => {
      const rows = await prisma.order.findMany({
        where: { userId: req.auth!.userId },
        orderBy: { placedAt: 'desc' },
        take: req.query.limit + 1,
        ...(req.query.cursor ? { cursor: { id: req.query.cursor }, skip: 1 } : {}),
        include: { _count: { select: { items: true } } },
      });

      const hasMore = rows.length > req.query.limit;
      const page = hasMore ? rows.slice(0, req.query.limit) : rows;
      return {
        items: page.map((o) => ({
          orderNumber: o.orderNumber,
          status: o.status,
          placedAt: o.placedAt.toISOString(),
          itemCount: o._count.items,
          totalCents: o.totalCents,
          etaAt: o.etaAt?.toISOString() ?? null,
          trackingToken: orderTrackingToken(o.orderNumber, trackingSecret),
        })),
        nextCursor: hasMore ? (page.at(-1)?.id ?? null) : null,
      };
    },
  );
}
