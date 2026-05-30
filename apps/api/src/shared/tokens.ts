import { createHmac, timingSafeEqual } from 'node:crypto';

/**
 * Stateless tracking token for guest order lookup: HMAC(orderNumber).
 * No DB column needed — returned at creation, verified on read.
 */
export function orderTrackingToken(orderNumber: string, secret: string): string {
  return createHmac('sha256', secret).update(`order:${orderNumber}`).digest('base64url');
}

export function verifyTrackingToken(orderNumber: string, token: string, secret: string): boolean {
  const expected = orderTrackingToken(orderNumber, secret);
  const a = Buffer.from(expected);
  const b = Buffer.from(token);
  return a.length === b.length && timingSafeEqual(a, b);
}
