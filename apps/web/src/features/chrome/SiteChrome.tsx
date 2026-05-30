'use client';

import { useEffect } from 'react';
import { Header } from '@/features/chrome/Header';
import { MobileMenu } from '@/features/chrome/MobileMenu';
import { CartDrawer } from '@/features/chrome/CartDrawer';
import { SearchOverlay } from '@/features/chrome/SearchOverlay';
import { Toaster } from '@/features/chrome/Toaster';
import { AgeGate } from '@/features/chrome/AgeGate';
import type { Category } from '@/lib/api/types';
import { useUiStore } from '@/features/chrome/ui-store';

interface SiteChromeProps {
  announcement: string | null;
  categories: Category[];
  deliveryFeeCents: number;
  freeDeliveryThresholdCents: number;
}

export function SiteChrome({
  announcement,
  categories,
  deliveryFeeCents,
  freeDeliveryThresholdCents,
}: SiteChromeProps) {
  const overlay = useUiStore((s) => s.overlay);
  const close = useUiStore((s) => s.closeOverlay);

  // Escape closes any open overlay.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [close]);

  // Lock body scroll while a slide-in overlay is open.
  useEffect(() => {
    document.documentElement.style.overflow = overlay ? 'hidden' : '';
    return () => {
      document.documentElement.style.overflow = '';
    };
  }, [overlay]);

  return (
    <>
      <Header announcement={announcement} />
      <MobileMenu categories={categories} />
      <CartDrawer deliveryFeeCents={deliveryFeeCents} freeDeliveryThresholdCents={freeDeliveryThresholdCents} />
      <SearchOverlay />
      <Toaster />
      <AgeGate />
    </>
  );
}
