'use client';

import { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { parseShopFilters, type ShopFilters } from '@/features/catalog/shop-filters';

export function useShopNav(): {
  filters: ShopFilters;
  setParams: (updates: Record<string, string | number | null>) => void;
} {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const filters = parseShopFilters(Object.fromEntries(searchParams.entries()));

  const setParams = useCallback(
    (updates: Record<string, string | number | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      for (const [key, value] of Object.entries(updates)) {
        if (value === null || value === '') params.delete(key);
        else params.set(key, String(value));
      }
      const queryString = params.toString();
      router.push(queryString ? `${pathname}?${queryString}` : pathname, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  return { filters, setParams };
}
