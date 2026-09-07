import { getSupabaseAdminClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import OwnerCouponsClient from '@/components/owner/OwnerCouponsClient/OwnerCouponsClient';

export const metadata: Metadata = { title: 'Coupons' };

export default async function OwnerCouponsPage() {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase.from('coupons').select('*').order('created_at', { ascending: false });
  return <OwnerCouponsClient coupons={data || []} />;
}
