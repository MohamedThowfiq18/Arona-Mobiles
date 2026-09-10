import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getAllProducts, createProduct } from '@/lib/products';
import { requireOwnerSession } from '@/lib/auth';
import { sanitizeString, validatePositiveNumber, getClientIP } from '@/lib/security';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  const auth = await requireOwnerSession(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const products = await getAllProducts(true);
    return NextResponse.json({ success: true, products });
  } catch (error) {
    console.error('Error fetching owner products:', error);
    return NextResponse.json({ error: 'Failed to retrieve products.' }, { status: 500 });
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
    const brand = sanitizeString(body.brand, 50);
    const model = sanitizeString(body.model, 100);
    const priceCheck = validatePositiveNumber(body.price, 1);
    const stockCheck = validatePositiveNumber(body.stock, 0);

    if (!brand || !model || !priceCheck.valid || !stockCheck.valid) {
      return NextResponse.json(
        { error: 'Valid brand, model, price (greater than 0), and stock are required.' },
        { status: 400 }
      );
    }

    const sanitizedData = {
      ...body,
      brand,
      model,
      price: priceCheck.value,
      stock: stockCheck.value,
      short_description: sanitizeString(body.short_description, 500),
      description: sanitizeString(body.description, 2000),
      condition: body.condition === 'pre-owned' ? 'pre-owned' : 'new',
    };

    const product = await createProduct(sanitizedData);

    // Invalidate Next.js and Vercel cache across all relevant paths
    try {
      revalidatePath('/', 'layout');
      revalidatePath('/shop');
      revalidatePath('/certified-preowned');
      revalidatePath('/owner-portal/products');
      revalidatePath('/owner-portal');
    } catch (e) {
      console.warn('Revalidation warning:', e);
    }

    await logAuditEvent({
      ownerId,
      action: 'PRODUCT_CREATED',
      targetTable: 'products',
      targetId: product.id,
      newData: { brand: product.brand, model: product.model, price: product.price, stock: product.stock },
      ipAddress: ip,
      note: `Product "${product.brand} ${product.model}" created`,
    });

    return NextResponse.json({
      success: true,
      message: 'Product added successfully!',
      product,
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product. Please check input parameters.' },
      { status: 500 }
    );
  }
}
