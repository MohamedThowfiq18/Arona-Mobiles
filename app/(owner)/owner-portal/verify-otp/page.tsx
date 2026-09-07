'use client';

import { useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import styles from './page.module.css';

function OTPForm() {
  const router = useRouter();
  const params = useSearchParams();
  const ownerId = params.get('id') || '';
  const phoneParam = params.get('phone') || '';

  const cleanPhone = phoneParam.replace(/\D/g, '').slice(-10) ||
    (ownerId.startsWith('owner-') ? ownerId.replace('owner-', '') : '');

  const displayPhone = cleanPhone
    ? `+91 ${cleanPhone.slice(0, 5)} ${cleanPhone.slice(5)}`
    : 'your registered phone number';

  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [resendMsg, setResendMsg] = useState('');
  const [resending, setResending] = useState(false);
  const refs = useRef<(HTMLInputElement | null)[]>([]);

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
    if (code.length < 6) return;
    setLoading(true);
    setError('');
    setResendMsg('');

    try {
      const res = await fetch('/api/auth/owner-otp-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ownerId: ownerId || `owner-${cleanPhone}`, otp: code }),
      });
      const data = await res.json();
      if (!res.ok || data.error) {
        setError(data.error || 'Invalid verification code.');
        return;
      }
      router.push('/owner-portal');
      router.refresh();
    } catch {
      setError('Verification failed. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const resend = async () => {
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
        setResendMsg(`New 6-digit verification code sent via SMS to ${displayPhone}.`);
        setOtp(['', '', '', '', '', '']);
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
        <div className={styles.lockIcon}>🔐</div>
        <h1 className={styles.title}>Two-Step Verification</h1>
        <p className={styles.subtitle}>
          Enter the real 6-digit SMS verification code delivered to <strong>{displayPhone}</strong>.
        </p>

        {error && <div className="alert alert--error">{error}</div>}
        {resendMsg && <div className="alert alert--success">{resendMsg}</div>}

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
            />
          ))}
        </div>

        <button
          id="otp-verify-btn"
          className="btn btn--primary btn--full btn--lg"
          onClick={verify}
          disabled={loading || otp.join('').length < 6}
        >
          {loading ? 'Verifying...' : 'Verify & Sign In →'}
        </button>

        <div className={styles.resend}>
          Didn&apos;t receive the SMS?{' '}
          <button className={styles.resendBtn} onClick={resend} disabled={resending}>
            {resending ? 'Sending...' : 'Resend Code'}
          </button>
        </div>

        <div className={styles.note}>
          Code expires in 5 minutes (max 5 verification attempts). Single-use.
        </div>

        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <a href="/owner-portal/login" style={{ fontSize: '0.82rem', color: 'var(--color-text-secondary)', textDecoration: 'none' }}>
            ← Back to Sign In
          </a>
        </div>
      </div>
    </div>
  );
}

export default function OwnerOTPPage() {
  return <Suspense fallback={null}><OTPForm /></Suspense>;
}
