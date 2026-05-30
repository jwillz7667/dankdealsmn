import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  CreateReviewResponseSchema,
  CreateReviewSchema,
  ReviewListSchema,
} from './reviews.schema.js';
import { createReview, listProductReviews } from './reviews.service.js';

// eslint-disable-next-line @typescript-eslint/require-await
export default async function reviewRoutes(fastify: FastifyInstance): Promise<void> {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    '/products/:slug/reviews',
    {
      schema: {
        tags: ['reviews'],
        params: z.object({ slug: z.string().min(1) }),
        response: { 200: ReviewListSchema },
      },
    },
    async (req) => listProductReviews(req.params.slug),
  );

  app.post(
    '/products/:slug/reviews',
    {
      schema: {
        tags: ['reviews'],
        params: z.object({ slug: z.string().min(1) }),
        body: CreateReviewSchema,
        response: { 201: CreateReviewResponseSchema },
      },
    },
    async (req, reply) => {
      const result = await createReview(req.params.slug, req.body, req.auth?.userId ?? null);
      return reply.code(201).send(result);
    },
  );
}
