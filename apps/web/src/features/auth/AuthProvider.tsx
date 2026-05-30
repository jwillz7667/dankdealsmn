'use client';

import { SessionProvider } from 'next-auth/react';

/** Client boundary that exposes the Auth.js session via `useSession()`.
 *  Wraps the app without forcing dynamic rendering on static/ISR pages. */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <SessionProvider>{children}</SessionProvider>;
}
