'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, Search, ShoppingCart, MapPin, Truck } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { NAV_LINKS } from '@/lib/site';
import { cartCount, useCartStore } from '@/features/cart/store';
import { useUiStore } from '@/features/chrome/ui-store';
import { useHydrated } from '@/lib/use-hydrated';
import { AccountButton } from '@/features/auth';

function isActive(pathname: string, href: string): boolean {
  if (href === '/shop') return pathname === '/shop';
  if (href.startsWith('/#')) return false; // anchors never mark active
  return pathname === href;
}

export function Header({ announcement }: { announcement: string | null }) {
  const pathname = usePathname();
  const hydrated = useHydrated();
  const count = useCartStore(cartCount);
  const openMenu = useUiStore((s) => s.openMenu);
  const openCart = useUiStore((s) => s.openCart);
  const openSearch = useUiStore((s) => s.openSearch);

  // Avoid hydration mismatch: persisted cart is only known after mount.
  const shownCount = hydrated ? count : 0;

  return (
    <>
      <div className="delstrip">
        <div className="wrap delstrip__in">
          <Truck className="ic" aria-hidden />
          <span>{announcement ?? 'Free delivery over $75 · Twin Cities & metro · 60–90 min'}</span>
        </div>
      </div>

      <header className="hdr">
        <div className="wrap">
          <div className="hdr__bar">
            <div className="hdr__left row gap-8">
              <button type="button" className="icon-btn mobile-only" onClick={openMenu} aria-label="Open menu">
                <Menu aria-hidden />
              </button>
              <Logo className="hdr__logo hide-mobile" height={22} priority />
            </div>

            <div className="hdr__center">
              <Logo className="hdr__logo mobile-only" height={20} priority />
              <nav className="hdr__nav" aria-label="Primary">
                {NAV_LINKS.map((n) => (
                  <Link key={n.id} href={n.href} className={isActive(pathname, n.href) ? 'active' : undefined}>
                    {n.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="hdr__right row gap-4">
              <Link className="chip hide-mobile" href="/#area" style={{ marginRight: 4 }}>
                <MapPin className="ic" aria-hidden />
                <span>Minneapolis</span>
              </Link>
              <button type="button" className="icon-btn hide-mobile" onClick={openSearch} aria-label="Search">
                <Search aria-hidden />
              </button>
              <button type="button" className="icon-btn mobile-only" onClick={openSearch} aria-label="Search">
                <Search aria-hidden />
              </button>
              <AccountButton />
              <button type="button" className="icon-btn" onClick={openCart} aria-label={`Cart, ${shownCount} items`}>
                <ShoppingCart aria-hidden />
                <span className="cart-count" data-n={shownCount}>
                  {shownCount}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
