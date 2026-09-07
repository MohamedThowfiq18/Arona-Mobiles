import { getSupabaseAdminClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import type { Product } from '@/lib/types';
import OwnerProductForm from '@/components/owner/OwnerProductForm/OwnerProductForm';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Edit Product' };

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase.from('products').select('*').eq('id', id).single();
  if (!data) notFound();
  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 800, marginBottom: 24 }}>
        Edit: {(data as Product).brand} {(data as Product).model}
      </h1>
      <OwnerProductForm mode="edit" product={data as Product} />
    </div>
  );
}
