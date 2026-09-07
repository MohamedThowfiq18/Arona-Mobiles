import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code')?.toUpperCase();
  const amount = Number(request.nextUrl.searchParams.get('amount') || 0);

  if (!code) return NextResponse.json({ error: 'No coupon code provided' }, { status: 400 });

  const supabase = getSupabaseAdminClient();
  const { data: coupon } = await supabase
    .from('coupons')
    .select('*')
    .eq('code', code)
    .eq('is_active', true)
    .single();

  if (!coupon) return NextResponse.json({ error: 'Invalid or expired coupon code' }, { status: 404 });
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date())
    return NextResponse.json({ error: 'This coupon has expired' }, { status: 400 });
  if (coupon.min_order_value && amount < coupon.min_order_value)
    return NextResponse.json({ error: `Minimum order value ₹${coupon.min_order_value} required` }, { status: 400 });
  if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit)
    return NextResponse.json({ error: 'Coupon usage limit reached' }, { status: 400 });

  let discount = 0;
  if (coupon.discount_type === 'flat') {
    discount = coupon.discount_value;
  } else {
    discount = Math.round(amount * coupon.discount_value / 100);
    if (coupon.max_discount) discount = Math.min(discount, coupon.max_discount);
  }

  return NextResponse.json({ discount, description: coupon.description });
}
