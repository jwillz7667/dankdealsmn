'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { Product } from '@/lib/api/types';

/** Display-only snapshot. Authoritative prices are always recomputed server-side. */
export interface CartItem {
  productId: string;
  slug: string;
  name: string;
  brand: string | null;
  size: string;
  priceCents: number;
  image: string | null;
  qty: number;
}

interface CartState {
  items: Record<string, CartItem>;
  add: (product: Product, qty?: number) => void;
  setQty: (productId: string, qty: number) => void;
  remove: (productId: string) => void;
  clear: () => void;
}

const noopStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const useCartStore = create<CartState>()(
  persist(
    (set) => ({
      items: {},
      add: (product, qty = 1) =>
        set((state) => {
          const existing = state.items[product.id];
          const nextQty = Math.min(99, (existing?.qty ?? 0) + qty);
          const snapshot: CartItem = {
            productId: product.id,
            slug: product.slug,
            name: product.name,
            brand: product.brand?.name ?? null,
            size: product.size,
            priceCents: product.priceCents,
            image: product.images[0]?.url ?? null,
            qty: nextQty,
          };
          return { items: { ...state.items, [product.id]: snapshot } };
        }),
      setQty: (productId, qty) =>
        set((state) => {
          const existing = state.items[productId];
          if (!existing) return state;
          if (qty <= 0) {
            const next = { ...state.items };
            delete next[productId];
            return { items: next };
          }
          return {
            items: { ...state.items, [productId]: { ...existing, qty: Math.min(99, qty) } },
          };
        }),
      remove: (productId) =>
        set((state) => {
          const next = { ...state.items };
          delete next[productId];
          return { items: next };
        }),
      clear: () => set({ items: {} }),
    }),
    {
      name: 'dd_cart',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.localStorage : noopStorage,
      ),
      version: 1,
    },
  ),
);

// ---- derived selectors ----
export const cartItemList = (s: CartState): CartItem[] =>
  Object.values(s.items).sort((a, b) => a.name.localeCompare(b.name));

export const cartCount = (s: CartState): number =>
  Object.values(s.items).reduce((n, i) => n + i.qty, 0);

export const cartSubtotalCents = (s: CartState): number =>
  Object.values(s.items).reduce((n, i) => n + i.priceCents * i.qty, 0);
