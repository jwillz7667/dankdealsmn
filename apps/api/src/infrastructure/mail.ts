import { Resend } from 'resend';
import type { AppConfig } from '../shared/config.js';

export interface OrderConfirmationData {
  to: string;
  orderNumber: string;
  customerName: string;
  totalCents: number;
  etaText: string;
}

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

  async sendOrderConfirmation(data: OrderConfirmationData): Promise<void> {
    const total = `$${(data.totalCents / 100).toFixed(2)}`;
    const subject = `DankDeals order ${data.orderNumber} confirmed`;
    const html = `
      <div style="font-family:Arial,sans-serif;max-width:480px;margin:auto">
        <h2 style="color:#3B9322">Order confirmed 🚗💨</h2>
        <p>Hi ${escapeHtml(data.customerName)}, we got your order.</p>
        <p><strong>Order:</strong> ${data.orderNumber}<br/>
           <strong>Total:</strong> ${total}<br/>
           <strong>ETA:</strong> ${escapeHtml(data.etaText)}</p>
        <p>Your driver will text you when they're close. Have cash or your debit card ready —
           and a valid 21+ ID. Thanks for choosing DankDeals.</p>
      </div>`;

    if (!this.resend) {
      console.warn(`[mail:skipped] ${subject} → ${data.to}`);
      return;
    }
    await this.resend.emails.send({
      from: this.config.EMAIL_FROM,
      to: data.to,
      subject,
      html,
    });
  }
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
