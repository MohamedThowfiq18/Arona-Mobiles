import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { validatePhoneNumber, sanitizeString } from '@/lib/security';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const {
      customerName,
      customerPhone,
      phoneBrand,
      phoneModel,
      issueDescription,
      serviceType,
      servicePrice,
      preferredDateTime,
    } = body;

    // ── 1. Server-Side Validation ─────────────────────────────────
    if (!customerName || typeof customerName !== 'string' || customerName.trim().length < 2) {
      return NextResponse.json(
        { error: 'Customer name is required (minimum 2 characters).' },
        { status: 400 }
      );
    }

    const phoneValidation = validatePhoneNumber(customerPhone);
    if (!phoneValidation.valid) {
      return NextResponse.json(
        { error: phoneValidation.error || 'Please provide a valid 10-digit Indian mobile number.' },
        { status: 400 }
      );
    }

    if (!phoneBrand || typeof phoneBrand !== 'string' || !phoneBrand.trim()) {
      return NextResponse.json(
        { error: 'Phone brand is required (e.g. Apple, Samsung, OnePlus).' },
        { status: 400 }
      );
    }

    if (!phoneModel || typeof phoneModel !== 'string' || !phoneModel.trim()) {
      return NextResponse.json(
        { error: 'Phone model is required (e.g. iPhone 13, Galaxy S21).' },
        { status: 400 }
      );
    }

    if (!serviceType || typeof serviceType !== 'string' || !serviceType.trim()) {
      return NextResponse.json(
        { error: 'Please select a repair service.' },
        { status: 400 }
      );
    }

    if (!preferredDateTime) {
      return NextResponse.json(
        { error: 'Please select your preferred appointment date and time.' },
        { status: 400 }
      );
    }

    // Verify valid date
    const dateObj = new Date(preferredDateTime);
    if (isNaN(dateObj.getTime())) {
      return NextResponse.json(
        { error: 'Invalid preferred appointment date and time format.' },
        { status: 400 }
      );
    }

    const cleanName = sanitizeString(customerName.trim(), 100);
    const cleanPhone = phoneValidation.cleanPhone;
    const cleanBrand = sanitizeString(phoneBrand.trim(), 100);
    const cleanModel = sanitizeString(phoneModel.trim(), 100);
    const cleanIssue = issueDescription ? sanitizeString(String(issueDescription).trim(), 1000) : '';
    const cleanService = sanitizeString(serviceType.trim(), 100);
    const priceNum = typeof servicePrice === 'number' && !isNaN(servicePrice) ? servicePrice : null;
    const slotIso = dateObj.toISOString();
    const nowIso = new Date().toISOString();

    // ── 2. Insert into Supabase ──────────────────────────────────
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database service is currently unavailable. Please try again or contact the store.' },
        { status: 503 }
      );
    }

    const supabase = getSupabaseAdminClient();

    // Primary insert payload with both explicit columns & legacy compatibility columns
    const fullPayload = {
      customer_name: cleanName,
      customer_phone: cleanPhone,
      phone_brand: cleanBrand,
      phone_model: cleanModel,
      issue_description: cleanIssue || null,
      service_type: cleanService,
      service_price: priceNum,
      preferred_date_time: slotIso,
      scheduled_slot: slotIso,
      device_info: {
        brand: cleanBrand,
        model: cleanModel,
        issue: cleanIssue || '',
        issue_description: cleanIssue || '',
        customer_name: cleanName,
        customer_phone: cleanPhone,
      },
      status: 'pending',
      created_at: nowIso,
      updated_at: nowIso,
    };

    let insertedRow: any = null;

    const { data: primaryData, error: primaryErr } = await supabase
      .from('repair_bookings')
      .insert(fullPayload)
      .select('*')
      .single();

    if (!primaryErr && primaryData) {
      insertedRow = primaryData;
    } else {
      console.warn('[Repairs API] Full payload insert error, attempting legacy schema fallback:', primaryErr?.message);
      // Fallback: in case Supabase table only has the original schema columns (service_type, device_info, scheduled_slot, status)
      const legacyPayload = {
        service_type: cleanService,
        device_info: {
          brand: cleanBrand,
          model: cleanModel,
          issue: cleanIssue || '',
          issue_description: cleanIssue || '',
          customer_name: cleanName,
          customer_phone: cleanPhone,
        },
        scheduled_slot: slotIso,
        status: 'pending',
        estimated_cost: priceNum,
        created_at: nowIso,
        updated_at: nowIso,
      };

      const { data: legacyData, error: legacyErr } = await supabase
        .from('repair_bookings')
        .insert(legacyPayload)
        .select('*')
        .single();

      if (legacyErr || !legacyData) {
        console.error('[Repairs API] Database insertion failed completely:', legacyErr?.message);
        return NextResponse.json(
          { error: 'Failed to record repair booking in database. Please try again.' },
          { status: 500 }
        );
      }

      insertedRow = {
        ...legacyData,
        customer_name: cleanName,
        customer_phone: cleanPhone,
        phone_brand: cleanBrand,
        phone_model: cleanModel,
        issue_description: cleanIssue,
        service_type: cleanService,
        service_price: priceNum,
        preferred_date_time: slotIso,
      };
    }

    return NextResponse.json({
      success: true,
      message: 'Repair appointment booked successfully!',
      booking: {
        id: insertedRow.id,
        customerName: cleanName,
        customerPhone: cleanPhone,
        phoneBrand: cleanBrand,
        phoneModel: cleanModel,
        serviceType: cleanService,
        servicePrice: priceNum,
        preferredDateTime: slotIso,
        status: insertedRow.status || 'pending',
        createdAt: insertedRow.created_at || nowIso,
      },
    });
  } catch (err: any) {
    console.error('[Repairs API] Server error:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred while processing your booking. Please try again.' },
      { status: 500 }
    );
  }
}
