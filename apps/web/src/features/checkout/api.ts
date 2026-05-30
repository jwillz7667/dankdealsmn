import { api } from '@/lib/api/client';
import type {
  CreateOrderRequest,
  CreateOrderResponse,
  Order,
  QuoteRequest,
  QuoteResult,
} from '@/lib/api/types';

/**
 * Storefront checkout calls. These run in the browser (client components) and
 * hit the public, server-authoritative endpoints — totals, stock, promo
 * validity and the 21+ gate are all re-checked on the API. The client never
 * trusts its own cart snapshot for money.
 */

/** Server-authoritative price quote. Promo failures are reported inline, not thrown. */
export function quoteCart(body: QuoteRequest, signal?: AbortSignal): Promise<QuoteResult> {
  return api.post<QuoteResult>('/cart/quote', body, { signal });
}

/** Places the order. Throws ApiError (422/409) when stock, zone or min-order rules fail. */
export function placeOrder(body: CreateOrderRequest): Promise<CreateOrderResponse> {
  return api.post<CreateOrderResponse>('/orders', body);
}

/**
 * Reads a single order for tracking. Access is granted by the stateless
 * tracking token issued at checkout (or an authenticated owner/admin session).
 */
export function getOrder(orderNumber: string, token?: string): Promise<Order> {
  const query = token ? `?token=${encodeURIComponent(token)}` : '';
  return api.get<Order>(`/orders/${encodeURIComponent(orderNumber)}${query}`);
}
