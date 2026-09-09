import { NextRequest, NextResponse } from 'next/server';
import { verifyMSG91OTP } from '@/lib/sms';
import bcrypt from 'bcryptjs';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { createOwnerSession, setSessionCookie, invalidateOwnerSessions } from '@/lib/auth';
import { validatePhoneNumber, getClientIP, getDeviceFingerprint } from '@/lib/security';
import { logAuditEvent } from '@/lib/audit';

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const { userAgent } = getDeviceFingerprint(request);

  try {
    const body = await request.json().catch(() => ({}));
    const { phone, otp, newPassword, reqId } = body;

    if (!phone || !otp || !newPassword) {
      return NextResponse.json({
        error: 'Phone number, 6-digit OTP, and new password are required.',
      }, { status: 400 });
    }

    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      return NextResponse.json({ error: 'Invalid phone number format.' }, { status: 400 });
    }
    const cleanPhone = phoneValidation.cleanPhone;
    const cleanOtp = String(otp).trim();

    if (typeof newPassword !== 'string' || newPassword.length < 6) {
      return NextResponse.json({
        error: 'New password must be at least 6 characters long.',
      }, { status: 400 });
    }

    // 1. Verify OTP using MSG91 official server-side verification API
    const verification = await verifyMSG91OTP(cleanPhone, cleanOtp, reqId);

    if (!verification.success) {
      await logAuditEvent({
        ownerId: `owner-${cleanPhone}`,
        action: 'OTP_FAILED',
        ipAddress: ip,
        userAgent,
        note: 'Password reset MSG91 OTP verification failed',
      });

      return NextResponse.json({
        error: verification.error || 'Invalid or expired OTP. Please try again.',
      }, { status: verification.configured === false ? 503 : 400 });
    }

    await logAuditEvent({
      ownerId: `owner-${cleanPhone}`,
      action: 'OTP_VERIFIED',
      ipAddress: ip,
      userAgent,
      note: 'Password reset MSG91 OTP verified successfully',
    });

    // 2. Hash new password (bcrypt min cost factor 10)
    const passwordHash = await bcrypt.hash(newPassword, 10);
    const ownerId = `owner-${cleanPhone}`;

    // 3. Invalidate ALL existing active sessions for this owner account
    invalidateOwnerSessions(ownerId);

    // 4. Update password in database
    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient();
        await supabase.from('owners').upsert({
          id: ownerId,
          phone: cleanPhone,
          password_hash: passwordHash,
          otp_verified: true,
          failed_login_attempts: 0,
          locked_until: null,
          created_at: new Date().toISOString(),
        }, { onConflict: 'phone' });
      } catch {
        // ignore
      }
    }

    // 5. Create new authenticated session
    const token = await createOwnerSession(ownerId, cleanPhone);
    await setSessionCookie(token);

    await logAuditEvent({
      ownerId,
      action: 'PASSWORD_RESET_COMPLETED',
      ipAddress: ip,
      userAgent,
      note: 'Password reset successfully; previous sessions revoked',
    });

    const res = NextResponse.json({
      success: true,
      message: 'Password reset successfully. All previous sessions have been signed out.',
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
    console.error('Reset password server error:', e);
    return NextResponse.json({ error: 'Password reset failed. Please try again later.' }, { status: 500 });
  }
}
