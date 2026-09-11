import { NextRequest, NextResponse } from 'next/server';
import { requireOwnerSession } from '@/lib/auth';
import { getAllAccessories, createAccessory, getAccessoryCategories } from '@/lib/accessories';

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
      { success: false, error: error?.message || 'Failed to fetch accessories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireOwnerSession(request);
  if (auth.errorResponse) return auth.errorResponse;

  try {
    const body = await request.json();
    if (!body.name || !body.brand || !body.category || body.price === undefined || body.stock === undefined) {
      return NextResponse.json(
        { success: false, error: 'Name, brand, category, price, and stock are required.' },
        { status: 400 }
      );
    }

    const created = await createAccessory(body);

    return NextResponse.json({
      success: true,
      accessory: created,
      message: 'Accessory created successfully',
    });
  } catch (error: any) {
    console.error('Owner accessory creation error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to create accessory' },
      { status: 500 }
    );
  }
}
