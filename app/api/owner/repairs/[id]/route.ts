import { NextRequest, NextResponse } from 'next/server';
import { requireOwnerSession } from '@/lib/auth';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const VALID_STATUSES = [
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'booked',
  'repaired',
  'delivered',
];

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireOwnerSession(request);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Booking ID is required.' }, { status: 400 });
  }

  try {
    const body = await request.json().catch(() => ({}));
    const { status, notes, technician_notes, final_cost } = body;

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (status !== undefined) {
      const cleanStatus = String(status).toLowerCase().trim();
      if (!VALID_STATUSES.includes(cleanStatus)) {
        return NextResponse.json(
          { error: `Invalid status. Supported statuses: ${VALID_STATUSES.join(', ')}` },
          { status: 400 }
        );
      }
      updates.status = cleanStatus;
    }

    if (notes !== undefined) updates.notes = notes;
    if (technician_notes !== undefined) updates.technician_notes = technician_notes;
    if (final_cost !== undefined) updates.final_cost = Number(final_cost);

    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database service is currently unavailable.' },
        { status: 503 }
      );
    }

    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from('repair_bookings')
      .update(updates)
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('[Owner Repair PATCH] Update error:', error.message);
      return NextResponse.json({ error: error.message || 'Failed to update repair booking.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Repair booking updated successfully.',
      booking: data,
    });
  } catch (err: any) {
    console.error('[Owner Repair PATCH] Server error:', err);
    return NextResponse.json({ error: 'Failed to update repair booking.' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await requireOwnerSession(request);
  if (auth.errorResponse) return auth.errorResponse;

  const { id } = params;
  if (!id) {
    return NextResponse.json({ error: 'Booking ID is required.' }, { status: 400 });
  }

  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json(
        { error: 'Database service is currently unavailable.' },
        { status: 503 }
      );
    }

    const supabase = getSupabaseAdminClient();
    const { error } = await supabase
      .from('repair_bookings')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('[Owner Repair DELETE] Delete error:', error.message);
      return NextResponse.json({ error: error.message || 'Failed to delete repair booking.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'Repair booking removed successfully.',
    });
  } catch (err: any) {
    console.error('[Owner Repair DELETE] Server error:', err);
    return NextResponse.json({ error: 'Failed to delete repair booking.' }, { status: 500 });
  }
}
