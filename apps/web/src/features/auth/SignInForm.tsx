'use client';

import { useState } from 'react';
import { Mail, Loader2 } from 'lucide-react';
import { signIn } from 'next-auth/react';

const ERROR_MESSAGES: Record<string, string> = {
  OAuthAccountNotLinked: 'That email is already linked to a different sign-in method. Use the original method.',
  AccessDenied: 'Access was denied. Please try again.',
  Verification: 'That sign-in link has expired or was already used. Request a new one.',
  Configuration: 'Sign-in is temporarily unavailable. Please try again later.',
};

interface SignInFormProps {
  callbackUrl: string;
  /** Whether the magic-link (email) provider is configured. */
  emailEnabled: boolean;
  error?: string;
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden focusable="false">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.81.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.34A9 9 0 0 0 9 18Z"
      />
      <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.01-2.34Z" />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.01 2.34C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  );
}

export function SignInForm({ callbackUrl, emailEnabled, error }: SignInFormProps) {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState<'google' | 'email' | null>(null);

  const errorText = error ? (ERROR_MESSAGES[error] ?? 'Something went wrong. Please try again.') : null;

  function handleGoogle() {
    setBusy('google');
    void signIn('google', { callbackUrl });
  }

  function handleEmail(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email.trim()) return;
    setBusy('email');
    // Auth.js redirects to /signin/verify on success (pages.verifyRequest).
    void signIn('resend', { email: email.trim(), callbackUrl });
  }

  return (
    <div className="authcard">
      <h1>Sign in</h1>
      <p className="muted">Welcome back. Sign in to track orders and check out faster.</p>

      {errorText && (
        <div className="infonote infonote--warn" role="alert" style={{ marginTop: 4 }}>
          <span>{errorText}</span>
        </div>
      )}

      <button type="button" className="btn btn--block btn--google" onClick={handleGoogle} disabled={busy !== null}>
        {busy === 'google' ? <Loader2 className="ic spin" aria-hidden /> : <GoogleGlyph />}
        Continue with Google
      </button>

      {emailEnabled && (
        <>
          <div className="or">
            <span>or</span>
          </div>

          <form onSubmit={handleEmail} className="stack gap-8" noValidate>
            <label className="authlabel" htmlFor="email">
              Email address
            </label>
            <input
              id="email"
              className="input"
              type="email"
              name="email"
              autoComplete="email"
              inputMode="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={busy !== null}
            />
            <button type="submit" className="btn btn--block" disabled={busy !== null || !email.trim()}>
              {busy === 'email' ? <Loader2 className="ic spin" aria-hidden /> : <Mail className="ic" aria-hidden />}
              Email me a sign-in link
            </button>
          </form>
        </>
      )}

      <p className="authfine">
        By continuing you agree to our terms and confirm you are 21 or older. We&apos;ll never share your email.
      </p>
    </div>
  );
}
