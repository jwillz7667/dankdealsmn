import { Resend } from 'resend';
import type { AppConfig } from '../shared/config.js';

export interface OrderEmailLine {
  name: string;
  brand: string | null;
  size: string | null;
  quantity: number;
  unitPriceCents: number;
  lineTotalCents: number;
}

export interface OrderEmailAddress {
  street: string;
  apt: string | null;
  city: string;
  zip: string;
  notes: string | null;
}

export interface OrderEmailTotals {
  subtotalCents: number;
  discountCents: number;
  deliveryFeeCents: number;
  taxCents: number;
  tipCents: number;
  totalCents: number;
}

/**
 * Everything both order emails need. The orders feature maps its serialized
 * OrderDTO onto this shape so infrastructure never imports a feature module
 * (dependencies flow features → infrastructure, never the reverse).
 */
export interface OrderEmailData {
  orderNumber: string;
  trackingToken: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  address: OrderEmailAddress;
  paymentMethod: string;
  deliveryType: string;
  scheduledWindow: string | null;
  etaText: string;
  idVerified: boolean;
  promoCode: string | null;
  items: OrderEmailLine[];
  totals: OrderEmailTotals;
}

const BRAND_INK = '#0c0f0b';
const BRAND_GREEN = '#3b9322';

const formatMoney = (cents: number): string => `$${(cents / 100).toFixed(2)}`;

const PAYMENT_LABELS: Record<string, string> = {
  CASH: 'Cash on delivery',
  DEBIT: 'Debit card on delivery',
};

const DELIVERY_LABELS: Record<string, string> = {
  ASAP: 'ASAP',
  SCHEDULED: 'Scheduled',
};

const humanize = (value: string, labels: Record<string, string>): string =>
  labels[value] ?? value.charAt(0) + value.slice(1).toLowerCase();

/**
 * Transactional email via Resend. If RESEND_API_KEY is absent (local dev),
 * sends are logged and skipped instead of throwing — never block an order on email.
 */
export class Mailer {
  private readonly resend?: Resend;

  constructor(private readonly config: AppConfig) {
    if (config.RESEND_API_KEY) this.resend = new Resend(config.RESEND_API_KEY);
  }

  get enabled(): boolean {
    return Boolean(this.resend);
  }

  private get logoUrl(): string {
    return `${this.config.WEB_PUBLIC_URL}/brand/logo.png`;
  }

  private trackingUrl(data: OrderEmailData): string {
    const token = encodeURIComponent(data.trackingToken);
    return `${this.config.WEB_PUBLIC_URL}/order/${encodeURIComponent(data.orderNumber)}?token=${token}`;
  }

  private adminUrl(data: OrderEmailData): string {
    return `${this.config.WEB_PUBLIC_URL}/admin/orders/${encodeURIComponent(data.orderNumber)}`;
  }

  /** Confirmation sent to the customer after a successful checkout. */
  async sendOrderConfirmation(data: OrderEmailData): Promise<void> {
    const subject = `DankDeals order ${data.orderNumber} confirmed`;
    const body = `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${BRAND_INK};">Order confirmed</h1>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.5;color:#4a5346;">
        Hi ${escapeHtml(firstName(data.customerName))}, we got your order and our team is on it.
      </p>
      ${summaryCard(`Order #${escapeHtml(data.orderNumber)}`, [
        ['ETA', escapeHtml(data.etaText)],
        ['Deliver to', escapeHtml(addressOneLine(data.address))],
        ['Payment', escapeHtml(humanize(data.paymentMethod, PAYMENT_LABELS))],
      ])}
      ${itemsTable(data.items)}
      ${totalsTable(data.totals, data.promoCode)}
      ${ctaButton('Track your order', this.trackingUrl(data))}
      <p style="margin:24px 0 0;font-size:14px;line-height:1.5;color:#4a5346;">
        Your driver will text you when they're close. Please have ${escapeHtml(
          paymentReadiness(data.paymentMethod),
        )} and a valid 21+ ID ready. Thanks for choosing DankDeals.
      </p>`;

    await this.send(data.customerEmail, subject, layout(this.logoUrl, body));
  }

  /** Internal notification to the business with the full order + customer detail. */
  async sendAdminOrderNotification(data: OrderEmailData): Promise<void> {
    const recipients = this.config.ADMIN_NOTIFICATION_EMAIL;
    if (recipients.length === 0) return;

    const subject = `New order ${data.orderNumber} — ${formatMoney(data.totals.totalCents)} — ${data.address.city}`;
    const body = `
      <h1 style="margin:0 0 8px;font-size:22px;font-weight:800;color:${BRAND_INK};">New order received</h1>
      <p style="margin:0 0 20px;font-size:15px;line-height:1.5;color:#4a5346;">
        Order <strong>#${escapeHtml(data.orderNumber)}</strong> for
        <strong>${formatMoney(data.totals.totalCents)}</strong> needs to be prepared and dispatched.
      </p>
      ${summaryCard('Customer', [
        ['Name', escapeHtml(data.customerName)],
        ['Phone', `<a href="tel:${escapeHtml(data.customerPhone)}" style="color:${BRAND_GREEN};">${escapeHtml(
          data.customerPhone,
        )}</a>`],
        ['Email', `<a href="mailto:${escapeHtml(data.customerEmail)}" style="color:${BRAND_GREEN};">${escapeHtml(
          data.customerEmail,
        )}</a>`],
        ['21+ ID confirmed', data.idVerified ? 'Yes' : '⚠️ NO'],
      ])}
      ${summaryCard('Delivery', [
        ['Address', escapeHtml(addressOneLine(data.address))],
        ['Notes', data.address.notes ? escapeHtml(data.address.notes) : '—'],
        ['Type', escapeHtml(humanize(data.deliveryType, DELIVERY_LABELS))],
        ['Window / ETA', escapeHtml(data.scheduledWindow ?? data.etaText)],
        ['Payment', escapeHtml(humanize(data.paymentMethod, PAYMENT_LABELS))],
      ])}
      ${itemsTable(data.items)}
      ${totalsTable(data.totals, data.promoCode)}
      ${ctaButton('Open in admin', this.adminUrl(data))}`;

    await this.send(recipients, subject, layout(this.logoUrl, body));
  }

  private async send(to: string | string[], subject: string, html: string): Promise<void> {
    if (!this.resend) {
      console.warn(`[mail:skipped] ${subject} → ${Array.isArray(to) ? to.join(', ') : to}`);
      return;
    }
    await this.resend.emails.send({ from: this.config.EMAIL_FROM, to, subject, html });
  }
}

const firstName = (name: string): string => name.trim().split(/\s+/)[0] || name;

const addressOneLine = (a: OrderEmailAddress): string =>
  [a.street, a.apt ? `Apt ${a.apt}` : null, `${a.city}, MN ${a.zip}`].filter(Boolean).join(', ');

const paymentReadiness = (method: string): string =>
  method === 'DEBIT' ? 'your debit card' : 'exact cash';

/** Outer shell: white logo header + content card + compliance footer. */
function layout(logoUrl: string, content: string): string {
  return `<!doctype html>
<html lang="en">
  <body style="margin:0;background:#f6f8f3;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BRAND_INK};">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border:1px solid #e3e8dd;border-radius:16px;overflow:hidden;">
            <tr>
              <td align="center" style="background:#ffffff;padding:28px 28px 8px;border-bottom:1px solid #eef1e9;">
                <img src="${logoUrl}" alt="DankDeals" width="240" height="25" style="display:block;width:240px;height:auto;border:0;" />
              </td>
            </tr>
            <tr>
              <td style="padding:28px;">${content}</td>
            </tr>
            <tr>
              <td style="padding:16px 28px 28px;border-top:1px solid #eef1e9;">
                <p style="margin:0;font-size:12px;line-height:1.5;color:#8a917f;">
                  DankDeals · Twin Cities cannabis delivery. Must be 21+. Keep out of reach of children.
                  This product has not been analyzed or approved by the FDA. License #MN-CAN-0421.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

function summaryCard(title: string, rows: Array<[string, string]>): string {
  const body = rows
    .map(
      ([label, value]) => `
      <tr>
        <td style="padding:4px 0;font-size:13px;color:#8a917f;width:130px;vertical-align:top;">${escapeHtml(label)}</td>
        <td style="padding:4px 0;font-size:14px;color:${BRAND_INK};">${value}</td>
      </tr>`,
    )
    .join('');
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 20px;background:#f6f8f3;border-radius:12px;padding:16px 18px;">
      <tr><td style="padding:0 0 8px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:${BRAND_GREEN};">${escapeHtml(
        title,
      )}</td></tr>
      <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0">${body}</table></td></tr>
    </table>`;
}

function itemsTable(items: OrderEmailLine[]): string {
  const rows = items
    .map((i) => {
      const meta = [i.brand, i.size].filter(Boolean).join(' · ');
      return `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eef1e9;font-size:14px;color:${BRAND_INK};">
          ${escapeHtml(i.name)}${meta ? `<br/><span style="font-size:12px;color:#8a917f;">${escapeHtml(meta)}</span>` : ''}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #eef1e9;font-size:14px;color:#4a5346;text-align:center;white-space:nowrap;">×${i.quantity}</td>
        <td style="padding:10px 0;border-bottom:1px solid #eef1e9;font-size:14px;color:${BRAND_INK};text-align:right;white-space:nowrap;">${formatMoney(
          i.lineTotalCents,
        )}</td>
      </tr>`;
    })
    .join('');
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 4px;">
      ${rows}
    </table>`;
}

function totalsTable(t: OrderEmailTotals, promoCode: string | null): string {
  const line = (label: string, value: string, strong = false): string => `
    <tr>
      <td style="padding:3px 0;font-size:${strong ? '16px' : '14px'};color:${strong ? BRAND_INK : '#4a5346'};font-weight:${
        strong ? '800' : '400'
      };">${escapeHtml(label)}</td>
      <td style="padding:3px 0;font-size:${strong ? '16px' : '14px'};color:${strong ? BRAND_INK : '#4a5346'};font-weight:${
        strong ? '800' : '400'
      };text-align:right;white-space:nowrap;">${value}</td>
    </tr>`;

  const discountLabel = promoCode ? `Discount (${escapeHtml(promoCode)})` : 'Discount';
  return `
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 0;">
      ${line('Subtotal', formatMoney(t.subtotalCents))}
      ${t.discountCents > 0 ? line(discountLabel, `−${formatMoney(t.discountCents)}`) : ''}
      ${line('Delivery', t.deliveryFeeCents === 0 ? 'Free' : formatMoney(t.deliveryFeeCents))}
      ${line('Tax', formatMoney(t.taxCents))}
      ${t.tipCents > 0 ? line('Driver tip', formatMoney(t.tipCents)) : ''}
      <tr><td colspan="2" style="padding:8px 0 0;border-top:1px solid #eef1e9;"></td></tr>
      ${line('Total', formatMoney(t.totalCents), true)}
    </table>`;
}

function ctaButton(label: string, href: string): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 0;">
      <tr>
        <td style="border-radius:12px;background:${BRAND_GREEN};">
          <a href="${href}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:12px;">${escapeHtml(
            label,
          )}</a>
        </td>
      </tr>
    </table>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => {
    switch (c) {
      case '&':
        return '&amp;';
      case '<':
        return '&lt;';
      case '>':
        return '&gt;';
      case '"':
        return '&quot;';
      default:
        return '&#39;';
    }
  });
}
