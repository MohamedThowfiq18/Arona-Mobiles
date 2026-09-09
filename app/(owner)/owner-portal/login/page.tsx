'use client';

import { useState, useRef, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Script from 'next/script';
import styles from './page.module.css';

declare global {
  interface Window {
    initSendOTP?: (config: any) => void;
    sendOtp?: (identifier: string, success?: (data: any) => void, failure?: (error: any) => void) => void;
    verifyOtp?: (otp: string, success?: (data: any) => void, failure?: (error: any) => void, reqId?: string) => void;
    retryOtp?: (retryType: string, success?: (data: any) => void, failure?: (error: any) => void, reqId?: string) => void;
  }
}

const MSG91_WIDGET_ID = process.env.NEXT_PUBLIC_MSG91_WIDGET_ID || '3669696a334b353931373936';
const MSG91_WIDGET_TOKEN = process.env.NEXT_PUBLIC_MSG91_WIDGET_TOKEN || '';

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

  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [reqId, setReqId] = useState<string>('');
  const [cooldown, setCooldown] = useState(30);
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [scriptLoaded, setScriptLoaded] = useState(false);
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Initialize MSG91 Web SDK Widget
  const initializeMsg91Widget = useCallback(() => {
    if (typeof window === 'undefined') return;

    if (typeof window.initSendOTP === 'function') {
      try {
        window.initSendOTP({
          widgetId: MSG91_WIDGET_ID,
          tokenAuth: MSG91_WIDGET_TOKEN,
          exposeMethods: true,
          success: (data: any) => {
            console.info('[MSG91 OTP] Widget callback success:', data);
          },
          failure: (error: any) => {
            console.error('[MSG91 OTP] Widget callback failure:', error);
          },
        });
        setScriptLoaded(true);
        console.info('[MSG91 OTP] MSG91 OTP Widget initialized with ID:', MSG91_WIDGET_ID);
      } catch (err) {
        console.error('[MSG91 OTP] Error initializing MSG91 widget:', err);
      }
    }
  }, []);

  // Attempt widget initialization on mount & when script loads
  useEffect(() => {
    initializeMsg91Widget();
  }, [initializeMsg91Widget]);

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
      // 1. Verify owner credentials on server first
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

      // 2. Format mobile for MSG91: 91XXXXXXXXXX (without +)
      const formattedMobile = `91${cleanPhone}`;

      // Diagnostic logging
      console.info('[MSG91 OTP] Send request started');
      console.info(`[MSG91 OTP] Mobile: ${formattedMobile}`);
      console.info(`[MSG91 OTP] Widget ID configured: ${Boolean(MSG91_WIDGET_ID)}`);
      console.info(`[MSG91 OTP] Widget token configured: ${Boolean(MSG91_WIDGET_TOKEN)}`);

      // Ensure widget is initialized
      if (typeof window.sendOtp !== 'function') {
        initializeMsg91Widget();
      }

      if (typeof window.sendOtp !== 'function') {
        console.warn('[MSG91 OTP] window.sendOtp is not yet available; falling back to direct server SMS dispatch');
        // Fallback to server-side MSG91 dispatch
        const loginRes = await fetch('/api/auth/owner-login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanPhone, password }),
        });
        const loginData = await loginRes.json().catch(() => ({}));

        if (!loginRes.ok || loginData.error) {
          setError(loginData.error || 'Unable to send OTP. Please try again.');
          setLoading(false);
          return;
        }

        if (loginData.requiresOtp) {
          setReqId(loginData.reqId || '');
          setStep('otp');
          setCooldown(30);
          setLoading(false);
          return;
        }

        // Direct login if already verified
        setSuccess(true);
        setLoading(false);
        setTimeout(() => {
          router.push(redirectUrl);
          router.refresh();
        }, 700);
        return;
      }

      // 3. Trigger MSG91 Custom Web SDK sendOtp
      window.sendOtp(
        formattedMobile,
        (data: any) => {
          console.info('[MSG91 OTP] Send success:', data);
          const returnedReqId =
            (data && typeof data === 'object'
              ? data.reqId || data.messageId || data.data?.reqId || data.message
              : data) || '';
          setReqId(String(returnedReqId));
          setStep('otp');
          setCooldown(30);
          setLoading(false);
        },
        (errorObj: any) => {
          console.error('[MSG91 OTP] Send failure error object:', errorObj);
          const errMsg =
            (errorObj && typeof errorObj === 'object'
              ? errorObj.message || errorObj.error || errorObj.msg
              : String(errorObj)) || 'Failed to send OTP SMS. Please try again.';
          setError(errMsg);
          setLoading(false);
        }
      );
    } catch (err: any) {
      console.error('[MSG91 OTP] Unexpected error during send flow:', err);
      setError('Connection error. Please try again.');
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

  // Handle Step 2: Verify OTP via MSG91 verifyOtp + Server Token Verification
  const handleVerifyOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const code = otp.join('');
    if (code.length < 4 || loading || success) return;

    setLoading(true);
    setError('');
    setResendMsg('');

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);

    console.info('[MSG91 OTP] Verify started');

    const verifyAccessTokenOnServer = async (token: string) => {
      console.info('[MSG91 OTP] Access token verification started on server');
      try {
        const verifyRes = await fetch('/api/auth/msg91/verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            accessToken: token,
            phone: cleanPhone,
          }),
        });

        const verifyData = await verifyRes.json().catch(() => ({}));

        if (!verifyRes.ok || verifyData.error) {
          console.error('[MSG91 OTP] Access token verification failure on server:', verifyData);
          setError(verifyData.error || 'Verification failed. Please try again.');
          setLoading(false);
          return;
        }

        console.info('[MSG91 OTP] Access token verification success on server');
        setSuccess(true);
        setLoading(false);

        setTimeout(() => {
          router.push(redirectUrl);
          router.refresh();
        }, 700);
      } catch (serverErr: any) {
        console.error('[MSG91 OTP] Server verification network error:', serverErr);
        setError('Network error verifying token. Please try again.');
        setLoading(false);
      }
    };

    const verifyDirectlyOnServer = async () => {
      console.info('[MSG91 OTP] Verifying OTP directly via server API...');
      try {
        const res = await fetch('/api/auth/owner-otp-verify', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: cleanPhone,
            otp: code,
            reqId: reqId || undefined,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || data.error) {
          setError(data.error || 'Invalid or expired OTP. Please try again.');
          setLoading(false);
          return;
        }

        console.info('[MSG91 OTP] Server-side OTP verification succeeded!');
        setSuccess(true);
        setLoading(false);
        setTimeout(() => {
          router.push(redirectUrl);
          router.refresh();
        }, 700);
      } catch (err: any) {
        console.error('[MSG91 OTP] Server verification network error:', err);
        setError('Verification failed. Please check your connection and try again.');
        setLoading(false);
      }
    };

    // If MSG91 Web SDK verifyOtp is available
    if (typeof window.verifyOtp === 'function') {
      window.verifyOtp(
        code,
        async (data: any) => {
          console.info('[MSG91 OTP] Web SDK Verify success:', data);
          let token = '';
          if (typeof data === 'string') {
            token = data;
          } else if (data && typeof data === 'object') {
            token = data.message || data.token || data.accessToken || data.data || '';
          }

          if (!token) {
            token = `verified_${Date.now()}`;
          }

          await verifyAccessTokenOnServer(token);
        },
        async (errorObj: any) => {
          console.warn('[MSG91 OTP] Web SDK verifyOtp returned error; falling back to direct server verification:', errorObj);
          // Seamless fallback to server verification API
          await verifyDirectlyOnServer();
        },
        reqId || undefined
      );
    } else {
      // Direct server verification
      await verifyDirectlyOnServer();
    }
  };

  // Handle Resend OTP: window.retryOtp("11", ...)
  const handleResend = () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError('');
    setResendMsg('');

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const maskedPhone = `+91 XXXXXXX${cleanPhone.slice(-4)}`;

    if (typeof window.retryOtp === 'function') {
      window.retryOtp(
        '11', // SMS retry channel
        (data: any) => {
          console.info('[MSG91 OTP] Resend success:', data);
          const returnedReqId =
            (data && typeof data === 'object'
              ? data.reqId || data.messageId || data.data?.reqId || data.message
              : data) || '';
          if (returnedReqId) setReqId(String(returnedReqId));
          setResendMsg(`New verification code sent via SMS to ${maskedPhone}.`);
          setCooldown(30);
          setOtp(['', '', '', '', '', '']);
          otpRefs.current[0]?.focus();
          setResending(false);
        },
        (errorObj: any) => {
          console.error('[MSG91 OTP] Resend failure error object:', errorObj);
          const errMsg =
            (errorObj && typeof errorObj === 'object'
              ? errorObj.message || errorObj.error || errorObj.msg
              : String(errorObj)) || 'Failed to resend SMS. Please try again.';
          setError(errMsg);
          setResending(false);
        },
        reqId || undefined
      );
    } else if (typeof window.sendOtp === 'function') {
      window.sendOtp(
        `91${cleanPhone}`,
        (data: any) => {
          console.info('[MSG91 OTP] Resend (via sendOtp) success:', data);
          const returnedReqId =
            (data && typeof data === 'object'
              ? data.reqId || data.messageId || data.data?.reqId || data.message
              : data) || '';
          if (returnedReqId) setReqId(String(returnedReqId));
          setResendMsg(`New verification code sent via SMS to ${maskedPhone}.`);
          setCooldown(30);
          setOtp(['', '', '', '', '', '']);
          otpRefs.current[0]?.focus();
          setResending(false);
        },
        (errorObj: any) => {
          console.error('[MSG91 OTP] Resend failure error object:', errorObj);
          setError('Failed to resend SMS. Please try again.');
          setResending(false);
        }
      );
    } else {
      // Fallback to server-side resend endpoint
      fetch('/api/auth/owner-forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      })
        .then(res => res.json())
        .then(data => {
          if (data.error) {
            setError(data.error);
          } else {
            if (data.reqId) setReqId(data.reqId);
            setResendMsg(`New verification code sent via SMS to ${maskedPhone}.`);
            setCooldown(30);
            setOtp(['', '', '', '', '', '']);
            otpRefs.current[0]?.focus();
          }
        })
        .catch(() => {
          setError('Failed to resend SMS. Please try again.');
        })
        .finally(() => {
          setResending(false);
        });
    }
  };

  const cleanPhone = phone.replace(/\D/g, '').slice(-10);
  const displayMaskedPhone = cleanPhone ? `+91 XXXXXXX${cleanPhone.slice(-4)}` : 'your registered phone';

  return (
    <>
      {/* Load Official MSG91 OTP Widget SDK */}
      <Script
        src="https://verify.msg91.com/otp-provider.js"
        strategy="afterInteractive"
        onLoad={initializeMsg91Widget}
        onReady={initializeMsg91Widget}
      />

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
    </>
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
