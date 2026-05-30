import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Truck } from 'lucide-react';
import { JsonLd } from '@/components/JsonLd';
import { Stars } from '@/components/Stars';
import { ProductGallery } from '@/features/catalog/components/ProductGallery';
import { ProductBuy } from '@/features/catalog/components/ProductBuy';
import { ProductRail } from '@/features/catalog/components/ProductGrid';
import { getProduct, getProductReviews, getRelatedProducts } from '@/features/catalog/api';
import { formatDateTime, money, potency, strainLabel } from '@/lib/format';
import { breadcrumbJsonLd, productJsonLd } from '@/lib/seo';

export const revalidate = 300;

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) return { title: 'Product not found' };

  const description = product.shortDescription ?? product.description.slice(0, 160);
  const images = product.images.map((img) => img.url);
  return {
    title: product.name,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      type: 'website',
      title: product.name,
      description,
      url: `/product/${product.slug}`,
      ...(images.length > 0 ? { images } : {}),
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProduct(slug);
  if (!product) notFound();

  const [related, reviews] = await Promise.all([getRelatedProducts(slug, 8), getProductReviews(slug)]);

  const thc = potency(product.thc);
  const cbd = potency(product.cbd);
  const save = product.compareAtCents && product.compareAtCents > product.priceCents
    ? product.compareAtCents - product.priceCents
    : 0;

  const breadcrumb = [
    { name: 'Home', path: '/' },
    { name: product.category.name, path: `/shop?category=${product.category.slug}` },
    { name: product.name, path: `/product/${product.slug}` },
  ];

  return (
    <div className="wrap section has-buybar">
      <JsonLd data={[productJsonLd(product), breadcrumbJsonLd(breadcrumb)]} />

      <nav className="crumb" aria-label="Breadcrumb">
        <Link href="/">Home</Link> /{' '}
        <Link href={`/shop?category=${product.category.slug}`}>{product.category.name}</Link> /{' '}
        <span>{product.name}</span>
      </nav>

      <div className="pdetail">
        <ProductGallery images={product.images} name={product.name} />

        <div className="pinfo">
          {product.brand && <div className="pinfo__brand">{product.brand.name}</div>}
          <h1>{product.name}</h1>

          {product.ratingCount > 0 && (
            <div className="row gap-8" style={{ margin: '6px 0' }}>
              <Stars rating={product.ratingAvg} />
              <span className="muted" style={{ fontSize: '.9rem' }}>
                {product.ratingAvg.toFixed(1)} · {product.ratingCount} reviews
              </span>
            </div>
          )}

          <div className="peffects" style={{ margin: '12px 0' }}>
            {product.badges.map((b) => (
              <span key={b} className={`badge badge--${b.toLowerCase()}`}>
                {b === 'BEST' ? 'Best seller' : b.charAt(0) + b.slice(1).toLowerCase()}
              </span>
            ))}
            <span className="badge badge--type">{strainLabel(product.strainType)}</span>
            <span className="badge badge--type">{product.size}</span>
          </div>

          <div className="pstats">
            {thc && (
              <div className="pstat">
                <b>{thc}</b>
                <span>THC</span>
              </div>
            )}
            {cbd && (
              <div className="pstat">
                <b>{cbd}</b>
                <span>CBD</span>
              </div>
            )}
            <div className="pstat">
              <b>{product.size}</b>
              <span>Size</span>
            </div>
          </div>

          <div className="pinfo__price">
            <span className="price">{money(product.priceCents)}</span>
            {save > 0 && product.compareAtCents && (
              <>
                <s>{money(product.compareAtCents)}</s>
                <span className="badge badge--deal" style={{ marginLeft: 8 }}>
                  Save {money(save)}
                </span>
              </>
            )}
          </div>

          <ProductBuy product={product} />

          {product.effects.length > 0 && (
            <>
              <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', margin: '20px 0 10px' }}>Effects</h4>
              <div className="peffects">
                {product.effects.map((e) => (
                  <span key={e} className="badge badge--soft">
                    {e}
                  </span>
                ))}
              </div>
            </>
          )}

          <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1rem', margin: '22px 0 6px' }}>
            About this product
          </h4>
          <p className="pdesc">{product.description}</p>

          <div className="pspecs">
            {product.brand && (
              <div className="pspecs__row">
                <span>Brand</span>
                <b>{product.brand.name}</b>
              </div>
            )}
            <div className="pspecs__row">
              <span>Category</span>
              <b>{product.category.name}</b>
            </div>
            <div className="pspecs__row">
              <span>Strain type</span>
              <b>{strainLabel(product.strainType)}</b>
            </div>
            <div className="pspecs__row">
              <span>Size</span>
              <b>{product.size}</b>
            </div>
            <div className="pspecs__row">
              <span>Lab tested</span>
              <b style={{ color: 'var(--green-700)' }}>✓ Verified</b>
            </div>
          </div>

          <div className="pnote">
            <Truck className="ic" aria-hidden />
            <span>
              Order in the next few hours for <b>same-day delivery</b> — most Twin Cities orders arrive in 60–90
              minutes.
            </span>
          </div>
        </div>
      </div>

      {reviews.items.length > 0 && (
        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="sec-head">
            <div>
              <span className="eyebrow">Verified buyers</span>
              <h2>Reviews ({reviews.total})</h2>
            </div>
          </div>
          <div>
            {reviews.items.map((r) => (
              <div className="review" key={r.id}>
                <div className="review__head">
                  <span className="review__author">{r.authorName}</span>
                  <Stars rating={r.rating} />
                </div>
                {r.title && <b>{r.title}</b>}
                {r.body && <p className="muted" style={{ marginTop: 4 }}>{r.body}</p>}
                <span className="muted" style={{ fontSize: '.8rem' }}>
                  {formatDateTime(r.createdAt)}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      {related.length > 0 && (
        <section className="section" style={{ paddingBottom: 0 }}>
          <div className="sec-head">
            <div>
              <span className="eyebrow">You might also like</span>
              <h2>Related products</h2>
            </div>
          </div>
          <ProductRail products={related} />
        </section>
      )}
    </div>
  );
}
