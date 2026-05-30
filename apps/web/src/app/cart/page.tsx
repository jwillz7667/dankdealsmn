import type { Metadata } from 'next';
import { CartView } from '@/features/checkout';
import { getStoreConfig } from '@/features/store/api';

// The cart is user-specific and client-rendered — keep it out of the index.
export const metadata: Metadata = {
  title: 'Your cart',
  description: 'Review your cannabis delivery order before checkout.',
  robots: { index: false, follow: true },
};

export default async function CartPage() {
  const store = await getStoreConfig();

  return (
    <div className="wrap section">
      <h1 style={{ fontSize: 'clamp(1.8rem, 5vw, 2.4rem)', marginBottom: 20 }}>Your cart</h1>
      <CartView
        deliveryFeeCents={store.deliveryFeeCents}
        freeDeliveryThresholdCents={store.freeDeliveryThresholdCents}
        minOrderCents={store.minOrderCents}
      />
    </div>
  );
}
