import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { updateProduct, deleteProduct, getProductByIdOrSlug } from '@/lib/products';
import { requireOwnerSession } from '@/lib/auth';
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
    const product = await getProductByIdOrSlug(id);
    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }
    return NextResponse.json({ success: true, product });
  } catch (error) {
    console.error('Error fetching product by ID:', error);
    return NextResponse.json({ error: 'Failed to retrieve product details.' }, { status: 500 });
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
    const existing = await getProductByIdOrSlug(id);

    if (!existing) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    // Input sanitization
    const updates: Record<string, any> = { ...body };
    if (body.brand) updates.brand = sanitizeString(body.brand, 50);
    if (body.model) updates.model = sanitizeString(body.model, 100);
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

    const updated = await updateProduct(id, updates);

    if (!updated) {
      return NextResponse.json({ error: 'Failed to update product.' }, { status: 404 });
    }

    // Invalidate Next.js cache
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/shop');
      revalidatePath('/certified-preowned');
      revalidatePath(`/product/${id}`);
      if (existing.slug) revalidatePath(`/product/${existing.slug}`);
      revalidatePath('/owner-portal/products');
      revalidatePath('/owner-portal');
    } catch (e) {
      console.warn('Revalidation warning:', e);
    }

    // Determine if price changed
    const isPriceChanged = existing.price !== updated.price;
    await logAuditEvent({
      ownerId,
      action: isPriceChanged ? 'PRICE_UPDATED' : 'PRODUCT_UPDATED',
      targetTable: 'products',
      targetId: id,
      oldData: { price: existing.price, stock: existing.stock },
      newData: { price: updated.price, stock: updated.stock },
      ipAddress: ip,
      note: isPriceChanged
        ? `Price updated from ₹${existing.price} to ₹${updated.price}`
        : `Product details updated`,
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error) {
    console.error('Error updating product:', error);
    return NextResponse.json(
      { error: 'Failed to update product details.' },
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
    const existing = await getProductByIdOrSlug(id);

    await deleteProduct(id);

    // Invalidate Next.js cache
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/shop');
      revalidatePath('/certified-preowned');
      revalidatePath(`/product/${id}`);
      if (existing?.slug) revalidatePath(`/product/${existing.slug}`);
      revalidatePath('/owner-portal/products');
      revalidatePath('/owner-portal');
    } catch (e) {
      console.warn('Revalidation warning:', e);
    }

    await logAuditEvent({
      ownerId,
      action: 'PRODUCT_DELETED',
      targetTable: 'products',
      targetId: id,
      oldData: existing ? { brand: existing.brand, model: existing.model, price: existing.price } : undefined,
      ipAddress: ip,
      note: `Product deleted (ID: ${id})`,
    });

    return NextResponse.json({ success: true, message: 'Product deleted successfully.' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json(
      { error: 'Failed to delete product.' },
      { status: 500 }
    );
  }
}
