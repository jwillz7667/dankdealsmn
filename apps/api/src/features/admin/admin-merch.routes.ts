import type { FastifyInstance } from 'fastify';
import type { ZodTypeProvider } from 'fastify-type-provider-zod';
import { z } from 'zod';
import { type PromoCode, prisma } from '../../infrastructure/prisma.js';
import { AppError } from '../../shared/errors.js';
import { getSettings } from '../store/store.service.js';
import {
  PromoCreateSchema,
  PromoSchemaAdmin,
  PromoUpdateSchema,
  SettingsSchema,
  SettingsUpdateSchema,
  ZoneCreateSchema,
  ZoneSchemaAdmin,
  ZoneUpdateSchema,
} from './admin.schema.js';
import { recordAudit } from './audit.js';

const IdParams = z.object({ id: z.string().min(1) });

function serializePromo(p: PromoCode) {
  return {
    id: p.id,
    code: p.code,
    description: p.description,
    type: p.type,
    value: p.value,
    minSubtotalCents: p.minSubtotalCents,
    isActive: p.isActive,
    startsAt: p.startsAt?.toISOString() ?? null,
    endsAt: p.endsAt?.toISOString() ?? null,
    usageLimit: p.usageLimit,
    usedCount: p.usedCount,
    perUserLimit: p.perUserLimit,
  };
}

// eslint-disable-next-line @typescript-eslint/require-await
export default async function adminMerchRoutes(fastify: FastifyInstance): Promise<void> {
  const app = fastify.withTypeProvider<ZodTypeProvider>();
  app.addHook('onRequest', app.requireRole('ADMIN'));

  // ---------- Promo codes ----------
  app.get(
    '/admin/promos',
    { schema: { tags: ['admin'], response: { 200: z.array(PromoSchemaAdmin) } } },
    async () => {
      const rows = await prisma.promoCode.findMany({ orderBy: { createdAt: 'desc' } });
      return rows.map(serializePromo);
    },
  );

  app.post(
    '/admin/promos',
    { schema: { tags: ['admin'], body: PromoCreateSchema, response: { 201: PromoSchemaAdmin } } },
    async (req, reply) => {
      const code = req.body.code.trim().toUpperCase();
      const existing = await prisma.promoCode.findUnique({ where: { code }, select: { id: true } });
      if (existing) throw AppError.conflict('A promo code with that code already exists.');

      const p = await prisma.promoCode.create({
        data: {
          code,
          description: req.body.description ?? null,
          type: req.body.type,
          value: req.body.value,
          minSubtotalCents: req.body.minSubtotalCents ?? null,
          isActive: req.body.isActive,
          startsAt: req.body.startsAt ? new Date(req.body.startsAt) : null,
          endsAt: req.body.endsAt ? new Date(req.body.endsAt) : null,
          usageLimit: req.body.usageLimit ?? null,
          perUserLimit: req.body.perUserLimit ?? null,
        },
      });
      await recordAudit(req, { action: 'promo.create', entityType: 'PromoCode', entityId: p.id });
      return reply.code(201).send(serializePromo(p));
    },
  );

  app.patch(
    '/admin/promos/:id',
    {
      schema: {
        tags: ['admin'],
        params: IdParams,
        body: PromoUpdateSchema,
        response: { 200: PromoSchemaAdmin },
      },
    },
    async (req) => {
      const existing = await prisma.promoCode.findUnique({
        where: { id: req.params.id },
        select: { id: true },
      });
      if (!existing) throw AppError.notFound('Promo code not found');

      const b = req.body;
      const p = await prisma.promoCode.update({
        where: { id: req.params.id },
        data: {
          ...(b.code !== undefined ? { code: b.code.trim().toUpperCase() } : {}),
          ...(b.description !== undefined ? { description: b.description } : {}),
          ...(b.type !== undefined ? { type: b.type } : {}),
          ...(b.value !== undefined ? { value: b.value } : {}),
          ...(b.minSubtotalCents !== undefined ? { minSubtotalCents: b.minSubtotalCents } : {}),
          ...(b.isActive !== undefined ? { isActive: b.isActive } : {}),
          ...(b.startsAt !== undefined ? { startsAt: b.startsAt ? new Date(b.startsAt) : null } : {}),
          ...(b.endsAt !== undefined ? { endsAt: b.endsAt ? new Date(b.endsAt) : null } : {}),
          ...(b.usageLimit !== undefined ? { usageLimit: b.usageLimit } : {}),
          ...(b.perUserLimit !== undefined ? { perUserLimit: b.perUserLimit } : {}),
        },
      });
      await recordAudit(req, { action: 'promo.update', entityType: 'PromoCode', entityId: p.id });
      return serializePromo(p);
    },
  );

  app.delete(
    '/admin/promos/:id',
    {
      schema: {
        tags: ['admin'],
        params: IdParams,
        response: { 200: z.object({ deleted: z.literal(true) }) },
      },
    },
    async (req) => {
      // Orders keep promoCodeSnapshot; the FK is set null on delete.
      await prisma.promoCode.delete({ where: { id: req.params.id } });
      await recordAudit(req, {
        action: 'promo.delete',
        entityType: 'PromoCode',
        entityId: req.params.id,
      });
      return { deleted: true as const };
    },
  );

  // ---------- Delivery zones ----------
  app.get(
    '/admin/zones',
    { schema: { tags: ['admin'], response: { 200: z.array(ZoneSchemaAdmin) } } },
    async () => {
      const rows = await prisma.deliveryZone.findMany({ orderBy: { sortOrder: 'asc' } });
      return rows.map((z) => ({ id: z.id, city: z.city, isActive: z.isActive, sortOrder: z.sortOrder }));
    },
  );

  app.post(
    '/admin/zones',
    { schema: { tags: ['admin'], body: ZoneCreateSchema, response: { 201: ZoneSchemaAdmin } } },
    async (req, reply) => {
      const existing = await prisma.deliveryZone.findUnique({
        where: { city: req.body.city },
        select: { id: true },
      });
      if (existing) throw AppError.conflict('That city is already a delivery zone.');

      const z = await prisma.deliveryZone.create({
        data: { city: req.body.city, isActive: req.body.isActive, sortOrder: req.body.sortOrder },
      });
      await recordAudit(req, { action: 'zone.create', entityType: 'DeliveryZone', entityId: z.id });
      return reply.code(201).send({ id: z.id, city: z.city, isActive: z.isActive, sortOrder: z.sortOrder });
    },
  );

  app.patch(
    '/admin/zones/:id',
    {
      schema: {
        tags: ['admin'],
        params: IdParams,
        body: ZoneUpdateSchema,
        response: { 200: ZoneSchemaAdmin },
      },
    },
    async (req) => {
      const existing = await prisma.deliveryZone.findUnique({
        where: { id: req.params.id },
        select: { id: true },
      });
      if (!existing) throw AppError.notFound('Delivery zone not found');

      const z = await prisma.deliveryZone.update({
        where: { id: req.params.id },
        data: {
          ...(req.body.city !== undefined ? { city: req.body.city } : {}),
          ...(req.body.isActive !== undefined ? { isActive: req.body.isActive } : {}),
          ...(req.body.sortOrder !== undefined ? { sortOrder: req.body.sortOrder } : {}),
        },
      });
      await recordAudit(req, { action: 'zone.update', entityType: 'DeliveryZone', entityId: z.id });
      return { id: z.id, city: z.city, isActive: z.isActive, sortOrder: z.sortOrder };
    },
  );

  app.delete(
    '/admin/zones/:id',
    {
      schema: {
        tags: ['admin'],
        params: IdParams,
        response: { 200: z.object({ deleted: z.literal(true) }) },
      },
    },
    async (req) => {
      await prisma.deliveryZone.delete({ where: { id: req.params.id } });
      await recordAudit(req, {
        action: 'zone.delete',
        entityType: 'DeliveryZone',
        entityId: req.params.id,
      });
      return { deleted: true as const };
    },
  );

  // ---------- Store settings (singleton) ----------
  app.get(
    '/admin/settings',
    { schema: { tags: ['admin'], response: { 200: SettingsSchema } } },
    async () => {
      const s = await getSettings();
      return {
        deliveryFeeCents: s.deliveryFeeCents,
        freeDeliveryThresholdCents: s.freeDeliveryThresholdCents,
        minOrderCents: s.minOrderCents,
        taxRateBps: s.taxRateBps,
        defaultTipBps: s.defaultTipBps,
        deliveryEtaMinutes: s.deliveryEtaMinutes,
        licenseNumber: s.licenseNumber,
        supportPhone: s.supportPhone,
        supportEmail: s.supportEmail,
        announcement: s.announcement,
      };
    },
  );

  app.put(
    '/admin/settings',
    { schema: { tags: ['admin'], body: SettingsUpdateSchema, response: { 200: SettingsSchema } } },
    async (req) => {
      await getSettings(); // ensure the singleton row exists
      const b = req.body;
      const s = await prisma.storeSettings.update({
        where: { id: 'default' },
        data: {
          ...(b.deliveryFeeCents !== undefined ? { deliveryFeeCents: b.deliveryFeeCents } : {}),
          ...(b.freeDeliveryThresholdCents !== undefined
            ? { freeDeliveryThresholdCents: b.freeDeliveryThresholdCents }
            : {}),
          ...(b.minOrderCents !== undefined ? { minOrderCents: b.minOrderCents } : {}),
          ...(b.taxRateBps !== undefined ? { taxRateBps: b.taxRateBps } : {}),
          ...(b.defaultTipBps !== undefined ? { defaultTipBps: b.defaultTipBps } : {}),
          ...(b.deliveryEtaMinutes !== undefined ? { deliveryEtaMinutes: b.deliveryEtaMinutes } : {}),
          ...(b.licenseNumber !== undefined ? { licenseNumber: b.licenseNumber } : {}),
          ...(b.supportPhone !== undefined ? { supportPhone: b.supportPhone } : {}),
          ...(b.supportEmail !== undefined ? { supportEmail: b.supportEmail } : {}),
          ...(b.announcement !== undefined ? { announcement: b.announcement } : {}),
        },
      });
      await recordAudit(req, { action: 'settings.update', entityType: 'StoreSettings', entityId: s.id });
      return {
        deliveryFeeCents: s.deliveryFeeCents,
        freeDeliveryThresholdCents: s.freeDeliveryThresholdCents,
        minOrderCents: s.minOrderCents,
        taxRateBps: s.taxRateBps,
        defaultTipBps: s.defaultTipBps,
        deliveryEtaMinutes: s.deliveryEtaMinutes,
        licenseNumber: s.licenseNumber,
        supportPhone: s.supportPhone,
        supportEmail: s.supportEmail,
        announcement: s.announcement,
      };
    },
  );
}
