import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { FDA_DISCLAIMER, SITE } from '@/lib/site';

const LAST_UPDATED = 'May 30, 2026';

export const metadata: Metadata = {
  title: 'Terms of service',
  description: `The terms that govern your use of ${SITE.url} and orders placed with ${SITE.legalName}.`,
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <div className="wrap section">
      <PageHeader title="Terms of service" />

      <div className="prose">
        <p className="muted-note">Last updated: {LAST_UPDATED}</p>

        <p>
          These Terms of Service (“Terms”) govern your use of {SITE.url} and any orders you place with{' '}
          {SITE.legalName}. By using our site or placing an order, you agree to these Terms.
        </p>

        <h2>Eligibility &amp; age requirement</h2>
        <p>
          You must be at least 21 years old to browse products, place an order, or receive a delivery.
          You agree to present a valid, government-issued photo ID to verify your age at the time of
          delivery. We reserve the right to refuse or cancel any order that cannot be age-verified.
        </p>

        <h2>Orders &amp; pricing</h2>
        <ul>
          <li>All prices are shown in U.S. dollars and may change without notice.</li>
          <li>
            Order totals — including delivery fee, applicable tax and any tip — are calculated and
            displayed before you confirm. The total shown at confirmation is authoritative.
          </li>
          <li>
            We may limit quantities or decline orders that violate purchase limits set by Minnesota law.
          </li>
        </ul>

        <h2>Payment</h2>
        <p>
          Payment is collected by your driver at delivery via cash or debit. We do not process card
          payments online.
        </p>

        <h2>Delivery</h2>
        <p>
          Delivery is available within our published service area during posted hours. Estimated arrival
          times are estimates, not guarantees. Someone 21 or older must be present to accept the
          delivery.
        </p>

        <h2>Returns</h2>
        <p>
          Because of cannabis regulations, all sales are final once a product has been delivered. If
          there is a problem with your order, <Link href="/contact">contact us</Link> promptly and we
          will work to resolve it.
        </p>

        <h2>Compliance &amp; safety</h2>
        <p>{FDA_DISCLAIMER}</p>

        <h2>Limitation of liability</h2>
        <p>
          To the fullest extent permitted by law, {SITE.legalName} is not liable for indirect or
          consequential damages arising from your use of the site or products. Nothing in these Terms
          limits liability that cannot be limited under applicable law.
        </p>

        <h2>Changes</h2>
        <p>
          We may update these Terms from time to time. Continued use of the site after changes take
          effect constitutes acceptance of the revised Terms.
        </p>
      </div>
    </div>
  );
}
