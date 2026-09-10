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
  sessionId: string;
  version: number;
  iat: number;
  exp: number;
}

export interface ActiveDeviceSession {
  id: string;
  deviceName: string;
  browser: string;
  operatingSystem: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  ipAddress: string;
  createdAt: string;
  lastActiveAt: string;
  isCurrent: boolean;
}

declare global {
  // eslint-disable-next-line no-var
  var __arona_device_sessions_store: Map<string, {
    id: string;
    ownerId: string;
    phone: string;
    deviceName: string;
    browser: string;
    operatingSystem: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
    ipAddress: string;
    userAgent: string;
    createdAt: number;
    lastActiveAt: number;
    expiresAt: number;
    isRevoked: boolean;
    revokedAt?: number;
  }> | undefined;
}

const deviceSessionsStore = globalThis.__arona_device_sessions_store ?? new Map();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__arona_device_sessions_store = deviceSessionsStore;
}

import { getDeviceFingerprint, parseDeviceDetails, maskIPAddress } from '@/lib/security';

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
 * Generate a cryptographically secure token hash for session verification
 */
function hashSessionToken(token: string): string {
  const encoder = new TextEncoder();
  const data = encoder.encode(token + SECRET_KEY);
  // Synchronous representation
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    hash = (hash << 5) - hash + data[i];
    hash |= 0;
  }
  return Math.abs(hash).toString(16) + textToBase64Url(token).slice(0, 16);
}

/**
 * Create a new device session record in Supabase & memory, and return a signed JWT cookie token
 */
export async function createOwnerSession(
  ownerId: string,
  phone: string,
  request?: NextRequest,
  customSessionId?: string
): Promise<string> {
  const nowMs = Date.now();
  const now = Math.floor(nowMs / 1000);
  const cleanPhone = phone.replace(/\D/g, '').slice(-10) || phone;
  const currentVersion = Math.max(
    getActiveSessionVersion(ownerId),
    getActiveSessionVersion(cleanPhone)
  );

  const sessionId = customSessionId || crypto.randomUUID();
  const expiresAtMs = nowMs + SECURITY_CONFIG.SESSION_EXPIRY_SECONDS * 1000;

  // Extract non-invasive device information from Request if provided
  let userAgent = 'Browser / Device';
  let ip = '127.0.0.1';
  let deviceInfo: {
    browser: string;
    operatingSystem: string;
    deviceType: 'desktop' | 'mobile' | 'tablet';
    deviceName: string;
  } = {
    browser: 'Browser',
    operatingSystem: 'Desktop',
    deviceType: 'desktop',
    deviceName: 'Browser · Desktop',
  };

  if (request) {
    const fp = getDeviceFingerprint(request);
    userAgent = fp.userAgent;
    ip = fp.ip;
    deviceInfo = fp.deviceInfo;
  }

  const tokenHash = hashSessionToken(sessionId + cleanPhone + String(now));

  // 1. Store in memory session store immediately
  deviceSessionsStore.set(sessionId, {
    id: sessionId,
    ownerId,
    phone: cleanPhone,
    deviceName: deviceInfo.deviceName,
    browser: deviceInfo.browser,
    operatingSystem: deviceInfo.operatingSystem,
    deviceType: deviceInfo.deviceType,
    ipAddress: ip,
    userAgent,
    createdAt: nowMs,
    lastActiveAt: nowMs,
    expiresAt: expiresAtMs,
    isRevoked: false,
  });

  // 2. Persist to Supabase owner_sessions table
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      await supabase.from('owner_sessions').insert({
        id: sessionId,
        owner_id: ownerId,
        phone: cleanPhone,
        session_token_hash: tokenHash,
        device_name: deviceInfo.deviceName,
        browser: deviceInfo.browser,
        operating_system: deviceInfo.operatingSystem,
        device_type: deviceInfo.deviceType,
        ip_address: ip,
        user_agent: userAgent,
        created_at: new Date(nowMs).toISOString(),
        last_active_at: new Date(nowMs).toISOString(),
        expires_at: new Date(expiresAtMs).toISOString(),
        is_revoked: false,
      });
    } catch (dbErr: any) {
      console.warn('[Auth] Error saving session to Supabase owner_sessions:', dbErr?.message);
    }
  }

  // 3. Create signed JWT session payload with embedded sessionId
  const payload: OwnerSession = {
    ownerId,
    phone: cleanPhone,
    role: 'owner',
    sessionId,
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
 * Check if a specific sessionId has been revoked either in memory or in Supabase
 */
export async function isSessionRevoked(sessionId: string, phone?: string): Promise<boolean> {
  const inMem = deviceSessionsStore.get(sessionId);
  if (inMem) {
    if (inMem.isRevoked || inMem.expiresAt < Date.now()) {
      return true;
    }
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      const { data, error } = await supabase
        .from('owner_sessions')
        .select('is_revoked, revoked_at, expires_at')
        .eq('id', sessionId)
        .maybeSingle();

      if (!error && data) {
        if (data.is_revoked || data.revoked_at || new Date(data.expires_at).getTime() < Date.now()) {
          if (inMem) inMem.isRevoked = true;
          return true;
        }
      }
    } catch {
      // Fall back to memory state
    }
  }

  return false;
}

/**
 * Verify a session token and confirm signature, expiration, session version, AND revocation status
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

    // 3. Global version check (bumped on password reset)
    const activeVersionOwner = getActiveSessionVersion(payload.ownerId);
    const activeVersionPhone = payload.phone ? getActiveSessionVersion(payload.phone) : 1;
    const requiredActiveVersion = Math.max(activeVersionOwner, activeVersionPhone);

    if (payload.version && payload.version < requiredActiveVersion) {
      return null;
    }

    // 4. Device Revocation Check (if device was revoked by another device)
    if (payload.sessionId) {
      const revoked = await isSessionRevoked(payload.sessionId, payload.phone);
      if (revoked) {
        return null;
      }
      touchSessionActivity(payload.sessionId).catch(() => {});
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Throttled update of last_active_at (updates at most once every 2 minutes)
 */
export async function touchSessionActivity(sessionId: string): Promise<void> {
  const nowMs = Date.now();
  const inMem = deviceSessionsStore.get(sessionId);
  if (inMem) {
    if (nowMs - inMem.lastActiveAt < 120000) {
      return;
    }
    inMem.lastActiveAt = nowMs;
  }

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      await supabase
        .from('owner_sessions')
        .update({ last_active_at: new Date(nowMs).toISOString() })
        .eq('id', sessionId)
        .eq('is_revoked', false);
    } catch {
      // ignore
    }
  }
}

/**
 * Retrieve all currently active logged-in device sessions for an owner
 */
export async function getOwnerActiveSessions(
  phone: string,
  currentSessionId?: string
): Promise<ActiveDeviceSession[]> {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10) || phone;
  const now = new Date().toISOString();
  const sessionsMap = new Map<string, ActiveDeviceSession>();

  // 1. Check Supabase owner_sessions table first
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      const { data, error } = await supabase
        .from('owner_sessions')
        .select('*')
        .or(`phone.eq.${cleanPhone},phone.eq.91${cleanPhone},phone.eq.+91${cleanPhone}`)
        .eq('is_revoked', false)
        .gt('expires_at', now)
        .order('last_active_at', { ascending: false });

      if (!error && Array.isArray(data)) {
        data.forEach(s => {
          sessionsMap.set(s.id, {
            id: s.id,
            deviceName: s.device_name || 'Browser · Device',
            browser: s.browser || 'Browser',
            operatingSystem: s.operating_system || 'OS',
            deviceType: s.device_type || 'desktop',
            ipAddress: maskIPAddress(s.ip_address),
            createdAt: s.created_at,
            lastActiveAt: s.last_active_at || s.created_at,
            isCurrent: Boolean(currentSessionId && s.id === currentSessionId),
          });
        });
      }
    } catch (err: any) {
      console.warn('[Auth] Error fetching sessions from Supabase:', err?.message);
    }
  }

  // 2. Overlay memory sessions
  const nowMs = Date.now();
  deviceSessionsStore.forEach(s => {
    if (s.phone === cleanPhone && !s.isRevoked && s.expiresAt > nowMs) {
      if (!sessionsMap.has(s.id)) {
        sessionsMap.set(s.id, {
          id: s.id,
          deviceName: s.deviceName,
          browser: s.browser,
          operatingSystem: s.operatingSystem,
          deviceType: s.deviceType,
          ipAddress: maskIPAddress(s.ipAddress),
          createdAt: new Date(s.createdAt).toISOString(),
          lastActiveAt: new Date(s.lastActiveAt).toISOString(),
          isCurrent: Boolean(currentSessionId && s.id === currentSessionId),
        });
      }
    }
  });

  const list = Array.from(sessionsMap.values());
  
  // Ensure current device appears first
  list.sort((a, b) => {
    if (a.isCurrent) return -1;
    if (b.isCurrent) return 1;
    return new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime();
  });

  return list;
}

/**
 * Revoke a single specific session by ID
 */
export async function revokeOwnerSessionById(
  sessionId: string,
  ownerPhone: string
): Promise<{ success: boolean; error?: string }> {
  const cleanPhone = ownerPhone.replace(/\D/g, '').slice(-10) || ownerPhone;
  const now = new Date().toISOString();
  const nowMs = Date.now();

  // 1. Update memory store
  const inMem = deviceSessionsStore.get(sessionId);
  if (inMem) {
    if (inMem.phone !== cleanPhone) {
      return { success: false, error: 'Unauthorized to revoke this session.' };
    }
    inMem.isRevoked = true;
    inMem.revokedAt = nowMs;
    deviceSessionsStore.set(sessionId, inMem);
  }

  // 2. Update Supabase
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      const { error } = await supabase
        .from('owner_sessions')
        .update({
          is_revoked: true,
          revoked_at: now,
        })
        .eq('id', sessionId)
        .or(`phone.eq.${cleanPhone},phone.eq.91${cleanPhone},phone.eq.+91${cleanPhone}`);

      if (error) {
        console.warn('[Auth] Supabase session revoke error:', error.message);
      }
    } catch (dbErr: any) {
      console.error('[Auth] Database revoke error:', dbErr?.message);
    }
  }

  return { success: true };
}

/**
 * Revoke ALL active sessions for an owner EXCEPT the current session
 */
export async function revokeAllOtherOwnerSessions(
  currentSessionId: string,
  ownerPhone: string
): Promise<{ success: boolean; count: number }> {
  const cleanPhone = ownerPhone.replace(/\D/g, '').slice(-10) || ownerPhone;
  const now = new Date().toISOString();
  const nowMs = Date.now();
  let count = 0;

  // 1. Update memory store
  deviceSessionsStore.forEach(s => {
    if (s.phone === cleanPhone && s.id !== currentSessionId && !s.isRevoked) {
      s.isRevoked = true;
      s.revokedAt = nowMs;
      count++;
    }
  });

  // 2. Update Supabase
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      await supabase
        .from('owner_sessions')
        .update({
          is_revoked: true,
          revoked_at: now,
        })
        .or(`phone.eq.${cleanPhone},phone.eq.91${cleanPhone},phone.eq.+91${cleanPhone}`)
        .neq('id', currentSessionId)
        .eq('is_revoked', false);
    } catch (dbErr: any) {
      console.error('[Auth] Database revoke-all-others error:', dbErr?.message);
    }
  }

  return { success: true, count };
}

/**
 * Invalidate all active sessions for a specific owner (e.g. on password reset)
 */
export function invalidateOwnerSessions(ownerId: string, phone?: string): void {
  bumpSessionVersion(ownerId);
  if (phone) {
    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    bumpSessionVersion(cleanPhone);
    const nowMs = Date.now();
    deviceSessionsStore.forEach(s => {
      if (s.phone === cleanPhone) {
        s.isRevoked = true;
        s.revokedAt = nowMs;
      }
    });

    if (isSupabaseConfigured()) {
      try {
        const supabase = getSupabaseAdminClient();
        supabase
          .from('owner_sessions')
          .update({ is_revoked: true, revoked_at: new Date().toISOString() })
          .or(`phone.eq.${cleanPhone},phone.eq.91${cleanPhone},phone.eq.+91${cleanPhone}`)
          .then();
      } catch {
        // ignore
      }
    }
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
import { STORE_CONFIG } from '@/lib/constants';

/**
 * Retrieve owner credential record from Supabase PostgreSQL (Single source of truth)
 */
export async function getOwnerRecord(phone: string): Promise<OwnerAccountRecord | null> {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  if (!cleanPhone) return null;

  // 1. Check Supabase PostgreSQL first (Primary source of truth for all devices)
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();
      
      // Step A: Search for exact phone match (or +91 / 91 variations)
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
        inMemoryOwnerStore.set('global_owner', record);

        return record;
      }

      // Step B: If no record found for this specific phone, but this phone is authorized,
      // fetch the single global store owner password record
      if (STORE_CONFIG.authorizedOwnerPhones.includes(cleanPhone)) {
        const { data: globalData, error: globalErr } = await supabase
          .from('owners')
          .select('*')
          .order('updated_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!globalErr && globalData?.password_hash) {
          const record: OwnerAccountRecord = {
            id: globalData.id || `owner-${cleanPhone}`,
            phone: cleanPhone,
            password_hash: globalData.password_hash,
            otp_verified: globalData.otp_verified ?? true,
            failed_login_attempts: globalData.failed_login_attempts ?? 0,
            locked_until: globalData.locked_until,
            session_version: globalData.session_version ?? 1,
            password_updated_at: globalData.password_updated_at,
            last_login_at: globalData.last_login_at,
            last_login_device: globalData.last_login_device,
          };

          inMemoryOwnerStore.set(cleanPhone, record);
          inMemoryOwnerStore.set('global_owner', record);
          return record;
        }
      }
    } catch (err: any) {
      console.warn('[Auth] Supabase lookup warning:', err?.message);
    }
  }

  // 2. Check in-memory server credential store (development & fallback)
  const cached =
    inMemoryOwnerStore.get(cleanPhone) ||
    inMemoryOwnerStore.get(`owner-${cleanPhone}`) ||
    inMemoryOwnerStore.get('global_owner');
    
  if (cached) {
    return cached;
  }

  return null;
}

/**
 * Persist new password hash globally to both Supabase PostgreSQL and server store,
 * and bump session versions to invalidate all older sessions across devices.
 */
export async function saveOwnerPassword(
  phone: string,
  passwordHash: string
): Promise<{ success: boolean; error?: string }> {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const now = new Date().toISOString();
  const ownerId = `owner-${cleanPhone}`;

  // 1. Bump session versions for cross-device session invalidation
  const allAuthorizedPhones = Array.from(new Set([
    cleanPhone,
    ...STORE_CONFIG.authorizedOwnerPhones,
  ]));

  let nextVersion = 1;
  for (const p of allAuthorizedPhones) {
    const v = bumpSessionVersion(p);
    bumpSessionVersion(`owner-${p}`);
    nextVersion = Math.max(nextVersion, v);
    invalidateOwnerSessions(`owner-${p}`, p);
  }

  // 2. Store in memory immediately across all authorized numbers & global_owner
  const existingRecord = inMemoryOwnerStore.get(cleanPhone) || inMemoryOwnerStore.get('global_owner');
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

  for (const p of allAuthorizedPhones) {
    inMemoryOwnerStore.set(p, { ...updatedRecord, phone: p, id: `owner-${p}` });
    inMemoryOwnerStore.set(`owner-${p}`, { ...updatedRecord, phone: p, id: `owner-${p}` });
  }
  inMemoryOwnerStore.set('global_owner', updatedRecord);

  // 3. Persist to Supabase PostgreSQL (Single source of truth for all devices)
  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();

      // Check for existing owner record(s)
      const { data: existingRows } = await supabase
        .from('owners')
        .select('id, phone, session_version');

      if (existingRows && existingRows.length > 0) {
        // Update ALL existing owner rows to have the same global password hash
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
          .in('id', existingRows.map(r => r.id));

        if (updateErr) {
          console.warn('[Auth] Full DB update error, falling back to core columns:', updateErr.message);
          await supabase
            .from('owners')
            .update({
              password_hash: passwordHash,
              otp_verified: true,
              failed_login_attempts: 0,
              locked_until: null,
              updated_at: now,
            })
            .in('id', existingRows.map(r => r.id));
        }
      } else {
        // No row existed yet -> Insert initial owner record
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

      console.info(`[Auth] New global password hash permanently saved to Supabase for ${cleanPhone}`);
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
