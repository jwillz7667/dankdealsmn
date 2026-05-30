import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import {
  CreateOrderResponseSchema,
  CreateOrderSchema,
  OrderSchema,
  QuoteRequestSchema,
  QuoteResponseSchema,
} from './orders.schema.js';
import { createOrder, getOrderByNumber, quoteOrder } from './orders.service.js';

// eslint-disable-next-line @typescript-eslint/require-await
export default async function orderRoutes(fastify: FastifyInstance): Promise<void> {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  const trackingSecret = app.services.config.AUTH_API_JWT_SECRET;

  app.post(
    '/cart/quote',
    {
      schema: {
        tags: ['orders'],
        body: QuoteRequestSchema,
        response: { 200: QuoteResponseSchema },
      },
    },
    async (req) => quoteOrder(req.body),
  );

  app.post(
    '/orders',
    {
      schema: {
        tags: ['orders'],
        body: CreateOrderSchema,
        response: { 201: CreateOrderResponseSchema },
      },
    },
    async (req, reply) => {
      const result = await createOrder({
        input: req.body,
        userId: req.auth?.userId ?? null,
        trackingSecret,
      });

      // Side effect at the edge: confirmation email is best-effort, never blocks checkout.
      const { order } = result;
      const etaText = order.scheduledWindow ?? (order.etaAt ? 'within the hour' : 'soon');
      void app.services.mailer
        .sendOrderConfirmation({
          to: order.customer.email,
          orderNumber: order.orderNumber,
          customerName: order.customer.name,
          totalCents: order.totals.totalCents,
          etaText,
        })
        .catch((err: unknown) => req.log.warn({ err }, 'order confirmation email failed'));

      return reply.code(201).send(result);
    },
  );

  app.get(
    '/orders/:orderNumber',
    {
      schema: {
        tags: ['orders'],
        params: z.object({ orderNumber: z.string().min(1) }),
        querystring: z.object({ token: z.string().min(1).optional() }),
        response: { 200: OrderSchema },
      },
    },
    async (req) =>
      getOrderByNumber({
        orderNumber: req.params.orderNumber,
        token: req.query.token,
        auth: req.auth,
        trackingSecret,
      }),
  );
}
