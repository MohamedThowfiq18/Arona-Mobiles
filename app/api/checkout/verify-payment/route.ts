import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/server';
import { verifyRazorpaySignature } from '@/lib/razorpay';

export async function POST(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId } = await request.json();

    const valid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!valid) {
      return NextResponse.json({ error: 'Payment verification failed' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();

    // Update order to paid + confirmed
    await supabase.from('orders').update({
      payment_status: 'paid',
      status: 'confirmed',
      razorpay_payment_id,
      tracking_history: supabase.rpc('jsonb_append', {
        arr: 'tracking_history',
        obj: { status: 'confirmed', timestamp: new Date().toISOString(), note: 'Payment successful' },
      }),
    }).eq('id', orderId);

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('Payment verify error:', e);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
