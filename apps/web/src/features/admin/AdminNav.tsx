'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Package, FolderTree, Tags, Receipt, Store } from 'lucide-react';

const LINKS = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard, exact: true },
  { href: '/admin/products', label: 'Products', icon: Package, exact: false },
  { href: '/admin/categories', label: 'Categories', icon: FolderTree, exact: false },
  { href: '/admin/brands', label: 'Brands', icon: Tags, exact: false },
  { href: '/admin/orders', label: 'Orders', icon: Receipt, exact: false },
] as const;

function isActive(pathname: string, href: string, exact: boolean): boolean {
  return exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav className="adminnav" aria-label="Admin">
      {LINKS.map(({ href, label, icon: Icon, exact }) => (
        <Link
          key={href}
          href={href}
          className={`adminnav__link${isActive(pathname, href, exact) ? ' active' : ''}`}
          aria-current={isActive(pathname, href, exact) ? 'page' : undefined}
        >
          <Icon className="ic" aria-hidden />
          <span>{label}</span>
        </Link>
      ))}
      <Link href="/" className="adminnav__link adminnav__link--store">
        <Store className="ic" aria-hidden />
        <span>View store</span>
      </Link>
    </nav>
  );
}
