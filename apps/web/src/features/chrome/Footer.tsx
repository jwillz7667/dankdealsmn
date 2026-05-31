import Link from 'next/link';
import Image from 'next/image';
import { Phone } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { CITIES } from '@/features/delivery';
import { FDA_DISCLAIMER, SITE } from '@/lib/site';
import type { Category } from '@/lib/api/types';

const COMPANY_LINKS = [
  { label: 'How it works', href: '/#how' },
  { label: 'About us', href: '/about' },
  { label: 'Contact', href: '/contact' },
] as const;

// Sitewide internal links to the highest-intent city pages; the rest live on
// the /delivery hub, which every column links to.
const FOOTER_CITIES = CITIES.slice(0, 8);

const SUPPORT_LINKS = [
  { label: 'FAQ', href: '/faq' },
  { label: 'My account', href: '/account' },
  { label: 'Privacy', href: '/privacy' },
  { label: 'Terms', href: '/terms' },
] as const;

export function Footer({
  categories,
  supportPhone,
  year,
}: {
  categories: Category[];
  supportPhone: string | null;
  year: number;
}) {
  const phone = supportPhone ?? SITE.supportPhone;

  return (
    <footer className="ftr">
      <div className="wrap ftr__top">
        <div className="ftr__brand">
          <div className="brandrow">
            <Image src="/brand/car.png" className="car" alt="" width={59} height={34} style={{ height: 34, width: 'auto' }} />
            <Logo href={null} tone="invert" height={22} />
          </div>
          <p style={{ maxWidth: 300, color: '#aab4a3', fontSize: '.92rem' }}>
            Fast, licensed cannabis delivery across Minneapolis, St. Paul and the greater metro. Lab-tested products at
            your door in under 90 minutes.
          </p>
          <div className="row gap-8" style={{ marginTop: 16 }}>
            <a
              className="chip"
              href={`tel:${phone.replace(/[^\d+]/g, '')}`}
              style={{ background: 'rgba(255,255,255,.08)', borderColor: 'rgba(255,255,255,.16)', color: '#fff' }}
            >
              <Phone className="ic" aria-hidden /> {phone}
            </a>
          </div>
        </div>

        <div>
          <h4>Shop</h4>
          <ul>
            {categories.slice(0, 6).map((c) => (
              <li key={c.id}>
                <Link href={`/shop?category=${c.slug}`}>{c.name}</Link>
              </li>
            ))}
            <li>
              <Link href="/shop?badge=DEAL">Today&apos;s Deals</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4>Company</h4>
          <ul>
            {COMPANY_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4>Delivery areas</h4>
          <ul>
            {FOOTER_CITIES.map((c) => (
              <li key={c.slug}>
                <Link href={`/delivery/${c.slug}`}>{c.name}</Link>
              </li>
            ))}
            <li>
              <Link href="/delivery">All areas →</Link>
            </li>
          </ul>
        </div>

        <div>
          <h4>Support</h4>
          <ul>
            {SUPPORT_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href}>{l.label}</Link>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="wrap">
        <div className="ftr__legal">⚠️ {FDA_DISCLAIMER}</div>
      </div>

      <div className="wrap ftr__bottom">
        <span>© {year} {SITE.legalName}. All rights reserved.</span>
        <span className="row gap-16">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms">Terms</Link>
          <Link href="/accessibility">Accessibility</Link>
        </span>
      </div>
    </footer>
  );
}
