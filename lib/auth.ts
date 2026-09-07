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
  const currentVersion = getActiveSessionVersion(ownerId);

  const payload: OwnerSession = {
    ownerId,
    phone,
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
    const activeVersion = getActiveSessionVersion(payload.ownerId);
    if (payload.version && payload.version < activeVersion) {
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
export function invalidateOwnerSessions(ownerId: string): void {
  bumpSessionVersion(ownerId);
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
