import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Edge guard for protected routes. This is intentionally a *presence* check, not
// a JWT validation: the Auth.js edge decoder and the Node decoder ship from
// different @auth/core builds in this Next/next-auth combo and disagree on the
// same cookie, which produced a /signin <-> /account redirect loop for logged-in
// users (Node saw the session, the edge did not). The authoritative auth + role
// check runs in the Node server components (requireUser / requireAdmin), where
// the JWT is decoded and the DB-backed role is read. Here we only fast-redirect
// genuinely anonymous visitors (no session cookie at all) for a snappier UX.
//
// Auth.js names the session cookie `authjs.session-token`, prefixed with
// `__Secure-` on HTTPS and split into `.0`, `.1`, … chunks when large.
const SESSION_COOKIE = /^(__Secure-|__Host-)?authjs\.session-token(\.\d+)?$/;

export function middleware(req: NextRequest): NextResponse {
  const hasSession = req.cookies.getAll().some((cookie) => SESSION_COOKIE.test(cookie.name));
  if (hasSession) return NextResponse.next();

  const signInUrl = new URL('/signin', req.url);
  signInUrl.searchParams.set('callbackUrl', `${req.nextUrl.pathname}${req.nextUrl.search}`);
  return NextResponse.redirect(signInUrl);
}

export const config = {
  matcher: ['/account/:path*', '/admin/:path*'],
};
