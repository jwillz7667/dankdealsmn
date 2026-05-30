import { Suspense } from 'react';
import type { Metadata } from 'next';
import { OrderTracker } from '@/features/checkout';

// Order pages contain personal delivery details — never index or follow.
export const metadata: Metadata = {
  title: 'Order tracking',
  robots: { index: false, follow: false },
};

interface OrderPageProps {
  params: Promise<{ orderNumber: string }>;
}

export default async function OrderPage({ params }: OrderPageProps) {
  const { orderNumber } = await params;

  return (
    <div className="wrap section">
      <Suspense fallback={<div className="empty" aria-hidden="true" style={{ minHeight: 280 }} />}>
        <OrderTracker orderNumber={orderNumber} />
      </Suspense>
    </div>
  );
}
