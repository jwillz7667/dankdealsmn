import 'server-only';
import { api } from '@/lib/api/client';
import type { StoreConfig } from '@/lib/api/types';

/** Sensible defaults mirroring StoreSettings seed — used if the API is unreachable. */
export const STORE_CONFIG_FALLBACK: StoreConfig = {
  deliveryFeeCents: 500,
  freeDeliveryThresholdCents: 7500,
  minOrderCents: 3000,
  taxRateBps: 1000,
  defaultTipBps: 1500,
  deliveryEtaMinutes: 45,
  licenseNumber: 'MN-CAN-0421',
  supportPhone: '(612) 555-3265',
  supportEmail: 'support@dankdealsmn.com',
  announcement: 'Free delivery on orders over $75 · Cash or debit on arrival',
  zones: [
    'Minneapolis',
    'St. Paul',
    'Bloomington',
    'Edina',
    'Richfield',
    'St. Louis Park',
    'Roseville',
    'Maplewood',
    'Eagan',
    'Plymouth',
    'Minnetonka',
    'Brooklyn Park',
    'Eden Prairie',
    'Burnsville',
  ],
};

export async function getStoreConfig(): Promise<StoreConfig> {
  try {
    return await api.get<StoreConfig>('/store/config', {
      next: { revalidate: 300, tags: ['store-config'] },
    });
  } catch (err) {
    console.error('getStoreConfig failed', err);
    return STORE_CONFIG_FALLBACK;
  }
}
