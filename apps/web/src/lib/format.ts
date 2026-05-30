/** Money + display formatting helpers. All money is integer cents. */

const usd = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/** 4299 → "$42.99". Whole-dollar amounts render without cents: 4200 → "$42". */
export function money(cents: number): string {
  if (cents % 100 === 0) {
    return `$${(cents / 100).toLocaleString('en-US')}`;
  }
  return usd.format(cents / 100);
}

/** Always two decimals, e.g. for line totals in a summary. */
export function moneyExact(cents: number): string {
  return usd.format(cents / 100);
}

export function potency(p: { value: number | null; unit: 'PERCENT' | 'MG' } | null): string | null {
  if (!p || p.value === null) return null;
  return p.unit === 'PERCENT' ? `${p.value}% THC` : `${p.value}mg`;
}

const STRAIN_LABEL: Record<string, string> = {
  INDICA: 'Indica',
  SATIVA: 'Sativa',
  HYBRID: 'Hybrid',
  CBD: 'CBD',
};
export const strainLabel = (s: string): string => STRAIN_LABEL[s] ?? s;
export const strainDotClass = (s: string): string => s.toLowerCase();

const STATUS_LABEL: Record<string, string> = {
  PENDING: 'Pending',
  CONFIRMED: 'Confirmed',
  PREPARING: 'Preparing',
  OUT_FOR_DELIVERY: 'Out for delivery',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled',
};
export const statusLabel = (s: string): string => STATUS_LABEL[s] ?? s;

export function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}
