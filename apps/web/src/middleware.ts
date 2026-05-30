import NextAuth from 'next-auth';
import { authConfig } from '@/features/auth/auth.config';

// Edge middleware: validates the JWT session (no DB) and redirects anonymous
// users away from protected routes. Role enforcement for /admin happens in the
// server component (requireAdmin) where the DB-backed role is authoritative.
export const { auth: middleware } = NextAuth(authConfig);

export const config = {
  matcher: ['/account/:path*', '/admin/:path*'],
};
