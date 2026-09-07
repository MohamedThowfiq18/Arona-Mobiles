import type { Metadata } from 'next';
import OwnerProductForm from '@/components/owner/OwnerProductForm/OwnerProductForm';

export const metadata: Metadata = { title: 'Add Product' };

export default function AddProductPage() {
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>Add New Product</h1>
      <OwnerProductForm mode="add" />
    </div>
  );
}
