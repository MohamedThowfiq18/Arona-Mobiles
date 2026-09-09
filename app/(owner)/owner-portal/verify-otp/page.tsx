'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import styles from './page.module.css';

function OTPForm() {
  const router = useRouter();
  const params = useSearchParams();
  const ownerId = params.get('id') || '';
  const phoneParam = params.get('phone') || '';
  const initialReqId = params.get('reqId') || '';

  const cleanPhone = phoneParam.replace(/\D/g, '').slice(-10) ||
    (ownerId.startsWith('owner-') ? ownerId.replace('owner-', '') : '');

  const displayPhone = cleanPhone
    ? `+91 XXXXXXX${cleanPhone.slice(-4)}`
    : 'your registered phone number';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [reqId, setReqId] = useState<string>(initialReqId);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [resendMsg, setResendMsg] = useState('');
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(30); // 30s resend cooldown
  const refs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend countdown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown(c => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return;
    const newOtp = [...otp];
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);
    if (value && index < 5) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      refs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const text = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (text.length === 6) {
      setOtp(text.split(''));
      refs.current[5]?.focus();
    }
    e.preventDefault();
  };

  const verify = async () => {
    const code = otp.join('');
    if (code.length < 6 || loading || success) return;
    setLoading(true);
    setError('');
    setResendMsg('');

    try {
      const res = await fetch('/api/auth/owner-otp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ownerId: ownerId || `owner-${cleanPhone}`,
          phone: cleanPhone,
          otp: code,
          reqId: reqId || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Invalid or expired OTP. Please try again.');
        setLoading(false);
        return;
      }

      // Success: Show confirmation and auto-redirect
      setSuccess(true);
      setLoading(false);

      setTimeout(() => {
        router.push('/owner-portal');
        router.refresh();
      }, 700);
    } catch {
      setError('Verification failed. Please check your connection and try again.');
      setLoading(false);
    }
  };

  const resend = async () => {
    if (cooldown > 0 || resending) return;
    if (!cleanPhone) {
      setError('Phone number not found. Please return to sign in.');
      return;
    }
    setResending(true);
    setError('');
    setResendMsg('');

    try {
      const res = await fetch('/api/auth/owner-forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: cleanPhone }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Failed to resend SMS.');
      } else {
        if (data.reqId) {
          setReqId(data.reqId);
        }
        setResendMsg(`New verification code sent via SMS to ${displayPhone}.`);
        setOtp(['', '', '', '', '', '']);
        setCooldown(30); // Reset 30-second cooldown
        refs.current[0]?.focus();
      }
    } catch {
      setError('Failed to resend SMS. Please try again.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.lockIcon}>{success ? '✓' : '🔐'}</div>
        <h1 className={styles.title}>
          {success ? '✓ Login Successful!' : 'Two-Step Verification'}
        </h1>
        <p className={styles.subtitle}>
          {success
            ? 'Welcome back to ARONA MOBILES Owner Portal. Redirecting...'
            : <>Enter the real 6-digit SMS verification code delivered to <strong>{displayPhone}</strong>.</>}
        </p>

        {error && !success && <div className="alert alert--error" role="alert">{error}</div>}
        {resendMsg && !success && <div className="alert alert--success" role="alert">{resendMsg}</div>}

        {!success ? (
          <>
            <div className={styles.otpRow} onPaste={handlePaste}>
              {otp.map((digit, i) => (
                <input
                  key={i}
                  id={`otp-digit-${i}`}
                  ref={el => { refs.current[i] = el; }}
                  className={styles.otpBox}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={e => handleChange(i, e.target.value)}
                  onKeyDown={e => handleKeyDown(i, e)}
                  autoFocus={i === 0}
                  disabled={loading || success}
                />
              ))}
            </div>

            <button
              id="otp-verify-btn"
              className="btn btn--primary btn--full btn--lg"
              onClick={verify}
              disabled={loading || success || otp.join('').length < 6}
            >
              {loading ? 'Verifying...' : 'Verify & Sign In →'}
            </button>

            <div className={styles.resend}>
              Didn&apos;t receive the SMS?{' '}
              <button
                type="button"
                className={styles.resendBtn}
                onClick={resend}
                disabled={resending || cooldown > 0}
              >
                {resending
                  ? 'Sending...'
                  : cooldown > 0
                  ? `Resend OTP in ${cooldown}s`
                  : 'Resend Code'}
              </button>
            </div>

            <div className={styles.note}>
              Code expires in 5 minutes (single-use).
            </div>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <a href="/owner-portal/login" style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
                ← Back to Sign In
              </a>
            </div>
          </>
        ) : (
          <div style={{ padding: '20px 0', color: 'var(--color-success, #10B981)', fontWeight: 600 }}>
            🔒 Authenticating owner session...
          </div>
        )}
      </div>
    </div>
  );
}

export default function OwnerOTPPage() {
  return (
    <Suspense fallback={null}>
      <OTPForm />
    </Suspense>
  );
}
