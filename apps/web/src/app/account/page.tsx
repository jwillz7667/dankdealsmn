import type { Metadata } from 'next';
import Link from 'next/link';
import { Package, ShoppingBag, ShieldCheck, ChevronRight } from 'lucide-react';
import { PageHeader } from '@/components/PageHeader';
import { requireUser, isAdminRole } from '@/features/auth/server';
import { SignOutButton } from '@/features/auth';

export const metadata: Metadata = {
  title: 'Your account',
  robots: { index: false, follow: false },
};

export default async function AccountPage() {
  const user = await requireUser('/account');
  const isAdmin = isAdminRole(user.role);
  const greeting = user.name?.split(' ')[0] ?? 'there';

  return (
    <div className="wrap section">
      <PageHeader title={`Hi, ${greeting}`} intro="Manage your orders and account from here." />

      <div className="acct">
        <div className="acctcard">
          <div className="acctcard__id">
            <b>{user.name ?? 'Your account'}</b>
            {user.email && <span className="muted">{user.email}</span>}
          </div>
          {isAdmin && <span className="rolepill">Admin</span>}
        </div>

        <div className="acctgrid">
          <Link className="acttile" href="/account/orders">
            <span className="acttile__ic">
              <Package aria-hidden />
            </span>
            <span className="acttile__body">
              <b>Order history</b>
              <span className="muted">View past orders and track active deliveries.</span>
            </span>
            <ChevronRight className="acttile__go" aria-hidden />
          </Link>

          <Link className="acttile" href="/shop">
            <span className="acttile__ic">
              <ShoppingBag aria-hidden />
            </span>
            <span className="acttile__body">
              <b>Browse the menu</b>
              <span className="muted">Lab-tested cannabis, delivered in 60–90 minutes.</span>
            </span>
            <ChevronRight className="acttile__go" aria-hidden />
          </Link>

          {isAdmin && (
            <Link className="acttile" href="/admin">
              <span className="acttile__ic">
                <ShieldCheck aria-hidden />
              </span>
              <span className="acttile__body">
                <b>Admin dashboard</b>
                <span className="muted">Manage products, inventory, and orders.</span>
              </span>
              <ChevronRight className="acttile__go" aria-hidden />
            </Link>
          )}
        </div>

        <div className="row" style={{ justifyContent: 'flex-start' }}>
          <SignOutButton />
        </div>
      </div>
    </div>
  );
}
