import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireOwnerSession } from '@/lib/auth';
import { getAllAccessories, createAccessory, getAccessoryCategories } from '@/lib/accessories';
import { getClientIP } from '@/lib/security';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await requireOwnerSession(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const accessories = await getAllAccessories(true);
    const categories = await getAccessoryCategories();

    return NextResponse.json({
      success: true,
      accessories,
      categories,
    });
  } catch (error: any) {
    console.error('Owner accessories fetch error:', {
      method: 'GET',
      path: '/api/owner/accessories',
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    });
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch accessories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireOwnerSession(request);
  if (auth.errorResponse) return auth.errorResponse;

  const ip = getClientIP(request);
  const ownerId = auth.session?.ownerId || 'owner';

  try {
    const body = await request.json().catch(() => ({}));
    if (!body.name || !body.brand || !body.category || body.price === undefined || body.stock === undefined) {
      return NextResponse.json(
        { success: false, error: 'Name, brand, category, price, and stock are required.' },
        { status: 400 }
      );
    }

    const created = await createAccessory(body);

    // Invalidate caches
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/accessories');
      revalidatePath(`/accessory/${created.id}`);
      revalidatePath('/owner-portal/accessories');
      revalidatePath('/owner-portal');
    } catch (e) {
      console.warn('Revalidation warning:', e);
    }

    // Audit log
    await logAuditEvent({
      ownerId,
      action: 'ACCESSORY_CREATED',
      targetTable: 'accessories',
      targetId: created.id,
      newData: { name: created.name, brand: created.brand, price: created.price, stock: created.stock },
      ipAddress: ip,
      note: `Accessory "${created.name}" created`,
    });

    return NextResponse.json({
      success: true,
      accessory: created,
      message: 'Accessory created successfully',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Owner accessory creation error:', {
      method: 'POST',
      path: '/api/owner/accessories',
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    });
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create accessory' },
      { status: 500 }
    );
  }
}

