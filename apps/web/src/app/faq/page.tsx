import type { Metadata } from 'next';
import { JsonLd } from '@/components/JsonLd';
import { PageHeader } from '@/components/PageHeader';
import { getStoreConfig } from '@/features/store/api';
import { money } from '@/lib/format';
import { faqPageJsonLd } from '@/lib/seo';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Frequently asked questions',
  description: `Delivery areas, payment, ID requirements and lab testing — everything you need to know about ordering from ${SITE.legalName}.`,
  alternates: { canonical: '/faq' },
};

export default async function FaqPage() {
  const store = await getStoreConfig();

  const faqs: { question: string; answer: string }[] = [
    {
      question: 'What areas do you deliver to?',
      answer: `We deliver across the Twin Cities metro — Minneapolis, St. Paul and ${store.zones.length}+ surrounding cities. Enter your address at checkout to confirm coverage.`,
    },
    {
      question: 'How long does delivery take?',
      answer: `Most orders arrive in 60–90 minutes. Our typical estimated delivery time is about ${store.deliveryEtaMinutes} minutes once a driver is assigned, and you can track your order live the whole way.`,
    },
    {
      question: 'Is there a delivery fee or order minimum?',
      answer: `Our minimum order is ${money(store.minOrderCents)}. Delivery is ${money(store.deliveryFeeCents)}, and it's free on orders over ${money(store.freeDeliveryThresholdCents)}.`,
    },
    {
      question: 'How do I pay?',
      answer:
        'You pay your driver at the door with cash or debit — we bring a card reader for debit. We never collect card numbers online, so your payment details stay with you until delivery.',
    },
    {
      question: 'Do I need to show ID?',
      answer:
        'Yes. Cannabis delivery is restricted to adults 21 and older. You confirm your age at checkout and present a valid, government-issued photo ID to your driver at delivery.',
    },
    {
      question: 'Are your products lab tested?',
      answer:
        'Every product on our menu is lab tested for potency and purity by an accredited lab. Potency figures (THC/CBD) are listed on each product page.',
    },
    {
      question: 'Can I schedule a delivery for later?',
      answer:
        'Yes. At checkout you can choose “Deliver ASAP” or pick a one-hour scheduled window that works for you.',
    },
    {
      question: 'What is your return policy?',
      answer: `Due to state cannabis regulations, all sales are final once delivered. If something is wrong with your order, contact us right away at ${store.supportPhone ?? SITE.supportPhone} and we'll make it right.`,
    },
  ];

  return (
    <div className="wrap section">
      <JsonLd data={faqPageJsonLd(faqs)} />
      <PageHeader
        title="Frequently asked questions"
        intro="Everything you need to know about ordering, delivery and our products."
      />

      <div className="faq">
        {faqs.map((f) => (
          <details className="faqitem" key={f.question}>
            <summary>{f.question}</summary>
            <div className="faqitem__body">{f.answer}</div>
          </details>
        ))}
      </div>
    </div>
  );
}
