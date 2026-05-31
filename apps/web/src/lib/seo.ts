import { SITE } from '@/lib/site';
import type { Product } from '@/lib/api/types';

type JsonLdNode = Record<string, unknown>;

function abs(path: string): string {
  if (path.startsWith('http')) return path;
  return `${SITE.url}${path.startsWith('/') ? '' : '/'}${path}`;
}

// Storewide trading hours — mirrors the "10am–10pm, seven days a week" copy.
const OPENING_HOURS: JsonLdNode = {
  '@type': 'OpeningHoursSpecification',
  dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
  opens: '10:00',
  closes: '22:00',
};

const TWITTER_URL = `https://twitter.com/${SITE.twitter.replace(/^@/, '')}`;

/** Build schema.org City Place nodes for an areaServed list. */
function cityPlaces(names: readonly string[]): JsonLdNode[] {
  return names.map((name) => ({ '@type': 'City', name: `${name}, MN` }));
}

/**
 * Organization + Store identity, used site-wide on the home page. Pass the
 * served-city names to expand `areaServed` into explicit City places (better
 * local-SEO signal than the single metro string).
 */
export function organizationJsonLd(areaServedNames?: readonly string[]): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': ['Organization', 'Store'],
    '@id': `${SITE.url}/#organization`,
    name: SITE.legalName,
    alternateName: SITE.name,
    url: SITE.url,
    logo: abs('/brand/logo.png'),
    image: abs('/brand/logo.png'),
    description: SITE.description,
    telephone: SITE.supportPhone,
    email: 'support@dankdealsmn.com',
    priceRange: '$$',
    currenciesAccepted: 'USD',
    paymentAccepted: 'Cash, Debit Card',
    openingHoursSpecification: OPENING_HOURS,
    areaServed:
      areaServedNames && areaServedNames.length > 0
        ? cityPlaces(areaServedNames)
        : SITE.serviceArea,
    sameAs: [TWITTER_URL],
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

/**
 * Per-city LocalBusiness node for a /delivery/{slug} landing page. `areaServed`
 * is scoped to the single city so Google ties the page to that locality; the
 * business itself references the site-wide organization @id.
 */
export function localBusinessJsonLd(city: { name: string; county: string; slug: string }): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': ['Store', 'LocalBusiness'],
    '@id': `${SITE.url}/delivery/${city.slug}#business`,
    name: `${SITE.name} — Cannabis Delivery in ${city.name}, MN`,
    parentOrganization: { '@id': `${SITE.url}/#organization` },
    url: abs(`/delivery/${city.slug}`),
    logo: abs('/brand/logo.png'),
    image: abs('/brand/logo.png'),
    description: `Licensed, lab-tested cannabis delivery in ${city.name}, ${city.county}, Minnesota — to your door in 60–90 minutes.`,
    telephone: SITE.supportPhone,
    priceRange: '$$',
    currenciesAccepted: 'USD',
    paymentAccepted: 'Cash, Debit Card',
    openingHoursSpecification: OPENING_HOURS,
    areaServed: { '@type': 'City', name: `${city.name}, MN` },
    address: {
      '@type': 'PostalAddress',
      addressRegion: 'MN',
      addressCountry: 'US',
      addressLocality: city.name,
    },
  };
}

/**
 * Service node describing cannabis delivery. Used on the /delivery hub (all
 * cities) and each city page (single city) to mark up the offered service.
 */
export function serviceJsonLd(opts: { areaServedNames: readonly string[]; path: string }): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Cannabis delivery',
    name: 'Same-day cannabis delivery',
    url: abs(opts.path),
    provider: { '@id': `${SITE.url}/#organization` },
    areaServed: cityPlaces(opts.areaServedNames),
    availableChannel: {
      '@type': 'ServiceChannel',
      serviceUrl: abs('/shop'),
      servicePhone: SITE.supportPhone,
    },
  };
}

/** ItemList for the /delivery hub, linking out to every city landing page. */
export function itemListJsonLd(items: { name: string; path: string }[]): JsonLdNode {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      url: abs(item.path),
    })),
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
