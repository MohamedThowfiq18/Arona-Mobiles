'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import styles from './Toast.module.css';

export interface ToastMessage {
  id: string;
  type?: 'success' | 'error' | 'info' | 'default';
  title: string;
  message?: string;
}

// Global event bus for toasts
const TOAST_EVENT = 'arona-toast';

export function showToast(toast: Omit<ToastMessage, 'id'>) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { ...toast, id: Date.now().toString() } }));
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) { clearTimeout(timer); timers.current.delete(id); }
  }, []);

  const addToast = useCallback((toast: ToastMessage) => {
    setToasts(prev => [toast, ...prev].slice(0, 5));
    const timer = setTimeout(() => removeToast(toast.id), 4000);
    timers.current.set(toast.id, timer);
  }, [removeToast]);

  useEffect(() => {
    const handler = (e: Event) => addToast((e as CustomEvent<ToastMessage>).detail);
    window.addEventListener(TOAST_EVENT, handler);
    return () => window.removeEventListener(TOAST_EVENT, handler);
  }, [addToast]);

  if (toasts.length === 0) return null;

  return (
    <div className={styles.container} aria-live="polite">
      {toasts.map(toast => (
        <div
          key={toast.id}
          className={`${styles.toast} ${styles[toast.type || 'default']}`}
          role="alert"
        >
          <div className={styles.icon}>
            {toast.type === 'success' ? '✅' :
             toast.type === 'error'   ? '❌' :
             toast.type === 'info'    ? 'ℹ️' : '🔔'}
          </div>
          <div className={styles.content}>
            <div className={styles.title}>{toast.title}</div>
            {toast.message && <div className={styles.message}>{toast.message}</div>}
          </div>
          <button
            className={styles.close}
            onClick={() => removeToast(toast.id)}
            aria-label="Close"
          >✕</button>
        </div>
      ))}
    </div>
  );
}
