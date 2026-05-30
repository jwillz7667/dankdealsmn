import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { OrderSchema } from '../orders/orders.schema.js';
import { assignDriver, getOrder, listOrders, updateOrderStatus } from './admin-orders.service.js';
import { recordAudit } from './audit.js';

const StatusEnum = z.enum([
  'PENDING',
  'CONFIRMED',
  'PREPARING',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
  'CANCELLED',
]);

const OrderListItemSchema = z.object({
  orderNumber: z.string(),
  status: StatusEnum,
  placedAt: z.string(),
  customerName: z.string(),
  city: z.string(),
  paymentMethod: z.enum(['CASH', 'DEBIT']),
  deliveryType: z.enum(['ASAP', 'SCHEDULED']),
  itemCount: z.number(),
  totalCents: z.number(),
  driver: z.string().nullable(),
});

const OrderListSchema = z.object({
  items: z.array(OrderListItemSchema),
  total: z.number(),
  page: z.number(),
  pageSize: z.number(),
});

const OrderNumberParams = z.object({ orderNumber: z.string().min(1) });

// eslint-disable-next-line @typescript-eslint/require-await
export default async function adminOrderRoutes(fastify: FastifyInstance): Promise<void> {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  app.addHook('onRequest', app.requireRole('ADMIN'));

  app.get(
    '/admin/orders',
    {
      schema: {
        tags: ['admin'],
        querystring: z.object({
          status: StatusEnum.optional(),
          search: z.string().trim().min(1).max(100).optional(),
          page: z.coerce.number().int().min(1).default(1),
          pageSize: z.coerce.number().int().min(1).max(100).default(25),
        }),
        response: { 200: OrderListSchema },
      },
    },
    async (req) => listOrders(req.query),
  );

  app.get(
    '/admin/orders/:orderNumber',
    { schema: { tags: ['admin'], params: OrderNumberParams, response: { 200: OrderSchema } } },
    async (req) => getOrder(req.params.orderNumber),
  );

  app.patch(
    '/admin/orders/:orderNumber/status',
    {
      schema: {
        tags: ['admin'],
        params: OrderNumberParams,
        body: z.object({ status: StatusEnum, message: z.string().trim().max(280).optional() }),
        response: { 200: OrderSchema },
      },
    },
    async (req) => {
      const order = await updateOrderStatus(req.params.orderNumber, req.body.status, req.body.message);
      await recordAudit(req, {
        action: 'order.status.update',
        entityType: 'Order',
        entityId: req.params.orderNumber,
        metadata: { status: req.body.status },
      });
      return order;
    },
  );

  app.patch(
    '/admin/orders/:orderNumber/driver',
    {
      schema: {
        tags: ['admin'],
        params: OrderNumberParams,
        body: z.object({ driverId: z.string().min(1).nullable() }),
        response: { 200: OrderSchema },
      },
    },
    async (req) => {
      const order = await assignDriver(req.params.orderNumber, req.body.driverId);
      await recordAudit(req, {
        action: 'order.driver.assign',
        entityType: 'Order',
        entityId: req.params.orderNumber,
        metadata: { driverId: req.body.driverId },
      });
      return order;
    },
  );
}
