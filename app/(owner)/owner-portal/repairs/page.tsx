import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import OwnerRepairsManager from '@/components/owner/OwnerRepairsManager/OwnerRepairsManager';
import type { RepairBooking } from '@/lib/types';

export const metadata: Metadata = { title: 'Repair Bookings' };
export const dynamic = 'force-dynamic';

export default async function OwnerRepairsPage() {
  let initialBookings: RepairBooking[] = [];

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      const { data, error } = await supabase
        .from('repair_bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data) {
        initialBookings = data.map((b: any) => {
          const dev = b.device_info || {};
          return {
            id: b.id,
            customer_name: b.customer_name || dev.customer_name || 'Customer',
            customer_phone: b.customer_phone || dev.customer_phone || '',
            phone_brand: b.phone_brand || dev.brand || '',
            phone_model: b.phone_model || dev.model || '',
            issue_description: b.issue_description || dev.issue || dev.issue_description || '',
            service_type: b.service_type || 'Repair Service',
            service_price: b.service_price ?? b.estimated_cost ?? null,
            preferred_date_time: b.preferred_date_time || b.scheduled_slot || null,
            status: b.status || 'pending',
            notes: b.notes || b.technician_notes || '',
            created_at: b.created_at,
            updated_at: b.updated_at || b.created_at,
          };
        });
      }
    } catch (err) {
      console.error('[OwnerRepairsPage] Server fetch error:', err);
    }
  }

  return <OwnerRepairsManager initialBookings={initialBookings} />;
}
