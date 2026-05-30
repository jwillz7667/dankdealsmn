import type { Metadata, Viewport } from 'next';
import { Archivo, Hanken_Grotesk } from 'next/font/google';
import './globals.css';
import { SITE } from '@/lib/site';
import { SiteChrome, Footer, StorefrontFrame } from '@/features/chrome';
import { AuthProvider } from '@/features/auth';
import { getCategories } from '@/features/catalog/api';
import { getStoreConfig } from '@/features/store/api';

const archivo = Archivo({ subsets: ['latin'], variable: '--font-archivo', display: 'swap' });
const hanken = Hanken_Grotesk({ subsets: ['latin'], variable: '--font-hanken', display: 'swap' });

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s · ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  keywords: [
    'cannabis delivery',
    'weed delivery Minneapolis',
    'marijuana delivery St. Paul',
    'Twin Cities cannabis',
    'THC edibles delivery',
    'same-day cannabis delivery Minnesota',
  ],
  authors: [{ name: SITE.legalName }],
  creator: SITE.legalName,
  publisher: SITE.legalName,
  alternates: { canonical: '/' },
  category: 'shopping',
  formatDetection: { telephone: true, address: false, email: false },
  openGraph: {
    type: 'website',
    locale: SITE.locale,
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  twitter: {
    card: 'summary_large_image',
    site: SITE.twitter,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
  },
  // Favicon (app/favicon.ico + app/icon.png) and Apple touch icon (app/apple-icon.png) are
  // wired automatically via file conventions; the social card comes from app/opengraph-image.tsx.
};

export const viewport: Viewport = {
  themeColor: '#3b9322',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const [categories, store] = await Promise.all([getCategories(), getStoreConfig()]);
  const year = new Date().getFullYear();

  return (
    <html lang="en" className={`${archivo.variable} ${hanken.variable}`}>
      <body>
        <a href="#content" className="skip-link">
          Skip to content
        </a>

        <AuthProvider>
          <StorefrontFrame
            header={
              <SiteChrome
                announcement={store.announcement}
                categories={categories}
                deliveryFeeCents={store.deliveryFeeCents}
                freeDeliveryThresholdCents={store.freeDeliveryThresholdCents}
              />
            }
            footer={<Footer categories={categories} supportPhone={store.supportPhone} year={year} />}
          >
            {children}
          </StorefrontFrame>
        </AuthProvider>
      </body>
    </html>
  );
}
