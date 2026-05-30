import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

// Private, transactional, and PII-bearing surfaces stay out of the index.
// These mirror the per-page `robots: noindex` directives so crawlers are blocked
// at both the directory and page level.
const DISALLOW = ['/cart', '/checkout', '/order/', '/account', '/api/', '/auth/'];

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: DISALLOW,
      },
    ],
    sitemap: `${SITE.url}/sitemap.xml`,
    host: SITE.url,
  };
}
