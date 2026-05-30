import 'server-only';
import { redirect } from 'next/navigation';
import type { Session } from 'next-auth';
import { auth } from './nextauth';
import { isAdminRole } from './roles';

type SessionUser = Session['user'];

/** Current user or null — for optional personalization in server components. */
export async function getCurrentUser(): Promise<SessionUser | null> {
  const session = await auth();
  return session?.user ?? null;
}

/** Require a signed-in user; redirect to sign-in (preserving destination) otherwise. */
export async function requireUser(callbackUrl = '/account'): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  return user;
}

/** Require an ADMIN; redirect anonymous users to sign-in and non-admins home. */
export async function requireAdmin(callbackUrl = '/admin'): Promise<SessionUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/signin?callbackUrl=${encodeURIComponent(callbackUrl)}`);
  if (!isAdminRole(user.role)) redirect('/');
  return user;
}
