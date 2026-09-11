'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client';
import { showToast } from '@/components/customer/Toast/Toast';
import { useStoreSettings } from '@/components/customer/StoreSettingsProvider/StoreSettingsProvider';
import type { RepairBooking } from '@/lib/types';
import styles from './page.module.css';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'PENDING', color: '#D97706', bg: 'rgba(245, 158, 11, 0.12)' },
  confirmed: { label: 'CONFIRMED', color: '#2563EB', bg: 'rgba(37, 99, 235, 0.12)' },
  in_progress: { label: 'IN PROGRESS', color: '#7C3AED', bg: 'rgba(124, 58, 237, 0.12)' },
  completed: { label: 'COMPLETED', color: '#059669', bg: 'rgba(5, 150, 105, 0.12)' },
  cancelled: { label: 'CANCELLED', color: '#DC2626', bg: 'rgba(220, 38, 38, 0.12)' },
  booked: { label: 'CONFIRMED', color: '#2563EB', bg: 'rgba(37, 99, 235, 0.12)' },
  repaired: { label: 'COMPLETED', color: '#059669', bg: 'rgba(5, 150, 105, 0.12)' },
  delivered: { label: 'COMPLETED', color: '#059669', bg: 'rgba(5, 150, 105, 0.12)' },
};

function RepairStatusContent() {
  const searchParams = useSearchParams();
  const { settings, whatsappNumber } = useStoreSettings();

  const [bookingId, setBookingId] = useState(searchParams.get('id') || searchParams.get('bookingId') || '');
  const [customerName, setCustomerName] = useState(searchParams.get('name') || searchParams.get('customerName') || '');
  const [phoneNumber, setPhoneNumber] = useState(searchParams.get('phone') || searchParams.get('mobile') || '');

  const [booking, setBooking] = useState<RepairBooking | null>(null);
  const [multipleBookings, setMultipleBookings] = useState<RepairBooking[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Auto-search if parameters are present in URL
  useEffect(() => {
    const queryId = searchParams.get('id') || searchParams.get('bookingId') || '';
    const queryName = searchParams.get('name') || searchParams.get('customerName') || '';
    const queryPhone = searchParams.get('phone') || searchParams.get('mobile') || '';

    if ((queryId || queryName) && queryPhone) {
      performLookup(queryId, queryName, queryPhone);
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
  const performLookup = async (idToSearch: string, nameToSearch: string, phoneToSearch: string) => {
    const cleanId = idToSearch.trim();
    const cleanName = nameToSearch.trim();
    const cleanPhone = phoneToSearch.replace(/\D/g, '').slice(-10);

    if (!cleanPhone || !/^[6-9]\d{9}$/.test(cleanPhone)) {
      showToast({ type: 'error', title: 'Please enter a valid 10-digit Indian mobile number.' });
      return;
    }

    if (!cleanId && !cleanName) {
      setErrorMsg('Enter your Booking ID or Customer Name.');
      showToast({ type: 'error', title: 'Enter your Booking ID or Customer Name.' });
      return;
    }

    setLoading(true);
    setErrorMsg('');
    setSearched(true);
    setBooking(null);
    setMultipleBookings(null);

    try {
      const params = new URLSearchParams();
      if (cleanId) params.append('id', cleanId);
      if (cleanName) params.append('name', cleanName);
      params.append('phone', cleanPhone);

      const res = await fetch(`/api/repairs/status?${params.toString()}`, {
        cache: 'no-store',
      });
      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        setErrorMsg(data.error || 'No repair booking found matching the provided details.');
      } else if (Array.isArray(data.bookings) && data.bookings.length > 1) {
        setMultipleBookings(data.bookings);
      } else if (data.booking || (Array.isArray(data.bookings) && data.bookings.length === 1)) {
        setBooking(data.booking || data.bookings[0]);
      } else {
        setErrorMsg('No repair booking found matching the provided details.');
      }
    } catch (err) {
      console.error('[Repair Status] Network error:', err);
      setErrorMsg('Could not connect to server. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    performLookup(bookingId, customerName, phoneNumber);
  };

  const handleCopyBookingId = (id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(id).then(() => {
        setCopiedId(id);
        showToast({ type: 'success', title: 'Booking ID copied!' });
        setTimeout(() => setCopiedId(null), 2500);
      }).catch(() => {
        showToast({ type: 'info', title: 'Booking ID', message: id });
      });
    }
  };

  const currentStatus = String(booking?.status || 'pending').toLowerCase().trim();
  const isCancelled = currentStatus === 'cancelled';
  const isCompleted = currentStatus === 'completed' || currentStatus === 'delivered' || currentStatus === 'repaired';
  const isInProgress = currentStatus === 'in_progress';
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
            Track the live progress of your device repair. Enter your Booking ID or your Name along with your registered mobile number.
          </p>
        </div>
      </div>

      <div className="container">
        <div className={styles.card}>
          <form onSubmit={handleFormSubmit} className={styles.form}>
            <div className={styles.helperNote}>
              💡 <strong>Forgot your Booking ID?</strong> Enter your name and mobile number to find your booking.
            </div>

            {/* Option A: Booking ID */}
            <div className="form-group">
              <label className="form-label" htmlFor="bookingIdInput">
                Booking ID (Optional)
              </label>
              <input
                id="bookingIdInput"
                className="form-input"
                placeholder="e.g. 5641f66f-5c15-430a-a588-..."
                value={bookingId}
                onChange={e => setBookingId(e.target.value)}
              />
            </div>

            {/* OR Divider */}
            <div className={styles.orDivider}>
              <span>OR</span>
            </div>

            {/* Option B: Customer Name */}
            <div className="form-group">
              <label className="form-label" htmlFor="customerNameInput">
                Customer Name (Optional)
              </label>
              <input
                id="customerNameInput"
                className="form-input"
                placeholder="Enter your name used during booking"
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
              />
            </div>

            {/* Registered Mobile Number (REQUIRED) */}
            <div className="form-group" style={{ marginTop: 8 }}>
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

          {/* ── Multiple Bookings Selection ───────────── */}
          {multipleBookings && multipleBookings.length > 1 && !booking && (
            <div className={styles.multipleContainer}>
              <div className={styles.multipleHeader}>
                <h2 className={styles.multipleTitle}>
                  Your Repair Bookings ({multipleBookings.length})
                </h2>
                <span style={{ fontSize: 13, color: 'var(--color-text-muted)' }}>
                  Select a booking to view full details
                </span>
              </div>

              <div className={styles.bookingsList}>
                {multipleBookings.map(b => {
                  const bStatus = String(b.status || 'pending').toLowerCase().trim();
                  const sConf = STATUS_CONFIG[bStatus] || { label: bStatus.toUpperCase(), color: '#6B7280', bg: '#F3F4F6' };
                  const appDate = b.preferred_date_time
                    ? new Date(b.preferred_date_time).toLocaleString('en-IN', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : 'Not specified';

                  const bookDate = new Date(b.created_at).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  });

                  return (
                    <div key={b.id} className={styles.bookingCardItem}>
                      <div className={styles.cardTopRow}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span className={styles.bookingIdBadge}>{b.id}</span>
                          <button
                            type="button"
                            className={styles.copyInlineBtn}
                            onClick={() => handleCopyBookingId(b.id)}
                            title="Copy Booking ID"
                          >
                            {copiedId === b.id ? '✓ Copied' : '📋 Copy ID'}
                          </button>
                        </div>
                        <span
                          className={styles.statusPill}
                          style={{ color: sConf.color, backgroundColor: sConf.bg }}
                        >
                          {sConf.label}
                        </span>
                      </div>

                      <div className={styles.cardGridSummary}>
                        <div>
                          <strong style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: 11 }}>SERVICE</strong>
                          <span>🔧 {b.service_type}</span>
                        </div>
                        <div>
                          <strong style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: 11 }}>DEVICE</strong>
                          <span>📱 {b.phone_brand} {b.phone_model}</span>
                        </div>
                        <div>
                          <strong style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: 11 }}>APPOINTMENT</strong>
                          <span>📅 {appDate}</span>
                        </div>
                        <div>
                          <strong style={{ display: 'block', color: 'var(--color-text-muted)', fontSize: 11 }}>BOOKED ON</strong>
                          <span>{bookDate}</span>
                        </div>
                      </div>

                      <div className={styles.cardFooterRow}>
                        <span style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
                          Customer: <strong>{b.customer_name}</strong>
                        </span>
                        <button
                          type="button"
                          className="btn btn--primary btn--sm"
                          onClick={() => setBooking(b)}
                        >
                          🔍 View Status →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Single Booking Result & Live Tracking ─── */}
          {booking && (
            <div className={styles.resultContainer}>
              {multipleBookings && multipleBookings.length > 1 && (
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => setBooking(null)}
                  style={{ alignSelf: 'flex-start', padding: 0, fontSize: 13 }}
                >
                  ← Back to All Bookings ({multipleBookings.length})
                </button>
              )}

              <div className={styles.statusHeader}>
                <div>
                  <span style={{ fontSize: 12, color: 'var(--color-text-muted)', display: 'block' }}>
                    Repair Booking ID
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginTop: 4 }}>
                    <span className={styles.bookingIdBadge}>{booking.id}</span>
                    <button
                      type="button"
                      className="btn btn--secondary btn--sm"
                      onClick={() => handleCopyBookingId(booking.id)}
                      style={{ padding: '4px 10px', fontSize: '12px' }}
                    >
                      {copiedId === booking.id ? '✓ Copied!' : '📋 Copy Booking ID'}
                    </button>
                  </div>
                  <span style={{ fontSize: 11, color: 'var(--color-text-muted)', display: 'block', marginTop: 4 }}>
                    💡 Save this Booking ID to track your repair.
                  </span>
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

