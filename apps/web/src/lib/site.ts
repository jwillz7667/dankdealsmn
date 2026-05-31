/** Canonical site constants. Single source of truth for SEO + chrome. */
export const SITE = {
  name: 'DankDeals',
  legalName: 'DankDeals MN',
  tagline: 'Cannabis Delivered in the Twin Cities',
  description:
    'Premium, lab-tested cannabis delivered across Minneapolis, St. Paul & the greater Twin Cities metro in 60–90 minutes. Flower, edibles, vapes, concentrates & more.',
  url: process.env.NEXT_PUBLIC_SITE_URL ?? 'https://dankdealsmn.com',
  locale: 'en_US',
  twitter: '@dankdealsmn',
  supportPhone: '(612) 930-1390',
  licenseNumber: 'MN-CAN-0421',
  serviceArea: 'Minneapolis–St. Paul, Minnesota',
  geo: { latitude: 44.9778, longitude: -93.265 },
} as const;

export const FDA_DISCLAIMER =
  'For use only by adults 21 years of age and older. Keep out of reach of children. ' +
  'Do not drive a motor vehicle or operate machinery while using cannabis. ' +
  `This product has not been analyzed or approved by the FDA. License #${SITE.licenseNumber}.`;

export const NAV_LINKS = [
  { id: 'shop', label: 'Shop', href: '/shop' },
  { id: 'deals', label: 'Deals', href: '/shop?badge=DEAL' },
  { id: 'how', label: 'How it works', href: '/#how' },
  { id: 'area', label: 'Delivery area', href: '/#area' },
] as const;
