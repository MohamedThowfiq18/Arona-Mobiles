import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { verifyMSG91OTP, normalizeIndianMobile } from '@/lib/sms';
import { createOwnerSession, setSessionCookie } from '@/lib/auth';
import { getClientIP, getDeviceFingerprint } from '@/lib/security';
import { logAuditEvent } from '@/lib/audit';
import { STORE_CONFIG } from '@/lib/constants';
import { getStoreSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const { userAgent, deviceSummary } = getDeviceFingerprint(request);

  try {
    const body = await request.json().catch(() => ({}));
    const { ownerId, phone, otp, reqId } = body;

    if ((!ownerId && !phone) || !otp) {
      return NextResponse.json({ error: 'Mobile number and verification code are required.' }, { status: 400 });
    }

    const cleanPhone = normalizeIndianMobile(phone || ownerId);
    const cleanOtp = String(otp).trim();

    // Check dynamic & pre-approved owner authorization
    const storeSettings = await getStoreSettings();
    const authorizedList = [
      ...STORE_CONFIG.authorizedOwnerPhones,
      ...(storeSettings.authorized_owner_phones || []),
    ];

    if (!authorizedList.includes(cleanPhone)) {
      await logAuditEvent({
        ownerId: `unauthorized-${cleanPhone}`,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        ipAddress: ip,
        userAgent,
        note: 'OTP verification attempted for non-authorized phone number',
      });
      return NextResponse.json({ error: 'Access Denied: Phone number is not authorized.' }, { status: 403 });
    }


    // Verify OTP using MSG91 official server-side verification API
    const verification = await verifyMSG91OTP(cleanPhone, cleanOtp, reqId);

    if (!verification.success) {
      await logAuditEvent({
        ownerId: `owner-${cleanPhone}`,
        action: 'OTP_FAILED',
        ipAddress: ip,
        userAgent,
        note: `MSG91 OTP verification failed: ${verification.error || 'Invalid or expired OTP.'}`,
      });

      return NextResponse.json({
        error: verification.error || 'Invalid or expired OTP. Please try again.',
      }, { status: verification.configured === false ? 503 : 400 });
    }

    const resolvedOwnerId = ownerId || `owner-${cleanPhone}`;

    // Success: mark owner as OTP verified in database
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient();
        await supabase.from('owners').update({
          otp_verified: true,
          last_login_at: new Date().toISOString(),
          last_login_device: deviceSummary,
        }).eq('phone', cleanPhone);
      } catch {
        // ignore
      }
    }

    // Create session token with device metadata and set httpOnly cookie
    const token = await createOwnerSession(resolvedOwnerId, cleanPhone, request);
    await setSessionCookie(token);

    await logAuditEvent({
      ownerId: `owner-${cleanPhone}`,
      action: 'OTP_VERIFIED',
      targetTable: 'owners',
      targetId: resolvedOwnerId,
      ipAddress: ip,
      userAgent,
      note: 'MSG91 real OTP verified successfully',
    });

    await logAuditEvent({
      ownerId: `owner-${cleanPhone}`,
      action: 'LOGIN_SUCCESS',
      ipAddress: ip,
      userAgent,
      note: `Owner logged in successfully (${deviceSummary})`,
    });

    const res = NextResponse.json({
      success: true,
      message: 'Login Successful! Welcome back to ARONA MOBILES Owner Portal.',
    });

    res.cookies.set('arona_owner_session', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 3600,
      path: '/',
    });

    return res;
  } catch (e) {
    console.error('OTP verify server error:', e);
    return NextResponse.json({ error: 'Verification process failed. Please try again.' }, { status: 500 });
  }
}
