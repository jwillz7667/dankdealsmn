import type { Metadata } from 'next';
import { CheckoutForm } from '@/features/checkout';
import { getStoreConfig } from '@/features/store/api';

export const metadata: Metadata = {
  title: 'Checkout',
  description: 'Complete your cannabis delivery order. Cash or debit at the door, 21+ only.',
  robots: { index: false, follow: false },
};

export default async function CheckoutPage() {
  const store = await getStoreConfig();

  return (
    <div className="wrap section">
      <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', marginBottom: 20 }}>Checkout</h1>
      <CheckoutForm
        zones={store.zones}
        defaultTipBps={store.defaultTipBps}
        deliveryFeeCents={store.deliveryFeeCents}
        freeDeliveryThresholdCents={store.freeDeliveryThresholdCents}
      />
    </div>
  );
}
