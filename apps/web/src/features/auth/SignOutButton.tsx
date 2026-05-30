'use client';

import { useState } from 'react';
import { LogOut } from 'lucide-react';
import { signOut } from 'next-auth/react';

interface SignOutButtonProps {
  className?: string;
  label?: string;
}

export function SignOutButton({ className = 'btn btn--ghost', label = 'Sign out' }: SignOutButtonProps) {
  const [pending, setPending] = useState(false);

  return (
    <button
      type="button"
      className={className}
      disabled={pending}
      onClick={() => {
        setPending(true);
        void signOut({ callbackUrl: '/' });
      }}
    >
      <LogOut aria-hidden /> {pending ? 'Signing out…' : label}
    </button>
  );
}
