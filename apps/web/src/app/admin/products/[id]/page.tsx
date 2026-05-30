import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ChevronLeft } from 'lucide-react';
import { getAdminToken } from '@/features/admin/server';
import { getProduct, listBrands, listCategories } from '@/features/admin/api';
import { ProductForm } from '@/features/admin/ProductForm';
import { ProductImageManager } from '@/features/admin/ProductImageManager';
import { DeleteButton } from '@/features/admin/DeleteButton';
import { deleteProductAction } from '@/features/admin/actions';
import { ApiError } from '@/lib/api/client';

export const metadata = { title: 'Edit product' };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditProductPage({ params }: PageProps) {
  const { id } = await params;
  const token = await getAdminToken();

  const product = await getProduct(token, id).catch((err) => {
    if (err instanceof ApiError && err.status === 404) notFound();
    throw err;
  });
  const [categories, brands] = await Promise.all([listCategories(token), listBrands(token)]);

  return (
    <div className="adminpage">
      <header className="adminpage__head">
        <div>
          <Link href="/admin/products" className="link">
            <ChevronLeft className="ic" aria-hidden style={{ verticalAlign: 'middle' }} /> Products
          </Link>
          <h1>{product.name}</h1>
          <p>
            <a
              href={`/product/${product.slug}`}
              target="_blank"
              rel="noreferrer"
              className="link"
            >
              View on storefront
            </a>
          </p>
        </div>
        <DeleteButton
          action={deleteProductAction}
          id={product.id}
          noun="product"
          redirectTo="/admin/products"
          className="btn btn--ghost btn--sm"
        />
      </header>

      <section className="adminbox">
        <h2 className="adminbox__title">Images</h2>
        <ProductImageManager productId={product.id} initialImages={product.images} />
      </section>

      <ProductForm categories={categories} brands={brands} product={product} />
    </div>
  );
}
