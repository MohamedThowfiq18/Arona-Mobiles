import crypto from 'crypto';

export const OTP_CONFIG = {
  LENGTH: 6,
  EXPIRY_MINUTES: 5,
  EXPIRY_MS: 5 * 60 * 1000, // 5 minutes
  MAX_REQUESTS_PER_WINDOW: 3,
  WINDOW_MINUTES: 10,
  WINDOW_MS: 10 * 60 * 1000, // 10 minutes
  MAX_VERIFICATION_ATTEMPTS: 5,
};

interface OTPRecord {
  phone: string;
  ownerId?: string;
  codeHash: string;
  expiresAt: number; // unix timestamp in ms
  attempts: number;
  used: boolean;
  invalidated: boolean;
  createdAt: number;
  purpose: 'first_time_login' | 'forgot_password';
}

// Global in-memory OTP and Rate Limit store
declare global {
  // eslint-disable-next-line no-var
  var __arona_otp_store: Map<string, OTPRecord> | undefined;
  // eslint-disable-next-line no-var
  var __arona_otp_request_history: Map<string, number[]> | undefined;
}

const otpStore = globalThis.__arona_otp_store ?? new Map<string, OTPRecord>();
const requestHistory = globalThis.__arona_otp_request_history ?? new Map<string, number[]>();

if (process.env.NODE_ENV !== 'production') {
  globalThis.__arona_otp_store = otpStore;
  globalThis.__arona_otp_request_history = requestHistory;
}

/**
 * Generate a cryptographically secure 6-digit numeric OTP (100000 - 999999)
 */
export function generateOTP(): string {
  const num = crypto.randomInt(100000, 1000000);
  return num.toString();
}

/**
 * Hash an OTP using SHA-256 for secure constant-time comparison & storage
 */
export function hashOTP(otp: string): string {
  const pepper = process.env.OTP_PEPPER || 'arona_otp_secure_pepper_2026';
  return crypto.createHash('sha256').update(otp + pepper).digest('hex');
}

/**
 * Verify a plain-text OTP against a stored hash with constant-time equality
 */
export function verifyOTPHash(plainOTP: string, storedHash: string): boolean {
  try {
    const computed = hashOTP(plainOTP);
    return crypto.timingSafeEqual(Buffer.from(computed, 'hex'), Buffer.from(storedHash, 'hex'));
  } catch {
    return false;
  }
}

/**
 * Get OTP expiry Date (strictly 5 minutes from now)
 */
export function getOTPExpiry(): Date {
  return new Date(Date.now() + OTP_CONFIG.EXPIRY_MS);
}

/**
 * Check if requesting an OTP exceeds the rate limit (Max 3 requests per 10 minutes)
 */
export function checkRateLimit(phone: string): { allowed: boolean; remainingMinutes?: number; currentCount: number } {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const now = Date.now();
  const windowStart = now - OTP_CONFIG.WINDOW_MS;

  // Clean old entries outside the window
  const history = (requestHistory.get(cleanPhone) || []).filter(ts => ts > windowStart);
  requestHistory.set(cleanPhone, history);

  if (history.length >= OTP_CONFIG.MAX_REQUESTS_PER_WINDOW) {
    const oldestInWindow = history[0];
    const remainingMs = (oldestInWindow + OTP_CONFIG.WINDOW_MS) - now;
    const remainingMinutes = Math.ceil(remainingMs / 60000);
    return {
      allowed: false,
      remainingMinutes: Math.max(1, remainingMinutes),
      currentCount: history.length,
    };
  }

  return { allowed: true, currentCount: history.length };
}

/**
 * Record a new OTP issuance in the security store
 */
export function issueOTP(
  phone: string,
  otp: string,
  ownerId?: string,
  purpose: 'first_time_login' | 'forgot_password' = 'first_time_login'
): { expiresAt: Date; codeHash: string } {
  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const now = Date.now();

  // Record timestamp in rate limit history
  const history = requestHistory.get(cleanPhone) || [];
  history.push(now);
  requestHistory.set(cleanPhone, history);

  // Store new active OTP record (invalidates any prior unverified code for this phone)
  const expiresAt = new Date(now + OTP_CONFIG.EXPIRY_MS);
  const codeHash = hashOTP(otp);

  const record: OTPRecord = {
    phone: cleanPhone,
    ownerId,
    codeHash,
    expiresAt: expiresAt.getTime(),
    attempts: 0,
    used: false,
    invalidated: false,
    createdAt: now,
    purpose,
  };

  otpStore.set(cleanPhone, record);
  if (ownerId) {
    otpStore.set(ownerId, record);
  }

  return { expiresAt, codeHash };
}

export interface VerifyOTPResult {
  valid: boolean;
  error?: string;
  attemptsRemaining?: number;
  phone?: string;
  ownerId?: string;
}

/**
 * Verify an entered 6-digit OTP code against security rules:
 * - Exactly 6 numeric digits
 * - Expiration check (strict 5 minutes)
 * - Single-use enforcement (immediate invalidation on success)
 * - Max 5 failed attempts before code invalidation
 */
export function verifyOTP(
  identifier: string, // phone or ownerId
  enteredOTP: string
): VerifyOTPResult {
  const cleanIdentifier = identifier.replace(/\D/g, '').slice(-10) || identifier;
  const record = otpStore.get(cleanIdentifier);

  if (!record) {
    return {
      valid: false,
      error: 'Invalid or expired verification code.',
    };
  }

  const now = Date.now();

  // 1. Check if already used (Single-use enforcement)
  if (record.used) {
    return {
      valid: false,
      error: 'This verification code has already been used. Please request a new one.',
    };
  }

  // 2. Check if invalidated due to excessive wrong attempts
  if (record.invalidated || record.attempts >= OTP_CONFIG.MAX_VERIFICATION_ATTEMPTS) {
    return {
      valid: false,
      error: 'Too many incorrect attempts. This code is invalid. Please request a new code.',
    };
  }

  // 3. Check expiration (Strict 5 minutes)
  if (now > record.expiresAt) {
    record.invalidated = true;
    return {
      valid: false,
      error: 'This verification code has expired (5-minute limit). Please request a new code.',
    };
  }

  // 4. Validate OTP Format
  if (!/^\d{6}$/.test(enteredOTP)) {
    return {
      valid: false,
      error: 'Verification code must be exactly 6 numeric digits.',
    };
  }

  // 5. Constant-time hash verification
  const isMatch = verifyOTPHash(enteredOTP, record.codeHash);

  if (!isMatch) {
    record.attempts += 1;
    const remaining = OTP_CONFIG.MAX_VERIFICATION_ATTEMPTS - record.attempts;

    if (remaining <= 0) {
      record.invalidated = true;
      return {
        valid: false,
        error: 'Too many incorrect attempts. This verification code is now invalidated.',
        attemptsRemaining: 0,
      };
    }

    return {
      valid: false,
      error: `Incorrect verification code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
      attemptsRemaining: remaining,
    };
  }

  // 6. Success: Mark as used immediately (Single-use)
  record.used = true;

  return {
    valid: true,
    phone: record.phone,
    ownerId: record.ownerId,
  };
}
