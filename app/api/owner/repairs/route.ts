import { NextRequest, NextResponse } from 'next/server';
import { requireOwnerSession } from '@/lib/auth';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await requireOwnerSession(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ bookings: [] });
    }

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('repair_bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Owner Repairs API] Fetch error:', error.message);
      return NextResponse.json({ error: 'Failed to fetch repair bookings.' }, { status: 500 });
    }

    // Normalize records for robust frontend consumption
    const normalized = (data || []).map(b => {
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

    return NextResponse.json({ bookings: normalized });
  } catch (err: any) {
    console.error('[Owner Repairs API] Server error:', err);
    return NextResponse.json({ error: 'Failed to load repair bookings.' }, { status: 500 });
  }
}
