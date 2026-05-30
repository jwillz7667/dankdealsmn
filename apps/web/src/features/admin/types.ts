import type { Order, PaymentMethod, DeliveryType, OrderStatus, Product } from '@/lib/api/types';

/** Product with the admin-only fields the public catalog omits. */
export interface AdminProduct extends Product {
  categoryId: string;
  brandId: string | null;
  trackInventory: boolean;
  inventoryQty: number;
  position: number;
  metaTitle: string | null;
  metaDescription: string | null;
  updatedAt: string;
}

export interface AdminProductList {
  items: AdminProduct[];
  total: number;
  page: number;
  pageSize: number;
}

export interface AdminCategory {
  id: string;
  slug: string;
  name: string;
  blurb: string | null;
  iconKey: string | null;
  sortOrder: number;
  isActive: boolean;
  metaTitle: string | null;
  metaDescription: string | null;
  productCount: number;
}

export interface AdminBrand {
  id: string;
  slug: string;
  name: string;
  logoUrl: string | null;
  description: string | null;
  isActive: boolean;
  productCount: number;
}

export interface AdminOrderListItem {
  orderNumber: string;
  status: OrderStatus;
  placedAt: string;
  customerName: string;
  city: string;
  paymentMethod: PaymentMethod;
  deliveryType: DeliveryType;
  itemCount: number;
  totalCents: number;
  driver: string | null;
}

export interface AdminOrderList {
  items: AdminOrderListItem[];
  total: number;
  page: number;
  pageSize: number;
}

export type AdminOrder = Order;

export interface AdminStats {
  orders: { total: number; pending: number; active: number; deliveredToday: number };
  revenue: { grossCentsAllTime: number; grossCentsLast30Days: number };
  catalog: { activeProducts: number; draftProducts: number; outOfStock: number; pendingReviews: number };
  recentOrders: {
    orderNumber: string;
    status: string;
    customerName: string;
    totalCents: number;
    placedAt: string;
  }[];
}

export interface PresignResponse {
  uploadUrl: string;
  publicUrl: string;
  key: string;
  expiresInSeconds: number;
}

/** Discriminated result returned by every admin server action. */
export type ActionResult<T = undefined> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };
