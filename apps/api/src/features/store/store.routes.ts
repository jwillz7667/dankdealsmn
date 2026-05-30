import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { getPublicStoreConfig } from './store.service.js';

const StoreConfigSchema = z.object({
  deliveryFeeCents: z.number(),
  freeDeliveryThresholdCents: z.number(),
  minOrderCents: z.number(),
  taxRateBps: z.number(),
  defaultTipBps: z.number(),
  deliveryEtaMinutes: z.number(),
  licenseNumber: z.string(),
  supportPhone: z.string().nullable(),
  supportEmail: z.string().nullable(),
  announcement: z.string().nullable(),
  zones: z.array(z.string()),
});

// eslint-disable-next-line @typescript-eslint/require-await
export default async function storeRoutes(fastify: FastifyInstance): Promise<void> {
  const app = fastify.withTypeProvider<ZodTypeProvider>();

  app.get(
    '/store/config',
    { schema: { tags: ['store'], response: { 200: StoreConfigSchema } } },
    async () => getPublicStoreConfig(),
  );
}
