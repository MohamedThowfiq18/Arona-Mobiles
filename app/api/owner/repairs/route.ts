import { NextRequest, NextResponse } from 'next/server';
import { requireOwnerSession } from '@/lib/auth';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  const auth = await requireOwnerSession(request);
  if (auth.errorResponse) {
    console.warn('[Owner Repairs API] Authentication failed for owner request.');
    return auth.errorResponse;
  }

  try {
    if (!isSupabaseConfigured()) {
      console.warn('[Owner Repairs API] Supabase is not configured; returning empty list.');
      return NextResponse.json({ bookings: [] }, {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      });
    }

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('repair_bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[Owner Repairs API] Database query error:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json(
        { error: error.message || 'Failed to fetch repair bookings from database.' },
        {
          status: 500,
          headers: {
            'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          },
        }
      );
    }

    console.info(`[Owner Repairs API] Successfully fetched ${data?.length || 0} repair booking(s) from Supabase public.repair_bookings.`);

    // Normalize records for robust frontend consumption
    const normalized = (data || []).map(b => {
      const dev = b.device_info || {};
      const statusRaw = String(b.status || 'pending').toLowerCase().trim();

      return {
        id: b.id,
        customer_name: b.customer_name || dev.customer_name || dev.name || 'Customer',
        customer_phone: b.customer_phone || dev.customer_phone || dev.phone || '',
        phone_brand: b.phone_brand || dev.brand || dev.phone_brand || '',
        phone_model: b.phone_model || dev.model || dev.phone_model || '',
        issue_description: b.issue_description || dev.issue || dev.issue_description || '',
        service_type: b.service_type || 'Repair Service',
        service_price: b.service_price ?? b.estimated_cost ?? null,
        preferred_date_time: b.preferred_date_time || b.scheduled_slot || null,
        status: statusRaw,
        notes: b.notes || b.technician_notes || '',
        created_at: b.created_at || new Date().toISOString(),
        updated_at: b.updated_at || b.created_at || new Date().toISOString(),
      };
    });

    return NextResponse.json(
      { bookings: normalized },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  } catch (err: any) {
    console.error('[Owner Repairs API] Server error:', err);
    return NextResponse.json(
      { error: 'Failed to load repair bookings.' },
      { status: 500 }
    );
  }
}
