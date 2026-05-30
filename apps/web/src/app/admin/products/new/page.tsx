import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import { getAdminToken } from '@/features/admin/server';
import { listBrands, listCategories } from '@/features/admin/api';
import { ProductForm } from '@/features/admin/ProductForm';

export const metadata = { title: 'New product' };

export default async function NewProductPage() {
  const token = await getAdminToken();
  const [categories, brands] = await Promise.all([listCategories(token), listBrands(token)]);

  return (
    <div className="adminpage">
      <header className="adminpage__head">
        <div>
          <Link href="/admin/products" className="link">
            <ChevronLeft className="ic" aria-hidden style={{ verticalAlign: 'middle' }} /> Products
          </Link>
          <h1>New product</h1>
        </div>
      </header>

      {categories.length === 0 ? (
        <div className="formerror" role="alert">
          You need at least one category before adding a product.{' '}
          <Link href="/admin/categories" className="link">
            Create a category
          </Link>
          .
        </div>
      ) : (
        <ProductForm categories={categories} brands={brands} />
      )}
    </div>
  );
}
