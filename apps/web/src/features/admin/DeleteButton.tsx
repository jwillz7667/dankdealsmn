'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Loader2 } from 'lucide-react';
import type { ActionResult } from './types';

interface DeleteButtonProps {
  /** Server action bound to the entity id. */
  action: (id: string) => Promise<ActionResult<unknown>>;
  id: string;
  /** What we're deleting, for the confirm copy (e.g. "product"). */
  noun?: string;
  /** Navigate here after a successful delete instead of refreshing in place. */
  redirectTo?: string;
  className?: string;
}

export function DeleteButton({
  action,
  id,
  noun = 'item',
  redirectTo,
  className = 'btn btn--ghost btn--sm',
}: DeleteButtonProps) {
  const router = useRouter();
  const [confirming, setConfirming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function run() {
    setError(null);
    startTransition(async () => {
      const result = await action(id);
      if (result.ok) {
        if (redirectTo) router.push(redirectTo);
        else router.refresh();
      } else {
        setError(result.error);
        setConfirming(false);
      }
    });
  }

  if (confirming) {
    return (
      <span className="delconfirm">
        <button type="button" className="btn btn--danger btn--sm" onClick={run} disabled={pending}>
          {pending ? <Loader2 className="ic spin" aria-hidden /> : null}
          Confirm
        </button>
        <button
          type="button"
          className="btn btn--ghost btn--sm"
          onClick={() => setConfirming(false)}
          disabled={pending}
        >
          Cancel
        </button>
      </span>
    );
  }

  return (
    <span className="delwrap">
      <button
        type="button"
        className={className}
        onClick={() => setConfirming(true)}
        aria-label={`Delete ${noun}`}
      >
        <Trash2 className="ic" aria-hidden /> Delete
      </button>
      {error && (
        <span className="delerror" role="alert">
          {error}
        </span>
      )}
    </span>
  );
}
