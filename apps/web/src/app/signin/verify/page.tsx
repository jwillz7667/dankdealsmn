import type { Metadata } from 'next';
import Link from 'next/link';
import { MailCheck } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Check your email',
  description: 'A sign-in link is on its way.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/signin/verify' },
};

export default function VerifyRequestPage() {
  return (
    <div className="authwrap">
      <div className="authcard" style={{ textAlign: 'center' }}>
        <div className="authicon" aria-hidden>
          <MailCheck />
        </div>
        <h1>Check your email</h1>
        <p className="muted">
          We sent a secure sign-in link to your inbox. Open it on this device to finish signing in. The
          link expires in 24 hours and can be used once.
        </p>
        <p className="authfine">
          Didn&apos;t get it? Check spam, or{' '}
          <Link href="/signin" className="link">
            request a new link
          </Link>
          . You must be 21 or older to order.
        </p>
      </div>
    </div>
  );
}
