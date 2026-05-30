import 'server-only';
import { api, qs } from '@/lib/api/client';
import type { Order } from '@/lib/api/types';
import type {
  AdminBrand,
  AdminCategory,
  AdminOrder,
  AdminOrderList,
  AdminProduct,
  AdminProductList,
  AdminStats,
  PresignResponse,
} from './types';

/**
 * Server-only admin API surface. Every call carries an ADMIN-scoped bearer
 * token (minted from the session) and is uncached — admin views must always
 * reflect the live database.
 */

const opts = (token: string) => ({ token, cache: 'no-store' as const });

export interface AdminProductQuery {
  search?: string;
  status?: 'DRAFT' | 'ACTIVE' | 'ARCHIVED';
  categoryId?: string;
  page?: number;
  pageSize?: number;
}

export function getStats(token: string): Promise<AdminStats> {
  return api.get<AdminStats>('/admin/stats', opts(token));
}

export function listProducts(token: string, query: AdminProductQuery = {}): Promise<AdminProductList> {
  return api.get<AdminProductList>(`/admin/products${qs({ ...query })}`, opts(token));
}

export function getProduct(token: string, id: string): Promise<AdminProduct> {
  return api.get<AdminProduct>(`/admin/products/${encodeURIComponent(id)}`, opts(token));
}

export function createProduct(token: string, body: unknown): Promise<AdminProduct> {
  return api.post<AdminProduct>('/admin/products', body, opts(token));
}

export function updateProduct(token: string, id: string, body: unknown): Promise<AdminProduct> {
  return api.patch<AdminProduct>(`/admin/products/${encodeURIComponent(id)}`, body, opts(token));
}

export function deleteProduct(token: string, id: string): Promise<{ deleted: true }> {
  return api.delete<{ deleted: true }>(`/admin/products/${encodeURIComponent(id)}`, opts(token));
}

export function addProductImage(token: string, id: string, body: unknown): Promise<AdminProduct> {
  return api.post<AdminProduct>(`/admin/products/${encodeURIComponent(id)}/images`, body, opts(token));
}

export function deleteProductImage(token: string, id: string, imageId: string): Promise<AdminProduct> {
  return api.delete<AdminProduct>(
    `/admin/products/${encodeURIComponent(id)}/images/${encodeURIComponent(imageId)}`,
    opts(token),
  );
}

export function reorderProductImages(
  token: string,
  id: string,
  body: { order: { id: string; position: number }[]; primaryId?: string },
): Promise<AdminProduct> {
  return api.patch<AdminProduct>(
    `/admin/products/${encodeURIComponent(id)}/images/reorder`,
    body,
    opts(token),
  );
}

export function presignUpload(token: string, body: unknown): Promise<PresignResponse> {
  return api.post<PresignResponse>('/admin/uploads/presign', body, opts(token));
}

export function listCategories(token: string): Promise<AdminCategory[]> {
  return api.get<AdminCategory[]>('/admin/categories', opts(token));
}

export function createCategory(token: string, body: unknown): Promise<AdminCategory> {
  return api.post<AdminCategory>('/admin/categories', body, opts(token));
}

export function updateCategory(token: string, id: string, body: unknown): Promise<AdminCategory> {
  return api.patch<AdminCategory>(`/admin/categories/${encodeURIComponent(id)}`, body, opts(token));
}

export function deleteCategory(token: string, id: string): Promise<{ deleted: true }> {
  return api.delete<{ deleted: true }>(`/admin/categories/${encodeURIComponent(id)}`, opts(token));
}

export function listBrands(token: string): Promise<AdminBrand[]> {
  return api.get<AdminBrand[]>('/admin/brands', opts(token));
}

export function createBrand(token: string, body: unknown): Promise<AdminBrand> {
  return api.post<AdminBrand>('/admin/brands', body, opts(token));
}

export function updateBrand(token: string, id: string, body: unknown): Promise<AdminBrand> {
  return api.patch<AdminBrand>(`/admin/brands/${encodeURIComponent(id)}`, body, opts(token));
}

export function deleteBrand(token: string, id: string): Promise<{ deleted: true }> {
  return api.delete<{ deleted: true }>(`/admin/brands/${encodeURIComponent(id)}`, opts(token));
}

export interface AdminOrderQuery {
  status?: AdminOrderList['items'][number]['status'];
  search?: string;
  page?: number;
  pageSize?: number;
}

export function listOrders(token: string, query: AdminOrderQuery = {}): Promise<AdminOrderList> {
  return api.get<AdminOrderList>(`/admin/orders${qs({ ...query })}`, opts(token));
}

export function getOrder(token: string, orderNumber: string): Promise<AdminOrder> {
  return api.get<Order>(`/admin/orders/${encodeURIComponent(orderNumber)}`, opts(token));
}

export function updateOrderStatus(
  token: string,
  orderNumber: string,
  body: { status: string; message?: string },
): Promise<AdminOrder> {
  return api.patch<Order>(
    `/admin/orders/${encodeURIComponent(orderNumber)}/status`,
    body,
    opts(token),
  );
}

export function assignDriver(
  token: string,
  orderNumber: string,
  driverId: string | null,
): Promise<AdminOrder> {
  return api.patch<Order>(
    `/admin/orders/${encodeURIComponent(orderNumber)}/driver`,
    { driverId },
    opts(token),
  );
}
