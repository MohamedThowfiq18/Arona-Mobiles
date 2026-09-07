import { getSupabaseAdminClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import OwnerReviewsClient from '@/components/owner/OwnerReviewsClient/OwnerReviewsClient';

export const metadata: Metadata = { title: 'Reviews & Q&A' };

export default async function OwnerReviewsPage() {
  const supabase = getSupabaseAdminClient();
  const [{ data: reviews }, { data: qa }] = await Promise.all([
    supabase.from('reviews').select('*, products(brand, model)').order('created_at', { ascending: false }).limit(100),
    supabase.from('product_qa').select('*, products(brand, model)').order('created_at', { ascending: false }).limit(100),
  ]);
  return <OwnerReviewsClient reviews={reviews || []} qa={qa || []} />;
}
