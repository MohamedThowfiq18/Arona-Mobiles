import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/otp';
import { sendMSG91OTP } from '@/lib/sms';
import { STORE_CONFIG } from '@/lib/constants';
import { validatePhoneNumber, getClientIP, getDeviceFingerprint } from '@/lib/security';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

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

    // 1. Rate Limiting Check
    const rateCheck = checkRateLimit(cleanPhone);
    if (!rateCheck.allowed) {
      await logAuditEvent({
        ownerId: `owner-${cleanPhone}`,
        action: 'OTP_RATE_LIMITED',
        ipAddress: ip,
        userAgent,
        note: `Rate limit hit during password recovery from phone ${cleanPhone}`,
      });
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

    await logAuditEvent({
      ownerId: `owner-${cleanPhone}`,
      action: 'OTP_REQUESTED',
      ipAddress: ip,
      userAgent,
      note: 'Password recovery OTP requested via MSG91 OTP Widget API',
    });

    // 3. Dispatch real SMS OTP via MSG91 Official OTP Widget API
    const smsResult = await sendMSG91OTP(cleanPhone);

    if (!smsResult.success) {
      return NextResponse.json({
        error: smsResult.error || 'Unable to send OTP. Please try again.',
      }, { status: smsResult.configured === false ? 503 : 500 });
    }

    await logAuditEvent({
      ownerId: `owner-${cleanPhone}`,
      action: 'OTP_SENT',
      ipAddress: ip,
      userAgent,
      note: `Password recovery MSG91 SMS OTP dispatched successfully (Req ID: ${smsResult.reqId || 'N/A'})`,
    });

    return NextResponse.json({
      success: true,
      phone: cleanPhone,
      reqId: smsResult.reqId,
      message: 'A 6-digit recovery code has been sent via SMS to your registered phone. Valid for 5 minutes.',
    });
  } catch (e) {
    console.error('Password reset request error:', e);
    return NextResponse.json({ error: 'Unable to process recovery request. Please try again later.' }, { status: 500 });
  }
}
