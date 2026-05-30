'use client';

import { Check } from 'lucide-react';
import { useUiStore } from '@/features/chrome/ui-store';

export function Toaster() {
  const toasts = useUiStore((s) => s.toasts);
  const dismiss = useUiStore((s) => s.dismissToast);

  if (toasts.length === 0) return null;

  return (
    <div className="toast-wrap" role="status" aria-live="polite">
      {toasts.map((t) => (
        <button
          type="button"
          key={t.id}
          className="toast"
          onClick={() => dismiss(t.id)}
          style={{ pointerEvents: 'auto', border: 'none', cursor: 'pointer' }}
        >
          <Check className="ic" aria-hidden />
          {t.message}
        </button>
      ))}
    </div>
  );
}
