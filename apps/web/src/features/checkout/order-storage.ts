'use client';

/**
 * Persists the stateless tracking tokens issued at checkout so a guest can
 * reopen the confirmation/tracking page without re-authenticating. Tokens are
 * capability grants scoped to a single order number — stored locally only.
 */

const TOKENS_KEY = 'dd_order_tokens';
const LAST_ORDER_KEY = 'dd_last_order';

type TokenMap = Record<string, string>;

function readMap(): TokenMap {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(TOKENS_KEY);
    if (!raw) return {};
    const parsed: unknown = JSON.parse(raw);
    return typeof parsed === 'object' && parsed !== null ? (parsed as TokenMap) : {};
  } catch {
    return {};
  }
}

export function rememberOrderToken(orderNumber: string, token: string): void {
  if (typeof window === 'undefined') return;
  const map = readMap();
  map[orderNumber] = token;
  try {
    window.localStorage.setItem(TOKENS_KEY, JSON.stringify(map));
    window.localStorage.setItem(LAST_ORDER_KEY, orderNumber);
  } catch {
    // Storage may be unavailable (private mode); tracking still works via the
    // ?token= URL the user is redirected to.
  }
}

export function getOrderToken(orderNumber: string): string | null {
  return readMap()[orderNumber] ?? null;
}

export function getLastOrderNumber(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return window.localStorage.getItem(LAST_ORDER_KEY);
  } catch {
    return null;
  }
}
