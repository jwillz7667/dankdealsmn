import { describe, it, expect } from 'vitest';
import { computeTotals, tipFromBps } from './pricing.js';

const settings = { deliveryFeeCents: 500, freeDeliveryThresholdCents: 7500, taxRateBps: 1000 };

describe('computeTotals (ported from store.js)', () => {
  it('charges the flat fee and 10% tax below the free threshold', () => {
    const r = computeTotals({ subtotalCents: 5000, settings });

    expect(r).toEqual({
      subtotalCents: 5000,
      discountCents: 0,
      deliveryFeeCents: 500,
      taxCents: 500,
      tipCents: 0,
      totalCents: 6000,
    });
  });

  it('waives delivery when subtotal is at or above the free threshold', () => {
    const r = computeTotals({ subtotalCents: 8000, settings });

    expect(r.deliveryFeeCents).toBe(0);
    expect(r.taxCents).toBe(800);
    expect(r.totalCents).toBe(8800);
  });

  it('applies DANK15 (15% off subtotal) before tax', () => {
    const r = computeTotals({
      subtotalCents: 5000,
      settings,
      promo: { type: 'PERCENT_OFF', value: 1500 },
    });

    expect(r.discountCents).toBe(750);
    expect(r.taxCents).toBe(425); // 4250 * 10%
    expect(r.deliveryFeeCents).toBe(500);
    expect(r.totalCents).toBe(5175);
  });

  it('applies FREEDROP (free delivery only)', () => {
    const r = computeTotals({
      subtotalCents: 5000,
      settings,
      promo: { type: 'FREE_DELIVERY', value: 0 },
    });

    expect(r.discountCents).toBe(0);
    expect(r.deliveryFeeCents).toBe(0);
    expect(r.totalCents).toBe(5500);
  });

  it('caps AMOUNT_OFF at the subtotal and never taxes below zero', () => {
    const r = computeTotals({
      subtotalCents: 3000,
      settings,
      promo: { type: 'AMOUNT_OFF', value: 999_999 },
    });

    expect(r.discountCents).toBe(3000);
    expect(r.taxCents).toBe(0);
    expect(r.totalCents).toBe(500); // only the delivery fee remains
  });

  it('adds tip on top of the taxed total', () => {
    const tip = tipFromBps(5000, 1500); // 15%
    expect(tip).toBe(750);

    const r = computeTotals({ subtotalCents: 5000, settings, tipCents: tip });
    expect(r.tipCents).toBe(750);
    expect(r.totalCents).toBe(6750);
  });
});
