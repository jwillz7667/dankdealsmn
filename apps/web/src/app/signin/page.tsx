import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SignInForm } from '@/features/auth';
import { auth } from '@/features/auth/server';
import { isEmailAuthEnabled } from '@/lib/env';

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
 * Only allow same-origin relative destinations — never an absolute or
 * protocol-relative URL — so the callback can't be used as an open redirect.
 */
function safeCallback(raw: string | undefined): string {
  if (!raw) return '/account';
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return '/account';
  return raw;
}

export default async function SignInPage({ searchParams }: SignInPageProps) {
  const { callbackUrl, error } = await searchParams;
  const target = safeCallback(callbackUrl);

  const session = await auth();
  if (session?.user) redirect(target);

  return (
    <div className="authwrap">
      <SignInForm callbackUrl={target} emailEnabled={isEmailAuthEnabled} error={error} />
    </div>
  );
}
