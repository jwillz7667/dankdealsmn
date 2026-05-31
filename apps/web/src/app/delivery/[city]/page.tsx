import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Truck, BadgeCheck, Clock, Wallet, MapPin, ShieldCheck } from 'lucide-react';
import { JsonLd } from '@/components/JsonLd';
import { ProductRail } from '@/features/catalog/components/ProductGrid';
import { getProducts } from '@/features/catalog/api';
import { getStoreConfig } from '@/features/store/api';
import { CITY_SLUGS, getCity, otherCities } from '@/features/delivery';
import { money } from '@/lib/format';
import { SITE } from '@/lib/site';
import {
  breadcrumbJsonLd,
  faqPageJsonLd,
  localBusinessJsonLd,
  serviceJsonLd,
} from '@/lib/seo';

// City copy is static; product rails refresh via their own catalog ISR tags.
export const revalidate = 3600;
// Only the 14 served cities are valid — any other slug is a real 404.
export const dynamicParams = false;

interface CityPageProps {
  params: Promise<{ city: string }>;
}

export function generateStaticParams(): { city: string }[] {
  return CITY_SLUGS.map((city) => ({ city }));
}

export async function generateMetadata({ params }: CityPageProps): Promise<Metadata> {
  const { city: slug } = await params;
  const city = getCity(slug);
  if (!city) return { title: 'Area not found' };

  return {
    // metaTitle already carries the brand, so bypass the "%s · DankDeals" template.
    title: { absolute: city.metaTitle },
    description: city.metaDescription,
    alternates: { canonical: `/delivery/${city.slug}` },
    openGraph: {
      type: 'website',
      title: city.metaTitle,
      description: city.metaDescription,
      url: `/delivery/${city.slug}`,
    },
    twitter: {
      title: city.metaTitle,
      description: city.metaDescription,
    },
  };
}

export default async function CityDeliveryPage({ params }: CityPageProps) {
  const { city: slug } = await params;
  const city = getCity(slug);
  if (!city) notFound();

  const [best, deals, store] = await Promise.all([
    getProducts({ badge: 'BEST', sort: 'rating', limit: 8 }),
    getProducts({ badge: 'DEAL', sort: 'featured', limit: 8 }),
    getStoreConfig(),
  ]);

  const siblings = otherCities(city.slug);

  const facts = [
    { Icon: Truck, label: 'Delivery fee', value: `${money(store.deliveryFeeCents)} flat` },
    {
      Icon: BadgeCheck,
      label: 'Free delivery',
      value: `Over ${money(store.freeDeliveryThresholdCents)}`,
    },
    { Icon: Wallet, label: 'Order minimum', value: money(store.minOrderCents) },
    { Icon: Clock, label: 'Typical ETA', value: '60–90 min' },
    { Icon: MapPin, label: 'Hours', value: '10am–10pm daily' },
    { Icon: ShieldCheck, label: 'Payment', value: 'Cash or debit' },
  ] as const;

  const breadcrumb = [
    { name: 'Home', path: '/' },
    { name: 'Delivery areas', path: '/delivery' },
    { name: city.name, path: `/delivery/${city.slug}` },
  ];

  return (
    <div className="wrap section">
      <JsonLd
        data={[
          localBusinessJsonLd(city),
          serviceJsonLd({ areaServedNames: [city.name], path: `/delivery/${city.slug}` }),
          breadcrumbJsonLd(breadcrumb),
          faqPageJsonLd(city.faqs),
        ]}
      />

      <nav className="crumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link> / <Link href="/delivery">Delivery areas</Link> /{' '}
        <span>{city.name}</span>
      </nav>

      <header className="page-head">
        <span className="eyebrow">Now serving {city.county}</span>
        <h1>Cannabis Delivery in {city.name}, MN</h1>
        <p>{city.heroSubtitle}</p>
        <div className="row gap-8" style={{ marginTop: 16, flexWrap: 'wrap' }}>
          <Link className="btn btn--lg" href="/shop">
            Shop the menu
          </Link>
          <a className="btn btn--ghost btn--lg" href={`tel:${SITE.supportPhone.replace(/[^\d+]/g, '')}`}>
            Call {SITE.supportPhone}
          </a>
        </div>
      </header>

      {/* Delivery facts pulled live from store settings */}
      <div className="trust" style={{ margin: '8px 0 28px' }}>
        {facts.map((f) => (
          <div className="trust__item" key={f.label}>
            <span className="ic">
              <f.Icon aria-hidden />
            </span>
            <b>{f.value}</b>
            <span>{f.label}</span>
          </div>
        ))}
      </div>

      <div className="prose">
        {city.intro.map((para, i) => (
          <p key={i}>{para}</p>
        ))}

        <h2>Why order from DankDeals in {city.name}</h2>
        <ul>
          {city.highlights.map((h) => (
            <li key={h}>{h}</li>
          ))}
        </ul>
      </div>

      {best.items.length > 0 && (
        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="sec-head">
            <div>
              <span className="eyebrow">Popular in {city.name}</span>
              <h2>Best sellers</h2>
            </div>
            <Link className="link" href="/shop">
              Shop all →
            </Link>
          </div>
          <ProductRail products={best.items} />
        </section>
      )}

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="sec-head">
          <div>
            <span className="eyebrow">Neighborhoods</span>
            <h2>Where we deliver in {city.name}</h2>
          </div>
        </div>
        <div className="row gap-8" style={{ flexWrap: 'wrap' }}>
          {city.neighborhoods.map((n) => (
            <span className="chip" key={n}>
              {n}
            </span>
          ))}
        </div>
        <p className="muted" style={{ marginTop: 12, maxWidth: '60ch' }}>
          Don&apos;t see your block? Enter your address at checkout — if you&apos;re inside our{' '}
          {city.name} delivery zone, you&apos;re good to go.
        </p>
      </section>

      {deals.items.length > 0 && (
        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="sec-head">
            <div>
              <span className="eyebrow">Today&apos;s deals</span>
              <h2>Save in {city.name}</h2>
            </div>
            <Link className="link" href="/shop?badge=DEAL">
              All deals →
            </Link>
          </div>
          <ProductRail products={deals.items} />
        </section>
      )}

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="sec-head">
          <div>
            <span className="eyebrow">Good to know</span>
            <h2>{city.name} delivery FAQ</h2>
          </div>
        </div>
        <div className="prose">
          {city.faqs.map((f) => (
            <div key={f.question} style={{ marginBottom: 18 }}>
              <h3 style={{ marginBottom: 6 }}>{f.question}</h3>
              <p style={{ margin: 0 }}>{f.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section" style={{ paddingBottom: 0 }}>
        <div className="sec-head">
          <div>
            <span className="eyebrow">More areas</span>
            <h2>We also deliver nearby</h2>
          </div>
          <Link className="link" href="/delivery">
            All delivery areas →
          </Link>
        </div>
        <div className="row gap-8" style={{ flexWrap: 'wrap' }}>
          {siblings.map((c) => (
            <Link className="chip" key={c.slug} href={`/delivery/${c.slug}`}>
              {c.name}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
