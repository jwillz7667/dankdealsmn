'use client';

import { create } from 'zustand';

export interface Toast {
  id: number;
  message: string;
}

type Overlay = 'menu' | 'cart' | 'search' | null;

interface UiState {
  overlay: Overlay;
  toasts: Toast[];
  openMenu: () => void;
  openCart: () => void;
  openSearch: () => void;
  closeOverlay: () => void;
  toast: (message: string) => void;
  dismissToast: (id: number) => void;
}

let toastSeq = 0;

export const useUiStore = create<UiState>((set) => ({
  overlay: null,
  toasts: [],
  openMenu: () => set({ overlay: 'menu' }),
  openCart: () => set({ overlay: 'cart' }),
  openSearch: () => set({ overlay: 'search' }),
  closeOverlay: () => set({ overlay: null }),
  toast: (message) => {
    toastSeq += 1;
    const id = toastSeq;
    set((s) => ({ toasts: [...s.toasts, { id, message }] }));
    setTimeout(() => {
      set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }));
    }, 2800);
    return;
  },
  dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
}));
