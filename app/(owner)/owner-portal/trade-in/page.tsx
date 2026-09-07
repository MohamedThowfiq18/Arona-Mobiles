import { getSupabaseAdminClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import OwnerQueuePage from '@/components/owner/OwnerQueuePage/OwnerQueuePage';

export const metadata: Metadata = { title: 'Trade-Ins' };

export default async function OwnerTradeInPage() {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase.from('trade_in_requests').select('*').order('created_at', { ascending: false });
  return (
    <OwnerQueuePage
      title="Trade-In Requests"
      icon="🔁"
      items={data || []}
      table="trade_in_requests"
      statusOptions={['submitted','inspecting','valued','completed','rejected']}
    />
  );
}
