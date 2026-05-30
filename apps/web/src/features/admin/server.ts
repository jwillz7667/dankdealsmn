import 'server-only';
import { getApiToken, requireAdmin } from '@/features/auth/server';

/**
 * Server-component helper: enforces the ADMIN role and returns a short-lived
 * API token for the page's data fetches. `requireAdmin` redirects non-admins,
 * so a token is always available past this point.
 */
export async function getAdminToken(): Promise<string> {
  await requireAdmin();
  const token = await getApiToken();
  if (!token) throw new Error('Admin session is missing — unable to authenticate API request.');
  return token;
}
