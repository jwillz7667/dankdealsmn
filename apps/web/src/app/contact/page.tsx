import type { Metadata } from 'next';
import { Clock, Mail, MapPin, Phone } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { getStoreConfig } from '@/features/store/api';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact us',
  description: `Get in touch with ${SITE.legalName} — call or email our Twin Cities support team for help with products, orders and delivery.`,
  alternates: { canonical: '/contact' },
};

export default async function ContactPage() {
  const store = await getStoreConfig();
  const phone = store.supportPhone ?? SITE.supportPhone;
  const email = store.supportEmail ?? 'support@dankdealsmn.com';
  const telHref = `tel:${phone.replace(/[^\d+]/g, '')}`;

  return (
    <div className="wrap section">
      <PageHeader
        title="Contact us"
        intro="Questions about a product, a promo, or an order in progress? Our Twin Cities team is here to help."
      />

      <div className="contact-grid">
        <div className="contact-card">
          <Phone className="ic" aria-hidden />
          <h3>Call or text</h3>
          <p className="muted">Fastest way to reach us during delivery hours.</p>
          <a href={telHref}>{phone}</a>
        </div>

        <div className="contact-card">
          <Mail className="ic" aria-hidden />
          <h3>Email</h3>
          <p className="muted">We reply within one business day.</p>
          <a href={`mailto:${email}`}>{email}</a>
        </div>

        <div className="contact-card">
          <Clock className="ic" aria-hidden />
          <h3>Delivery hours</h3>
          <p className="muted">Seven days a week</p>
          <b>10:00 AM – 10:00 PM</b>
        </div>

        <div className="contact-card">
          <MapPin className="ic" aria-hidden />
          <h3>Service area</h3>
          <p className="muted">{SITE.serviceArea}</p>
          <b>{store.zones.length}+ cities</b>
        </div>
      </div>

      <p className="muted" style={{ maxWidth: 760, marginTop: 24, fontSize: '.9rem' }}>
        Tracking an active order? Open the tracking link from your confirmation email to see live status.
        For anything else, call us at <a href={telHref} style={{ color: 'var(--green-700)', fontWeight: 700 }}>{phone}</a>.
      </p>
    </div>
  );
}
