import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireOwnerSession } from '@/lib/auth';
import { getAccessoryById, updateAccessory, deleteAccessory } from '@/lib/accessories';
import { getClientIP } from '@/lib/security';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const auth = await requireOwnerSession(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const resolvedParams = await params;
    const accessory = await getAccessoryById(resolvedParams.id);

    if (!accessory) {
      return NextResponse.json(
        { success: false, error: 'Accessory not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      accessory,
    });
  } catch (error: any) {
    console.error('Owner single accessory fetch error:', {
      method: 'GET',
      path: `/api/owner/accessories/[id]`,
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    });
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch accessory' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const auth = await requireOwnerSession(request);
  if (auth.errorResponse) return auth.errorResponse;

  const ip = getClientIP(request);
  const ownerId = auth.session?.ownerId || 'owner';

  try {
    const resolvedParams = await params;
    const body = await request.json().catch(() => ({}));
    const updated = await updateAccessory(resolvedParams.id, body);

    // Invalidate caches
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/accessories');
      revalidatePath(`/accessory/${resolvedParams.id}`);
      revalidatePath('/owner-portal/accessories');
      revalidatePath('/owner-portal');
    } catch (e) {
      console.warn('Revalidation warning:', e);
    }

    // Audit log
    await logAuditEvent({
      ownerId,
      action: 'ACCESSORY_UPDATED',
      targetTable: 'accessories',
      targetId: resolvedParams.id,
      newData: { name: updated.name, price: updated.price, stock: updated.stock, is_active: updated.is_active },
      ipAddress: ip,
      note: `Accessory "${updated.name}" updated`,
    });

    return NextResponse.json({
      success: true,
      accessory: updated,
      message: 'Accessory updated successfully',
    });
  } catch (error: any) {
    console.error('Owner accessory update error:', {
      method: 'PUT/PATCH',
      path: `/api/owner/accessories/[id]`,
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    });
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to update accessory' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const auth = await requireOwnerSession(request);
  if (auth.errorResponse) return auth.errorResponse;

  const ip = getClientIP(request);
  const ownerId = auth.session?.ownerId || 'owner';

  try {
    const resolvedParams = await params;
    await deleteAccessory(resolvedParams.id);

    // Invalidate caches
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/accessories');
      revalidatePath(`/accessory/${resolvedParams.id}`);
      revalidatePath('/owner-portal/accessories');
      revalidatePath('/owner-portal');
    } catch (e) {
      console.warn('Revalidation warning:', e);
    }

    // Audit log
    await logAuditEvent({
      ownerId,
      action: 'ACCESSORY_DELETED',
      targetTable: 'accessories',
      targetId: resolvedParams.id,
      ipAddress: ip,
      note: `Accessory ${resolvedParams.id} deleted`,
    });

    return NextResponse.json({
      success: true,
      message: 'Accessory deleted successfully',
    });
  } catch (error: any) {
    console.error('Owner accessory delete error:', {
      method: 'DELETE',
      path: `/api/owner/accessories/[id]`,
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    });
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete accessory' },
      { status: 500 }
    );
  }
}

export const PATCH = PUT;

