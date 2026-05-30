import { prisma, type PromoCode } from '../../infrastructure/prisma.js';
import { AppError } from '../../shared/errors.js';
import type { AppliedPromo } from '../../domain/pricing.js';

export interface ResolvedPromo {
  record: PromoCode;
  applied: AppliedPromo;
}

/**
 * Validates a promo code against current rules. Throws UNPROCESSABLE with a
 * human-readable reason on failure so the storefront can show it inline.
 */
export async function resolvePromo(
  codeRaw: string,
  subtotalCents: number,
  now: Date = new Date(),
): Promise<ResolvedPromo> {
  const code = codeRaw.trim().toUpperCase();
  const record = await prisma.promoCode.findUnique({ where: { code } });

  if (!record || !record.isActive) {
    throw AppError.unprocessable("That promo code isn't valid.");
  }
  if (record.startsAt && record.startsAt > now) {
    throw AppError.unprocessable('That promo code is not active yet.');
  }
  if (record.endsAt && record.endsAt < now) {
    throw AppError.unprocessable('That promo code has expired.');
  }
  if (record.usageLimit !== null && record.usedCount >= record.usageLimit) {
    throw AppError.unprocessable('That promo code has reached its usage limit.');
  }
  if (record.minSubtotalCents !== null && subtotalCents < record.minSubtotalCents) {
    const dollars = (record.minSubtotalCents / 100).toFixed(0);
    throw AppError.unprocessable(`Spend at least $${dollars} to use this code.`);
  }

  return { record, applied: { type: record.type, value: record.value } };
}
