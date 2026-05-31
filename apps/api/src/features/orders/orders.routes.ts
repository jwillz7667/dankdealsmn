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
import type { OrderEmailData } from '../../infrastructure/mail.js';

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

      // Side effects at the edge: emails are best-effort and never block checkout.
      const { order, trackingToken } = result;
      const etaText = order.scheduledWindow ?? (order.etaAt ? 'in 60–90 minutes' : 'soon');
      const emailData: OrderEmailData = {
        orderNumber: order.orderNumber,
        trackingToken,
        customerName: order.customer.name,
        customerEmail: order.customer.email,
        customerPhone: order.customer.phone,
        address: order.address,
        paymentMethod: order.paymentMethod,
        deliveryType: order.deliveryType,
        scheduledWindow: order.scheduledWindow,
        etaText,
        idVerified: order.idVerified,
        promoCode: order.promoCode,
        items: order.items.map((i) => ({
          name: i.name,
          brand: i.brand,
          size: i.size,
          quantity: i.quantity,
          unitPriceCents: i.unitPriceCents,
          lineTotalCents: i.lineTotalCents,
        })),
        totals: order.totals,
      };

      void app.services.mailer
        .sendOrderConfirmation(emailData)
        .catch((err: unknown) => req.log.warn({ err }, 'order confirmation email failed'));
      void app.services.mailer
        .sendAdminOrderNotification(emailData)
        .catch((err: unknown) => req.log.warn({ err }, 'admin order notification failed'));

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
