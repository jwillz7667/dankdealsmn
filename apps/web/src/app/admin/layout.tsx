import type { Metadata } from 'next';
import Link from 'next/link';
import { Leaf } from 'lucide-react';
import { requireAdmin } from '@/features/auth/server';
import { SignOutButton } from '@/features/auth';
import { AdminNav } from '@/features/admin/AdminNav';

export const metadata: Metadata = {
  title: { default: 'Admin', template: '%s · DankDeals Admin' },
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();

  return (
    <div className="admin">
      <aside className="admin__side">
        <Link href="/admin" className="admin__brand">
          <Leaf className="ic" aria-hidden />
          <span>
            DankDeals <em>Admin</em>
          </span>
        </Link>

        <AdminNav />

        <div className="admin__user">
          <div className="admin__user-id">
            <b>{user.name ?? 'Admin'}</b>
            {user.email && <span>{user.email}</span>}
          </div>
          <SignOutButton className="btn btn--ghost btn--sm btn--block" />
        </div>
      </aside>

      <div className="admin__content">{children}</div>
    </div>
  );
}
