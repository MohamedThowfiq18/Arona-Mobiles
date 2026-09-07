'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import styles from './page.module.css';

function OwnerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirect = searchParams.get('redirect') || '/owner-portal';
  const reason = searchParams.get('reason');
  const redirectUrl = rawRedirect.startsWith('/owner-portal') ? rawRedirect : '/owner-portal';

  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading || success) return;

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/owner-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, password }),
      });
      const data = await res.json();

      if (!res.ok || data.error) {
        setError(data.error || 'Invalid phone number or password.');
        setLoading(false);
        return;
      }

      if (data.requiresOtp) {
        // First-time 2FA verification flow
        router.push(`/owner-portal/verify-otp?id=${encodeURIComponent(data.ownerId)}&phone=${encodeURIComponent(phone)}`);
        return;
      }

      // Successful sign in
      setSuccess(true);
      setLoading(false);

      setTimeout(() => {
        router.push(redirectUrl);
        router.refresh();
      }, 700);
    } catch {
      setError('Network connection error. Please try again.');
      setLoading(false);
    }
  };

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

        <h1 className={styles.title}>Sign In</h1>
        <p className={styles.subtitle}>Enter your authorized credentials to access the store management dashboard.</p>

        {/* Inactivity Alert */}
        {reason === 'idle' && !error && !success && (
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
                Authenticating owner session...
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

        <form onSubmit={handleLogin} className={styles.form}>
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
            {success ? '✓ Authenticated' : loading ? 'Signing in...' : 'Sign In →'}
          </button>
        </form>

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
