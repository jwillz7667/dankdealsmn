import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, MapPin, Truck, BadgeCheck, Clock, Wallet, ShieldCheck } from 'lucide-react';
import { JsonLd } from '@/components/JsonLd';
import { ProductRail } from '@/features/catalog/components/ProductGrid';
import { getProducts } from '@/features/catalog/api';
import { getStoreConfig } from '@/features/store/api';
import { CITIES, CITY_NAMES, cityPath } from '@/features/delivery';
import { money } from '@/lib/format';
import { breadcrumbJsonLd, itemListJsonLd, serviceJsonLd } from '@/lib/seo';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Cannabis Delivery Areas',
  description:
    'See where DankDeals delivers cannabis across the Twin Cities metro — Minneapolis, St. Paul, Bloomington, Edina and 10 more cities. Lab-tested products to your door in 60–90 minutes. 21+.',
  alternates: { canonical: '/delivery' },
  openGraph: {
    type: 'website',
    title: 'Cannabis Delivery Areas · DankDeals',
    description:
      'Where DankDeals delivers cannabis across the Twin Cities metro — 14 cities, lab-tested products, 60–90 minute delivery.',
    url: '/delivery',
  },
};

export default async function DeliveryHubPage() {
  const [best, store] = await Promise.all([
    getProducts({ badge: 'BEST', sort: 'rating', limit: 8 }),
    getStoreConfig(),
  ]);

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
  ];

  return (
    <div className="wrap section">
      <JsonLd
        data={[
          serviceJsonLd({ areaServedNames: CITY_NAMES, path: '/delivery' }),
          itemListJsonLd(CITIES.map((c) => ({ name: c.name, path: cityPath(c.slug) }))),
          breadcrumbJsonLd(breadcrumb),
        ]}
      />

      <nav className="crumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link> / <span>Delivery areas</span>
      </nav>

      <header className="page-head">
        <span className="eyebrow">Now serving the Twin Cities &amp; metro</span>
        <h1>Cannabis delivery areas</h1>
        <p>
          DankDeals delivers lab-tested flower, edibles and vapes to {CITIES.length} cities across the
          Minneapolis–St. Paul metro — usually in 60–90 minutes, seven days a week. Pick your city for
          local delivery details, or just enter your address at checkout to confirm coverage.
        </p>
        <div className="row gap-8" style={{ marginTop: 16, flexWrap: 'wrap' }}>
          <Link className="btn btn--lg" href="/shop">
            Shop the menu
          </Link>
        </div>
      </header>

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

      <section className="section" style={{ paddingTop: 0, paddingBottom: 0 }}>
        <div className="sec-head">
          <div>
            <span className="eyebrow">Choose your city</span>
            <h2>Where we deliver</h2>
          </div>
        </div>
        <div className="cats">
          {CITIES.map((c) => (
            <Link className="catcard" key={c.slug} href={cityPath(c.slug)}>
              <span className="ico">
                <MapPin size={26} aria-hidden />
              </span>
              <b>{c.name}</b>
              <span>{c.county}</span>
              <span className="go">
                Delivery in {c.name} <ChevronRight aria-hidden />
              </span>
            </Link>
          ))}
        </div>
      </section>

      {best.items.length > 0 && (
        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="sec-head">
            <div>
              <span className="eyebrow">Metro-wide favorites</span>
              <h2>Best sellers</h2>
            </div>
            <Link className="link" href="/shop">
              Shop all →
            </Link>
          </div>
          <ProductRail products={best.items} />
        </section>
      )}
    </div>
  );
}
