import { z } from 'zod';

export const CartItemInputSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().min(1).max(99),
});

export const QuoteRequestSchema = z.object({
  items: z.array(CartItemInputSchema).min(1).max(50),
  promoCode: z.string().trim().min(1).max(40).optional(),
  tipCents: z.number().int().min(0).max(100_000).optional(),
});
export type QuoteRequest = z.infer<typeof QuoteRequestSchema>;

export const CreateOrderSchema = z.object({
  items: z.array(CartItemInputSchema).min(1).max(50),
  contact: z.object({
    name: z.string().trim().min(1).max(120),
    phone: z.string().trim().min(7).max(32),
    email: z.string().email(),
  }),
  address: z.object({
    street: z.string().trim().min(1).max(160),
    apt: z.string().trim().max(60).optional(),
    city: z.string().trim().min(1).max(80),
    zip: z.string().trim().regex(/^\d{5}(-\d{4})?$/, 'Enter a valid ZIP code'),
    notes: z.string().trim().max(500).optional(),
  }),
  fulfillment: z.object({
    type: z.enum(['ASAP', 'SCHEDULED']),
    scheduledWindow: z.string().trim().max(80).optional(),
  }),
  payment: z.object({ method: z.enum(['CASH', 'DEBIT']) }),
  tipCents: z.number().int().min(0).max(100_000).default(0),
  promoCode: z.string().trim().min(1).max(40).optional(),
  idVerified: z.literal(true, {
    errorMap: () => ({ message: 'You must confirm you are 21 or older.' }),
  }),
});
export type CreateOrderRequest = z.infer<typeof CreateOrderSchema>;

// ---- responses ----
const LineSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  name: z.string(),
  brand: z.string().nullable(),
  size: z.string(),
  image: z.string().nullable(),
  unitPriceCents: z.number(),
  quantity: z.number(),
  lineTotalCents: z.number(),
});

const TotalsSchema = z.object({
  subtotalCents: z.number(),
  discountCents: z.number(),
  deliveryFeeCents: z.number(),
  taxCents: z.number(),
  tipCents: z.number(),
  totalCents: z.number(),
});

export const QuoteResponseSchema = z.object({
  lines: z.array(LineSchema),
  totals: TotalsSchema,
  promo: z
    .object({ code: z.string(), description: z.string().nullable(), applied: z.boolean() })
    .nullable(),
  minOrderCents: z.number(),
  minOrderMet: z.boolean(),
  freeDeliveryThresholdCents: z.number(),
});
export type QuoteResult = z.infer<typeof QuoteResponseSchema>;

const OrderResponseSchema = z.object({
  orderNumber: z.string(),
  status: z.enum(['PENDING', 'CONFIRMED', 'PREPARING', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED']),
  placedAt: z.string(),
  etaAt: z.string().nullable(),
  deliveredAt: z.string().nullable(),
  deliveryType: z.enum(['ASAP', 'SCHEDULED']),
  scheduledWindow: z.string().nullable(),
  paymentMethod: z.enum(['CASH', 'DEBIT']),
  idVerified: z.boolean(),
  customer: z.object({ name: z.string(), phone: z.string(), email: z.string() }),
  address: z.object({
    street: z.string(),
    apt: z.string().nullable(),
    city: z.string(),
    zip: z.string(),
    notes: z.string().nullable(),
  }),
  items: z.array(
    z.object({
      productId: z.string().nullable(),
      name: z.string(),
      brand: z.string().nullable(),
      size: z.string().nullable(),
      image: z.string().nullable(),
      unitPriceCents: z.number(),
      quantity: z.number(),
      lineTotalCents: z.number(),
    }),
  ),
  totals: TotalsSchema,
  promoCode: z.string().nullable(),
  driver: z
    .object({
      displayName: z.string(),
      vehicleDescription: z.string().nullable(),
      ratingAvg: z.number(),
    })
    .nullable(),
  events: z.array(
    z.object({
      status: z.enum([
        'PENDING',
        'CONFIRMED',
        'PREPARING',
        'OUT_FOR_DELIVERY',
        'DELIVERED',
        'CANCELLED',
      ]),
      message: z.string().nullable(),
      createdAt: z.string(),
    }),
  ),
});

export const OrderSchema = OrderResponseSchema;
export const CreateOrderResponseSchema = z.object({
  order: OrderResponseSchema,
  trackingToken: z.string(),
});
