import { type Prisma, prisma } from '../../infrastructure/prisma.js';
import { AppError } from '../../shared/errors.js';
import { orderInclude, serializeOrder, type OrderDTO } from '../orders/orders.serialize.js';

export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';

// Forward-only fulfillment flow; CANCELLED is reachable from any non-terminal state.
const NEXT: Record<OrderStatus, OrderStatus[]> = {
  PENDING: ['CONFIRMED', 'CANCELLED'],
  CONFIRMED: ['PREPARING', 'CANCELLED'],
  PREPARING: ['OUT_FOR_DELIVERY', 'CANCELLED'],
  OUT_FOR_DELIVERY: ['DELIVERED', 'CANCELLED'],
  DELIVERED: [],
  CANCELLED: [],
};

export interface OrderListItem {
  orderNumber: string;
  status: OrderStatus;
  placedAt: string;
  customerName: string;
  city: string;
  paymentMethod: 'CASH' | 'DEBIT';
  deliveryType: 'ASAP' | 'SCHEDULED';
  itemCount: number;
  totalCents: number;
  driver: string | null;
}

export async function listOrders(f: {
  status?: OrderStatus;
  search?: string;
  page: number;
  pageSize: number;
}): Promise<{ items: OrderListItem[]; total: number; page: number; pageSize: number }> {
  const where: Prisma.OrderWhereInput = {};
  if (f.status) where.status = f.status;
  if (f.search) {
    where.OR = [
      { orderNumber: { contains: f.search, mode: 'insensitive' } },
      { customerName: { contains: f.search, mode: 'insensitive' } },
      { customerPhone: { contains: f.search, mode: 'insensitive' } },
      { customerEmail: { contains: f.search, mode: 'insensitive' } },
    ];
  }

  const [rows, total] = await Promise.all([
    prisma.order.findMany({
      where,
      orderBy: { placedAt: 'desc' },
      skip: (f.page - 1) * f.pageSize,
      take: f.pageSize,
      include: {
        _count: { select: { items: true } },
        driver: { select: { displayName: true } },
      },
    }),
    prisma.order.count({ where }),
  ]);

  return {
    items: rows.map((o) => ({
      orderNumber: o.orderNumber,
      status: o.status,
      placedAt: o.placedAt.toISOString(),
      customerName: o.customerName,
      city: o.addressCity,
      paymentMethod: o.paymentMethod,
      deliveryType: o.deliveryType,
      itemCount: o._count.items,
      totalCents: o.totalCents,
      driver: o.driver?.displayName ?? null,
    })),
    total,
    page: f.page,
    pageSize: f.pageSize,
  };
}

export async function getOrder(orderNumber: string): Promise<OrderDTO> {
  const order = await prisma.order.findUnique({ where: { orderNumber }, include: orderInclude });
  if (!order) throw AppError.notFound('Order not found');
  return serializeOrder(order);
}

export async function updateOrderStatus(
  orderNumber: string,
  status: OrderStatus,
  message?: string,
): Promise<OrderDTO> {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: { id: true, status: true },
  });
  if (!order) throw AppError.notFound('Order not found');

  // Same status + a note appends a customer-facing timeline event without a state
  // change, so an admin can post an update while the order stays in its stage.
  if (order.status === status) {
    if (!message) throw AppError.unprocessable(`Order is already ${status}.`);
    const noted = await prisma.$transaction(async (tx) => {
      await tx.orderEvent.create({ data: { orderId: order.id, status, message } });
      return tx.order.findUniqueOrThrow({ where: { id: order.id }, include: orderInclude });
    });
    return serializeOrder(noted);
  }
  if (!NEXT[order.status].includes(status)) {
    throw AppError.unprocessable(`Cannot move an order from ${order.status} to ${status}.`);
  }

  const updated = await prisma.$transaction(async (tx) => {
    const o = await tx.order.update({
      where: { id: order.id },
      data: {
        status,
        ...(status === 'DELIVERED' ? { deliveredAt: new Date() } : {}),
      },
    });
    await tx.orderEvent.create({
      data: { orderId: o.id, status, message: message ?? null },
    });
    return tx.order.findUniqueOrThrow({ where: { id: o.id }, include: orderInclude });
  });

  return serializeOrder(updated);
}

export async function assignDriver(orderNumber: string, driverId: string | null): Promise<OrderDTO> {
  const order = await prisma.order.findUnique({
    where: { orderNumber },
    select: { id: true },
  });
  if (!order) throw AppError.notFound('Order not found');

  if (driverId) {
    const driver = await prisma.driver.findUnique({
      where: { id: driverId },
      select: { id: true, displayName: true },
    });
    if (!driver) throw AppError.badRequest('Unknown driverId');
  }

  const updated = await prisma.order.update({
    where: { id: order.id },
    data: { driverId },
    include: orderInclude,
  });
  return serializeOrder(updated);
}
