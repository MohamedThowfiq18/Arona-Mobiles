import { NextRequest } from 'next/server';

// ── Rate Limiter ─────────────────────────────────────────────
interface RateLimitRecord {
  attempts: number;
  firstAttemptTime: number;
  lockedUntil?: number;
}

declare global {
  // eslint-disable-next-line no-var
  var __arona_security_rate_limits: Map<string, RateLimitRecord> | undefined;
  // eslint-disable-next-line no-var
  var __arona_session_versions: Map<string, number> | undefined;
}

const rateLimitStore = globalThis.__arona_security_rate_limits ?? new Map<string, RateLimitRecord>();
const sessionVersionStore = globalThis.__arona_session_versions ?? new Map<string, number>();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__arona_security_rate_limits = rateLimitStore;
  globalThis.__arona_session_versions = sessionVersionStore;
}

export const SECURITY_CONFIG = {
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION_MS: 15 * 60 * 1000, // 15 minutes
  ATTEMPT_WINDOW_MS: 15 * 60 * 1000, // 15 minutes
  SESSION_EXPIRY_DAYS: 7,
  SESSION_EXPIRY_SECONDS: 7 * 24 * 3600,
  IDLE_TIMEOUT_MINUTES: 30,
};

/**
 * Get client IP address safely from NextRequest
 */
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return '127.0.0.1';
}

export interface DeviceInfo {
  browser: string;
  operatingSystem: string;
  deviceType: 'desktop' | 'mobile' | 'tablet';
  deviceName: string;
}

/**
 * Parse non-invasive device information from User-Agent string
 */
export function parseDeviceDetails(userAgent: string): DeviceInfo {
  const ua = userAgent || '';

  // 1. Detect Operating System
  let operatingSystem = 'Unknown OS';
  if (/windows/i.test(ua)) operatingSystem = 'Windows';
  else if (/iphone/i.test(ua)) operatingSystem = 'iOS';
  else if (/ipad/i.test(ua)) operatingSystem = 'iPadOS';
  else if (/android/i.test(ua)) operatingSystem = 'Android';
  else if (/macintosh|mac os x/i.test(ua)) operatingSystem = 'macOS';
  else if (/linux/i.test(ua)) operatingSystem = 'Linux';

  // 2. Detect Browser
  let browser = 'Browser';
  if (/edg/i.test(ua)) browser = 'Edge';
  else if (/opr|opera/i.test(ua)) browser = 'Opera';
  else if (/samsungbrowser/i.test(ua)) browser = 'Samsung Internet';
  else if (/chrome|crios/i.test(ua)) browser = 'Chrome';
  else if (/firefox|fxios/i.test(ua)) browser = 'Firefox';
  else if (/safari/i.test(ua) && !/chrome|crios|android/i.test(ua)) browser = 'Safari';

  // 3. Detect Device Type
  let deviceType: 'desktop' | 'mobile' | 'tablet' = 'desktop';
  if (/ipad|tablet/i.test(ua)) {
    deviceType = 'tablet';
  } else if (/mobile|iphone|android/i.test(ua)) {
    deviceType = 'mobile';
  }

  // 4. Formatted Display Name (e.g. "Chrome · Windows", "Safari · iPhone")
  const deviceName = `${browser} · ${operatingSystem}`;

  return {
    browser,
    operatingSystem,
    deviceType,
    deviceName,
  };
}

/**
 * Safely mask an IP address for non-sensitive UI display (e.g. 192.168.xxx.xxx)
 */
export function maskIPAddress(ip?: string): string {
  if (!ip || ip === '127.0.0.1' || ip === '::1') return '127.0.xxx.xxx';
  
  // IPv4
  if (ip.includes('.')) {
    const parts = ip.split('.');
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.xxx.xxx`;
    }
  }

  // IPv6
  if (ip.includes(':')) {
    const parts = ip.split(':');
    if (parts.length >= 2) {
      return `${parts[0]}:${parts[1]}:xxx:xxx`;
    }
  }

  return 'xxx.xxx.xxx.xxx';
}

/**
 * Get device fingerprint string from Request (IP + User-Agent)
 */
export function getDeviceFingerprint(request: NextRequest): {
  ip: string;
  userAgent: string;
  deviceSummary: string;
  deviceInfo: DeviceInfo;
} {
  const ip = getClientIP(request);
  const userAgent = request.headers.get('user-agent') || 'Unknown Device';
  const deviceInfo = parseDeviceDetails(userAgent);

  return {
    ip,
    userAgent,
    deviceSummary: deviceInfo.deviceName,
    deviceInfo,
  };
}

/**
 * Rate limit check for login attempts (Key can be phone number or IP address)
 */
export function checkLoginRateLimit(key: string): {
  allowed: boolean;
  remainingAttempts: number;
  lockedUntil?: Date;
  lockoutMinutes?: number;
} {
  const normalizedKey = key.trim().toLowerCase();
  const now = Date.now();
  const record = rateLimitStore.get(normalizedKey);

  if (!record) {
    return {
      allowed: true,
      remainingAttempts: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS,
    };
  }

  // Check if currently locked
  if (record.lockedUntil && record.lockedUntil > now) {
    const remainingMs = record.lockedUntil - now;
    return {
      allowed: false,
      remainingAttempts: 0,
      lockedUntil: new Date(record.lockedUntil),
      lockoutMinutes: Math.max(1, Math.ceil(remainingMs / 60000)),
    };
  }

  // Reset if window has elapsed
  if (now - record.firstAttemptTime > SECURITY_CONFIG.ATTEMPT_WINDOW_MS) {
    rateLimitStore.delete(normalizedKey);
    return {
      allowed: true,
      remainingAttempts: SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS,
    };
  }

  const remaining = Math.max(0, SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - record.attempts);
  return {
    allowed: remaining > 0,
    remainingAttempts: remaining,
  };
}

/**
 * Record a failed login attempt for rate limiting
 */
export function recordFailedLogin(key: string): { locked: boolean; lockedUntil?: Date; lockoutMinutes?: number } {
  const normalizedKey = key.trim().toLowerCase();
  const now = Date.now();
  let record = rateLimitStore.get(normalizedKey);

  if (!record || (now - record.firstAttemptTime > SECURITY_CONFIG.ATTEMPT_WINDOW_MS)) {
    record = {
      attempts: 1,
      firstAttemptTime: now,
    };
  } else {
    record.attempts += 1;
  }

  if (record.attempts >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
    record.lockedUntil = now + SECURITY_CONFIG.LOCKOUT_DURATION_MS;
    rateLimitStore.set(normalizedKey, record);
    return {
      locked: true,
      lockedUntil: new Date(record.lockedUntil),
      lockoutMinutes: Math.ceil(SECURITY_CONFIG.LOCKOUT_DURATION_MS / 60000),
    };
  }

  rateLimitStore.set(normalizedKey, record);
  return { locked: false };
}

/**
 * Clear rate limit on successful authentication
 */
export function clearLoginRateLimit(key: string) {
  const normalizedKey = key.trim().toLowerCase();
  rateLimitStore.delete(normalizedKey);
}

// ── Session Versioning (For Invalidation on Password Reset) ──
export function getActiveSessionVersion(identifier: string): number {
  const cleanKey = identifier.replace(/\D/g, '').slice(-10) || identifier;
  return sessionVersionStore.get(cleanKey) ?? 1;
}

export function bumpSessionVersion(identifier: string): number {
  const cleanKey = identifier.replace(/\D/g, '').slice(-10) || identifier;
  const current = getActiveSessionVersion(cleanKey);
  const next = current + 1;
  sessionVersionStore.set(cleanKey, next);
  sessionVersionStore.set(identifier, next);
  return next;
}

// ── Server-Side Input Validators ─────────────────────────────
/**
 * Validate Indian 10-digit mobile phone number format
 */
export function validatePhoneNumber(phone: unknown): { valid: boolean; cleanPhone: string; error?: string } {
  if (!phone || typeof phone !== 'string') {
    return { valid: false, cleanPhone: '', error: 'Phone number is required.' };
  }
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
    return {
      valid: false,
      cleanPhone,
      error: 'Invalid phone number format. Please provide a valid 10-digit mobile number.',
    };
  }
  return { valid: true, cleanPhone };
}

/**
 * Sanitize text input to prevent XSS and malformed content
 */
export function sanitizeString(val: unknown, maxLength = 255): string {
  if (typeof val !== 'string') return '';
  return val
    .trim()
    .replace(/[<>]/g, '') // remove direct tag delimiters
    .slice(0, maxLength);
}

/**
 * Validate numeric positive values (prices, stocks)
 */
export function validatePositiveNumber(val: unknown, min = 0, max = 10000000): { valid: boolean; value: number } {
  const num = Number(val);
  if (isNaN(num) || num < min || num > max) {
    return { valid: false, value: 0 };
  }
  return { valid: true, value: num };
}
