import 'server-only';
import { api, qs } from '@/lib/api/client';
import type { AccountOrderList } from '@/lib/api/types';

/**
 * Authenticated order history for the signed-in user. Always uncached — the
 * per-user JWT is short-lived and the result is private to one account.
 */
export async function getMyOrders(token: string, cursor?: string): Promise<AccountOrderList> {
  return api.get<AccountOrderList>(`/account/orders${qs({ cursor })}`, {
    token,
    cache: 'no-store',
  });
}
