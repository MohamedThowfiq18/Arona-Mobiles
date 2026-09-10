'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import styles from '../login/page.module.css';

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

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [resendMsg, setResendMsg] = useState('');
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(30);

  // In-memory MSG91 transaction state
  const [msg91Ready, setMsg91Ready] = useState(false);
  const [msg91ReqId, setMsg91ReqId] = useState<string>('');

  // Stable MSG91 Custom Web SDK Script Loader & Initializer (Reused from login)
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const configuration = {
      widgetId: process.env.NEXT_PUBLIC_MSG91_WIDGET_ID,
      tokenAuth: process.env.NEXT_PUBLIC_MSG91_WIDGET_TOKEN,
      identifier: '',
      exposeMethods: true,
      captchaRenderId: '',

      success: (data: any) => {
        console.log('[MSG91 ForgotPassword] OTP sent:', data);
      },

      failure: (err: any) => {
        console.error('[MSG91 ForgotPassword] OTP failed:', err);
      },
    };

    const initializeWidget = () => {
      if (typeof window.initSendOTP === 'function') {
        try {
          window.initSendOTP(configuration);
          console.log('[MSG91 ForgotPassword] Widget initialized');
          setMsg91Ready(true);
        } catch (e) {
          console.error('[MSG91 ForgotPassword] Error initializing MSG91 widget:', e);
        }
      }
    };

    // If already initialized and methods are present
    if (
      typeof window.sendOtp === 'function' &&
      typeof window.verifyOtp === 'function'
    ) {
      console.log('[MSG91 ForgotPassword] Widget already initialized');
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
          console.log('[MSG91 ForgotPassword] Script loaded');
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
      console.log('[MSG91 ForgotPassword] Script loaded');
      initializeWidget();
    };
    script.onerror = () => {
      console.error('[MSG91 ForgotPassword] Failed to load OTP provider script');
      setMsg91Ready(false);
    };

    document.body.appendChild(script);
  }, []);

  // Resend countdown timer
  useEffect(() => {
    if (step !== 2 || cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(c => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [step, cooldown]);

  // Step 1: Send real MSG91 SMS OTP
  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || success) return;

    setError('');
    setSuccessMsg('');
    setResendMsg('');

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    if (cleanPhone.length !== 10) {
      setError('Please enter a valid 10-digit registered mobile number.');
      return;
    }

    setLoading(true);

    const formattedMobile = `91${cleanPhone}`;

    if (typeof window.sendOtp === 'function') {
      console.log('[MSG91 ForgotPassword] Dispatching OTP via Web SDK');

      window.sendOtp(
        formattedMobile,
        (data: any) => {
          console.log('[MSG91 ForgotPassword] OTP send successful:', data);
          const reqId = data?.reqId || data?.message || data?.data?.reqId || (typeof data === 'string' && data.length > 5 ? data : '');
          if (reqId) {
            setMsg91ReqId(String(reqId));
          }
          setSuccessMsg(`A 6-digit recovery code has been sent via SMS to your registered phone.`);
          setStep(2);
          setCooldown(30);
          setLoading(false);
        },
        async (err: any) => {
          console.warn('[MSG91 ForgotPassword] SDK sendOtp failed, attempting server fallback:', err);
          // Fallback to server endpoint
          try {
            const res = await fetch('/api/auth/owner-forgot-password', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ phone: cleanPhone }),
            });
            const data = await res.json();
            if (!res.ok || data.error) {
              setError(data.error || 'Unable to send OTP. Please try again.');
              setLoading(false);
              return;
            }
            if (data.reqId) {
              setMsg91ReqId(String(data.reqId));
            }
            setSuccessMsg(data.message || 'A 6-digit recovery code has been sent via SMS.');
            setStep(2);
            setCooldown(30);
            setLoading(false);
          } catch {
            setError('Unable to send OTP. Please try again.');
            setLoading(false);
          }
        }
      );
    } else {
      // Fallback via server API
      try {
        const res = await fetch('/api/auth/owner-forgot-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: cleanPhone }),
        });
        const data = await res.json();
        if (!res.ok || data.error) {
          setError(data.error || 'Unable to send OTP. Please try again.');
          setLoading(false);
          return;
        }
        if (data.reqId) {
          setMsg91ReqId(String(data.reqId));
        }
        setSuccessMsg(data.message || 'A 6-digit recovery code has been sent via SMS.');
        setStep(2);
        setCooldown(30);
        setLoading(false);
      } catch {
        setError('OTP service is still loading. Please try again.');
        setLoading(false);
      }
    }
  };

  // Resend OTP handler via MSG91
  const handleResend = () => {
    if (cooldown > 0 || resending || loading) return;

    setResending(true);
    setError('');
    setResendMsg('');

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const formattedMobile = `91${cleanPhone}`;
    const masked = `+91 XXXXXXX${cleanPhone.slice(-4)}`;

    const onResendSuccess = (data: any) => {
      console.log('[MSG91 ForgotPassword] Resend successful:', data);
      const newReqId = data?.reqId || data?.message || data?.data?.reqId || '';
      if (newReqId) {
        setMsg91ReqId(String(newReqId));
      }
      setResendMsg(`New recovery code sent via SMS to ${masked}.`);
      setCooldown(30);
      setOtp('');
      setResending(false);
    };

    const onResendFailure = (err: any) => {
      console.error('[MSG91 ForgotPassword] Resend failed:', err);
      setError(err?.message || 'Unable to send OTP. Please try again.');
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
      setError('OTP service is still loading. Please try again.');
      setResending(false);
    }
  };

  // Step 2: Verify OTP via MSG91 + Secure Password Reset on Server
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || success) return;

    setError('');
    setResendMsg('');

    const cleanPhone = phone.replace(/\D/g, '').slice(-10);
    const cleanOtp = otp.replace(/\D/g, '').slice(0, 6);

    if (cleanOtp.length < 4) {
      setError('Please enter the 6-digit SMS verification code.');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    const executeServerPasswordReset = async (accessToken?: string) => {
      try {
        const res = await fetch('/api/auth/owner-reset-password', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            phone: cleanPhone,
            otp: cleanOtp,
            reqId: msg91ReqId || undefined,
            accessToken: accessToken || undefined,
            newPassword,
          }),
        });

        const data = await res.json().catch(() => ({}));

        if (!res.ok || data.error) {
          setError(data.error || 'Unable to update password. Please try again.');
          setLoading(false);
          return;
        }

        setSuccess(true);
        setSuccessMsg('✓ Password Reset Successful! Your password has been updated successfully.');
        setLoading(false);

        setTimeout(() => {
          router.push('/owner-portal/login');
          router.refresh();
        }, 1500);
      } catch (err: any) {
        console.error('Password reset network error:', err);
        setError('Unable to update password. Please try again.');
        setLoading(false);
      }
    };

    // Verify OTP using MSG91 Web SDK
    if (typeof window.verifyOtp === 'function' && msg91ReqId) {
      console.log('[MSG91 ForgotPassword] Verifying OTP via Web SDK');

      window.verifyOtp(
        cleanOtp,
        async (data: any) => {
          console.log('[MSG91 ForgotPassword] OTP verified by MSG91:', data);
          const accessToken = extractMsg91AccessToken(data) || `verified_${Date.now()}`;
          await executeServerPasswordReset(accessToken);
        },
        async (errObj: any) => {
          console.warn('[MSG91 ForgotPassword] SDK verifyOtp rejected, checking with server:', errObj);
          // Try server-side verification directly
          await executeServerPasswordReset();
        },
        msg91ReqId
      );
    } else {
      // Direct server-side verification
      await executeServerPasswordReset();
    }
  };

  const cleanPhoneDisplay = phone.replace(/\D/g, '').slice(-10);
  const displayMaskedPhone = cleanPhoneDisplay ? `+91 XXXXXXX${cleanPhoneDisplay.slice(-4)}` : 'your registered phone';

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logo}>
          <span className={styles.logoIcon}>🔑</span>
          <div>
            <div className={styles.logoName}>ARONA MOBILES</div>
            <div className={styles.logoSub}>Account Recovery</div>
          </div>
        </div>

        <h1 className={styles.title}>
          {success ? '✓ Password Reset Successful!' : step === 1 ? 'Reset Password' : 'Enter 6-Digit Code'}
        </h1>
        <p className={styles.subtitle}>
          {success
            ? 'Your password has been updated successfully. Redirecting to sign in...'
            : step === 1
            ? 'Enter your registered owner phone number to receive a real 6-digit MSG91 SMS verification code.'
            : <>Enter the verification code sent to <strong>{displayMaskedPhone}</strong> and choose your new password.</>}
        </p>

        {/* Success Alert */}
        {success && (
          <div className={styles.successBox} role="status" aria-live="polite" style={{ marginBottom: '16px' }}>
            <div className={styles.successIcon}>✓</div>
            <div>
              <div className={styles.successTitle}>Password Reset Successful!</div>
              <div className={styles.successDesc}>
                Your password has been updated successfully.
              </div>
              <div className={styles.redirectNote}>
                <span className={styles.spinnerSmall} />
                Redirecting to Owner Portal sign in...
              </div>
            </div>
          </div>
        )}

        {/* Standard Alerts */}
        {error && !success && <div className="alert alert--error" role="alert">{error}</div>}
        {successMsg && !success && <div className="alert alert--success" role="alert">{successMsg}</div>}
        {resendMsg && !success && <div className="alert alert--info" role="alert">{resendMsg}</div>}

        {!success && step === 1 && (
          <form onSubmit={handleRequestOTP} className={styles.form}>
            <div className="form-group">
              <label className="form-label" htmlFor="recovery-phone">Registered Owner Mobile Number</label>
              <input
                id="recovery-phone"
                className="form-input"
                type="tel"
                placeholder="10-digit mobile number"
                value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                required
                disabled={loading}
                autoFocus
              />
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--full btn--lg"
              disabled={loading || phone.replace(/\D/g, '').length < 10}
            >
              {loading ? 'Sending SMS OTP...' : 'Send OTP →'}
            </button>
          </form>
        )}

        {!success && step === 2 && (
          <form onSubmit={handleResetPassword} className={styles.form}>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label" htmlFor="recovery-otp">6-Digit SMS Verification Code</label>
                {cooldown > 0 ? (
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)' }}>
                    Resend in {cooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resending || loading}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-primary)',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {resending ? 'Sending...' : 'Resend OTP'}
                  </button>
                )}
              </div>
              <input
                id="recovery-otp"
                className="form-input"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter 6-digit code"
                value={otp}
                onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                required
                disabled={loading}
                autoFocus
              />
              <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: '4px' }}>
                Delivered via MSG91 SMS (single-use).
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="recovery-new-pass">New Password</label>
              <input
                id="recovery-new-pass"
                className="form-input"
                type="password"
                placeholder="Minimum 6 characters"
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="recovery-confirm-pass">Confirm New Password</label>
              <input
                id="recovery-confirm-pass"
                className="form-input"
                type="password"
                placeholder="Re-enter new password"
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              className="btn btn--primary btn--full btn--lg"
              disabled={loading || otp.length < 4 || !newPassword || !confirmPassword}
            >
              {loading ? 'Resetting Password...' : 'Reset Password & Sign In →'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => { setStep(1); setError(''); setSuccessMsg(''); setResendMsg(''); }}
                disabled={loading}
              >
                ← Request a new code
              </button>
            </div>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
          <Link href="/owner-portal/login" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', textDecoration: 'none' }}>
            ← Back to Owner Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
