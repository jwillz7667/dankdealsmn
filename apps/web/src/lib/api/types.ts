/**
 * TypeScript mirror of the Fastify API response/request DTOs
 * (apps/api/src/features/**). Kept in lockstep with the Zod schemas there.
 */

export type StrainType = 'INDICA' | 'SATIVA' | 'HYBRID' | 'CBD';
export type Badge = 'DEAL' | 'NEW' | 'BEST';
export type ProductStatus = 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
export type PotencyUnit = 'PERCENT' | 'MG';
export type OrderStatus =
  | 'PENDING'
  | 'CONFIRMED'
  | 'PREPARING'
  | 'OUT_FOR_DELIVERY'
  | 'DELIVERED'
  | 'CANCELLED';
export type DeliveryType = 'ASAP' | 'SCHEDULED';
export type PaymentMethod = 'CASH' | 'DEBIT';

export interface Potency {
  value: number | null;
  unit: PotencyUnit;
}

export interface ProductImage {
  id: string;
  url: string;
  alt: string | null;
  width: number | null;
  height: number | null;
  position: number;
  isPrimary: boolean;
}

export interface NamedRef {
  name: string;
  slug: string;
}

export interface Product {
  id: string;
  slug: string;
  name: string;
  brand: NamedRef | null;
  category: NamedRef;
  strainType: StrainType;
  thc: Potency | null;
  cbd: Potency | null;
  priceCents: number;
  compareAtCents: number | null;
  size: string;
  badges: Badge[];
  effects: string[];
  shortDescription: string | null;
  description: string;
  status: ProductStatus;
  isFeatured: boolean;
  inStock: boolean;
  ratingAvg: number;
  ratingCount: number;
  images: ProductImage[];
  createdAt: string;
}

export interface ProductList {
  items: Product[];
  nextCursor: string | null;
  total: number;
}

export interface Category {
  id: string;
  slug: string;
  name: string;
  blurb: string | null;
  iconKey: string | null;
  productCount: number;
}

export interface Brand {
  id: string;
  slug: string;
  name: string;
  productCount: number;
}

export interface StoreConfig {
  deliveryFeeCents: number;
  freeDeliveryThresholdCents: number;
  minOrderCents: number;
  taxRateBps: number;
  defaultTipBps: number;
  deliveryEtaMinutes: number;
  licenseNumber: string;
  supportPhone: string | null;
  supportEmail: string | null;
  announcement: string | null;
  zones: string[];
}

export interface QuoteLine {
  productId: string;
  slug: string;
  name: string;
  brand: string | null;
  size: string;
  image: string | null;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
}

export interface OrderTotals {
  subtotalCents: number;
  discountCents: number;
  deliveryFeeCents: number;
  taxCents: number;
  tipCents: number;
  totalCents: number;
}

export interface QuoteResult {
  lines: QuoteLine[];
  totals: OrderTotals;
  promo: { code: string; description: string | null; applied: boolean } | null;
  minOrderCents: number;
  minOrderMet: boolean;
  freeDeliveryThresholdCents: number;
}

export interface OrderItem {
  productId: string | null;
  name: string;
  brand: string | null;
  size: string | null;
  image: string | null;
  unitPriceCents: number;
  quantity: number;
  lineTotalCents: number;
}

export interface OrderEvent {
  status: OrderStatus;
  message: string | null;
  createdAt: string;
}

export interface Order {
  orderNumber: string;
  status: OrderStatus;
  placedAt: string;
  etaAt: string | null;
  deliveredAt: string | null;
  deliveryType: DeliveryType;
  scheduledWindow: string | null;
  paymentMethod: PaymentMethod;
  idVerified: boolean;
  customer: { name: string; phone: string; email: string };
  address: { street: string; apt: string | null; city: string; zip: string; notes: string | null };
  items: OrderItem[];
  totals: OrderTotals;
  promoCode: string | null;
  driver: { displayName: string; vehicleDescription: string | null; ratingAvg: number } | null;
  events: OrderEvent[];
}

export interface CreateOrderResponse {
  order: Order;
  trackingToken: string;
}

export interface AccountOrderSummary {
  orderNumber: string;
  status: OrderStatus;
  placedAt: string;
  itemCount: number;
  totalCents: number;
  etaAt: string | null;
  /** Capability token to open the tracking page (client-side polling). */
  trackingToken: string;
}

export interface AccountOrderList {
  items: AccountOrderSummary[];
  nextCursor: string | null;
}

export interface Review {
  id: string;
  rating: number;
  title: string | null;
  body: string | null;
  authorName: string;
  createdAt: string;
}

export interface ReviewList {
  items: Review[];
  total: number;
}

// ---- request payloads ----
export interface CartItemInput {
  productId: string;
  quantity: number;
}

export interface QuoteRequest {
  items: CartItemInput[];
  promoCode?: string;
  tipCents?: number;
}

export interface CreateOrderRequest {
  items: CartItemInput[];
  contact: { name: string; phone: string; email: string };
  address: { street: string; apt?: string; city: string; zip: string; notes?: string };
  fulfillment: { type: DeliveryType; scheduledWindow?: string };
  payment: { method: PaymentMethod };
  tipCents: number;
  promoCode?: string;
  idVerified: true;
}

export interface ApiErrorBody {
  error: { code: string; message: string; details?: unknown };
}
