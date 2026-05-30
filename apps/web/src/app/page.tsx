import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Leaf, ShoppingCart, Truck, ShieldCheck, Zap, Lock, Tag } from 'lucide-react';
import { CategoryIcon } from '@/components/CategoryIcon';
import { JsonLd } from '@/components/JsonLd';
import { ProductRail } from '@/features/catalog/components/ProductGrid';
import { NewsletterForm } from '@/features/newsletter/NewsletterForm';
import { getCategories, getProducts } from '@/features/catalog/api';
import { getStoreConfig } from '@/features/store/api';
import { organizationJsonLd, webSiteJsonLd } from '@/lib/seo';

export const revalidate = 300;

const STEPS = [
  { Icon: Leaf, title: 'Browse the menu', body: 'Explore lab-tested flower, edibles, vapes and more from trusted Minnesota brands.' },
  { Icon: ShoppingCart, title: 'Place your order', body: 'Add to cart, verify your ID once, and check out in under a minute. $30 minimum.' },
  { Icon: Truck, title: 'We deliver — fast', body: 'A discreet DankDeals driver brings it to your door in 60–90 minutes. Track every step.' },
] as const;

const TRUST = [
  { Icon: ShieldCheck, title: 'Lab-tested & legal', body: 'Every product is third-party tested and fully compliant with Minnesota law.' },
  { Icon: Zap, title: 'Lightning fast', body: 'Most orders arrive within 60–90 minutes, seven days a week.' },
  { Icon: Lock, title: 'Discreet delivery', body: 'Unmarked vehicles and smell-proof, sealed packaging. Always private.' },
  { Icon: Tag, title: 'Honest pricing', body: 'Fair, transparent prices and daily deals — no surprise fees at the door.' },
] as const;

export default async function HomePage() {
  const [categories, best, deals, store] = await Promise.all([
    getCategories(),
    getProducts({ badge: 'BEST', sort: 'rating', limit: 8 }),
    getProducts({ badge: 'DEAL', sort: 'featured', limit: 8 }),
    getStoreConfig(),
  ]);

  return (
    <>
      <JsonLd data={[organizationJsonLd(), webSiteJsonLd()]} />

      {/* Hero */}
      <section className="hero">
        <div className="wrap hero__in">
          <div className="stack gap-16">
            <span className="badge badge--soft" style={{ alignSelf: 'flex-start', padding: '7px 13px' }}>
              ⚡ Same-day delivery · 60–90 min
            </span>
            <h1>
              Cannabis,
              <br />
              <em>delivered.</em>
            </h1>
            <p className="lead">
              Premium, lab-tested flower, edibles, vapes &amp; more — brought to your door across the Twin Cities &amp;
              metro.
            </p>
            <div className="hero__cta">
              <Link className="btn btn--lg" href="/shop">
                Shop products
                <ArrowRight aria-hidden />
              </Link>
              <Link className="btn btn--ghost btn--lg" href="/#how">
                How it works
              </Link>
            </div>
            <div className="hero__stats">
              <div>
                <b>14+</b>
                <span>Metro cities</span>
              </div>
              <div>
                <b>
                  60–90<small style={{ fontSize: '.7rem' }}> min</small>
                </b>
                <span>Avg. delivery</span>
              </div>
              <div>
                <b>100%</b>
                <span>Lab-tested</span>
              </div>
            </div>
          </div>

          <div className="hero__visual">
            <div className="hero__img">
              <Image
                src="/brand/car.png"
                alt="DankDeals delivery car"
                width={1001}
                height={572}
                priority
                sizes="(min-width: 760px) 45vw, 100vw"
                style={{ width: '88%', height: 'auto', objectFit: 'contain' }}
              />
            </div>
            <div className="hero__float">
              <span className="dot">
                <Truck aria-hidden />
              </span>
              <span>
                <b>On the way</b>
                <span>Arriving in 72 min</span>
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Browse</span>
              <h2>Shop by category</h2>
            </div>
            <Link className="link" href="/shop">
              View all →
            </Link>
          </div>
          <div className="cats">
            {categories.map((c) => (
              <Link className="catcard" key={c.id} href={`/shop?category=${c.slug}`}>
                <span className="ico">
                  <CategoryIcon iconKey={c.iconKey} size={26} />
                </span>
                <b>{c.name}</b>
                <span>{c.blurb ?? 'Shop the collection'}</span>
                <span className="go">
                  Shop <ChevronRight aria-hidden />
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Best sellers */}
      {best.items.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="wrap">
            <div className="sec-head">
              <div>
                <span className="eyebrow">Crowd favorites</span>
                <h2>Best sellers</h2>
              </div>
              <Link className="link" href="/shop">
                Shop all →
              </Link>
            </div>
            <ProductRail products={best.items} />
          </div>
        </section>
      )}

      {/* Deals */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="dealbar">
            <Image src="/brand/car.png" className="car" alt="" width={300} height={172} />
            <div>
              <span className="eyebrow" style={{ color: 'var(--green-200)' }}>
                Today only
              </span>
              <h2 style={{ margin: '6px 0 8px' }}>
                Fresh <em>deals</em>, dropped daily.
              </h2>
              <p style={{ color: '#aab4a3', maxWidth: '46ch' }}>
                Save on staff-picked flower, carts and edibles — restocked every morning. Use code{' '}
                <b style={{ color: '#fff' }}>DANK15</b> for 15% off your first order.
              </p>
            </div>
            <Link className="btn btn--lg" href="/shop?badge=DEAL">
              See all deals
            </Link>
          </div>
          {deals.items.length > 0 && (
            <div style={{ marginTop: 18 }}>
              <ProductRail products={deals.items} />
            </div>
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="section" id="how" style={{ background: 'var(--surface)', scrollMarginTop: 80 }}>
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Easy as it gets</span>
              <h2>How it works</h2>
            </div>
          </div>
          <div className="steps">
            {STEPS.map((s, i) => (
              <div className="step" key={s.title}>
                <div className="step__n">
                  {i + 1}
                  <span className="ic">
                    <s.Icon aria-hidden />
                  </span>
                </div>
                <div>
                  <h3>{s.title}</h3>
                  <p>{s.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust */}
      <section className="section">
        <div className="wrap">
          <div className="sec-head">
            <div>
              <span className="eyebrow">Why DankDeals</span>
              <h2>Delivery done right</h2>
            </div>
          </div>
          <div className="trust">
            {TRUST.map((t) => (
              <div className="trust__item" key={t.title}>
                <span className="ic">
                  <t.Icon aria-hidden />
                </span>
                <b>{t.title}</b>
                <span>{t.body}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Delivery area */}
      <section className="section" id="area" style={{ paddingTop: 0, scrollMarginTop: 80 }}>
        <div className="wrap">
          <div className="area">
            <span className="eyebrow" style={{ color: 'var(--green-200)' }}>
              Now serving
            </span>
            <h2>Delivering across the Twin Cities &amp; metro</h2>
            <p style={{ color: '#aab4a3', maxWidth: '50ch' }}>
              Enter your address at checkout to confirm coverage. We deliver 10am–10pm, seven days a week — rain, shine
              or snow.
            </p>
            <div className="area__zones">
              {store.zones.map((z, i) => (
                <span key={z} className={i < 2 ? 'on' : undefined}>
                  {z}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="wrap">
          <div className="news">
            <span className="eyebrow">Stay lit on deals</span>
            <h2>Get drops in your inbox</h2>
            <p className="muted">New strains, weekly deals and delivery perks. No spam, just DankDeals.</p>
            <NewsletterForm />
          </div>
        </div>
      </section>
    </>
  );
}
