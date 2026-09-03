import { safeLocalStorage } from './safeStorage';

const SMS_KEY_STORAGE = 'arona_sms_api_key';
const SMS_GATEWAY_STORAGE = 'arona_sms_gateway_type'; // 'fast2sms' | '2factor'

export interface SmsSendResult {
  success: boolean;
  message: string;
  gateway?: string;
  smsDeepLink?: string;
}

/**
 * Get current stored SMS API Key
 */
export function getSmsApiKey(): string {
  if (typeof import.meta !== 'undefined') {
    const metaEnv = (import.meta as any).env;
    if (metaEnv?.VITE_FAST2SMS_API_KEY) return metaEnv.VITE_FAST2SMS_API_KEY;
    if (metaEnv?.VITE_2FACTOR_API_KEY) return metaEnv.VITE_2FACTOR_API_KEY;
  }
  return safeLocalStorage.getItem(SMS_KEY_STORAGE) || '';
}

/**
 * Save SMS API Key
 */
export function saveSmsApiKey(key: string, type: 'fast2sms' | '2factor' = 'fast2sms'): void {
  safeLocalStorage.setItem(SMS_KEY_STORAGE, key.trim());
  safeLocalStorage.setItem(SMS_GATEWAY_STORAGE, type);
}

/**
 * Get current gateway type
 */
export function getSmsGatewayType(): 'fast2sms' | '2factor' {
  return (safeLocalStorage.getItem(SMS_GATEWAY_STORAGE) as 'fast2sms' | '2factor') || 'fast2sms';
}

/**
 * Clean phone number to 10-digit Indian mobile format
 */
export function cleanIndianPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.slice(-10);
}

/**
 * Send real SMS OTP via Fast2SMS, 2Factor, or generate native mobile SMS link
 */
export async function sendRealSmsOtp(phone: string, otp: string): Promise<SmsSendResult> {
  const targetPhone = cleanIndianPhone(phone);
  const apiKey = getSmsApiKey();
  const gatewayType = getSmsGatewayType();

  const smsText = `Your ARONA MOBILES Owner Portal OTP is ${otp}. Valid for 10 minutes. Do not share with anyone.`;
  const smsDeepLink = `sms:+91${targetPhone}?body=${encodeURIComponent(smsText)}`;

  // If no API key configured yet, return deep link fallback instructions
  if (!apiKey) {
    return {
      success: false,
      message: 'No SMS API Key configured yet. Please enter your Fast2SMS or 2Factor API Key below to send real mobile SMS automatically.',
      smsDeepLink
    };
  }

  // 1. Send via Fast2SMS
  if (gatewayType === 'fast2sms') {
    try {
      // Fast2SMS Quick Transactional / OTP Route
      const url = `https://www.fast2sms.com/dev/bulkV2?authorization=${apiKey}&route=otp&variables_values=${otp}&numbers=${targetPhone}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await res.json();
      if (data && (data.return === true || data.status_code === 200)) {
        return {
          success: true,
          message: `Real SMS OTP sent successfully via Fast2SMS to +91 ${targetPhone}`,
          gateway: 'Fast2SMS'
        };
      } else {
        return {
          success: false,
          message: data?.message || 'Fast2SMS dispatch error. Please verify API Key.',
          smsDeepLink
        };
      }
    } catch (err: any) {
      console.warn('Fast2SMS error:', err);
      return {
        success: false,
        message: 'Fast2SMS network connection error.',
        smsDeepLink
      };
    }
  }

  // 2. Send via 2Factor API
  if (gatewayType === '2factor') {
    try {
      const url = `https://2factor.in/API/V1/${apiKey}/SMS/+91${targetPhone}/${otp}/AUTOGEN`;
      const res = await fetch(url);
      const data = await res.json();
      if (data && data.Status === 'Success') {
        return {
          success: true,
          message: `Real SMS OTP sent successfully via 2Factor to +91 ${targetPhone}`,
          gateway: '2Factor'
        };
      } else {
        return {
          success: false,
          message: data?.Details || '2Factor API dispatch error.',
          smsDeepLink
        };
      }
    } catch (err: any) {
      console.warn('2Factor API error:', err);
      return {
        success: false,
        message: '2Factor network error.',
        smsDeepLink
      };
    }
  }

  return {
    success: false,
    message: 'Unknown SMS gateway type.',
    smsDeepLink
  };
}
