'use client';

import { usePathname } from 'next/navigation';

interface StorefrontFrameProps {
  header: React.ReactNode;
  footer: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Renders the public store chrome (header + footer) around page content, but
 * omits it under /admin, which ships its own full-bleed dashboard shell. Kept
 * client-side so the root layout stays static/ISR-friendly — `usePathname` is
 * resolved during SSR, so there's no hydration flash.
 */
export function StorefrontFrame({ header, footer, children }: StorefrontFrameProps) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin') ?? false;

  if (isAdmin) {
    return <main id="content">{children}</main>;
  }

  return (
    <>
      {header}
      <main id="content">{children}</main>
      {footer}
    </>
  );
}
