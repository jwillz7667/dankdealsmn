'use client';

import Link from 'next/link';
import { User } from 'lucide-react';
import { useSession } from 'next-auth/react';

/**
 * Header account affordance. Reads the client session so static/ISR pages stay
 * cacheable — the icon links to the account hub when signed in, sign-in
 * otherwise. The `status` check avoids a flash of the wrong destination during
 * the brief session-fetch on first paint.
 */
export function AccountButton() {
  const { status } = useSession();
  const signedIn = status === 'authenticated';

  return (
    <Link
      className="icon-btn"
      href={signedIn ? '/account' : '/signin'}
      aria-label={signedIn ? 'Your account' : 'Sign in'}
      data-state={status}
    >
      <User aria-hidden />
    </Link>
  );
}
