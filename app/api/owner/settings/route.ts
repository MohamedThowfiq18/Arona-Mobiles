import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getStoreSettings, updateStoreSettings } from '@/lib/settings';
import { requireOwnerSession } from '@/lib/auth';
import { sanitizeString, getClientIP } from '@/lib/security';
import { logAuditEvent } from '@/lib/audit';

export async function GET(request: NextRequest) {
  const auth = await requireOwnerSession(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const settings = await getStoreSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error fetching owner store settings:', error);
    return NextResponse.json({ error: 'Failed to retrieve settings.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  const auth = await requireOwnerSession(request);
  if (auth.errorResponse) return auth.errorResponse;

  const ip = getClientIP(request);
  const ownerId = auth.session?.ownerId || 'owner';

  try {
    const body = await request.json().catch(() => ({}));
    const current = await getStoreSettings();

    // Sanitize phone and contact inputs
    const updates: Record<string, any> = {};

    if (body.store_name !== undefined) updates.store_name = sanitizeString(body.store_name, 100);
    if (body.tagline !== undefined) updates.tagline = sanitizeString(body.tagline, 200);
    if (body.phone_primary !== undefined) updates.phone_primary = sanitizeString(body.phone_primary, 30);
    if (body.phone_secondary !== undefined) updates.phone_secondary = sanitizeString(body.phone_secondary, 30);
    if (body.whatsapp_number !== undefined) updates.whatsapp_number = sanitizeString(body.whatsapp_number, 30);
    if (body.email !== undefined) updates.email = sanitizeString(body.email, 100);
    if (body.address_line1 !== undefined) updates.address_line1 = sanitizeString(body.address_line1, 200);
    if (body.address_line2 !== undefined) updates.address_line2 = sanitizeString(body.address_line2, 200);
    if (body.city !== undefined) updates.city = sanitizeString(body.city, 100);
    if (body.state !== undefined) updates.state = sanitizeString(body.state, 100);
    if (body.pincode !== undefined) updates.pincode = sanitizeString(body.pincode, 20);
    if (body.landmark !== undefined) updates.landmark = sanitizeString(body.landmark, 200);
    if (body.hours_weekdays !== undefined) updates.hours_weekdays = sanitizeString(body.hours_weekdays, 100);
    if (body.hours_sunday !== undefined) updates.hours_sunday = sanitizeString(body.hours_sunday, 100);
    if (body.google_maps_url !== undefined) updates.google_maps_url = sanitizeString(body.google_maps_url, 500);
    if (body.announcement_bar !== undefined) updates.announcement_bar = sanitizeString(body.announcement_bar, 300);

    if (Array.isArray(body.authorized_owner_phones)) {
      updates.authorized_owner_phones = body.authorized_owner_phones
        .map((p: any) => String(p).replace(/\D/g, '').slice(-10))
        .filter((p: string) => p.length === 10);
    }

    const updated = await updateStoreSettings(updates);

    await logAuditEvent({
      ownerId,
      action: 'STORE_SETTINGS_UPDATED',
      targetTable: 'store_settings',
      targetId: 'default',
      oldData: {
        phone_primary: current.phone_primary,
        phone_secondary: current.phone_secondary,
        whatsapp_number: current.whatsapp_number,
      },
      newData: {
        phone_primary: updated.phone_primary,
        phone_secondary: updated.phone_secondary,
        whatsapp_number: updated.whatsapp_number,
      },
      ipAddress: ip,
      note: 'Owner updated store contact phone numbers and store settings',
    });

    return NextResponse.json({
      success: true,
      message: 'Store contact details and numbers updated successfully!',
      settings: updated,
    });
  } catch (error) {
    console.error('Error updating store settings:', error);
    return NextResponse.json(
      { error: 'Failed to update store settings. Please check parameters.' },
      { status: 500 }
    );
  }
}
