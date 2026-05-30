import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { SITE } from '@/lib/site';

const LAST_UPDATED = 'May 30, 2026';

export const metadata: Metadata = {
  title: 'Accessibility',
  description: `${SITE.legalName}'s commitment to an accessible, inclusive online experience for all customers.`,
  alternates: { canonical: '/accessibility' },
};

export default function AccessibilityPage() {
  return (
    <div className="wrap section">
      <PageHeader title="Accessibility statement" />

      <div className="prose">
        <p className="muted-note">Last updated: {LAST_UPDATED}</p>

        <p>
          {SITE.legalName} is committed to making {SITE.url} usable for everyone, including people who
          rely on assistive technology. We aim to conform to the Web Content Accessibility Guidelines
          (WCAG) 2.1 Level AA.
        </p>

        <h2>What we do</h2>
        <ul>
          <li>Semantic HTML and labeled controls so screen readers can navigate the site.</li>
          <li>Keyboard support for all interactive elements, with a visible “skip to content” link.</li>
          <li>Color contrast and text sizing chosen for readability.</li>
          <li>Respect for reduced-motion preferences in animations and transitions.</li>
        </ul>

        <h2>Ongoing effort</h2>
        <p>
          Accessibility is an ongoing process. We regularly review new features and content, and we
          welcome feedback that helps us improve.
        </p>

        <h2>Need help or found a barrier?</h2>
        <p>
          If you encounter any difficulty using our site, please <Link href="/contact">contact us</Link>
          {SITE.supportPhone ? ` or call ${SITE.supportPhone}` : ''}. We&apos;ll work with you to provide
          the information or complete the order you need.
        </p>
      </div>
    </div>
  );
}
