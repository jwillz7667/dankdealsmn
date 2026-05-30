'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

interface FavoritesState {
  ids: string[];
  toggle: (productId: string) => boolean; // returns the new saved state
  has: (productId: string) => boolean;
}

const noopStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const useFavoritesStore = create<FavoritesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (productId) => {
        const has = get().ids.includes(productId);
        set((s) => ({
          ids: has ? s.ids.filter((id) => id !== productId) : [...s.ids, productId],
        }));
        return !has;
      },
      has: (productId) => get().ids.includes(productId),
    }),
    {
      name: 'dd_favorites',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.localStorage : noopStorage,
      ),
      version: 1,
    },
  ),
);
