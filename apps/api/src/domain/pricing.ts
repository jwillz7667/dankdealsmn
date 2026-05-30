/**
 * Canonical order pricing — ported EXACTLY from the prototype's store.js `totals()`.
 * Pure, framework-free, integer-cents. This is the single source of truth for money;
 * the storefront only displays what this returns. See CLAUDE.md § Canonical business rules.
 *
 * Original (floats, dollars):
 *   fee      = sub >= freeOver ? 0 : 5
 *   discount = DANK15 ? sub * 0.15 : 0
 *   fee      = FREEDROP ? 0 : fee
 *   taxed    = max(0, sub - discount)
 *   tax      = taxed * 0.10
 *   total    = taxed + fee + tax (+ tip)
 */

export type PromoKind = 'PERCENT_OFF' | 'AMOUNT_OFF' | 'FREE_DELIVERY';

export interface PricingSettings {
  deliveryFeeCents: number;
  freeDeliveryThresholdCents: number;
  taxRateBps: number; // 1000 = 10%
}

export interface AppliedPromo {
  type: PromoKind;
  value: number; // bps for PERCENT_OFF, cents for AMOUNT_OFF, ignored for FREE_DELIVERY
}

export interface PriceBreakdown {
  subtotalCents: number;
  discountCents: number;
  deliveryFeeCents: number;
  taxCents: number;
  tipCents: number;
  totalCents: number;
}

const bps = (amount: number, rate: number): number => Math.round((amount * rate) / 10_000);

export function computeTotals(input: {
  subtotalCents: number;
  settings: PricingSettings;
  promo?: AppliedPromo | null;
  tipCents?: number;
}): PriceBreakdown {
  const { subtotalCents, settings } = input;
  const tipCents = Math.max(0, Math.round(input.tipCents ?? 0));

  let deliveryFeeCents =
    subtotalCents >= settings.freeDeliveryThresholdCents ? 0 : settings.deliveryFeeCents;

  let discountCents = 0;
  const promo = input.promo;
  if (promo) {
    if (promo.type === 'PERCENT_OFF') {
      discountCents = bps(subtotalCents, promo.value);
    } else if (promo.type === 'AMOUNT_OFF') {
      discountCents = Math.min(promo.value, subtotalCents);
    } else if (promo.type === 'FREE_DELIVERY') {
      deliveryFeeCents = 0;
    }
  }

  const taxedBase = Math.max(0, subtotalCents - discountCents);
  const taxCents = bps(taxedBase, settings.taxRateBps);
  const totalCents = taxedBase + deliveryFeeCents + taxCents + tipCents;

  return { subtotalCents, discountCents, deliveryFeeCents, taxCents, tipCents, totalCents };
}

/** Tip helper — `defaultTipBps` of subtotal (prototype default 15%). */
export function tipFromBps(subtotalCents: number, tipBps: number): number {
  return bps(subtotalCents, tipBps);
}
