import { type Prisma } from '../../infrastructure/prisma.js';

export const orderInclude = {
  items: true,
  events: { orderBy: { createdAt: 'asc' } },
  driver: { select: { displayName: true, vehicleDescription: true, ratingAvg: true } },
} satisfies Prisma.OrderInclude;

export type OrderWithRelations = Prisma.OrderGetPayload<{ include: typeof orderInclude }>;

export function serializeOrder(o: OrderWithRelations) {
  return {
    orderNumber: o.orderNumber,
    status: o.status,
    placedAt: o.placedAt.toISOString(),
    etaAt: o.etaAt?.toISOString() ?? null,
    deliveredAt: o.deliveredAt?.toISOString() ?? null,
    deliveryType: o.deliveryType,
    scheduledWindow: o.scheduledWindow,
    paymentMethod: o.paymentMethod,
    idVerified: o.idVerified,
    customer: { name: o.customerName, phone: o.customerPhone, email: o.customerEmail },
    address: {
      street: o.addressStreet,
      apt: o.addressApt,
      city: o.addressCity,
      zip: o.addressZip,
      notes: o.deliveryNotes,
    },
    items: o.items.map((i) => ({
      productId: i.productId,
      name: i.nameSnapshot,
      brand: i.brandSnapshot,
      size: i.sizeSnapshot,
      image: i.imageSnapshot,
      unitPriceCents: i.unitPriceCents,
      quantity: i.quantity,
      lineTotalCents: i.lineTotalCents,
    })),
    totals: {
      subtotalCents: o.subtotalCents,
      discountCents: o.discountCents,
      deliveryFeeCents: o.deliveryFeeCents,
      taxCents: o.taxCents,
      tipCents: o.tipCents,
      totalCents: o.totalCents,
    },
    promoCode: o.promoCodeSnapshot,
    driver: o.driver
      ? {
          displayName: o.driver.displayName,
          vehicleDescription: o.driver.vehicleDescription,
          ratingAvg: o.driver.ratingAvg.toNumber(),
        }
      : null,
    events: o.events.map((e) => ({
      status: e.status,
      message: e.message,
      createdAt: e.createdAt.toISOString(),
    })),
  };
}

export type OrderDTO = ReturnType<typeof serializeOrder>;
