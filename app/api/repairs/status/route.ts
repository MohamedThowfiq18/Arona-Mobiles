import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { validatePhoneNumber, sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const id = searchParams.get('id') || searchParams.get('bookingId');
    const phone = searchParams.get('phone') || searchParams.get('mobile');

    return await handleLookup(id, phone);
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
    const phone = body.phone || body.customerPhone || body.mobile;

    return await handleLookup(id, phone);
  } catch (err: any) {
    console.error('[Repair Status API POST] Server error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while checking repair status.' },
      { status: 500 }
    );
  }
}

async function handleLookup(id: unknown, phone: unknown) {
  // ── 1. Validate Inputs ───────────────────────────────────────────
  if (!id || typeof id !== 'string' || id.trim().length < 4) {
    return NextResponse.json(
      { error: 'Please provide a valid Booking ID.' },
      { status: 400 }
    );
  }

  const phoneValidation = validatePhoneNumber(phone);
  if (!phoneValidation.valid) {
    return NextResponse.json(
      { error: 'Please provide a valid 10-digit Indian mobile number associated with the booking.' },
      { status: 400 }
    );
  }

  const cleanId = id.trim();
  const cleanPhone = phoneValidation.cleanPhone;

  // ── 2. Query Supabase Database ─────────────────────────────────
  if (!isSupabaseConfigured()) {
    return NextResponse.json(
      { error: 'Database service is currently unavailable. Please try again later.' },
      { status: 503 }
    );
  }

  const supabase = getSupabaseAdminClient();

  // Try exact UUID or ID match
  const { data, error } = await supabase
    .from('repair_bookings')
    .select('*')
    .eq('id', cleanId)
    .maybeSingle();

  if (error) {
    console.error('[Repair Status API] Database query error:', error.message);
    return NextResponse.json(
      { error: 'Unable to retrieve repair booking at this time. Please check your Booking ID.' },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json(
      { error: 'No repair booking found matching the provided Booking ID and Phone Number.' },
      { status: 404 }
    );
  }

  // ── 3. Strict Verification of Customer Phone Number ──────────────
  const rowPhone = (data.customer_phone || data.device_info?.customer_phone || '')
    .replace(/\D/g, '')
    .slice(-10);

  if (rowPhone !== cleanPhone) {
    return NextResponse.json(
      { error: 'No repair booking found matching the provided Booking ID and Phone Number.' },
      { status: 404 }
    );
  }

  // ── 4. Return Normalized Booking Payload (Safe for Customer View) ─
  const dev = data.device_info || {};
  return NextResponse.json({
    success: true,
    booking: {
      id: data.id,
      customer_name: data.customer_name || dev.customer_name || 'Customer',
      customer_phone: rowPhone,
      phone_brand: data.phone_brand || dev.brand || '',
      phone_model: data.phone_model || dev.model || '',
      issue_description: data.issue_description || dev.issue || dev.issue_description || '',
      service_type: data.service_type || 'Repair Service',
      service_price: data.service_price ?? data.estimated_cost ?? null,
      preferred_date_time: data.preferred_date_time || data.scheduled_slot || null,
      status: data.status || 'pending',
      notes: data.notes || data.technician_notes || null,
      created_at: data.created_at,
      updated_at: data.updated_at || data.created_at,
    },
  });
}
