// @ts-check

import path from 'node:path';
import { fileURLToPath } from 'node:url';

const appDir = path.dirname(fileURLToPath(import.meta.url));
// Prisma's query-engine binary is copied into apps/web/.prisma/client by
// scripts/copy-prisma-engine.mjs; trace it into the serverless functions that
// run the Auth.js Prisma adapter or direct Prisma queries. Next's file-tracer
// can't follow Prisma's runtime (dynamic) engine load on its own.
const prismaEngine = ['./.prisma/client/*.node'];

/**
 * Resolve hosts that the app is allowed to talk to / load media from.
 * Values come from env so the same config works in dev, preview and prod.
 */
// Production defaults: the API runs on Railway behind the custom domain
// api.dankdealsmn.com; media is served from the Cloudflare R2 CDN domain.
const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'https://api.dankdealsmn.com';
const mediaUrl = process.env.NEXT_PUBLIC_MEDIA_BASE_URL || 'https://media.dankdealsmn.com';
const isDev = process.env.NODE_ENV !== 'production';

const safeHost = (url) => {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
};
const mediaHost = safeHost(mediaUrl);

/**
 * Content-Security-Policy. We keep style-src/inline permissive (Next injects
 * inline styles + our design tokens) but lock script/connect/frame down to the
 * origins we actually use. connect-src includes the API so client fetches work.
 */
const csp = [
  `default-src 'self'`,
  `base-uri 'self'`,
  `object-src 'none'`,
  `frame-ancestors 'none'`,
  `form-action 'self'`,
  `img-src 'self' data: blob: https:`,
  `font-src 'self' https://fonts.gstatic.com data:`,
  `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com`,
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ''}`,
  `connect-src 'self' ${apiUrl}${isDev ? ' ws: http://localhost:*' : ''}`,
  `upgrade-insecure-requests`,
]
  .filter(Boolean)
  .join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()' },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  // Trace from the monorepo root so bundled files keep their repo-relative paths.
  outputFileTracingRoot: path.join(appDir, '..', '..'),
  // Ship the Prisma engine into every function that touches the database.
  outputFileTracingIncludes: {
    '/api/**': prismaEngine,
    '/admin': prismaEngine,
    '/admin/**': prismaEngine,
    '/account': prismaEngine,
    '/account/**': prismaEngine,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      ...(mediaHost ? [{ protocol: 'https', hostname: mediaHost }] : []),
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: '**.r2.cloudflarestorage.com' },
    ],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
};

export default nextConfig;
