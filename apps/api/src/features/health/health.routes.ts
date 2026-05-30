import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';

// eslint-disable-next-line @typescript-eslint/require-await
export default async function healthRoutes(fastify: FastifyInstance): Promise<void> {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    '/health',
    {
      schema: {
        tags: ['system'],
        response: { 200: z.object({ status: z.literal('ok'), uptime: z.number() }) },
      },
    },
    () => ({ status: 'ok' as const, uptime: process.uptime() }),
  );

  app.get(
    '/health/ready',
    {
      schema: {
        tags: ['system'],
        response: {
          200: z.object({ status: z.literal('ready'), db: z.literal('up') }),
        },
      },
    },
    async () => {
      await fastify.services.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready' as const, db: 'up' as const };
    },
  );
}
