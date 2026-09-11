import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { requireOwnerSession } from '@/lib/auth';
import { getAllAccessories, createAccessory, getAccessoryCategories } from '@/lib/accessories';
import { sanitizeString, validatePositiveNumber, getClientIP } from '@/lib/security';
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
    console.error('Owner accessories fetch error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to retrieve accessories.' },
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

    // Server-side input validation and sanitization
    const name = sanitizeString(body.name, 150);
    const brand = sanitizeString(body.brand, 50);
    const category = sanitizeString(body.category, 100);
    const priceCheck = validatePositiveNumber(body.price, 1);
    const stockCheck = validatePositiveNumber(body.stock, 0);

    if (!name || !brand || !category || !priceCheck.valid || !stockCheck.valid) {
      return NextResponse.json(
        { error: 'Valid name, brand, category, price (greater than 0), and stock are required.' },
        { status: 400 }
      );
    }

    const sanitizedData = {
      ...body,
      name,
      brand,
      category,
      subcategory: body.subcategory ? sanitizeString(body.subcategory, 100) : undefined,
      model_sku: body.model_sku ? sanitizeString(body.model_sku, 100) : undefined,
      color: body.color ? sanitizeString(body.color, 50) : undefined,
      compatibility: body.compatibility ? sanitizeString(body.compatibility, 250) : undefined,
      offer: body.offer ? sanitizeString(body.offer, 200) : undefined,
      price: priceCheck.value,
      original_price: body.original_price !== undefined && body.original_price !== null && body.original_price !== ''
        ? Number(body.original_price)
        : undefined,
      discount_price: body.discount_price !== undefined && body.discount_price !== null && body.discount_price !== ''
        ? Number(body.discount_price)
        : undefined,
      stock: stockCheck.value,
      description: body.description ? sanitizeString(body.description, 2000) : undefined,
    };

    const created = await createAccessory(sanitizedData);

    // Invalidate Next.js cache across all relevant paths
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
      message: 'Accessory added successfully!',
    }, { status: 201 });
  } catch (error: any) {
    console.error('Owner accessory creation error:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    });
    return NextResponse.json(
      { error: error?.message || 'Failed to create accessory in database. Please check input parameters.' },
      { status: 500 }
    );
  }
}
