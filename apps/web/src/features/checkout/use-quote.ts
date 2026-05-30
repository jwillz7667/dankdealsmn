'use client';

import { useEffect, useRef, useState } from 'react';
import { ApiError } from '@/lib/api/client';
import type { CartItemInput, QuoteResult } from '@/lib/api/types';
import { quoteCart } from './api';

interface UseQuoteArgs {
  items: CartItemInput[];
  promoCode: string;
  tipCents: number;
  enabled: boolean;
}

interface UseQuoteResult {
  quote: QuoteResult | null;
  loading: boolean;
  /** Set when the whole quote fails (network / unavailable items), not for promo issues. */
  error: string | null;
}

const DEBOUNCE_MS = 350;

/**
 * Debounced, race-safe wrapper around POST /cart/quote. Re-quotes whenever the
 * cart contents, promo code or tip change. The previous in-flight request is
 * aborted so the last input always wins.
 */
export function useQuote({ items, promoCode, tipCents, enabled }: UseQuoteArgs): UseQuoteResult {
  const [quote, setQuote] = useState<QuoteResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Stable signature so the effect only re-runs on a real change.
  const key = JSON.stringify({ items, promoCode, tipCents, enabled });
  const latest = useRef(key);
  latest.current = key;

  useEffect(() => {
    if (!enabled || items.length === 0) {
      setQuote(null);
      setLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const requestKey = key;
    setLoading(true);

    const timer = setTimeout(() => {
      void (async () => {
        try {
          const result = await quoteCart(
            { items, promoCode: promoCode || undefined, tipCents },
            controller.signal,
          );
          if (latest.current !== requestKey) return;
          setQuote(result);
          setError(null);
        } catch (err) {
          if (controller.signal.aborted || latest.current !== requestKey) return;
          setError(err instanceof ApiError ? err.message : 'Could not load your cart total.');
        } finally {
          if (latest.current === requestKey) setLoading(false);
        }
      })();
    }, DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
    // `key` encodes every input; listing it alone keeps the effect honest.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  return { quote, loading, error };
}
