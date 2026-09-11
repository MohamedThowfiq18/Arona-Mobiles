import { NextRequest, NextResponse } from 'next/server';
import { requireOwnerSession } from '@/lib/auth';
import { getAccessoryById, updateAccessory, deleteAccessory } from '@/lib/accessories';

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
    console.error('Owner single accessory fetch error:', error);
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

  try {
    const resolvedParams = await params;
    const body = await request.json();
    const updated = await updateAccessory(resolvedParams.id, body);

    return NextResponse.json({
      success: true,
      accessory: updated,
      message: 'Accessory updated successfully',
    });
  } catch (error: any) {
    console.error('Owner accessory update error:', error);
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

  try {
    const resolvedParams = await params;
    await deleteAccessory(resolvedParams.id);

    return NextResponse.json({
      success: true,
      message: 'Accessory deleted successfully',
    });
  } catch (error: any) {
    console.error('Owner accessory delete error:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to delete accessory' },
      { status: 500 }
    );
  }
}
