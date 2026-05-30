import { getAdminToken } from '@/features/admin/server';
import { listCategories } from '@/features/admin/api';
import { CategoryManager } from '@/features/admin/CategoryManager';

export const metadata = { title: 'Categories' };

export default async function AdminCategoriesPage() {
  const token = await getAdminToken();
  const categories = await listCategories(token);
  return <CategoryManager categories={categories} />;
}
