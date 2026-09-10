import { NextRequest, NextResponse } from 'next/server';
import { checkRateLimit } from '@/lib/otp';
import { sendMSG91OTP } from '@/lib/sms';
import { STORE_CONFIG } from '@/lib/constants';
import { getStoreSettings } from '@/lib/settings';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
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
    const { phone, checkOnly } = body;

    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      if (checkOnly) {
        return NextResponse.json({ error: 'Please enter a valid 10-digit registered mobile number.' }, { status: 400 });
      }
      return NextResponse.json(GENERIC_RECOVERY_RESPONSE);
    }

    const cleanPhone = phoneValidation.cleanPhone;

    // 1. Check dynamic authorized owner phones list and database
    const storeSettings = await getStoreSettings();
    const authorizedList = [
      ...STORE_CONFIG.authorizedOwnerPhones,
      ...(storeSettings.authorized_owner_phones || []),
    ];
    let isAuthorizedPhone = authorizedList.includes(cleanPhone);

    if (!isAuthorizedPhone && isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient();
        const { data } = await supabase.from('owners').select('phone').eq('phone', cleanPhone).maybeSingle();
        if (data?.phone) {
          isAuthorizedPhone = true;
        }
      } catch (dbErr) {
        console.warn('Database lookup warning during owner check:', dbErr);
      }
    }

    if (!isAuthorizedPhone) {
      await logAuditEvent({
        ownerId: `unauthorized-${cleanPhone}`,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        ipAddress: ip,
        userAgent,
        note: 'Password recovery requested for non-authorized phone number',
      });
      if (checkOnly) {
        return NextResponse.json({
          error: 'Unable to reset password. Please check your registered mobile number.',
        }, { status: 403 });
      }
      return NextResponse.json(GENERIC_RECOVERY_RESPONSE);
    }

    // If client is just checking authorization before triggering MSG91 Web SDK
    if (checkOnly) {
      return NextResponse.json({
        valid: true,
        cleanPhone,
        formattedMobile: `91${cleanPhone}`,
      });
    }

    // 2. Rate Limiting Check
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
