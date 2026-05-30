import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { type Prisma, prisma } from '../../infrastructure/prisma.js';
import { AppError } from '../../shared/errors.js';
import { recordAudit } from './audit.js';

const IdParams = z.object({ id: z.string().min(1) });

const DriverSchema = z.object({
  id: z.string(),
  displayName: z.string(),
  phone: z.string().nullable(),
  vehicleDescription: z.string().nullable(),
  ratingAvg: z.number(),
  isActive: z.boolean(),
});

const DriverCreateSchema = z.object({
  displayName: z.string().trim().min(1).max(80),
  phone: z.string().trim().max(40).nullable().optional(),
  vehicleDescription: z.string().trim().max(120).nullable().optional(),
  isActive: z.boolean().default(true),
});
const DriverUpdateSchema = DriverCreateSchema.partial();

type DriverRow = Prisma.DriverGetPayload<Record<string, never>>;
function serialize(d: DriverRow) {
  return {
    id: d.id,
    displayName: d.displayName,
    phone: d.phone,
    vehicleDescription: d.vehicleDescription,
    ratingAvg: d.ratingAvg.toNumber(),
    isActive: d.isActive,
  };
}

// eslint-disable-next-line @typescript-eslint/require-await
export default async function adminDriverRoutes(fastify: FastifyInstance): Promise<void> {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  app.addHook('onRequest', app.requireRole('ADMIN'));

  app.get(
    '/admin/drivers',
    { schema: { tags: ['admin'], response: { 200: z.array(DriverSchema) } } },
    async () => {
      const rows = await prisma.driver.findMany({ orderBy: { displayName: 'asc' } });
      return rows.map(serialize);
    },
  );

  app.post(
    '/admin/drivers',
    { schema: { tags: ['admin'], body: DriverCreateSchema, response: { 201: DriverSchema } } },
    async (req, reply) => {
      const d = await prisma.driver.create({
        data: {
          displayName: req.body.displayName,
          phone: req.body.phone ?? null,
          vehicleDescription: req.body.vehicleDescription ?? null,
          isActive: req.body.isActive,
        },
      });
      await recordAudit(req, { action: 'driver.create', entityType: 'Driver', entityId: d.id });
      return reply.code(201).send(serialize(d));
    },
  );

  app.patch(
    '/admin/drivers/:id',
    {
      schema: {
        tags: ['admin'],
        params: IdParams,
        body: DriverUpdateSchema,
        response: { 200: DriverSchema },
      },
    },
    async (req) => {
      const existing = await prisma.driver.findUnique({
        where: { id: req.params.id },
        select: { id: true },
      });
      if (!existing) throw AppError.notFound('Driver not found');

      const d = await prisma.driver.update({
        where: { id: req.params.id },
        data: {
          ...(req.body.displayName !== undefined ? { displayName: req.body.displayName } : {}),
          ...(req.body.phone !== undefined ? { phone: req.body.phone } : {}),
          ...(req.body.vehicleDescription !== undefined
            ? { vehicleDescription: req.body.vehicleDescription }
            : {}),
          ...(req.body.isActive !== undefined ? { isActive: req.body.isActive } : {}),
        },
      });
      await recordAudit(req, { action: 'driver.update', entityType: 'Driver', entityId: d.id });
      return serialize(d);
    },
  );

  app.delete(
    '/admin/drivers/:id',
    {
      schema: {
        tags: ['admin'],
        params: IdParams,
        response: { 200: z.object({ deleted: z.literal(true) }) },
      },
    },
    async (req) => {
      await prisma.driver.delete({ where: { id: req.params.id } });
      await recordAudit(req, { action: 'driver.delete', entityType: 'Driver', entityId: req.params.id });
      return { deleted: true as const };
    },
  );
}
