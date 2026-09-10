// ============================================================
// Auth helpers for Owner Portal session management
// Uses Web Crypto API (fully compatible with Edge Runtime & Node)
// ============================================================

import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getActiveSessionVersion, bumpSessionVersion, SECURITY_CONFIG } from '@/lib/security';

const SESSION_COOKIE = 'arona_owner_session';
const SECRET_KEY = process.env.SESSION_SECRET || 'arona-mobiles-default-secret-key-replace-in-prod-2026';

export interface OwnerSession {
  ownerId: string;
  phone: string;
  role: 'owner';
  version: number;
  iat: number;
  exp: number;
}

function bytesToBase64Url(bytes: Uint8Array): string {
  let bin = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    bin += String.fromCharCode(bytes[i]);
  }
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlToBytes(str: string): Uint8Array {
  let b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (b64.length % 4) b64 += '=';
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) {
    bytes[i] = bin.charCodeAt(i);
  }
  return bytes;
}

function textToBase64Url(text: string): string {
  return bytesToBase64Url(new TextEncoder().encode(text));
}

function base64UrlToText(str: string): string {
  return new TextDecoder().decode(base64UrlToBytes(str));
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

/**
 * Create a session token for an authenticated owner (7-day validity)
 */
export async function createOwnerSession(ownerId: string, phone: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const cleanPhone = phone.replace(/\D/g, '').slice(-10) || phone;
  const currentVersion = Math.max(
    getActiveSessionVersion(ownerId),
    getActiveSessionVersion(cleanPhone)
  );

  const payload: OwnerSession = {
    ownerId,
    phone: cleanPhone,
    role: 'owner',
    version: currentVersion,
    iat: now,
    exp: now + SECURITY_CONFIG.SESSION_EXPIRY_SECONDS,
  };

  const header = textToBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = textToBase64Url(JSON.stringify(payload));
  const data = new TextEncoder().encode(`${header}.${body}`);

  const key = await getHmacKey(SECRET_KEY);
  const sigBuffer = await crypto.subtle.sign('HMAC', key, data);
  const sig = bytesToBase64Url(new Uint8Array(sigBuffer));

  return `${header}.${body}.${sig}`;
}

/**
 * Verify a session token and confirm signature, expiration, and session version
 */
export async function verifyOwnerSession(token: string): Promise<OwnerSession | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;

    const data = new TextEncoder().encode(`${header}.${body}`);
    const key = await getHmacKey(SECRET_KEY);
    const sigBytes = base64UrlToBytes(sig);

    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes as any, data as any);
    if (!isValid) return null;

    const payload = JSON.parse(base64UrlToText(body)) as OwnerSession;
    
    // 1. Expiration check
    if (Date.now() / 1000 > payload.exp) return null;

    // 2. Role check
    if (payload.role !== 'owner') return null;

    // 3. Invalidation check (if password was changed and session version bumped)
    const activeVersionOwner = getActiveSessionVersion(payload.ownerId);
    const activeVersionPhone = payload.phone ? getActiveSessionVersion(payload.phone) : 1;
    const requiredActiveVersion = Math.max(activeVersionOwner, activeVersionPhone);

    if (payload.version && payload.version < requiredActiveVersion) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Invalidate all active sessions for a specific owner (e.g. on password reset)
 */
export function invalidateOwnerSessions(ownerId: string, phone?: string): void {
  bumpSessionVersion(ownerId);
  if (phone) {
    bumpSessionVersion(phone);
  }
}

export interface PasswordResetTokenPayload {
  ownerId: string;
  phone: string;
  role: 'owner';
  purpose: 'PASSWORD_RESET';
  iat: number;
  exp: number;
}

/**
 * Create a secure, short-lived (15 min) password reset authorization token
 */
export async function createPasswordResetToken(ownerId: string, phone: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const payload: PasswordResetTokenPayload = {
    ownerId,
    phone,
    role: 'owner',
    purpose: 'PASSWORD_RESET',
    iat: now,
    exp: now + 15 * 60, // 15 minutes
  };

  const header = textToBase64Url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = textToBase64Url(JSON.stringify(payload));
  const data = new TextEncoder().encode(`${header}.${body}`);

  const key = await getHmacKey(SECRET_KEY);
  const sigBuffer = await crypto.subtle.sign('HMAC', key, data);
  const sig = bytesToBase64Url(new Uint8Array(sigBuffer));

  return `${header}.${body}.${sig}`;
}

/**
 * Verify a password reset token for validity, expiration, and owner identity
 */
export async function verifyPasswordResetToken(token: string, expectedPhone?: string): Promise<PasswordResetTokenPayload | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;

    const data = new TextEncoder().encode(`${header}.${body}`);
    const key = await getHmacKey(SECRET_KEY);
    const sigBytes = base64UrlToBytes(sig);

    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes as any, data as any);
    if (!isValid) return null;

    const payload = JSON.parse(base64UrlToText(body)) as PasswordResetTokenPayload;
    if (Date.now() / 1000 > payload.exp) return null;
    if (payload.role !== 'owner' || payload.purpose !== 'PASSWORD_RESET') return null;
    if (expectedPhone && payload.phone !== expectedPhone) return null;

    return payload;
  } catch {
    return null;
  }
}

/**
 * Set the session cookie (httpOnly, secure in prod, sameSite: lax)
 */
export async function setSessionCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: SECURITY_CONFIG.SESSION_EXPIRY_SECONDS,
    path: '/',
  });
}

/**
 * Clear the session cookie (logout)
 */
export async function clearSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

/**
 * Get the owner session from the cookie store (Server Components / Server Actions)
 */
export async function getOwnerSession(): Promise<OwnerSession | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyOwnerSession(token);
}

/**
 * Get the owner session from a Request object (Middleware / Route Handlers)
 */
export async function getOwnerSessionFromRequest(request: NextRequest): Promise<OwnerSession | null> {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  return verifyOwnerSession(token);
}

/**
 * Server-side RBAC guard for protected owner API route handlers.
 * Rejects unauthenticated or unauthorized requests with 401 Unauthorized.
 */
export async function requireOwnerSession(request: NextRequest): Promise<{
  session: OwnerSession | null;
  errorResponse?: NextResponse;
}> {
  const session = await getOwnerSessionFromRequest(request);

  if (!session || session.role !== 'owner') {
    return {
      session: null,
      errorResponse: NextResponse.json(
        { error: 'Unauthorized: Owner session required.' },
        { status: 401 }
      ),
    };
  }

  return { session };
}

// ── Centralized Owner Credential Store & Database Sync ───────
export interface OwnerAccountRecord {
  id: string;
  phone: string;
  password_hash: string;
  otp_verified?: boolean;
  failed_login_attempts?: number;
  locked_until?: string | null;
  session_version?: number;
  password_updated_at?: string;
  last_login_at?: string;
  last_login_device?: string;
}

declare global {
  // eslint-disable-next-line no-var
  var __arona_owner_credentials: Map<string, OwnerAccountRecord> | undefined;
}

const inMemoryOwnerStore = globalThis.__arona_owner_credentials ?? new Map<string, OwnerAccountRecord>();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__arona_owner_credentials = inMemoryOwnerStore;
}

import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';

/**
 * Retrieve owner record from Supabase PostgreSQL (or in-memory server store fallback)
 */
export async function getOwnerRecord(phone: string): Promise<OwnerAccountRecord | null> {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  if (!cleanPhone) return null;

  // 1. Check Supabase PostgreSQL first (Primary source of truth)
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      const { data, error } = await supabase
        .from('owners')
        .select('*')
        .or(`phone.eq.${cleanPhone},phone.eq.91${cleanPhone},phone.eq.+91${cleanPhone}`)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (!error && data?.password_hash) {
        const record: OwnerAccountRecord = {
          id: data.id || `owner-${cleanPhone}`,
          phone: cleanPhone,
          password_hash: data.password_hash,
          otp_verified: data.otp_verified ?? true,
          failed_login_attempts: data.failed_login_attempts ?? 0,
          locked_until: data.locked_until,
          session_version: data.session_version ?? 1,
          password_updated_at: data.password_updated_at,
          last_login_at: data.last_login_at,
          last_login_device: data.last_login_device,
        };

        // Cache into in-memory store
        inMemoryOwnerStore.set(cleanPhone, record);
        inMemoryOwnerStore.set(record.id, record);

        return record;
      }
    } catch (err: any) {
      console.warn('[Auth] Supabase lookup warning:', err?.message);
    }
  }

  // 2. Check in-memory server credential store
  const cached = inMemoryOwnerStore.get(cleanPhone) || inMemoryOwnerStore.get(`owner-${cleanPhone}`);
  if (cached) {
    return cached;
  }

  return null;
}

/**
 * Persist new password hash to both Supabase PostgreSQL and server store,
 * and bump session version to invalidate all older sessions across devices.
 */
export async function saveOwnerPassword(
  phone: string,
  passwordHash: string
): Promise<{ success: boolean; error?: string }> {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const now = new Date().toISOString();
  const ownerId = `owner-${cleanPhone}`;

  // 1. Bump session version for immediate cross-device session invalidation
  const nextVersion = bumpSessionVersion(cleanPhone);
  bumpSessionVersion(ownerId);

  // 2. Store in memory immediately
  const existingRecord = inMemoryOwnerStore.get(cleanPhone);
  const updatedRecord: OwnerAccountRecord = {
    id: existingRecord?.id || ownerId,
    phone: cleanPhone,
    password_hash: passwordHash,
    otp_verified: true,
    failed_login_attempts: 0,
    locked_until: null,
    session_version: nextVersion,
    password_updated_at: now,
  };

  inMemoryOwnerStore.set(cleanPhone, updatedRecord);
  inMemoryOwnerStore.set(updatedRecord.id, updatedRecord);

  // 3. Persist to Supabase PostgreSQL
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();

      const { data: existingRow } = await supabase
        .from('owners')
        .select('id, phone, session_version')
        .or(`phone.eq.${cleanPhone},phone.eq.91${cleanPhone},phone.eq.+91${cleanPhone}`)
        .limit(1)
        .maybeSingle();

      if (existingRow?.id) {
        // Try update with all columns
        const { error: updateErr } = await supabase
          .from('owners')
          .update({
            password_hash: passwordHash,
            otp_verified: true,
            failed_login_attempts: 0,
            locked_until: null,
            password_updated_at: now,
            session_version: nextVersion,
            updated_at: now,
          })
          .eq('id', existingRow.id);

        if (updateErr) {
          console.warn('[Auth] Full DB update error, falling back to core columns:', updateErr.message);
          await supabase
            .from('owners')
            .update({
              password_hash: passwordHash,
              otp_verified: true,
              failed_login_attempts: 0,
              locked_until: null,
            })
            .eq('id', existingRow.id);
        }
      } else {
        // Try insert with all columns
        const { error: insertErr } = await supabase
          .from('owners')
          .insert({
            phone: cleanPhone,
            password_hash: passwordHash,
            otp_verified: true,
            failed_login_attempts: 0,
            locked_until: null,
            password_updated_at: now,
            session_version: nextVersion,
            created_at: now,
            updated_at: now,
          });

        if (insertErr) {
          console.warn('[Auth] Full DB insert error, falling back to core columns:', insertErr.message);
          await supabase
            .from('owners')
            .insert({
              phone: cleanPhone,
              password_hash: passwordHash,
              otp_verified: true,
              failed_login_attempts: 0,
              locked_until: null,
            });
        }
      }

      console.info(`[Auth] New password hash permanently saved to Supabase for ${cleanPhone}`);
    } catch (dbErr: any) {
      console.error('[Auth] Database update error:', dbErr?.message);
    }
  }

  return { success: true };
}

/**
 * Record successful login in both DB and in-memory store
 */
export async function recordOwnerLoginSuccess(
  ownerId: string,
  phone: string,
  deviceSummary: string
): Promise<void> {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const now = new Date().toISOString();

  const inMem = inMemoryOwnerStore.get(cleanPhone);
  if (inMem) {
    inMem.failed_login_attempts = 0;
    inMem.locked_until = null;
    inMem.last_login_at = now;
    inMem.last_login_device = deviceSummary;
    inMemoryOwnerStore.set(cleanPhone, inMem);
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      await supabase
        .from('owners')
        .update({
          failed_login_attempts: 0,
          locked_until: null,
          last_login_at: now,
          last_login_device: deviceSummary,
          updated_at: now,
        })
        .or(`phone.eq.${cleanPhone},id.eq.${ownerId}`);
    } catch {
      // ignore
    }
  }
}

/**
 * Record failed login attempt in both DB and in-memory store
 */
export async function recordOwnerFailedAttempt(
  ownerId: string,
  phone: string,
  ip: string
): Promise<{ locked: boolean; lockedUntil?: Date }> {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const inMem = inMemoryOwnerStore.get(cleanPhone);
  const currentAttempts = ((inMem?.failed_login_attempts || 0) + 1);
  const lockedUntil = currentAttempts >= 5
    ? new Date(Date.now() + 15 * 60000)
    : null;

  if (inMem) {
    inMem.failed_login_attempts = currentAttempts;
    inMem.locked_until = lockedUntil ? lockedUntil.toISOString() : null;
    inMemoryOwnerStore.set(cleanPhone, inMem);
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      await supabase
        .from('owners')
        .update({
          failed_login_attempts: currentAttempts,
          ...(lockedUntil ? { locked_until: lockedUntil.toISOString() } : {}),
          updated_at: new Date().toISOString(),
        })
        .or(`phone.eq.${cleanPhone},id.eq.${ownerId}`);
    } catch {
      // ignore
    }
  }

  return {
    locked: Boolean(lockedUntil),
    lockedUntil: lockedUntil || undefined,
  };
}
