import { prisma, Prisma } from '../../infrastructure/prisma.js';
import { AppError } from '../../shared/errors.js';
import { computeTotals, type AppliedPromo } from '../../domain/pricing.js';
import { generateOrderNumber } from '../../domain/order-number.js';
import { orderTrackingToken, verifyTrackingToken } from '../../shared/tokens.js';
import { getSettings, getActiveZones } from '../store/store.service.js';
import { resolvePromo, type ResolvedPromo } from '../promo/promo.service.js';
import type { AuthContext } from '../../plugins/auth.js';
import {
  orderInclude,
  serializeOrder,
  type OrderWithRelations,
  type OrderDTO,
} from './orders.serialize.js';
import type { CreateOrderRequest, QuoteRequest, QuoteResult } from './orders.schema.js';

// Minimal product shape needed to price a line and snapshot it onto the order.
const lineProductSelect = {
  id: true,
  slug: true,
  name: true,
  size: true,
  priceCents: true,
  trackInventory: true,
  inventoryQty: true,
  brand: { select: { name: true } },
  images: {
    orderBy: [{ isPrimary: 'desc' }, { position: 'asc' }],
    take: 1,
    select: { url: true },
  },
} satisfies Prisma.ProductSelect;

type LineProduct = Prisma.ProductGetPayload<{ select: typeof lineProductSelect }>;

interface BuiltLine {
  product: LineProduct;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

/**
 * Loads the requested products, merges duplicate lines, and prices each one from
 * the DB — never from the client. Throws UNPROCESSABLE if anything is unavailable
 * or out of stock so the storefront can surface a precise message.
 */
async function buildLines(items: ReadonlyArray<{ productId: string; quantity: number }>): Promise<BuiltLine[]> {
  const merged = new Map<string, number>();
  for (const it of items) {
    merged.set(it.productId, (merged.get(it.productId) ?? 0) + it.quantity);
  }

  const products = await prisma.product.findMany({
    where: { id: { in: [...merged.keys()] }, status: 'ACTIVE' },
    select: lineProductSelect,
  });
  const byId = new Map(products.map((p) => [p.id, p]));

  const lines: BuiltLine[] = [];
  for (const [productId, quantity] of merged) {
    const product = byId.get(productId);
    if (!product) {
      throw AppError.unprocessable('One or more items are no longer available.');
    }
    if (product.trackInventory && product.inventoryQty < quantity) {
      throw AppError.unprocessable(`${product.name} is out of stock.`);
    }
    lines.push({
      product,
      quantity,
      unitPriceCents: product.priceCents,
      lineTotalCents: product.priceCents * quantity,
    });
  }
  return lines;
}

const sum = (lines: BuiltLine[]): number => lines.reduce((acc, l) => acc + l.lineTotalCents, 0);

/**
 * Server-authoritative price quote. Promo failures are non-fatal here — the
 * storefront shows the reason inline and still renders a valid cart total.
 */
export async function quoteOrder(input: QuoteRequest): Promise<QuoteResult> {
  const settings = await getSettings();
  const lines = await buildLines(input.items);
  const subtotalCents = sum(lines);

  let promo: AppliedPromo | null = null;
  let promoMeta: QuoteResult['promo'] = null;
  if (input.promoCode) {
    try {
      const resolved = await resolvePromo(input.promoCode, subtotalCents);
      promo = resolved.applied;
      promoMeta = { code: resolved.record.code, description: resolved.record.description, applied: true };
    } catch (err) {
      if (err instanceof AppError && err.code === 'UNPROCESSABLE') {
        promoMeta = { code: input.promoCode.trim().toUpperCase(), description: err.message, applied: false };
      } else {
        throw err;
      }
    }
  }

  const totals = computeTotals({ subtotalCents, settings, promo, tipCents: input.tipCents });

  return {
    lines: lines.map((l) => ({
      productId: l.product.id,
      slug: l.product.slug,
      name: l.product.name,
      brand: l.product.brand?.name ?? null,
      size: l.product.size,
      image: l.product.images[0]?.url ?? null,
      unitPriceCents: l.unitPriceCents,
      quantity: l.quantity,
      lineTotalCents: l.lineTotalCents,
    })),
    totals,
    promo: promoMeta,
    minOrderCents: settings.minOrderCents,
    minOrderMet: subtotalCents >= settings.minOrderCents,
    freeDeliveryThresholdCents: settings.freeDeliveryThresholdCents,
  };
}

const normalizeCity = (s: string): string => s.trim().toLowerCase().replace(/\./g, '').replace(/\s+/g, ' ');

export interface CreateOrderResult {
  order: OrderDTO;
  trackingToken: string;
}

/**
 * Places an order. Re-prices everything from the DB, enforces delivery zone /
 * minimum-order / 21+ rules, and writes Order + OrderItems + initial event in one
 * transaction. Promo (if supplied) must be valid here — unlike the lenient quote.
 */
export async function createOrder(params: {
  input: CreateOrderRequest;
  userId: string | null;
  trackingSecret: string;
}): Promise<CreateOrderResult> {
  const { input, userId, trackingSecret } = params;

  const [settings, zones] = await Promise.all([getSettings(), getActiveZones()]);

  const servedCities = new Set(zones.map(normalizeCity));
  if (!servedCities.has(normalizeCity(input.address.city))) {
    throw AppError.unprocessable(`We don't deliver to ${input.address.city} yet.`);
  }

  const lines = await buildLines(input.items);
  const subtotalCents = sum(lines);

  if (subtotalCents < settings.minOrderCents) {
    const min = (settings.minOrderCents / 100).toFixed(0);
    throw AppError.unprocessable(`Minimum order is $${min}.`);
  }

  let resolved: ResolvedPromo | null = null;
  let promo: AppliedPromo | null = null;
  if (input.promoCode) {
    resolved = await resolvePromo(input.promoCode, subtotalCents);
    promo = resolved.applied;
  }

  const totals = computeTotals({ subtotalCents, settings, promo, tipCents: input.tipCents });

  const etaAt =
    input.fulfillment.type === 'ASAP'
      ? new Date(Date.now() + settings.deliveryEtaMinutes * 60_000)
      : null;

  const itemData: Prisma.OrderItemCreateManyOrderInput[] = lines.map((l) => ({
    productId: l.product.id,
    nameSnapshot: l.product.name,
    brandSnapshot: l.product.brand?.name ?? null,
    sizeSnapshot: l.product.size,
    imageSnapshot: l.product.images[0]?.url ?? null,
    unitPriceCents: l.unitPriceCents,
    quantity: l.quantity,
    lineTotalCents: l.lineTotalCents,
  }));

  let created: OrderWithRelations | undefined;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const orderNumber = generateOrderNumber();
    try {
      created = await prisma.$transaction(async (tx) => {
        const order = await tx.order.create({
          data: {
            orderNumber,
            userId,
            status: 'CONFIRMED',
            customerName: input.contact.name,
            customerPhone: input.contact.phone,
            customerEmail: input.contact.email,
            addressStreet: input.address.street,
            addressApt: input.address.apt ?? null,
            addressCity: input.address.city,
            addressZip: input.address.zip,
            deliveryNotes: input.address.notes ?? null,
            deliveryType: input.fulfillment.type,
            scheduledWindow: input.fulfillment.scheduledWindow ?? null,
            etaAt,
            paymentMethod: input.payment.method,
            idVerified: input.idVerified,
            subtotalCents: totals.subtotalCents,
            discountCents: totals.discountCents,
            deliveryFeeCents: totals.deliveryFeeCents,
            taxCents: totals.taxCents,
            tipCents: totals.tipCents,
            totalCents: totals.totalCents,
            taxRateBps: settings.taxRateBps,
            promoCodeId: resolved?.record.id ?? null,
            promoCodeSnapshot: resolved?.record.code ?? null,
            items: { createMany: { data: itemData } },
            events: { create: { status: 'CONFIRMED', message: 'Order received and confirmed.' } },
          },
          include: orderInclude,
        });

        if (resolved) {
          await tx.promoCode.update({
            where: { id: resolved.record.id },
            data: { usedCount: { increment: 1 } },
          });
        }
        return order;
      });
      break;
    } catch (err) {
      const isDuplicate =
        err instanceof Prisma.PrismaClientKnownRequestError &&
        err.code === 'P2002' &&
        attempt < 4;
      if (!isDuplicate) throw err;
    }
  }

  if (!created) {
    throw AppError.conflict('Could not place your order. Please try again.');
  }

  return {
    order: serializeOrder(created),
    trackingToken: orderTrackingToken(created.orderNumber, trackingSecret),
  };
}

/**
 * Reads a single order. Access is granted to admins/service callers, the owning
 * user, or anyone holding the order's stateless tracking token; otherwise 404
 * (so order numbers can't be enumerated).
 */
export async function getOrderByNumber(params: {
  orderNumber: string;
  token?: string;
  auth: AuthContext | null;
  trackingSecret: string;
}): Promise<OrderDTO> {
  const order = await prisma.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: orderInclude,
  });
  if (!order) throw AppError.notFound('Order not found');

  const isAdmin = params.auth?.role === 'ADMIN' || params.auth?.service === true;
  const isOwner = Boolean(params.auth && order.userId && params.auth.userId === order.userId);
  const validToken = Boolean(
    params.token && verifyTrackingToken(order.orderNumber, params.token, params.trackingSecret),
  );

  if (!isAdmin && !isOwner && !validToken) {
    throw AppError.notFound('Order not found');
  }

  return serializeOrder(order);
}
