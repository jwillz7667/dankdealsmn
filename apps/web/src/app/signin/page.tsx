import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SignInForm } from '@/features/auth';
import { auth } from '@/features/auth/server';
import { isEmailAuthEnabled, isGoogleAuthEnabled } from '@/lib/env';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to track orders and check out faster at DankDeals.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/signin' },
};

interface SignInPageProps {
  searchParams: Promise<{ callbackUrl?: string; error?: string }>;
}

/**
 * Resolve the post-login destination to a SAFE same-origin path.
 * Accepts a relative path, or an absolute URL whose origin matches the site —
 * the Auth.js middleware redirects protected routes to /signin with an
 * absolute callbackUrl (e.g. https://dankdealsmn.com/admin), which must round
 * back to that path after login. Anything cross-origin, protocol-relative, or
 * malformed falls back to /account so the callback can't become an open redirect.
 */
function safeCallback(raw: string | undefined): string {
  if (!raw) return '/account';
  if (raw.startsWith('/') && !raw.startsWith('//') && !raw.startsWith('/\\')) return raw;
  try {
    const url = new URL(raw);
    if (url.origin === new URL(SITE.url).origin) return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    // Not a parseable absolute URL — fall through to the safe default.
  }
  return '/account';
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { callbackUrl, error } = await searchParams;
  const target = safeCallback(callbackUrl);

  const session = await auth();
  if (session?.user) redirect(target);

  return (
    <div className="authwrap">
      <SignInForm
        callbackUrl={target}
        googleEnabled={isGoogleAuthEnabled}
        emailEnabled={isEmailAuthEnabled}
        error={error}
      />
    </div>
  );
}
