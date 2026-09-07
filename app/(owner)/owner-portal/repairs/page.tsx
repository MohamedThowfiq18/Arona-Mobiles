import { getSupabaseAdminClient } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import OwnerQueuePage from '@/components/owner/OwnerQueuePage/OwnerQueuePage';

export const metadata: Metadata = { title: 'Repairs' };

export default async function OwnerRepairsPage() {
  const supabase = getSupabaseAdminClient();
  const { data } = await supabase.from('repair_bookings').select('*').order('created_at', { ascending: false });
  return (
    <OwnerQueuePage
      title="Repair Bookings"
      icon="🔧"
      items={data || []}
      table="repair_bookings"
      statusOptions={['booked','in_progress','repaired','delivered','cancelled']}
    />
  );
}
