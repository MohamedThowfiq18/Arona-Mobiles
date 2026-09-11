import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { validatePhoneNumber, sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
export const fetchCache = 'force-no-store';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id') || searchParams.get('bookingId');
    const name = searchParams.get('name') || searchParams.get('customerName');
    const phone = searchParams.get('phone') || searchParams.get('mobile');

    return await handleLookup(id, name, phone);
  } catch (err: any) {
    console.error('[Repair Status API GET] Server error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while checking repair status.' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const id = body.id || body.bookingId;
    const name = body.name || body.customerName;
    const phone = body.phone || body.customerPhone || body.mobile;

    return await handleLookup(id, name, phone);
  } catch (err: any) {
    console.error('[Repair Status API POST] Server error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while checking repair status.' },
      { status: 500 }
    );
  }
}

async function handleLookup(id: unknown, name: unknown, phone: unknown) {
  // ── 1. Validate Phone Number (ALWAYS REQUIRED) ───────────────────
  const phoneValidation = validatePhoneNumber(phone);
  if (!phoneValidation.valid) {
    return NextResponse.json(
      { error: 'Please provide a valid 10-digit Indian mobile number.' },
      {
        status: 400,
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
      }
    );
  }

  const cleanPhone = phoneValidation.cleanPhone;
  const cleanId = typeof id === 'string' ? id.trim() : '';
  const cleanName = typeof name === 'string' ? sanitizeString(name.trim(), 100) : '';

  // ── 2. Validate at least one of Booking ID or Customer Name ─────
  if (!cleanId && !cleanName) {
    return NextResponse.json(
      { error: 'Enter your Booking ID or Customer Name.' },
      {
        status: 400,
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
      }
    );
  }

  // ── 3. Query Supabase Database ─────────────────────────────────
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database service is currently unavailable. Please try again later.' },
      {
        status: 503,
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
      }
    );
  }

  const supabase = getSupabaseAdminClient();

  // Try direct query first
  let query = supabase
    .from('repair_bookings')
    .select('*')
    .order('created_at', { ascending: false });

  if (cleanId) {
    query = query.eq('id', cleanId);
  } else if (cleanName) {
    query = query.ilike('customer_name', `%${cleanName}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error('[Repair Status API] Database query error:', error.message);
    return NextResponse.json(
      { error: 'Unable to retrieve repair bookings at this time.' },
      {
        status: 500,
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
      }
    );
  }

  // ── 4. Verify Customer Phone Number Strictly ────────────────────
  let matchedRows = (data || []).filter(row => {
    const rowPhone = (row.customer_phone || row.device_info?.customer_phone || '')
      .replace(/\D/g, '')
      .slice(-10);
    return rowPhone === cleanPhone;
  });

  // If no rows matched by direct query, perform a broader fallback check for legacy records
  if (matchedRows.length === 0) {
    const { data: allRows } = await supabase
      .from('repair_bookings')
      .select('*')
      .order('created_at', { ascending: false });

    if (allRows && allRows.length > 0) {
      matchedRows = allRows.filter(row => {
        const rowPhone = (row.customer_phone || row.device_info?.customer_phone || '')
          .replace(/\D/g, '')
          .slice(-10);
        if (rowPhone !== cleanPhone) return false;

        if (cleanId) {
          return row.id === cleanId;
        }
        if (cleanName) {
          const rowName = (row.customer_name || row.device_info?.customer_name || '').toLowerCase();
          return rowName.includes(cleanName.toLowerCase());
        }
        return true;
      });
    }
  }

  if (matchedRows.length === 0) {
    return NextResponse.json(
      { error: 'No repair booking found matching the provided details and phone number.' },
      {
        status: 404,
        headers: { 'Cache-Control': 'no-store, no-cache, must-revalidate' },
      }
    );
  }

  // ── 5. Normalize Payload (Safe for Customer View) ───────────────
  const normalizedBookings = matchedRows.map(row => {
    const dev = row.device_info || {};
    return {
      id: row.id,
      customer_name: row.customer_name || dev.customer_name || dev.name || cleanName || 'Customer',
      customer_phone: cleanPhone,
      phone_brand: row.phone_brand || dev.brand || dev.phone_brand || '',
      phone_model: row.phone_model || dev.model || dev.phone_model || '',
      issue_description: row.issue_description || dev.issue || dev.issue_description || '',
      service_type: row.service_type || 'Repair Service',
      service_price: row.service_price ?? row.estimated_cost ?? null,
      preferred_date_time: row.preferred_date_time || row.scheduled_slot || null,
      status: String(row.status || 'pending').toLowerCase().trim(),
      notes: row.notes || row.technician_notes || null,
      created_at: row.created_at || new Date().toISOString(),
      updated_at: row.updated_at || row.created_at || new Date().toISOString(),
    };
  });

  return NextResponse.json(
    {
      success: true,
      booking: normalizedBookings[0],
      bookings: normalizedBookings,
      count: normalizedBookings.length,
    },
    {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    }
  );
}

