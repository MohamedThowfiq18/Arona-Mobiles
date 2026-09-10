'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';

declare global {
  interface Window {
    initSendOTP?: (configuration: any) => void;
    sendOtp?: (
      identifier: string,
      success?: (data: any) => void,
      failure?: (error: any) => void
    ) => void;
    verifyOtp?: (
      otp: string | number,
      success?: (data: any) => void,
      failure?: (error: any) => void,
      reqId?: string
    ) => void;
    retryOtp?: (
      channel: string,
      success?: (data: any) => void,
      failure?: (error: any) => void,
      reqId?: string
    ) => void;
  }
}

/**
 * Helper to extract MSG91 Access Token / JWT from verifyOtp response
 */
function extractMsg91AccessToken(data: any): string {
  if (!data) return '';
  if (typeof data === 'string') return data;
  if (typeof data === 'object') {
    if (data['access-token']) return String(data['access-token']);
    if (data.accessToken) return String(data.accessToken);
    if (data.token) return String(data.token);
    if (data.data?.token) return String(data.data.token);
    if (data.data?.accessToken) return String(data.data.accessToken);
    if (typeof data.message === 'string' && data.message.length > 20) return data.message;
    if (typeof data.message === 'string') return data.message;
  }
  return '';
}

function OwnerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect') || '/owner-portal';
  const reason = searchParams.get('reason');
  const redirectUrl = rawRedirect.startsWith('/owner-portal') ? rawRedirect : '/owner-portal';

  // Form State
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // MSG91 In-memory State
  const [msg91Ready, setMsg91Ready] = useState(false);
  const [msg91ReqId, setMsg91ReqId] = useState<string>('');

  // OTP Input State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [cooldown, setCooldown] = useState(30);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Stable MSG91 Custom Web SDK Script Loader & Initializer
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const configuration = {
      widgetId: process.env.NEXT_PUBLIC_MSG91_WIDGET_ID,
      tokenAuth: process.env.NEXT_PUBLIC_MSG91_WIDGET_TOKEN,
      identifier: '',
      exposeMethods: true,
      captchaRenderId: '',

      success: (data: any) => {
        console.log('[MSG91] OTP sent:', data);
      },

      failure: (error: any) => {
        console.error('[MSG91] OTP failed:', error);
      },
    };

    const initializeWidget = () => {
      if (typeof window.initSendOTP === 'function') {
        try {
          window.initSendOTP(configuration);
          console.log('[MSG91] Widget initialized');
          setMsg91Ready(true);
        } catch (e) {
          console.error('[MSG91] Error initializing MSG91 widget:', e);
        }
      }
    };

    // If already initialized and methods are present
    if (
      typeof window.sendOtp === 'function' &&
      typeof window.verifyOtp === 'function'
    ) {
      console.log('[MSG91] Widget initialized');
      setMsg91Ready(true);
      return;
    }

    const existingScript = document.querySelector(
      'script[src="https://verify.msg91.com/otp-provider.js"]'
    );

    if (existingScript) {
      if (typeof window.initSendOTP === 'function') {
        initializeWidget();
      } else {
        existingScript.addEventListener('load', () => {
          console.log('[MSG91] Script loaded');
          initializeWidget();
        });
      }
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://verify.msg91.com/otp-provider.js';
    script.type = 'text/javascript';
    script.async = true;
    script.onload = () => {
      console.log('[MSG91] Script loaded');
      initializeWidget();
    };
    script.onerror = () => {
      console.error('[MSG91] Failed to load OTP provider script');
      setMsg91Ready(false);
    };

    document.body.appendChild(script);
  }, []);

  // Resend countdown timer
  useEffect(() => {
    if (step !== 'otp' || cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(c => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [step, cooldown]);

  // Focus first OTP input when step changes to OTP
  useEffect(() => {
    if (step === 'otp') {
      setTimeout(() => {
        otpRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Handle Step 1: Validate credentials + Trigger MSG91 sendOtp
  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || success) return;

    setLoading(true);
    setError('');

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit mobile number.');
      setLoading(false);
      return;
    }

    try {
      // 1. Validate owner credentials on server first
      const checkRes = await fetch('/api/auth/owner-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone, password, checkOnly: true }),
      });
      const checkData = await checkRes.json().catch(() => ({}));

      if (!checkRes.ok || checkData.error) {
        setError(checkData.error || 'Invalid phone number or password.');
        setLoading(false);
        return;
      }

      // 2. Dispatch real SMS OTP via MSG91 Web SDK
      if (typeof window.sendOtp !== 'function') {
        setError('MSG91 OTP service is still loading. Please try again.');
        setLoading(false);
        return;
      }

      const formattedMobile = `91${cleanPhone}`;
      console.log('[MSG91] OTP send requested');

      window.sendOtp(
        formattedMobile,
        (data: any) => {
          console.log('[MSG91] OTP send successful', data);
          const reqId = data?.reqId || data?.message || data?.data?.reqId || (typeof data === 'string' && data.length > 5 ? data : '');
          if (reqId) {
            setMsg91ReqId(String(reqId));
          }
          setStep('otp');
          setCooldown(30);
          setLoading(false);
        },
        (err: any) => {
          console.error('[MSG91] OTP send failed', err);
          setError(err?.message || 'Failed to send OTP via SMS. Please try again.');
          setLoading(false);
        }
      );
    } catch (err: any) {
      console.error('[MSG91] Error initiating OTP send:', err);
      setError('Connection error. Please check your network and try again.');
      setLoading(false);
    }
  };

  // OTP Input navigation handlers
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length >= 4) {
      const parts = text.split('').slice(0, 6);
      while (parts.length < 6) parts.push('');
      setOtp(parts);
      const focusIndex = Math.min(text.length, 5);
      otpRefs.current[focusIndex]?.focus();
    }
    e.preventDefault();
  };

  // Handle Step 2: Verify OTP via MSG91 verifyOtp + Server Owner Authorization
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otp.join('');
    if (code.length < 4 || loading || success) return;

    if (!msg91ReqId) {
      setError('OTP session expired. Please request a new OTP.');
      return;
    }

    if (typeof window.verifyOtp !== 'function') {
      setError('MSG91 OTP service is still loading. Please try again.');
      return;
    }

    setLoading(true);
    setError('');
    setResendMsg('');

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    console.log('[MSG91] OTP verification requested');

    window.verifyOtp(
      code,
      async (data: any) => {
        console.log('[MSG91] OTP verification successful', data);
        const accessToken = extractMsg91AccessToken(data) || `verified_${Date.now()}`;

        try {
          // Verify with server and create authorized owner session
          const verifyRes = await fetch('/api/auth/msg91/verify', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              accessToken,
              phone: cleanPhone,
              reqId: msg91ReqId,
              otp: code,
            }),
          });

          const verifyData = await verifyRes.json().catch(() => ({}));

          if (!verifyRes.ok || verifyData.error) {
            // If access token verify fails on server, try direct server verification endpoint
            const fallbackRes = await fetch('/api/auth/owner-otp-verify', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                phone: cleanPhone,
                otp: code,
                reqId: msg91ReqId,
              }),
            });

            const fallbackData = await fallbackRes.json().catch(() => ({}));

            if (!fallbackRes.ok || fallbackData.error) {
              setError(fallbackData.error || verifyData.error || 'Invalid or expired OTP. Please try again.');
              setLoading(false);
              return;
            }
          }

          console.log('[MSG91] Server owner session created');
          setSuccess(true);
          setLoading(false);

          setTimeout(() => {
            router.push(redirectUrl);
            router.refresh();
          }, 700);
        } catch {
          setError('Network error verifying authentication. Please try again.');
          setLoading(false);
        }
      },
      (errorObj: any) => {
        console.error('[MSG91] OTP verification failed', errorObj);
        setError(errorObj?.message || errorObj?.msg || 'Invalid or expired OTP. Please try again.');
        setLoading(false);
      },
      msg91ReqId
    );
  };

  // Handle Resend OTP via MSG91 SDK
  const handleResend = async () => {
    if (cooldown > 0 || resending) return;

    setResending(true);
    setError('');
    setResendMsg('');

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const formattedMobile = `91${cleanPhone}`;
    const maskedPhone = `+91 XXXXXXX${cleanPhone.slice(-4)}`;

    console.log('[MSG91] OTP send requested (resend)');

    const onResendSuccess = (data: any) => {
      console.log('[MSG91] OTP send successful (resend)', data);
      const newReqId = data?.reqId || data?.message || data?.data?.reqId || '';
      if (newReqId) {
        setMsg91ReqId(String(newReqId));
      }
      setResendMsg(`New verification code sent via SMS to ${maskedPhone}.`);
      setCooldown(30);
      setOtp(['', '', '', '', '', '']);
      otpRefs.current[0]?.focus();
      setResending(false);
    };

    const onResendFailure = (err: any) => {
      console.error('[MSG91] OTP send failed (resend):', err);
      setError(err?.message || 'Failed to resend SMS. Please try again.');
      setResending(false);
    };

    if (typeof window.retryOtp === 'function' && msg91ReqId) {
      window.retryOtp('1', onResendSuccess, (retryErr: any) => {
        if (typeof window.sendOtp === 'function') {
          window.sendOtp(formattedMobile, onResendSuccess, onResendFailure);
        } else {
          onResendFailure(retryErr);
        }
      }, msg91ReqId);
    } else if (typeof window.sendOtp === 'function') {
      window.sendOtp(formattedMobile, onResendSuccess, onResendFailure);
    } else {
      setError('MSG91 OTP service is still loading. Please try again.');
      setResending(false);
    }
  };

  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const displayMaskedPhone = cleanPhone ? `+91 XXXXXXX${cleanPhone.slice(-4)}` : 'your registered phone';

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        {/* Logo */}
        <div className={styles.logo}>
          <span className={styles.logoIcon}>📱</span>
          <div>
            <div className={styles.logoName}>ARONA MOBILES</div>
            <div className={styles.logoSub}>Owner Portal</div>
          </div>
        </div>

        <h1 className={styles.title}>
          {step === 'otp' && !success ? 'Two-Step Verification' : 'Sign In'}
        </h1>
        <p className={styles.subtitle}>
          {step === 'otp' && !success
            ? <>Enter the real 6-digit SMS verification code delivered to <strong>{displayMaskedPhone}</strong>.</>
            : 'Enter your authorized credentials to access the store management dashboard.'}
        </p>

        {/* Inactivity Alert */}
        {reason === 'idle' && !error && !success && step === 'credentials' && (
          <div className="alert alert--warning" role="alert" style={{ marginBottom: '16px' }}>
            🔒 You have been signed out due to 30 minutes of inactivity. Please sign in again.
          </div>
        )}

        {/* Success Confirmation */}
        {success && (
          <div className={styles.successBox} role="status" aria-live="polite">
            <div className={styles.successIcon}>✓</div>
            <div>
              <div className={styles.successTitle}>Login Successful!</div>
              <div className={styles.successDesc}>
                Welcome back to ARONA MOBILES Owner Portal.
              </div>
              <div className={styles.redirectNote}>
                <span className={styles.spinnerSmall} />
                Redirecting to dashboard...
              </div>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {error && !success && (
          <div className="alert alert--error" role="alert">{error}</div>
        )}

        {/* Resend Success Alert */}
        {resendMsg && !success && (
          <div className="alert alert--success" role="alert">{resendMsg}</div>
        )}

        {/* Step 1: Credentials Form */}
        {step === 'credentials' && !success && (
          <form onSubmit={handleCredentialsSubmit} className={styles.form}>
            <div className="form-group">
              <label className="form-label" htmlFor="owner-phone">Authorized Mobile Number</label>
              <input
                id="owner-phone"
                className="form-input"
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
                disabled={loading || success}
                autoComplete="tel"
                autoFocus
              />
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="owner-password" style={{ marginBottom: 0 }}>Password</label>
                <a
                  href="/owner-portal/forgot-password"
                  style={{ fontSize: '0.8rem', color: 'var(--color-primary)', textDecoration: 'none', fontWeight: 600 }}
                >
                  Forgot Password?
                </a>
              </div>
              <div className={styles.passWrap} style={{ marginTop: '6px' }}>
                <input
                  id="owner-password"
                  className={`form-input ${styles.passInput}`}
                  type={showPass ? 'text' : 'password'}
                  placeholder="Enter password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  disabled={loading || success}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className={styles.passToggle}
                  onClick={() => setShowPass(s => !s)}
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                  disabled={loading || success}
                >
                  {showPass ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button
              id="owner-login-btn"
              type="submit"
              className={`btn btn--full btn--lg ${success ? 'btn--success' : 'btn--primary'}`}
              disabled={loading || success || phone.length < 10 || !password}
              style={success ? { background: '#10B981', borderColor: '#10B981', color: '#fff' } : undefined}
            >
              {loading ? 'Verifying Credentials...' : 'Sign In →'}
            </button>
          </form>
        )}

        {/* Step 2: OTP Verification Form */}
        {step === 'otp' && !success && (
          <div className={styles.form}>
            <div className={styles.otpRow} onPaste={handleOtpPaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-digit-${i}`}
                  ref={el => { otpRefs.current[i] = el; }}
                  className={styles.otpBox}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  disabled={loading || success}
                />
              ))}
            </div>

            <button
              id="owner-verify-otp-btn"
              type="button"
              className="btn btn--primary btn--full btn--lg"
              onClick={() => handleVerifyOtp()}
              disabled={loading || success || otp.join('').length < 4}
            >
              {loading ? 'Verifying OTP...' : 'Verify & Sign In →'}
            </button>

            <div className={styles.resendRow}>
              <span>Didn&apos;t receive code?</span>
              <button
                type="button"
                className={styles.resendBtn}
                onClick={handleResend}
                disabled={resending || cooldown > 0}
              >
                {resending
                  ? 'Sending...'
                  : cooldown > 0
                  ? `Resend in ${cooldown}s`
                  : 'Resend OTP'}
              </button>
            </div>

            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button
                type="button"
                className={styles.backLink}
                onClick={() => {
                  setStep('credentials');
                  setError('');
                  setResendMsg('');
                }}
                disabled={loading || success}
              >
                ← Change mobile number / password
              </button>
            </div>
          </div>
        )}

        <div className={styles.securityNote}>
          <span>🔒</span>
          <span>Access is strictly restricted to pre-approved store owner phone numbers with end-to-end encryption.</span>
        </div>

        <div style={{ textAlign: 'center', marginTop: '18px' }}>
          <a href="/" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', textDecoration: 'none' }}>
            ← Return to Customer Store
          </a>
        </div>
      </div>
    </div>
  );
}

export default function OwnerLoginPage() {
  return (
    <Suspense fallback={
      <div className={styles.page}>
        <div className={styles.card} style={{ textAlign: 'center', padding: '40px' }}>
          <div className={styles.spinnerSmall} style={{ width: '24px', height: '24px', margin: '0 auto 12px' }} />
          <div>Loading Owner Portal...</div>
        </div>
      </div>
    }>
      <OwnerLoginForm />
    </Suspense>
  );
}
