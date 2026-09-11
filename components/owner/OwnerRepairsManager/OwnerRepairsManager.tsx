'use client';

import { useState, useEffect, useCallback } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { showToast } from '@/components/customer/Toast/Toast';
import type { RepairBooking } from '@/lib/types';
import styles from './OwnerRepairsManager.module.css';

interface Props {
  initialBookings: RepairBooking[];
}

const STATUS_OPTIONS = [
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
];

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

function normalizeBooking(b: any): RepairBooking {
  const dev = b.device_info || {};
  let statusRaw = String(b.status || 'pending').toLowerCase().trim();
  if (statusRaw === 'booked') statusRaw = 'confirmed';
  if (statusRaw === 'repaired' || statusRaw === 'delivered') statusRaw = 'completed';

  return {
    id: b.id,
    customer_name: b.customer_name || dev.customer_name || dev.name || 'Customer',
    customer_phone: b.customer_phone || dev.customer_phone || dev.phone || '',
    phone_brand: b.phone_brand || dev.brand || dev.phone_brand || '',
    phone_model: b.phone_model || dev.model || dev.phone_model || '',
    issue_description: b.issue_description || dev.issue || dev.issue_description || '',
    service_type: b.service_type || 'Repair Service',
    service_price: b.service_price ?? b.estimated_cost ?? null,
    preferred_date_time: b.preferred_date_time || b.scheduled_slot || null,
    status: statusRaw as RepairBooking['status'],
    notes: b.notes || b.technician_notes || '',
    created_at: b.created_at || new Date().toISOString(),
    updated_at: b.updated_at || b.created_at || new Date().toISOString(),
  };
}

export default function OwnerRepairsManager({ initialBookings }: Props) {
  const [bookings, setBookings] = useState<RepairBooking[]>(initialBookings || []);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isRealtimeLive, setIsRealtimeLive] = useState(false);

  // ── 1. Fetch Latest Bookings from Owner API (no-store) ─────────────
  const fetchBookings = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      const res = await fetch('/api/owner/repairs', {
        cache: 'no-store',
        headers: { 'Cache-Control': 'no-cache' },
      });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.bookings)) {
          setBookings(data.bookings.map(normalizeBooking));
        }
      }
    } catch (err) {
      console.warn('[OwnerRepairsManager] Fetch error:', err);
    } finally {
      if (!isSilent) setIsRefreshing(false);
    }
  }, []);

  // Update state when initialBookings prop is provided on SSR
  useEffect(() => {
    if (initialBookings && initialBookings.length > 0) {
      setBookings(initialBookings.map(normalizeBooking));
    }
  }, [initialBookings]);

  // Client-side fetch on initial mount, focus, and fast fallback polling
  useEffect(() => {
    fetchBookings(false);

    const onFocus = () => fetchBookings(true);
    window.addEventListener('focus', onFocus);

    // 4-second polling fallback to guarantee fresh data across devices
    const pollInterval = setInterval(() => {
      fetchBookings(true);
    }, 4000);

    return () => {
      window.removeEventListener('focus', onFocus);
      clearInterval(pollInterval);
    };
  }, [fetchBookings]);

  // ── 2. Setup Supabase Realtime Subscription ──────────────────────
  useEffect(() => {
    let channel: any = null;
    try {
      const supabase = getSupabaseClient();
      channel = supabase
        .channel('realtime:owner_repair_bookings')
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'repair_bookings' },
          (payload: any) => {
            console.info('[Realtime] repair_bookings event:', payload.eventType, payload);

            if (payload.eventType === 'INSERT') {
              const normalized = normalizeBooking(payload.new);

              setBookings(prev => {
                // Prevent duplicates
                if (prev.some(b => b.id === normalized.id)) return prev;
                return [normalized, ...prev];
              });

              showToast({
                type: 'info',
                title: 'New Repair Booking Received!',
                message: `${normalized.customer_name || 'A customer'} booked ${normalized.service_type}`,
              });
            } else if (payload.eventType === 'UPDATE') {
              const normalized = normalizeBooking(payload.new);

              setBookings(prev =>
                prev.map(b => (b.id === normalized.id ? { ...b, ...normalized } : b))
              );
            } else if (payload.eventType === 'DELETE') {
              const deletedId = payload.old?.id;
              if (deletedId) {
                setBookings(prev => prev.filter(b => b.id !== deletedId));
              }
            }
          }
        )
        .subscribe((status: string) => {
          if (status === 'SUBSCRIBED') {
            setIsRealtimeLive(true);
          } else {
            setIsRealtimeLive(false);
          }
        });
    } catch (err) {
      console.warn('[Realtime] Failed to subscribe to repair_bookings channel:', err);
      setIsRealtimeLive(false);
    }

    return () => {
      if (channel) {
        try {
          const supabase = getSupabaseClient();
          supabase.removeChannel(channel);
        } catch {}
      }
    };
  }, []);

  // ── 3. Update Status via Server API (Server Confirmed) ───────────
  const handleStatusChange = async (id: string, newStatus: string) => {
    if (updatingId === id) return;
    setUpdatingId(id);

    try {
      const res = await fetch(`/api/owner/repairs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        showToast({
          type: 'error',
          title: 'Status Update Failed',
          message: data.error || 'Could not update status in Supabase.',
        });
        return;
      }

      // Update state only after server confirms the database update
      const updatedBooking = data.booking;
      const confirmedStatus = (updatedBooking?.status || newStatus) as RepairBooking['status'];
      const confirmedUpdatedAt = updatedBooking?.updated_at || new Date().toISOString();

      setBookings(prev =>
        prev.map(b =>
          b.id === id
            ? {
                ...b,
                status: confirmedStatus,
                updated_at: confirmedUpdatedAt,
              }
            : b
        )
      );

      const formattedLabel = confirmedStatus.replace(/_/g, ' ').toUpperCase();
      showToast({
        type: 'success',
        title: 'Status Updated',
        message: `Booking status updated to ${formattedLabel}.`,
      });
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Network Error',
        message: 'Could not reach server to update status. Please try again.',
      });
    } finally {
      setUpdatingId(null);
    }
  };

  // ── 4. Filter Bookings ──────────────────────────────────────────
  const filtered = bookings.filter(b => {
    const itemStatus = String(b.status || 'pending').toLowerCase().trim();
    const matchStatus = !statusFilter || itemStatus === statusFilter.toLowerCase().trim();
    if (!matchStatus) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase().trim();
    const str = [
      b.id,
      b.customer_name,
      b.customer_phone,
      b.phone_brand,
      b.phone_model,
      b.service_type,
      b.issue_description,
      b.notes,
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase();

    return str.includes(q);
  });

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <h1 className={styles.title}>🔧 Repair Bookings</h1>
          <span className={styles.countBadge}>{filtered.length} Bookings</span>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => fetchBookings(false)}
            disabled={isRefreshing}
            style={{ fontSize: 12, padding: '4px 10px', height: 'auto' }}
          >
            {isRefreshing ? 'Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
        <div className={styles.liveIndicator}>
          <span className={isRealtimeLive ? styles.liveDot : styles.syncDot} />
          {isRealtimeLive ? 'Realtime Live' : 'Live Syncing'}
        </div>
      </div>

      <div className={styles.controls}>
        <input
          className={`form-input ${styles.search}`}
          placeholder="Search by customer, phone, device, service, ID..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className={`form-input form-select ${styles.filterSelect}`}
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses ({bookings.length})</option>
          {STATUS_OPTIONS.map(s => {
            const count = bookings.filter(b => String(b.status || 'pending').toLowerCase().trim() === s).length;
            return (
              <option key={s} value={s}>
                {s.replace(/_/g, ' ').toUpperCase()} ({count})
              </option>
            );
          })}
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)', marginBottom: 4 }}>
            No repair bookings found.
          </p>
          <p>When customers book repair appointments at <code>/repair</code>, they will appear here automatically in real time.</p>
        </div>
      ) : (
        <div className={styles.list}>
          {filtered.map(item => {
            const itemStatus = String(item.status || 'pending').toLowerCase().trim();
            const statusConf = STATUS_CONFIG[itemStatus] || {
              label: itemStatus.replace(/_/g, ' '),
              color: '#6B7280',
              bg: '#F3F4F6',
            };

            const appointmentDate = item.preferred_date_time
              ? new Date(item.preferred_date_time).toLocaleString('en-IN', {
                  weekday: 'short',
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Not specified';

            const createdDate = new Date(item.created_at).toLocaleDateString('en-IN', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            const cleanPhone = (item.customer_phone || '').replace(/\D/g, '').slice(-10);
            const waMessage = encodeURIComponent(
              `Hi ${item.customer_name || 'Customer'}, this is ARONA MOBILES regarding your ${item.service_type} appointment for ${item.phone_brand || ''} ${item.phone_model || ''} (Booking ID: ${item.id.slice(0, 8)}).`
            );

            return (
              <div key={item.id} className={styles.card}>
                <div className={styles.cardHeader}>
                  <div className={styles.serviceTitle}>
                    <span>🔧 {item.service_type}</span>
                    {item.service_price && (
                      <span className={styles.priceTag}>₹{item.service_price.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                  <div className={styles.headerRight}>
                    <span
                      className={styles.statusBadge}
                      style={{ color: statusConf.color, backgroundColor: statusConf.bg }}
                    >
                      {updatingId === item.id ? 'UPDATING...' : statusConf.label}
                    </span>
                    <select
                      className={`form-input form-select ${styles.statusSelect}`}
                      value={itemStatus}
                      onChange={e => handleStatusChange(item.id, e.target.value)}
                      disabled={updatingId === item.id}
                    >
                      {STATUS_OPTIONS.map(s => (
                        <option key={s} value={s}>
                          {s.replace(/_/g, ' ').toUpperCase()}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className={styles.gridDetails}>
                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Customer</span>
                    <span className={styles.detailValue}>{item.customer_name || '—'}</span>
                    {cleanPhone && (
                      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)', marginTop: 2 }}>
                        +91 {cleanPhone}
                      </span>
                    )}
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Device</span>
                    <span className={styles.detailValue}>
                      {item.phone_brand} {item.phone_model}
                    </span>
                  </div>

                  <div className={styles.detailItem}>
                    <span className={styles.detailLabel}>Appointment Slot</span>
                    <span className={styles.detailValue} style={{ color: '#2563EB' }}>
                      📅 {appointmentDate}
                    </span>
                  </div>
                </div>

                {item.issue_description && (
                  <div className={styles.issueBox}>
                    <strong>Issue Description:</strong> {item.issue_description}
                  </div>
                )}

                <div className={styles.cardFooter}>
                  <div className={styles.metaInfo}>
                    <span>ID: <span className={styles.idCode}>{item.id}</span></span>
                    <span>•</span>
                    <span>Booked on: {createdDate}</span>
                  </div>

                  {cleanPhone && (
                    <div className={styles.actions}>
                      <a
                        href={`https://wa.me/91${cleanPhone}?text=${waMessage}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`${styles.contactBtn} ${styles.whatsappBtn}`}
                        title="Chat on WhatsApp"
                      >
                        💬 WhatsApp
                      </a>
                      <a
                        href={`tel:+91${cleanPhone}`}
                        className={`${styles.contactBtn} ${styles.callBtn}`}
                        title="Call Customer"
                      >
                        📞 Call
                      </a>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
