import { getAdminToken } from '@/features/admin/server';
import { listBrands } from '@/features/admin/api';
import { BrandManager } from '@/features/admin/BrandManager';

export const metadata = { title: 'Brands' };

export default async function AdminBrandsPage() {
  const token = await getAdminToken();
  const brands = await listBrands(token);
  return <BrandManager brands={brands} />;
}
