// ============================================================
// Edge-Compatible Auth Helper for Next.js Middleware & Edge Runtime
// Uses strictly Web Crypto API & standard Web APIs.
// ZERO dependencies on Node.js (fs, path, crypto, child_process),
// database clients, or server-only modules.
// ============================================================

import type { NextRequest } from 'next/server';

export const SESSION_COOKIE = 'arona_owner_session';
const SECRET_KEY = process.env.SESSION_SECRET || 'arona-mobiles-default-secret-key-replace-in-prod-2026';

export interface OwnerSession {
  ownerId: string;
  phone: string;
  role: 'owner';
  sessionId?: string;
  version?: number;
  iat: number;
  exp: number;
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
    ['verify']
  );
}

/**
 * Verify session token using Edge-safe Web Crypto API.
 * Returns decoded OwnerSession if valid and not expired, or null otherwise.
 */
export async function verifyOwnerSessionEdge(token: string): Promise<OwnerSession | null> {
  if (!token || typeof token !== 'string') return null;

  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, sig] = parts;

    const enc = new TextEncoder();
    const data = enc.encode(`${header}.${body}`);
    const key = await getHmacKey(SECRET_KEY);
    const sigBytes = base64UrlToBytes(sig);

    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes as any, data as any);
    if (!isValid) return null;

    const payload = JSON.parse(base64UrlToText(body)) as OwnerSession;

    // Check expiration
    if (!payload.exp || Date.now() / 1000 > payload.exp) {
      return null;
    }

    // Check role
    if (payload.role !== 'owner') {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Extract and verify owner session from NextRequest cookies (Edge-safe)
 */
export async function getOwnerSessionFromRequest(request: NextRequest): Promise<OwnerSession | null> {
  try {
    const token = request.cookies.get(SESSION_COOKIE)?.value;
    if (!token) return null;
    return await verifyOwnerSessionEdge(token);
  } catch {
    return null;
  }
}
