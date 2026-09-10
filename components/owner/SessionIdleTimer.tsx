'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const IDLE_WARNING_MS = 25 * 60 * 1000; // 25 minutes
const IDLE_LOGOUT_MS = 30 * 60 * 1000;  // 30 minutes

export default function SessionIdleTimer() {
  const router = useRouter();
  const pathname = usePathname();
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(300); // 5 minutes countdown
  const lastActivityRef = useRef<number>(Date.now());
  const countdownTimerRef = useRef<NodeJS.Timeout | null>(null);

  const isPublicAuthPage =
    pathname === '/owner-portal/login' ||
    pathname === '/owner-portal/verify-otp' ||
    pathname === '/owner-portal/forgot-password';

  const handleLogout = useCallback(async (reason = 'idle') => {
    try {
      await fetch('/api/auth/owner-logout', { method: 'POST' });
    } catch {
      // ignore
    }
    setShowWarning(false);
    router.push(`/owner-portal/login?reason=${reason}`);
    router.refresh();
  }, [router]);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
    }
  }, [showWarning]);

  // Periodic session validity check (detects remote revocation across devices)
  useEffect(() => {
    if (isPublicAuthPage) return;

    let isMounted = true;

    const checkSessionStatus = async () => {
      try {
        const res = await fetch('/api/auth/session-check', {
          method: 'GET',
          cache: 'no-store',
        });

        if (!isMounted) return;

        if (res.status === 401 || !res.ok) {
          const data = await res.json().catch(() => ({}));
          const reason = data?.reason === 'revoked' ? 'revoked' : 'idle';
          handleLogout(reason);
        }
      } catch {
        // Network failure or offline - do not logout immediately on transient network errors
      }
    };

    // Run initial check on load and set up periodic 30-second interval
    checkSessionStatus();
    const intervalId = setInterval(checkSessionStatus, 30000);

    // Also check immediately when the window/tab regains visibility or focus
    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkSessionStatus();
      }
    };

    window.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('focus', checkSessionStatus);

    return () => {
      isMounted = false;
      clearInterval(intervalId);
      window.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('focus', checkSessionStatus);
    };
  }, [isPublicAuthPage, handleLogout]);

  useEffect(() => {
    if (isPublicAuthPage) return;

    const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];
    const onUserAction = () => {
      if (!showWarning) {
        lastActivityRef.current = Date.now();
      }
    };

    events.forEach(e => window.addEventListener(e, onUserAction, { passive: true }));

    // Periodic idle check interval
    const interval = setInterval(() => {
      const idleTime = Date.now() - lastActivityRef.current;

      if (idleTime >= IDLE_LOGOUT_MS) {
        handleLogout('idle');
      } else if (idleTime >= IDLE_WARNING_MS && !showWarning) {
        setShowWarning(true);
        const remaining = Math.max(0, Math.floor((IDLE_LOGOUT_MS - idleTime) / 1000));
        setSecondsRemaining(remaining);
      }
    }, 10000);

    return () => {
      events.forEach(e => window.removeEventListener(e, onUserAction));
      clearInterval(interval);
    };
  }, [isPublicAuthPage, showWarning, handleLogout]);

  // Countdown timer when warning modal is open
  useEffect(() => {
    if (showWarning) {
      countdownTimerRef.current = setInterval(() => {
        setSecondsRemaining(prev => {
          if (prev <= 1) {
            handleLogout('idle');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (countdownTimerRef.current) {
      clearInterval(countdownTimerRef.current);
    }

    return () => {
      if (countdownTimerRef.current) clearInterval(countdownTimerRef.current);
    };
  }, [showWarning, handleLogout]);

  if (!showWarning || isPublicAuthPage) return null;

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const timeFormatted = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out',
      }}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          padding: '28px',
          maxWidth: '440px',
          width: '100%',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1px solid #e2e8f0',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: '3rem', marginBottom: '12px' }}>⏳</div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#0f172a', marginBottom: '8px' }}>
          Session Timeout Warning
        </h2>
        <p style={{ fontSize: '0.9rem', color: '#64748b', lineHeight: 1.5, marginBottom: '20px' }}>
          You have been inactive. For your security, you will be automatically signed out in:
        </p>

        <div
          style={{
            fontSize: '2rem',
            fontWeight: 800,
            fontFamily: 'monospace',
            color: '#dc2626',
            backgroundColor: '#fef2f2',
            padding: '12px',
            borderRadius: '10px',
            marginBottom: '24px',
            border: '1px solid #fee2e2',
          }}
        >
          {timeFormatted}
        </div>

        <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
          <button
            type="button"
            onClick={resetActivity}
            style={{
              flex: 1,
              padding: '12px 18px',
              backgroundColor: '#1d4ed8',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            Stay Signed In
          </button>
          <button
            type="button"
            onClick={() => handleLogout('user')}
            style={{
              padding: '12px 18px',
              backgroundColor: '#f1f5f9',
              color: '#475569',
              border: '1px solid #cbd5e1',
              borderRadius: '8px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
            }}
          >
            Sign Out Now
          </button>
        </div>
      </div>
    </div>
  );
}
