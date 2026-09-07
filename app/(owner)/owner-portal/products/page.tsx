import { getAllProducts } from '@/lib/products';
import Link from 'next/link';
import type { Metadata } from 'next';
import OwnerProductList from '@/components/owner/OwnerProductList/OwnerProductList';

export const metadata: Metadata = { title: 'Products — Owner Portal' };
export const dynamic = 'force-dynamic';

export default async function OwnerProductsPage() {
  const products = await getAllProducts(true);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 800 }}>Products</h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginTop: 2 }}>
            {products.length} total products
          </p>
        </div>
        <Link href="/owner-portal/products/add" className="btn btn--primary" id="owner-add-product-btn">
          + Add New Product
        </Link>
      </div>
      <OwnerProductList initialProducts={products} />
    </div>
  );
}
