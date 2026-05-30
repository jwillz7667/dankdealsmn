import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../infrastructure/prisma.js';

const StatsSchema = z.object({
  orders: z.object({
    total: z.number(),
    pending: z.number(),
    active: z.number(), // confirmed → out for delivery
    deliveredToday: z.number(),
  }),
  revenue: z.object({
    grossCentsAllTime: z.number(),
    grossCentsLast30Days: z.number(),
  }),
  catalog: z.object({
    activeProducts: z.number(),
    draftProducts: z.number(),
    outOfStock: z.number(),
    pendingReviews: z.number(),
  }),
  recentOrders: z.array(
    z.object({
      orderNumber: z.string(),
      status: z.string(),
      customerName: z.string(),
      totalCents: z.number(),
      placedAt: z.string(),
    }),
  ),
});

// eslint-disable-next-line @typescript-eslint/require-await
export default async function adminDashboardRoutes(fastify: FastifyInstance): Promise<void> {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  app.addHook('onRequest', app.requireRole('ADMIN'));

  app.get('/admin/stats', { schema: { tags: ['admin'], response: { 200: StatsSchema } } }, async () => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      total,
      pending,
      active,
      deliveredToday,
      grossAll,
      gross30,
      activeProducts,
      draftProducts,
      outOfStock,
      pendingReviews,
      recent,
    ] = await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: 'PENDING' } }),
      prisma.order.count({
        where: { status: { in: ['CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY'] } },
      }),
      prisma.order.count({ where: { status: 'DELIVERED', deliveredAt: { gte: startOfDay } } }),
      prisma.order.aggregate({
        where: { status: { not: 'CANCELLED' } },
        _sum: { totalCents: true },
      }),
      prisma.order.aggregate({
        where: { status: { not: 'CANCELLED' }, placedAt: { gte: thirtyDaysAgo } },
        _sum: { totalCents: true },
      }),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.product.count({ where: { status: 'DRAFT' } }),
      prisma.product.count({ where: { trackInventory: true, inventoryQty: { lte: 0 } } }),
      prisma.review.count({ where: { status: 'PENDING' } }),
      prisma.order.findMany({
        orderBy: { placedAt: 'desc' },
        take: 10,
        select: {
          orderNumber: true,
          status: true,
          customerName: true,
          totalCents: true,
          placedAt: true,
        },
      }),
    ]);

    return {
      orders: { total, pending, active, deliveredToday },
      revenue: {
        grossCentsAllTime: grossAll._sum.totalCents ?? 0,
        grossCentsLast30Days: gross30._sum.totalCents ?? 0,
      },
      catalog: { activeProducts, draftProducts, outOfStock, pendingReviews },
      recentOrders: recent.map((o) => ({
        orderNumber: o.orderNumber,
        status: o.status,
        customerName: o.customerName,
        totalCents: o.totalCents,
        placedAt: o.placedAt.toISOString(),
      })),
    };
  });
}
