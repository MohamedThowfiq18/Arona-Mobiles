import { NextRequest, NextResponse } from 'next/server';
import { generateOTP, issueOTP, checkRateLimit } from '@/lib/otp';
import { sendOTPSMS } from '@/lib/sms';
import { STORE_CONFIG } from '@/lib/constants';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { validatePhoneNumber, getClientIP, getDeviceFingerprint } from '@/lib/security';
import { logAuditEvent } from '@/lib/audit';

const GENERIC_RECOVERY_RESPONSE = {
  success: true,
  message: 'If this phone number is registered, a 6-digit recovery code has been sent via SMS.',
};

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const { userAgent } = getDeviceFingerprint(request);

  try {
    const body = await request.json().catch(() => ({}));
    const { phone } = body;

    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      // Return same generic message to prevent enumeration
      return NextResponse.json(GENERIC_RECOVERY_RESPONSE);
    }

    const cleanPhone = phoneValidation.cleanPhone;

    // 1. Rate Limiting: Max 3 requests per 10 minutes
    const rateCheck = checkRateLimit(cleanPhone);
    if (!rateCheck.allowed) {
      return NextResponse.json({
        error: `Too many requests. Please wait ${rateCheck.remainingMinutes} minute(s) before requesting another recovery code.`,
      }, { status: 429 });
    }

    // 2. Authorization check (only authorized owner phones receive real SMS OTP)
    if (!STORE_CONFIG.authorizedOwnerPhones.includes(cleanPhone)) {
      await logAuditEvent({
        ownerId: `unauthorized-${cleanPhone}`,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        ipAddress: ip,
        userAgent,
        note: 'Password recovery requested for non-authorized phone number',
      });
      // Return uniform success response so attackers cannot discover authorized phone numbers
      return NextResponse.json(GENERIC_RECOVERY_RESPONSE);
    }

    // 3. Generate 6-digit cryptographically secure code
    const otp = generateOTP();
    const { expiresAt, codeHash } = issueOTP(cleanPhone, otp, `owner-${cleanPhone}`, 'forgot_password');

    // 4. Record in database if configured
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient();
        await supabase.from('otp_codes').insert({
          owner_id: `owner-${cleanPhone}`,
          code_hash: codeHash,
          expires_at: expiresAt.toISOString(),
          used: false,
        });
      } catch {
        // Continue
      }
    }

    // 5. Send direct SMS OTP (never logged or returned in response)
    await sendOTPSMS(cleanPhone, otp);

    await logAuditEvent({
      ownerId: `owner-${cleanPhone}`,
      action: 'PASSWORD_RESET_REQUESTED',
      ipAddress: ip,
      userAgent,
      note: 'Password recovery SMS OTP dispatched',
    });

    return NextResponse.json({
      success: true,
      phone: cleanPhone,
      message: 'If this phone number is registered, a 6-digit recovery code has been sent via SMS. Valid for 5 minutes.',
    });
  } catch (e) {
    console.error('Password reset request error:', e);
    return NextResponse.json({ error: 'Unable to process recovery request. Please try again later.' }, { status: 500 });
  }
}
