import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireOwnerSession } from '@/lib/auth';
import { getAccessoryById, updateAccessory, deleteAccessory } from '@/lib/accessories';
import { sanitizeString, validatePositiveNumber, getClientIP } from '@/lib/security';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  const auth = await requireOwnerSession(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const { id } = await params;
    const accessory = await getAccessoryById(id);

    if (!accessory) {
      return NextResponse.json(
        { error: 'Accessory not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      accessory,
    });
  } catch (error: any) {
    console.error('Owner single accessory fetch error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to retrieve accessory details.' },
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
    const { id } = await params;
    const body = await request.json().catch(() => ({}));
    const existing = await getAccessoryById(id);

    if (!existing) {
      return NextResponse.json({ error: 'Accessory not found' }, { status: 404 });
    }

    // Input sanitization and formatting
    const updates: Record<string, any> = { ...body };
    if (body.name) updates.name = sanitizeString(body.name, 150);
    if (body.brand) updates.brand = sanitizeString(body.brand, 50);
    if (body.category) updates.category = sanitizeString(body.category, 100);
    if (body.subcategory !== undefined) updates.subcategory = body.subcategory ? sanitizeString(body.subcategory, 100) : null;
    if (body.model_sku !== undefined) updates.model_sku = body.model_sku ? sanitizeString(body.model_sku, 100) : null;
    if (body.color !== undefined) updates.color = body.color ? sanitizeString(body.color, 50) : null;
    if (body.compatibility !== undefined) updates.compatibility = body.compatibility ? sanitizeString(body.compatibility, 250) : null;
    if (body.offer !== undefined) updates.offer = body.offer ? sanitizeString(body.offer, 200) : null;
    if (body.description !== undefined) updates.description = body.description ? sanitizeString(body.description, 2000) : null;
    if (body.original_price !== undefined) updates.original_price = body.original_price !== null && body.original_price !== '' ? Number(body.original_price) : null;
    if (body.discount_price !== undefined) updates.discount_price = body.discount_price !== null && body.discount_price !== '' ? Number(body.discount_price) : null;

    if (body.price !== undefined) {
      const pCheck = validatePositiveNumber(body.price, 1);
      if (!pCheck.valid) {
        return NextResponse.json({ error: 'Invalid price value.' }, { status: 400 });
      }
      updates.price = pCheck.value;
    }

    if (body.stock !== undefined) {
      const sCheck = validatePositiveNumber(body.stock, 0);
      if (!sCheck.valid) {
        return NextResponse.json({ error: 'Invalid stock value.' }, { status: 400 });
      }
      updates.stock = sCheck.value;
    }

    const updated = await updateAccessory(id, updates);

    // Invalidate Next.js cache
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/accessories');
      revalidatePath(`/accessory/${id}`);
      revalidatePath('/owner-portal/accessories');
      revalidatePath('/owner-portal');
    } catch (e) {
      console.warn('Revalidation warning:', e);
    }

    // Determine if price changed
    const isPriceChanged = existing.price !== updated.price;
    await logAuditEvent({
      ownerId,
      action: isPriceChanged ? 'PRICE_UPDATED' : 'ACCESSORY_UPDATED',
      targetTable: 'accessories',
      targetId: id,
      oldData: { price: existing.price, stock: existing.stock },
      newData: { price: updated.price, stock: updated.stock },
      ipAddress: ip,
      note: isPriceChanged
        ? `Price updated from ₹${existing.price} to ₹${updated.price}`
        : `Accessory "${updated.name}" updated`,
    });

    return NextResponse.json({
      success: true,
      accessory: updated,
      message: 'Accessory updated successfully',
    });
  } catch (error: any) {
    console.error('Owner accessory update error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update accessory details in database.' },
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
    const { id } = await params;
    const existing = await getAccessoryById(id);

    await deleteAccessory(id);

    // Invalidate Next.js cache
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/accessories');
      revalidatePath(`/accessory/${id}`);
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
      targetId: id,
      oldData: existing ? { name: existing.name, brand: existing.brand, price: existing.price } : undefined,
      ipAddress: ip,
      note: `Accessory "${existing?.name || id}" deleted`,
    });

    return NextResponse.json({
      success: true,
      message: 'Accessory deleted successfully.',
    });
  } catch (error: any) {
    console.error('Owner accessory delete error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete accessory from database.' },
      { status: 500 }
    );
  }
}

export const PATCH = PUT;
