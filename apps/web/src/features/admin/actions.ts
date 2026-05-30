'use server';

import { revalidatePath, revalidateTag } from 'next/cache';
import { ZodError } from 'zod';
import { auth, getApiToken, isAdminRole } from '@/features/auth/server';
import { ApiError } from '@/lib/api/client';
import * as adminApi from './api';
import {
  BrandCreateSchema,
  BrandUpdateSchema,
  CategoryCreateSchema,
  CategoryUpdateSchema,
  OrderStatusUpdateSchema,
  PresignRequestSchema,
  ProductCreateSchema,
  ProductImageCreateSchema,
  ProductUpdateSchema,
} from './schema';
import type {
  ActionResult,
  AdminBrand,
  AdminCategory,
  AdminOrder,
  AdminProduct,
  PresignResponse,
} from './types';

function fieldErrorsOf(err: ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of err.issues) {
    const key = issue.path.join('.') || '_';
    out[key] ??= issue.message;
  }
  return out;
}

/** Wraps an admin mutation: re-checks the ADMIN session, mints a token, maps errors. */
async function withAdmin<T>(fn: (token: string) => Promise<T>): Promise<ActionResult<T>> {
  const session = await auth();
  if (!session?.user || !isAdminRole(session.user.role)) {
    return { ok: false, error: 'Your session has expired. Sign in again to continue.' };
  }
  const token = await getApiToken();
  if (!token) {
    return { ok: false, error: 'Your session has expired. Sign in again to continue.' };
  }
  try {
    return { ok: true, data: await fn(token) };
  } catch (err) {
    if (err instanceof ZodError) {
      return { ok: false, error: 'Please correct the highlighted fields.', fieldErrors: fieldErrorsOf(err) };
    }
    if (err instanceof ApiError) {
      return { ok: false, error: err.message, fieldErrors: detailsToFieldErrors(err.details) };
    }
    console.error('admin action failed', err);
    return { ok: false, error: 'Something went wrong. Please try again.' };
  }
}

/** Surface server-side Zod field errors (the API returns issues in `details`). */
function detailsToFieldErrors(details: unknown): Record<string, string> | undefined {
  if (!Array.isArray(details)) return undefined;
  const out: Record<string, string> = {};
  for (const issue of details) {
    if (
      issue &&
      typeof issue === 'object' &&
      'path' in issue &&
      Array.isArray((issue as { path: unknown[] }).path) &&
      'message' in issue &&
      typeof (issue as { message: unknown }).message === 'string'
    ) {
      const path = (issue as { path: (string | number)[] }).path;
      const key = path.filter((p) => p !== 'body').join('.') || '_';
      out[key] ??= (issue as { message: string }).message;
    }
  }
  return Object.keys(out).length ? out : undefined;
}

function revalidateCatalog(): void {
  revalidateTag('catalog');
  revalidateTag('products');
  revalidateTag('categories');
  revalidateTag('brands');
}

// ---------------------------------------------------------------- products

export async function createProductAction(input: unknown): Promise<ActionResult<AdminProduct>> {
  return withAdmin(async (token) => {
    const body = ProductCreateSchema.parse(input);
    const product = await adminApi.createProduct(token, body);
    revalidateCatalog();
    revalidatePath('/admin/products');
    return product;
  });
}

export async function updateProductAction(
  id: string,
  input: unknown,
): Promise<ActionResult<AdminProduct>> {
  return withAdmin(async (token) => {
    const body = ProductUpdateSchema.parse(input);
    const product = await adminApi.updateProduct(token, id, body);
    revalidateCatalog();
    revalidatePath('/admin/products');
    revalidatePath(`/admin/products/${id}`);
    revalidateTag(`product:${product.slug}`);
    return product;
  });
}

export async function deleteProductAction(id: string): Promise<ActionResult> {
  return withAdmin(async (token) => {
    await adminApi.deleteProduct(token, id);
    revalidateCatalog();
    revalidatePath('/admin/products');
    return undefined;
  });
}

// ---------------------------------------------------------------- images

export async function presignImageAction(input: unknown): Promise<ActionResult<PresignResponse>> {
  return withAdmin(async (token) => {
    const body = PresignRequestSchema.parse(input);
    return adminApi.presignUpload(token, body);
  });
}

export async function attachProductImageAction(
  productId: string,
  input: unknown,
): Promise<ActionResult<AdminProduct>> {
  return withAdmin(async (token) => {
    const body = ProductImageCreateSchema.parse(input);
    const product = await adminApi.addProductImage(token, productId, body);
    revalidateCatalog();
    revalidatePath(`/admin/products/${productId}`);
    revalidateTag(`product:${product.slug}`);
    return product;
  });
}

export async function deleteProductImageAction(
  productId: string,
  imageId: string,
): Promise<ActionResult<AdminProduct>> {
  return withAdmin(async (token) => {
    const product = await adminApi.deleteProductImage(token, productId, imageId);
    revalidateCatalog();
    revalidatePath(`/admin/products/${productId}`);
    revalidateTag(`product:${product.slug}`);
    return product;
  });
}

export async function reorderProductImagesAction(
  productId: string,
  order: { id: string; position: number }[],
  primaryId?: string,
): Promise<ActionResult<AdminProduct>> {
  return withAdmin(async (token) => {
    const product = await adminApi.reorderProductImages(token, productId, {
      order,
      ...(primaryId ? { primaryId } : {}),
    });
    revalidateCatalog();
    revalidatePath(`/admin/products/${productId}`);
    revalidateTag(`product:${product.slug}`);
    return product;
  });
}

// ---------------------------------------------------------------- categories

export async function createCategoryAction(input: unknown): Promise<ActionResult<AdminCategory>> {
  return withAdmin(async (token) => {
    const body = CategoryCreateSchema.parse(input);
    const category = await adminApi.createCategory(token, body);
    revalidateCatalog();
    revalidatePath('/admin/categories');
    return category;
  });
}

export async function updateCategoryAction(
  id: string,
  input: unknown,
): Promise<ActionResult<AdminCategory>> {
  return withAdmin(async (token) => {
    const body = CategoryUpdateSchema.parse(input);
    const category = await adminApi.updateCategory(token, id, body);
    revalidateCatalog();
    revalidatePath('/admin/categories');
    return category;
  });
}

export async function deleteCategoryAction(id: string): Promise<ActionResult> {
  return withAdmin(async (token) => {
    await adminApi.deleteCategory(token, id);
    revalidateCatalog();
    revalidatePath('/admin/categories');
    return undefined;
  });
}

// ---------------------------------------------------------------- brands

export async function createBrandAction(input: unknown): Promise<ActionResult<AdminBrand>> {
  return withAdmin(async (token) => {
    const body = BrandCreateSchema.parse(input);
    const brand = await adminApi.createBrand(token, body);
    revalidateCatalog();
    revalidatePath('/admin/brands');
    return brand;
  });
}

export async function updateBrandAction(id: string, input: unknown): Promise<ActionResult<AdminBrand>> {
  return withAdmin(async (token) => {
    const body = BrandUpdateSchema.parse(input);
    const brand = await adminApi.updateBrand(token, id, body);
    revalidateCatalog();
    revalidatePath('/admin/brands');
    return brand;
  });
}

export async function deleteBrandAction(id: string): Promise<ActionResult> {
  return withAdmin(async (token) => {
    await adminApi.deleteBrand(token, id);
    revalidateCatalog();
    revalidatePath('/admin/brands');
    return undefined;
  });
}

// ---------------------------------------------------------------- orders

export async function updateOrderStatusAction(
  orderNumber: string,
  input: unknown,
): Promise<ActionResult<AdminOrder>> {
  return withAdmin(async (token) => {
    const body = OrderStatusUpdateSchema.parse(input);
    const order = await adminApi.updateOrderStatus(token, orderNumber, {
      status: body.status,
      ...(body.message ? { message: body.message } : {}),
    });
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderNumber}`);
    return order;
  });
}

export async function assignDriverAction(
  orderNumber: string,
  driverId: string | null,
): Promise<ActionResult<AdminOrder>> {
  return withAdmin(async (token) => {
    const order = await adminApi.assignDriver(token, orderNumber, driverId);
    revalidatePath('/admin/orders');
    revalidatePath(`/admin/orders/${orderNumber}`);
    return order;
  });
}
