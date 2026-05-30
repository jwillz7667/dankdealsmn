import { SITE } from '@/lib/site';
import type { Product } from '@/lib/api/types';

type JsonLdNode = Record<string, unknown>;

function abs(path: string): string {
  if (path.startsWith('http')) return path;
  return `${SITE.url}${path.startsWith('/') ? '' : '/'}${path}`;
}

/** Organization + LocalBusiness identity, used site-wide on the home page. */
export function organizationJsonLd(): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'Store'],
    '@id': `${SITE.url}/#organization`,
    name: SITE.legalName,
    alternateName: SITE.name,
    url: SITE.url,
    description: SITE.description,
    telephone: SITE.supportPhone,
    areaServed: SITE.serviceArea,
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'MN',
      addressCountry: 'US',
      addressLocality: 'Minneapolis',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: SITE.geo.latitude,
      longitude: SITE.geo.longitude,
    },
  };
}

/** WebSite node with SearchAction so Google can surface a sitelinks search box. */
export function webSiteJsonLd(): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE.url}/#website`,
    url: SITE.url,
    name: SITE.name,
    description: SITE.description,
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE.url}/shop?search={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: abs(item.path),
    })),
  };
}

export function faqPageJsonLd(items: { question: string; answer: string }[]): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: { '@type': 'Answer', text: item.answer },
    })),
  };
}

export function productJsonLd(product: Product): JsonLdNode {
  const images = product.images.map((img) => abs(img.url));
  const node: JsonLdNode = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.shortDescription ?? product.description,
    sku: product.id,
    category: product.category.name,
    ...(images.length > 0 ? { image: images } : {}),
    ...(product.brand ? { brand: { '@type': 'Brand', name: product.brand.name } } : {}),
    offers: {
      '@type': 'Offer',
      url: abs(`/product/${product.slug}`),
      priceCurrency: 'USD',
      price: (product.priceCents / 100).toFixed(2),
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: { '@type': 'Organization', name: SITE.legalName },
    },
  };
  if (product.ratingCount > 0) {
    node.aggregateRating = {
      '@type': 'AggregateRating',
      ratingValue: product.ratingAvg.toFixed(1),
      reviewCount: product.ratingCount,
    };
  }
  return node;
}
