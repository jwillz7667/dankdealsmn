import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { prisma } from '../../infrastructure/prisma.js';

const SubscribeSchema = z.object({
  email: z.string().email(),
  source: z.string().trim().max(60).optional(),
});

// eslint-disable-next-line @typescript-eslint/require-await
export default async function newsletterRoutes(fastify: FastifyInstance): Promise<void> {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.post(
    '/newsletter',
    {
      schema: {
        tags: ['newsletter'],
        body: SubscribeSchema,
        response: { 200: z.object({ subscribed: z.literal(true) }) },
      },
    },
    async (req) => {
      const email = req.body.email.trim().toLowerCase();
      await prisma.newsletterSubscriber.upsert({
        where: { email },
        create: { email, source: req.body.source ?? null, status: 'SUBSCRIBED' },
        update: { status: 'SUBSCRIBED', source: req.body.source ?? undefined },
      });
      return { subscribed: true as const };
    },
  );
}
