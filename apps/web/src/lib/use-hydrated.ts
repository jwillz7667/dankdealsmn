'use client';

import { useEffect, useState } from 'react';

/**
 * True only after the first client render. Use to gate UI that depends on
 * localStorage-persisted state (e.g. the cart) so SSR markup and the first
 * client paint match and React doesn't warn about hydration mismatches.
 */
export function useHydrated(): boolean {
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  return hydrated;
}
