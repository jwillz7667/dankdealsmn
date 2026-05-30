'use client';

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/**
 * The applied promo code, persisted to sessionStorage so it carries from the
 * cart into checkout but doesn't linger across browser sessions. Validity is
 * always decided server-side by /cart/quote — this only holds the raw input.
 */
interface PromoState {
  code: string;
  setCode: (code: string) => void;
  clear: () => void;
}

const noopStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined,
};

export const usePromoStore = create<PromoState>()(
  persist(
    (set) => ({
      code: '',
      setCode: (code) => set({ code: code.trim() }),
      clear: () => set({ code: '' }),
    }),
    {
      name: 'dd_promo',
      storage: createJSONStorage(() =>
        typeof window !== 'undefined' ? window.sessionStorage : noopStorage,
      ),
      version: 1,
    },
  ),
);
