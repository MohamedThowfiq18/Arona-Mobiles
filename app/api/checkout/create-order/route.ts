import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient } from '@/lib/supabase/server';
import { createRazorpayOrder, rupeeToPane } from '@/lib/razorpay';
import { v4 as uuidv4 } from 'uuid';

function generateOrderNumber() {
  return 'ARN' + Date.now().toString(36).toUpperCase();
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      items,
      address,
      pickup_schedule,
      pickup_notes,
      payment_method,
      subtotal,
      delivery_charge = 0,
      total,
      coupon_code,
      discount_amount,
    } = body;

    if (!items?.length || !address) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = getSupabaseAdminClient();
    const orderId = uuidv4();
    const orderNumber = generateOrderNumber();

    // Create order record for store pickup
    const initialStatus = 'pending';
    const isPayAtStore = payment_method === 'pay_at_store' || payment_method === 'cod';

    const { error: orderError } = await supabase.from('orders').insert({
      id: orderId,
      order_number: orderNumber,
      items,
      status: initialStatus,
      payment_status: 'pending',
      payment_method: payment_method || 'pay_at_store',
      address,
      coupon_code: coupon_code || null,
      subtotal,
      discount_amount: discount_amount || 0,
      delivery_charge: 0,
      total,
      tracking_history: [{
        status: initialStatus,
        timestamp: new Date().toISOString(),
        note: `Phone reservation received (${pickup_schedule || 'In-Store Pickup'}).`,
      }],
      notes: pickup_notes || null,
    });

    if (orderError) throw orderError;

    // If Pay at Store / COD — no payment gateway needed
    if (isPayAtStore) {
      return NextResponse.json({ orderId, orderNumber });
    }

    // Create Razorpay order for online payments
    const razorpayOrder = await createRazorpayOrder({
      amount: rupeeToPane(total),
      receipt: orderNumber,
      notes: { order_id: orderId },
    });

    // Save Razorpay order ID
    await supabase.from('orders').update({ razorpay_order_id: razorpayOrder.id }).eq('id', orderId);

    return NextResponse.json({ orderId, orderNumber, razorpayOrder });
  } catch (e) {
    console.error('Create order error:', e);
    return NextResponse.json({ error: 'Failed to create order' }, { status: 500 });
  }
}
