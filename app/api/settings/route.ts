import { NextResponse } from 'next/server';
import { getStoreSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const settings = await getStoreSettings();
    return NextResponse.json({ success: true, settings });
  } catch (error) {
    console.error('Error retrieving store settings:', error);
    return NextResponse.json({ error: 'Failed to retrieve store settings.' }, { status: 500 });
  }
}
