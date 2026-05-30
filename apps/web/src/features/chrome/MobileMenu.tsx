'use client';

import Link from 'next/link';
import { X, Home, Leaf, ChevronRight, Tag, Truck, MapPin, User, LogIn } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { Logo } from '@/components/Logo';
import { CategoryIcon } from '@/components/CategoryIcon';
import type { Category } from '@/lib/api/types';
import { useUiStore } from '@/features/chrome/ui-store';

export function MobileMenu({ categories }: { categories: Category[] }) {
  const isOpen = useUiStore((s) => s.overlay === 'menu');
  const close = useUiStore((s) => s.closeOverlay);
  const { status } = useSession();
  const signedIn = status === 'authenticated';

  return (
    <div className={`mmenu${isOpen ? ' open' : ''}`} aria-hidden={!isOpen}>
      <div className="mmenu__scrim" onClick={close} />
      <nav className="mmenu__panel" aria-label="Mobile">
        <div className="between" style={{ marginBottom: 10 }}>
          <Logo href={null} height={22} />
          <button type="button" className="icon-btn" onClick={close} aria-label="Close menu">
            <X aria-hidden />
          </button>
        </div>

        <Link className="chip" href="/#area" onClick={close} style={{ alignSelf: 'flex-start', margin: '6px 0 10px' }}>
          <MapPin className="ic" aria-hidden />
          <span>Deliver to Minneapolis–St. Paul</span>
        </Link>

        <Link className="mlink" href="/" onClick={close}>
          <span className="row gap-12">
            <Home className="ic" aria-hidden /> Home
          </span>
          <span />
        </Link>
        <Link className="mlink" href="/shop" onClick={close}>
          <span className="row gap-12">
            <Leaf className="ic" aria-hidden /> Shop all
          </span>
          <ChevronRight aria-hidden />
        </Link>
        <Link className="mlink" href={signedIn ? '/account' : '/signin'} onClick={close}>
          <span className="row gap-12">
            {signedIn ? <User className="ic" aria-hidden /> : <LogIn className="ic" aria-hidden />}
            {signedIn ? 'Your account' : 'Sign in'}
          </span>
          <ChevronRight aria-hidden />
        </Link>

        <div
          style={{
            font: '700 .72rem/1 var(--font-display)',
            letterSpacing: '.14em',
            textTransform: 'uppercase',
            color: 'var(--muted)',
            padding: '16px 6px 8px',
          }}
        >
          Categories
        </div>
        {categories.map((c) => (
          <Link
            key={c.id}
            className="mlink"
            href={`/shop?category=${c.slug}`}
            onClick={close}
            style={{ fontSize: '1rem', padding: '12px 6px' }}
          >
            <span className="row gap-12" style={{ color: 'var(--green)' }}>
              <CategoryIcon iconKey={c.iconKey} size={20} />
              <span style={{ color: 'var(--ink)' }}>{c.name}</span>
            </span>
            <ChevronRight aria-hidden />
          </Link>
        ))}

        <Link className="mlink" href="/shop?badge=DEAL" onClick={close}>
          <span className="row gap-12">
            <Tag className="ic" aria-hidden /> Today&apos;s deals
          </span>
          <ChevronRight aria-hidden />
        </Link>
        <Link className="mlink" href="/#how" onClick={close}>
          <span className="row gap-12">
            <Truck className="ic" aria-hidden /> How it works
          </span>
          <span />
        </Link>

        <div style={{ marginTop: 'auto', paddingTop: 18 }}>
          <Link className="btn btn--block" href="/shop" onClick={close}>
            Start shopping
          </Link>
        </div>
      </nav>
    </div>
  );
}
