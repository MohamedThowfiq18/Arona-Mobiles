'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styles from '../login/page.module.css';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/owner-forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Unable to send recovery code.');
        setLoading(false);
        return;
      }

      setSuccess(data.message || 'If this phone number is registered, a 6-digit recovery code has been sent via SMS.');
      setStep(2);
      setLoading(false);
    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setError('');

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/auth/owner-reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp, newPassword }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Failed to reset password.');
        setLoading(false);
        return;
      }

      setSuccess('Password reset successfully! Redirecting to Owner Portal...');
      setTimeout(() => {
        router.push('/owner-portal');
        router.refresh();
      }, 900);
    } catch {
      setError('Connection error. Please try again.');
      setLoading(false);
    }
  };

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
          {step === 1 ? 'Reset Password' : 'Enter 6-Digit Code'}
        </h1>
        <p className={styles.subtitle}>
          {step === 1
            ? 'Enter your registered owner phone number to receive a 6-digit SMS verification code.'
            : `Enter the code received on your phone and choose a strong new password.`}
        </p>

        {error && <div className="alert alert--error" role="alert">{error}</div>}
        {success && <div className="alert alert--success" role="alert">{success}</div>}

        {step === 1 ? (
          <form onSubmit={handleRequestOTP} className={styles.form}>
            <div className="form-group">
              <label className="form-label" htmlFor="recovery-phone">Registered Mobile Number</label>
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
              disabled={loading || phone.length < 10}
            >
              {loading ? 'Sending SMS...' : 'Send Recovery SMS →'}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetPassword} className={styles.form}>
            <div className="form-group">
              <label className="form-label" htmlFor="recovery-otp">6-Digit SMS Code</label>
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
                Code expires in 5 minutes (single-use).
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
              disabled={loading || otp.length < 6 || !newPassword || !confirmPassword}
            >
              {loading ? 'Resetting Password...' : 'Reset Password & Sign In →'}
            </button>

            <div style={{ textAlign: 'center', marginTop: '12px' }}>
              <button
                type="button"
                className="btn btn--ghost btn--sm"
                onClick={() => { setStep(1); setError(''); setSuccess(''); }}
                disabled={loading}
              >
                ← Request a new code
              </button>
            </div>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '20px', paddingTop: '16px', borderTop: '1px solid var(--color-border)' }}>
          <a href="/owner-portal/login" style={{ fontSize: '0.85rem', color: 'var(--color-primary)', textDecoration: 'none' }}>
            ← Back to Owner Sign In
          </a>
        </div>
      </div>
    </div>
  );
}
