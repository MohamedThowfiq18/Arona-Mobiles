import { NextRequest, NextResponse } from 'next/server';
import { getAccessoryById } from '@/lib/accessories';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } | Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params;
    const accessory = await getAccessoryById(resolvedParams.id);

    if (!accessory || !accessory.is_active) {
      return NextResponse.json(
        { success: false, error: 'Accessory not found or inactive' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      accessory,
    });
  } catch (error: any) {
    console.error('Error fetching single accessory:', error);
    return NextResponse.json(
      { success: false, error: error?.message || 'Failed to fetch accessory' },
      { status: 500 }
    );
  }
}
