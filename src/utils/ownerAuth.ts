import { safeLocalStorage, safeSessionStorage } from './safeStorage';

// Authorized Owner Phone Numbers (Identity verification numbers)
export const ALLOWED_PHONE_NUMBERS = [
  '9659458606',
  '9994235672',
  '9787061617',
  '919659458606',
  '919994235672',
  '919787061617',
  '+919659458606',
  '+919994235672',
  '+919787061617'
];

export interface OwnerSession {
  sessionId: string;
  phone: string;
  deviceName: string;
  createdAt: number;
  lastActive: number;
  rememberMe: boolean;
  active: boolean;
}

const SESSION_TOKEN_KEY = 'arona_owner_device_session_token_v2';
const TEMP_SESSION_KEY = 'arona_owner_auth_temp_v2';

/**
 * Generate human-readable device name from browser userAgent
 */
export function detectDeviceName(): string {
  if (typeof window === 'undefined' || !navigator) return 'Authorized Device';
  const ua = navigator.userAgent;
  let os = 'Unknown Device';
  if (ua.includes('Win')) os = 'Windows PC';
  else if (ua.includes('Mac')) os = 'MacBook / Mac';
  else if (ua.includes('Android')) os = 'Android Phone';
  else if (ua.includes('iPhone') || ua.includes('iPad')) os = 'iPhone / iPad';
  else if (ua.includes('Linux')) os = 'Linux Workstation';

  let browser = 'Browser';
  if (ua.includes('Chrome') && !ua.includes('Edg')) browser = 'Chrome';
  else if (ua.includes('Edg')) browser = 'Edge';
  else if (ua.includes('Safari') && !ua.includes('Chrome')) browser = 'Safari';
  else if (ua.includes('Firefox')) browser = 'Firefox';

  return `${os} (${browser})`;
}

/**
 * Check if the given phone number belongs to an authorized owner
 */
export function isAuthorizedPhoneNumber(phone: string): boolean {
  const clean = phone.replace(/[\s\-\+\(\)]/g, '');
  return ALLOWED_PHONE_NUMBERS.some(allowed => {
    const cleanAllowed = allowed.replace(/[\s\-\+\(\)]/g, '');
    return clean === cleanAllowed || clean.endsWith(cleanAllowed) || cleanAllowed.endsWith(clean);
  });
}

/**
 * Create a new authorized session for the owner
 */
export function createOwnerSession(phone: string, rememberMe: boolean): OwnerSession {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  const session: OwnerSession = {
    sessionId,
    phone,
    deviceName: detectDeviceName(),
    createdAt: Date.now(),
    lastActive: Date.now(),
    rememberMe,
    active: true
  };

  if (rememberMe) {
    safeLocalStorage.setItem(SESSION_TOKEN_KEY, JSON.stringify(session));
    safeLocalStorage.setItem('arona_owner_phone', phone);
  } else {
    safeSessionStorage.setItem(TEMP_SESSION_KEY, JSON.stringify(session));
  }

  // Broadcast session creation to Cloud DB (handled in cloudStore)
  return session;
}

/**
 * Get current stored session from device (LocalStorage if remembered, else SessionStorage)
 */
export function getCurrentSession(): OwnerSession | null {
  try {
    const persistent = safeLocalStorage.getItem(SESSION_TOKEN_KEY);
    if (persistent) {
      const parsed = JSON.parse(persistent);
      if (parsed && parsed.sessionId && parsed.active) {
        return parsed;
      }
    }

    const temp = safeSessionStorage.getItem(TEMP_SESSION_KEY);
    if (temp) {
      const parsed = JSON.parse(temp);
      if (parsed && parsed.sessionId && parsed.active) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Error reading owner session:', err);
  }
  return null;
}

/**
 * Synchronize local session active state
 */
export function logoutCurrentDevice(): void {
  safeLocalStorage.removeItem(SESSION_TOKEN_KEY);
  safeSessionStorage.removeItem(TEMP_SESSION_KEY);
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('arona_owner_session_revoked'));
  }
}
