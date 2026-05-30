import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../infrastructure/prisma.js';
import { AppError } from '../../shared/errors.js';
import { recomputeProductRating } from '../reviews/reviews.service.js';
import { AdminReviewSchema } from './admin.schema.js';
import { recordAudit } from './audit.js';

const IdParams = z.object({ id: z.string().min(1) });
const StatusEnum = z.enum(['PENDING', 'PUBLISHED', 'REJECTED']);

// eslint-disable-next-line @typescript-eslint/require-await
export default async function adminReviewRoutes(fastify: FastifyInstance): Promise<void> {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  app.addHook('onRequest', app.requireRole('ADMIN'));

  app.get(
    '/admin/reviews',
    {
      schema: {
        tags: ['admin'],
        querystring: z.object({
          status: StatusEnum.optional(),
          page: z.coerce.number().int().min(1).default(1),
          pageSize: z.coerce.number().int().min(1).max(100).default(25),
        }),
        response: {
          200: z.object({
            items: z.array(AdminReviewSchema),
            total: z.number(),
            page: z.number(),
            pageSize: z.number(),
          }),
        },
      },
    },
    async (req) => {
      const where = req.query.status ? { status: req.query.status } : {};
      const [rows, total] = await Promise.all([
        prisma.review.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (req.query.page - 1) * req.query.pageSize,
          take: req.query.pageSize,
          include: { product: { select: { name: true } } },
        }),
        prisma.review.count({ where }),
      ]);
      return {
        items: rows.map((r) => ({
          id: r.id,
          productId: r.productId,
          productName: r.product.name,
          authorName: r.authorName,
          rating: r.rating,
          title: r.title,
          body: r.body,
          status: r.status,
          createdAt: r.createdAt.toISOString(),
        })),
        total,
        page: req.query.page,
        pageSize: req.query.pageSize,
      };
    },
  );

  app.patch(
    '/admin/reviews/:id',
    {
      schema: {
        tags: ['admin'],
        params: IdParams,
        body: z.object({ status: StatusEnum }),
        response: { 200: z.object({ id: z.string(), status: StatusEnum }) },
      },
    },
    async (req) => {
      const existing = await prisma.review.findUnique({
        where: { id: req.params.id },
        select: { id: true, productId: true },
      });
      if (!existing) throw AppError.notFound('Review not found');

      const review = await prisma.review.update({
        where: { id: req.params.id },
        data: { status: req.body.status },
      });
      await recomputeProductRating(existing.productId);
      await recordAudit(req, {
        action: 'review.moderate',
        entityType: 'Review',
        entityId: review.id,
        metadata: { status: req.body.status },
      });
      return { id: review.id, status: review.status };
    },
  );

  app.delete(
    '/admin/reviews/:id',
    {
      schema: {
        tags: ['admin'],
        params: IdParams,
        response: { 200: z.object({ deleted: z.literal(true) }) },
      },
    },
    async (req) => {
      const existing = await prisma.review.findUnique({
        where: { id: req.params.id },
        select: { id: true, productId: true },
      });
      if (!existing) throw AppError.notFound('Review not found');

      await prisma.review.delete({ where: { id: req.params.id } });
      await recomputeProductRating(existing.productId);
      await recordAudit(req, {
        action: 'review.delete',
        entityType: 'Review',
        entityId: req.params.id,
      });
      return { deleted: true as const };
    },
  );
}
