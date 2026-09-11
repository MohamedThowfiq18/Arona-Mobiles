'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client';
import { showToast } from '@/components/customer/Toast/Toast';
import { useStoreSettings } from '@/components/customer/StoreSettingsProvider/StoreSettingsProvider';
import type { RepairBooking } from '@/lib/types';
import styles from './page.module.css';

function RepairStatusContent() {
  const searchParams = useSearchParams();
  const { settings, whatsappNumber } = useStoreSettings();

  const [bookingId, setBookingId] = useState(searchParams.get('id') || searchParams.get('bookingId') || '');
  const [phoneNumber, setPhoneNumber] = useState(searchParams.get('phone') || searchParams.get('mobile') || '');
  const [booking, setBooking] = useState<RepairBooking | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-search if both parameters are provided in URL query
  useEffect(() => {
    const queryId = searchParams.get('id') || searchParams.get('bookingId');
    const queryPhone = searchParams.get('phone') || searchParams.get('mobile');
    if (queryId && queryPhone) {
      performLookup(queryId, queryPhone);
    }
  }, [searchParams]);

  // ── 1. Realtime Supabase Subscription for Current Booking ────────
  useEffect(() => {
    if (!booking?.id) return;

    let channel: any = null;
    try {
      const supabase = getSupabaseClient();
      channel = supabase
        .channel(`realtime:repair_status:${booking.id}`)
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'repair_bookings',
            filter: `id=eq.${booking.id}`,
          },
          (payload: any) => {
            if (payload.new) {
              const updated = payload.new;
              setBooking(prev => {
                if (!prev) return null;
                const newStatus = updated.status || prev.status;
                if (newStatus !== prev.status) {
                  showToast({
                    type: 'info',
                    title: 'Status Updated Live!',
                    message: `Your repair status is now: ${newStatus.replace(/_/g, ' ').toUpperCase()}`,
                  });
                }
                return {
                  ...prev,
                  status: newStatus,
                  notes: updated.notes || updated.technician_notes || prev.notes,
                  service_price: updated.service_price ?? updated.final_cost ?? prev.service_price,
                  preferred_date_time: updated.preferred_date_time || updated.scheduled_slot || prev.preferred_date_time,
                  updated_at: updated.updated_at || new Date().toISOString(),
                };
              });
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('[Realtime] Failed to subscribe to booking status channel:', err);
    }

    return () => {
      if (channel) {
        try {
          const supabase = getSupabaseClient();
          supabase.removeChannel(channel);
        } catch {}
      }
    };
  }, [booking?.id]);

  // ── 2. Perform Lookup via Server API ────────────────────────────
  const performLookup = async (idToSearch: string, phoneToSearch: string) => {
    const cleanId = idToSearch.trim();
    const cleanPhone = phoneToSearch.replace(/\D/g, '').slice(-10);

    if (!cleanId) {
      showToast({ type: 'error', title: 'Please enter your Booking ID.' });
      return;
    }
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      showToast({ type: 'error', title: 'Please enter a valid 10-digit Indian mobile number.' });
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSearched(true);

    try {
      const res = await fetch(
        `/api/repairs/status?id=${encodeURIComponent(cleanId)}&phone=${encodeURIComponent(cleanPhone)}`
      );
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success || !data.booking) {
        setBooking(null);
        setErrorMsg(data.error || 'No repair booking found matching the provided Booking ID and Phone Number.');
      } else {
        setBooking(data.booking);
        setErrorMsg('');
      }
    } catch (err) {
      console.error('[Repair Status] Network error:', err);
      setBooking(null);
      setErrorMsg('Could not connect to server. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(bookingId, phoneNumber);
  };

  const currentStatus = booking?.status || 'pending';
  const isCancelled = currentStatus === 'cancelled';
  const isCompleted = currentStatus === 'completed' || currentStatus === 'delivered';
  const isInProgress = currentStatus === 'in_progress' || currentStatus === 'repaired';
  const isConfirmed = currentStatus === 'confirmed' || currentStatus === 'booked' || isInProgress || isCompleted;

  const waStoreNumber = (whatsappNumber || '9787061617').replace(/\D/g, '').slice(-10);
  const waMessage = encodeURIComponent(
    `Hi ${settings.store_name || 'ARONA MOBILES'}! I would like an update regarding my repair booking (ID: ${booking?.id || bookingId}).`
  );

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className="container">
          <h1 className={styles.title}>🔍 Check Your Repair Status</h1>
          <p className={styles.sub}>
            Enter your Booking ID and registered mobile number to track the live progress of your device repair.
          </p>
        </div>
      </div>

      <div className="container">
        <div className={styles.card}>
          <form onSubmit={handleFormSubmit} className={styles.form}>
            <div className={styles.formGrid}>
              <div className="form-group">
                <label className="form-label" htmlFor="bookingIdInput">
                  Booking ID *
                </label>
                <input
                  id="bookingIdInput"
                  className="form-input"
                  placeholder="e.g. 5641f66f-5c15-430a-a588-..."
                  value={bookingId}
                  onChange={e => setBookingId(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="phoneInput">
                  Registered Mobile Number *
                </label>
                <input
                  id="phoneInput"
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 9876543210 (10 digits)"
                  value={phoneNumber}
                  onChange={e => setPhoneNumber(e.target.value)}
                  maxLength={10}
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className={`btn btn--primary btn--lg btn--full ${styles.submitBtn}`}
              disabled={loading}
            >
              {loading ? 'Checking Status...' : '🔍 Check Status'}
            </button>
          </form>

          {/* ── Error Message ─────────────────────────── */}
          {searched && errorMsg && (
            <div style={{ marginTop: 24 }} className={styles.cancelledAlert}>
              {errorMsg}
            </div>
          )}

          {/* ── Result Section ────────────────────────── */}
          {booking && (
            <div className={styles.resultContainer}>
              <div className={styles.statusHeader}>
                <div>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block' }}>
                    Repair Booking ID
                  </span>
                  <span className={styles.bookingIdBadge}>{booking.id}</span>
                </div>
                <div className={styles.liveBadge}>
                  <span className={styles.liveDot} />
                  Live Sync
                </div>
              </div>

              {/* ── Visual Progress Timeline ──────────── */}
              {isCancelled ? (
                <div className={styles.cancelledAlert}>
                  ❌ This repair booking has been cancelled. Please contact the store for more information.
                </div>
              ) : (
                <div className={styles.tracker}>
                  {/* Step 1: Received */}
                  <div className={`${styles.trackerStep} ${styles.stepCompleted}`}>
                    <div className={styles.stepIcon}>✓</div>
                    <div className={styles.stepLabel}>Booking Received</div>
                  </div>

                  {/* Step 2: Store Confirmation */}
                  <div
                    className={`${styles.trackerStep} ${
                      isConfirmed
                        ? styles.stepCompleted
                        : currentStatus === 'pending'
                        ? styles.stepPending
                        : ''
                    }`}
                  >
                    <div className={styles.stepIcon}>
                      {isConfirmed ? '✓' : currentStatus === 'pending' ? '⏳' : '2'}
                    </div>
                    <div className={styles.stepLabel}>
                      {isConfirmed ? 'Confirmed by Store' : 'Waiting for Confirmation'}
                    </div>
                  </div>

                  {/* Step 3: In Progress */}
                  <div
                    className={`${styles.trackerStep} ${
                      isCompleted
                        ? styles.stepCompleted
                        : isInProgress
                        ? styles.stepActive
                        : ''
                    }`}
                  >
                    <div className={styles.stepIcon}>
                      {isCompleted ? '✓' : isInProgress ? '⚙️' : '3'}
                    </div>
                    <div className={styles.stepLabel}>
                      {isInProgress ? 'Repair In Progress' : 'In Progress'}
                    </div>
                  </div>

                  {/* Step 4: Completed */}
                  <div
                    className={`${styles.trackerStep} ${
                      isCompleted ? styles.stepCompleted : ''
                    }`}
                  >
                    <div className={styles.stepIcon}>{isCompleted ? '✅' : '4'}</div>
                    <div className={styles.stepLabel}>
                      {isCompleted ? 'Repair Completed' : 'Completed'}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Details Grid ──────────────────────── */}
              <div className={styles.detailsGrid}>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Customer</span>
                  <span className={styles.detailValue}>{booking.customer_name}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Registered Phone</span>
                  <span className={styles.detailValue}>+91 {booking.customer_phone}</span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Device</span>
                  <span className={styles.detailValue}>
                    {booking.phone_brand} {booking.phone_model}
                  </span>
                </div>
                <div className={styles.detailItem}>
                  <span className={styles.detailLabel}>Service Needed</span>
                  <span className={styles.detailValue} style={{ color: 'var(--color-accent)' }}>
                    {booking.service_type}
                  </span>
                </div>
                {booking.preferred_date_time && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Preferred Appointment</span>
                    <span className={styles.detailValue} style={{ color: '#2563EB' }}>
                      📅{' '}
                      {new Date(booking.preferred_date_time).toLocaleString('en-IN', {
                        weekday: 'short',
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
                {booking.service_price && (
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Estimated Cost</span>
                    <span className={styles.detailValue}>₹{booking.service_price.toLocaleString('en-IN')}</span>
                  </div>
                )}
              </div>

              {booking.issue_description && (
                <div className={styles.noteBox}>
                  <strong>Reported Issue:</strong> {booking.issue_description}
                </div>
              )}

              {booking.notes && (
                <div className={styles.noteBox} style={{ background: '#EFF6FF', borderColor: '#BFDBFE' }}>
                  <strong style={{ color: '#1D4ED8' }}>Technician / Store Note:</strong> {booking.notes}
                </div>
              )}

              {/* ── Quick Actions ─────────────────────── */}
              <div className={styles.actions}>
                <a
                  href={`https://wa.me/91${waStoreNumber}?text=${waMessage}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.whatsappBtn}
                >
                  💬 Contact Store on WhatsApp
                </a>
                <Link href="/repair" className="btn btn--secondary">
                  Book Another Repair
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RepairStatusPage() {
  return (
    <Suspense
      fallback={
        <div className="container" style={{ padding: '80px 0', textAlign: 'center' }}>
          Loading repair status tracking...
        </div>
      }
    >
      <RepairStatusContent />
    </Suspense>
  );
}
