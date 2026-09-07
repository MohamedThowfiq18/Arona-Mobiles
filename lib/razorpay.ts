// ============================================================
// Razorpay integration (server-side only)
// Docs: https://razorpay.com/docs/payments/server-integration/nodejs/
// ============================================================

import crypto from 'crypto';

export interface RazorpayOrderParams {
  amount: number; // in paise (₹1 = 100 paise)
  currency?: string;
  receipt: string; // order number
  notes?: Record<string, string>;
}

export interface RazorpayOrder {
  id: string;
  entity: string;
  amount: number;
  amount_paid: number;
  amount_due: number;
  currency: string;
  receipt: string;
  status: string;
  created_at: number;
}

/**
 * Create a Razorpay order. Called from server actions only.
 */
export async function createRazorpayOrder(params: RazorpayOrderParams): Promise<RazorpayOrder> {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;

  if (!keyId || !keySecret) {
    throw new Error('Razorpay credentials not configured');
  }

  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${keyId}:${keySecret}`).toString('base64'),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      amount: params.amount, // already in paise
      currency: params.currency || 'INR',
      receipt: params.receipt,
      notes: params.notes || {},
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.description || 'Failed to create Razorpay order');
  }

  return response.json();
}

/**
 * Verify Razorpay payment signature.
 * Called server-side after payment to confirm authenticity.
 */
export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string
): boolean {
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keySecret) throw new Error('Razorpay secret not configured');

  const body = orderId + '|' + paymentId;
  const expectedSignature = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex');

  return expectedSignature === signature;
}

/**
 * Convert rupees to paise for Razorpay API
 */
export function rupeeToPane(rupees: number): number {
  return Math.round(rupees * 100);
}
