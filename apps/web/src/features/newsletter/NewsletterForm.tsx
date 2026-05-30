'use client';

import { useState } from 'react';
import { api, ApiError } from '@/lib/api/client';
import { useUiStore } from '@/features/chrome/ui-store';

type Status = 'idle' | 'loading' | 'done';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const toast = useUiStore((s) => s.toast);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'loading') return;
    setStatus('loading');
    api
      .post('/newsletter', { email })
      .then(() => {
        setStatus('done');
        setEmail('');
        toast('Subscribed! Check your inbox 📬');
      })
      .catch((err: unknown) => {
        setStatus('idle');
        const message =
          err instanceof ApiError ? err.message : 'Something went wrong — please try again.';
        toast(message);
      });
  };

  if (status === 'done') {
    return (
      <p className="muted" style={{ marginTop: 18, fontWeight: 600 }}>
        You&apos;re on the list — watch your inbox for drops. 📬
      </p>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate>
      <input
        className="input"
        type="email"
        placeholder="you@email.com"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        aria-label="Email address"
        disabled={status === 'loading'}
      />
      <button className="btn" type="submit" disabled={status === 'loading'}>
        {status === 'loading' ? 'Subscribing…' : 'Subscribe'}
      </button>
    </form>
  );
}
