import { prisma, type StoreSettings } from '../../infrastructure/prisma.js';

const DEFAULTS = {
  id: 'default',
  deliveryFeeCents: 500,
  freeDeliveryThresholdCents: 7500,
  minOrderCents: 3000,
  taxRateBps: 1000,
  defaultTipBps: 1500,
  deliveryEtaMinutes: 45,
  licenseNumber: 'MN-CAN-0421',
};

/** Reads the singleton settings row, creating sane defaults on first call. */
export async function getSettings(): Promise<StoreSettings> {
  return prisma.storeSettings.upsert({
    where: { id: 'default' },
    create: DEFAULTS,
    update: {},
  });
}

export async function getActiveZones(): Promise<string[]> {
  const zones = await prisma.deliveryZone.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { city: true },
  });
  return zones.map((z) => z.city);
}

export async function getPublicStoreConfig(): Promise<{
  deliveryFeeCents: number;
  freeDeliveryThresholdCents: number;
  minOrderCents: number;
  taxRateBps: number;
  defaultTipBps: number;
  deliveryEtaMinutes: number;
  licenseNumber: string;
  supportPhone: string | null;
  supportEmail: string | null;
  announcement: string | null;
  zones: string[];
}> {
  const [s, zones] = await Promise.all([getSettings(), getActiveZones()]);
  return {
    deliveryFeeCents: s.deliveryFeeCents,
    freeDeliveryThresholdCents: s.freeDeliveryThresholdCents,
    minOrderCents: s.minOrderCents,
    taxRateBps: s.taxRateBps,
    defaultTipBps: s.defaultTipBps,
    deliveryEtaMinutes: s.deliveryEtaMinutes,
    licenseNumber: s.licenseNumber,
    supportPhone: s.supportPhone,
    supportEmail: s.supportEmail,
    announcement: s.announcement,
    zones,
  };
}
