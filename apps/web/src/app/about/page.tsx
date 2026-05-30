import type { Metadata } from 'next';
import Link from 'next/link';
import { Leaf, ShieldCheck, Truck } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'About us',
  description: `${SITE.legalName} is a licensed cannabis delivery service serving the Twin Cities metro with lab-tested products and 60–90 minute delivery.`,
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <div className="wrap section">
      <PageHeader
        title="About DankDeals"
        intro={`We're a locally owned, state-licensed cannabis delivery service built for ${SITE.serviceArea}.`}
      />

      <div className="prose">
        <p>
          DankDeals started with a simple idea: getting quality cannabis should be fast, transparent,
          and genuinely pleasant. We carry only lab-tested flower, edibles, vapes, and concentrates from
          Minnesota-compliant producers, and we deliver them to your door in about an hour.
        </p>

        <h2>What makes us different</h2>
        <ul>
          <li>
            <b>Lab-tested, always.</b> Every product lists its potency and is verified by an accredited
            lab before it reaches our menu.
          </li>
          <li>
            <b>No hidden fees.</b> Cash or debit at the door and clear, itemized totals before you
            confirm — what you see is what you pay.
          </li>
          <li>
            <b>Fast, local drivers.</b> Most {SITE.serviceArea} orders arrive in 60–90 minutes with live
            tracking the whole way.
          </li>
        </ul>

        <h2>Licensed &amp; compliant</h2>
        <p>
          DankDeals operates under Minnesota cannabis license{' '}
          <b>#{SITE.licenseNumber}</b>. We verify that every customer is 21 or older at checkout and
          again at the door — a valid government-issued ID is required for every delivery.
        </p>

        <div className="trust" style={{ margin: '24px 0' }}>
          <div className="trust__item">
            <span className="ic">
              <ShieldCheck aria-hidden />
            </span>
            <b>Lab verified</b>
            <span>Potency &amp; purity tested</span>
          </div>
          <div className="trust__item">
            <span className="ic">
              <Truck aria-hidden />
            </span>
            <b>60–90 min</b>
            <span>Metro-wide delivery</span>
          </div>
          <div className="trust__item">
            <span className="ic">
              <Leaf aria-hidden />
            </span>
            <b>Curated menu</b>
            <span>Only what we&apos;d use ourselves</span>
          </div>
        </div>

        <p>
          Questions about a product or your order? <Link href="/contact">Get in touch</Link> — we&apos;re
          happy to help.
        </p>
      </div>
    </div>
  );
}
