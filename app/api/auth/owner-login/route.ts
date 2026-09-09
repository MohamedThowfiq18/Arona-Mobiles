import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import bcrypt from 'bcryptjs';
import { checkRateLimit } from '@/lib/otp';
import { sendMSG91OTP } from '@/lib/sms';
import { createOwnerSession } from '@/lib/auth';
import { STORE_CONFIG } from '@/lib/constants';
import {
  checkLoginRateLimit,
  recordFailedLogin,
  clearLoginRateLimit,
  validatePhoneNumber,
  getClientIP,
  getDeviceFingerprint,
} from '@/lib/security';
import { logAuditEvent } from '@/lib/audit';

export const dynamic = 'force-dynamic';

const GENERIC_AUTH_ERROR = 'Invalid phone number or password.';

export async function POST(request: NextRequest) {
  const ip = getClientIP(request);
  const { deviceSummary, userAgent } = getDeviceFingerprint(request);

  try {
    const body = await request.json().catch(() => ({}));
    const { phone, password } = body;

    if (!phone || !password || typeof password !== 'string') {
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 400 });
    }

    // ── 1. Validate Phone Number Format ──────────────────────────────
    const phoneValidation = validatePhoneNumber(phone);
    if (!phoneValidation.valid) {
      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 400 });
    }
    const cleanPhone = phoneValidation.cleanPhone;

    // ── 2. Rate Limiting Check (Phone & IP) ───────────────────────────
    const ratePhone = checkLoginRateLimit(`phone:${cleanPhone}`);
    const rateIP = checkLoginRateLimit(`ip:${ip}`);

    if (!ratePhone.allowed || !rateIP.allowed) {
      const lockoutMin = ratePhone.lockoutMinutes || rateIP.lockoutMinutes || 15;
      await logAuditEvent({
        ownerId: `phone-${cleanPhone}`,
        action: 'LOGIN_FAILED',
        ipAddress: ip,
        userAgent,
        note: `Rate limit triggered: account locked for ${lockoutMin} minutes`,
      });
      return NextResponse.json({
        error: `Too many failed login attempts. Please try again after ${lockoutMin} minutes.`,
      }, { status: 429 });
    }

    // ── 3. Authorization Check (Pre-approved Owner Numbers) ──────────
    const isAuthorizedPhone = STORE_CONFIG.authorizedOwnerPhones.includes(cleanPhone);

    let owner: any = null;

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient();
        const { data } = await supabase
          .from('owners')
          .select('*')
          .eq('phone', cleanPhone)
          .single();
        owner = data;
      } catch {
        // Fallback gracefully
      }
    }

    // If phone is not authorized in store config, simulate work and return generic error
    if (!isAuthorizedPhone) {
      // Fake bcrypt compare to prevent timing side-channel attacks
      await bcrypt.compare(password, '$2a$10$e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855');
      recordFailedLogin(`phone:${cleanPhone}`);
      recordFailedLogin(`ip:${ip}`);

      await logAuditEvent({
        ownerId: `unauthorized-${cleanPhone}`,
        action: 'UNAUTHORIZED_ACCESS_ATTEMPT',
        ipAddress: ip,
        userAgent,
        note: `Login attempted on non-authorized owner number`,
      });

      return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
    }

    // Initial setup if owner account does not exist in DB yet
    if (!owner) {
      // Default fallback master check for initial setup
      const isMasterPassword = password === 'admin123' || password === 'owner123' || password === 'arona123';
      if (!isMasterPassword) {
        recordFailedLogin(`phone:${cleanPhone}`);
        recordFailedLogin(`ip:${ip}`);
        await logAuditEvent({
          ownerId: `phone-${cleanPhone}`,
          action: 'LOGIN_FAILED',
          ipAddress: ip,
          userAgent,
          note: 'Invalid initial password attempt',
        });
        return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
      }

      const passwordHash = await bcrypt.hash(password, 10);

      if (isSupabaseConfigured()) {
        try {
          const supabase = getSupabaseAdminClient();
          const { data: newOwner } = await supabase
            .from('owners')
            .insert({
              phone: cleanPhone,
              password_hash: passwordHash,
              otp_verified: false,
              last_login_device: deviceSummary,
            })
            .select()
            .single();
          owner = newOwner;
        } catch {
          // Fallback
        }
      }

      owner = owner || {
        id: `owner-${cleanPhone}`,
        phone: cleanPhone,
        otp_verified: false,
        password_hash: passwordHash,
      };
    } else {
      // Check database lock status if exists
      if (owner.locked_until && new Date(owner.locked_until) > new Date()) {
        return NextResponse.json({
          error: 'Account temporarily locked due to failed attempts. Please try again later.',
        }, { status: 429 });
      }

      // ── 4. Verify Password with bcrypt ─────────────────────────────
      let valid = false;
      if (owner.password_hash) {
        valid = await bcrypt.compare(password, owner.password_hash);
      }

      if (!valid) {
        const phoneLock = recordFailedLogin(`phone:${cleanPhone}`);
        recordFailedLogin(`ip:${ip}`);

        if (isSupabaseConfigured()) {
          try {
            const supabase = getSupabaseAdminClient();
            const attempts = (owner.failed_login_attempts || 0) + 1;
            const lockedUntil = attempts >= 5
              ? new Date(Date.now() + 15 * 60000).toISOString()
              : null;
            await supabase.from('owners').update({
              failed_login_attempts: attempts,
              ...(lockedUntil ? { locked_until: lockedUntil } : {}),
            }).eq('id', owner.id);
          } catch {
            // ignore
          }
        }

        await logAuditEvent({
          ownerId: owner.id || `owner-${cleanPhone}`,
          action: 'LOGIN_FAILED',
          ipAddress: ip,
          userAgent,
          note: phoneLock.locked ? 'Password incorrect - Account locked for 15 mins' : 'Password incorrect',
        });

        if (phoneLock.locked) {
          return NextResponse.json({
            error: 'Too many failed login attempts. Account locked for 15 minutes.',
          }, { status: 429 });
        }

        return NextResponse.json({ error: GENERIC_AUTH_ERROR }, { status: 401 });
      }

      // Password is valid → reset failure counters
      clearLoginRateLimit(`phone:${cleanPhone}`);
      clearLoginRateLimit(`ip:${ip}`);

      if (isSupabaseConfigured()) {
        try {
          const supabase = getSupabaseAdminClient();
          await supabase.from('owners').update({
            failed_login_attempts: 0,
            locked_until: null,
            last_login_at: new Date().toISOString(),
            last_login_device: deviceSummary,
          }).eq('id', owner.id);
        } catch {
          // ignore
        }
      }
    }

    // If client requested credential validation before calling MSG91 Web SDK sendOtp
    if (body.checkOnly) {
      console.info(`[MSG91 OTP] Owner credentials validated for ${cleanPhone}; ready for MSG91 Web SDK`);
      return NextResponse.json({
        valid: true,
        ownerId: owner.id,
        cleanPhone,
        formattedMobile: `91${cleanPhone}`,
      });
    }

    // ── 5. Always Require Real MSG91 SMS OTP ────────────────────────
    const rateCheck = checkRateLimit(cleanPhone);
    if (!rateCheck.allowed) {
      await logAuditEvent({
        ownerId: owner.id || `owner-${cleanPhone}`,
        action: 'OTP_RATE_LIMITED',
        ipAddress: ip,
        userAgent,
        note: `Too many OTP requests from phone ${cleanPhone}`,
      });
      return NextResponse.json({
        error: `Too many OTP requests. Please wait ${rateCheck.remainingMinutes} minute(s) before requesting another code.`,
      }, { status: 429 });
    }

    await logAuditEvent({
      ownerId: owner.id || `owner-${cleanPhone}`,
      action: 'OTP_REQUESTED',
      ipAddress: ip,
      userAgent,
      note: 'Login OTP requested via MSG91 OTP Widget API',
    });

    // Send real SMS OTP via MSG91 Official OTP Widget API
    const smsResult = await sendMSG91OTP(cleanPhone);

    if (!smsResult.success) {
      return NextResponse.json({
        error: smsResult.error || 'Unable to send OTP. Please try again.',
      }, { status: smsResult.configured === false ? 503 : 500 });
    }

    await logAuditEvent({
      ownerId: owner.id || `owner-${cleanPhone}`,
      action: 'OTP_SENT',
      ipAddress: ip,
      userAgent,
      note: `MSG91 real SMS OTP dispatched successfully (Req ID: ${smsResult.reqId || 'N/A'})`,
    });

    return NextResponse.json({
      requiresOtp: true,
      ownerId: owner.id,
      phone: cleanPhone,
      reqId: smsResult.reqId,
      message: `A 6-digit verification code has been sent via SMS to your registered phone. Valid for 15 minutes.`,
    });
  } catch (e) {
    console.error('Owner login unexpected error:', e);
    // Generic safe error message (never leak database/internal details)
    return NextResponse.json({ error: 'Authentication failed. Please try again later.' }, { status: 500 });
  }
}
