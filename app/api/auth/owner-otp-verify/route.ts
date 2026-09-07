import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { verifyOTP } from '@/lib/otp';
import { createOwnerSession, setSessionCookie } from '@/lib/auth';
import { getClientIP, getDeviceFingerprint } from '@/lib/security';
import { logAuditEvent } from '@/lib/audit';

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const { userAgent, deviceSummary } = getDeviceFingerprint(request);

  try {
    const body = await request.json().catch(() => ({}));
    const { ownerId, otp } = body;

    if (!ownerId || !otp || typeof otp !== 'string') {
      return NextResponse.json({ error: 'Verification code is required.' }, { status: 400 });
    }

    const cleanOtp = String(otp).trim();

    // Verify OTP using security engine (6 digits, 5-min expiry, max 5 attempts, single-use)
    const verification = verifyOTP(ownerId, cleanOtp);

    if (!verification.valid) {
      await logAuditEvent({
        ownerId: String(ownerId),
        action: 'OTP_FAILED',
        ipAddress: ip,
        userAgent,
        note: `OTP verification failed: ${verification.error}`,
      });

      return NextResponse.json({
        error: verification.error || 'Invalid or expired verification code.',
        attemptsRemaining: verification.attemptsRemaining,
      }, { status: 401 });
    }

    // Success: mark OTP verified
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient();
        await supabase.from('owners').update({
          otp_verified: true,
          last_login_at: new Date().toISOString(),
          last_login_device: deviceSummary,
        }).eq('id', ownerId);
      } catch {
        // ignore
      }
    }

    let ownerPhone = verification.phone || '';
    if (!ownerPhone && String(ownerId).startsWith('owner-')) {
      ownerPhone = String(ownerId).replace('owner-', '');
    }

    // Create session token
    const token = await createOwnerSession(ownerId, ownerPhone);
    await setSessionCookie(token);

    await logAuditEvent({
      ownerId: String(ownerId),
      action: 'OTP_VERIFIED',
      targetTable: 'owners',
      targetId: String(ownerId),
      ipAddress: ip,
      userAgent,
      note: `2FA phone ownership verified successfully`,
    });

    const res = NextResponse.json({
      success: true,
      message: 'Verification successful. Welcome to the Owner Portal.',
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
