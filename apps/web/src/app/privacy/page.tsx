import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { SITE } from '@/lib/site';

const LAST_UPDATED = 'May 30, 2026';

export const metadata: Metadata = {
  title: 'Privacy policy',
  description: `How ${SITE.legalName} collects, uses and protects your personal information.`,
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <div className="wrap section">
      <PageHeader title="Privacy policy" />

      <div className="prose">
        <p className="muted-note">Last updated: {LAST_UPDATED}</p>

        <p>
          {SITE.legalName} (“we,” “us”) respects your privacy. This policy explains what information we
          collect when you use {SITE.url}, why we collect it, and the choices you have.
        </p>

        <h2>Information we collect</h2>
        <ul>
          <li>
            <b>Order details</b> — your name, phone number, email, delivery address and order contents,
            which we need to fulfill and deliver your order.
          </li>
          <li>
            <b>Age verification</b> — confirmation that you are 21 or older. Your ID is checked at the
            door by your driver and is not stored by us.
          </li>
          <li>
            <b>Usage data</b> — basic, aggregated analytics (pages viewed, device type) used to improve
            the site. We do not sell this data.
          </li>
        </ul>

        <h2>How we use your information</h2>
        <ul>
          <li>To process, deliver and track your orders.</li>
          <li>To send order confirmations and delivery updates.</li>
          <li>To provide customer support and comply with Minnesota cannabis regulations.</li>
        </ul>

        <h2>Payment information</h2>
        <p>
          We do not collect or store credit card numbers. Payment is made directly to your driver by cash
          or debit at the time of delivery.
        </p>

        <h2>Sharing</h2>
        <p>
          We share information only with the delivery driver assigned to your order and with service
          providers who help us operate (e.g. email delivery), and only as needed. We disclose
          information to regulators or law enforcement when required by law.
        </p>

        <h2>Your choices</h2>
        <p>
          You may request access to or deletion of your personal information by contacting us. We retain
          order records as required by state cannabis recordkeeping rules.
        </p>

        <h2>Contact</h2>
        <p>
          Questions about this policy? <Link href="/contact">Contact us</Link>. License #
          {SITE.licenseNumber}.
        </p>
      </div>
    </div>
  );
}
