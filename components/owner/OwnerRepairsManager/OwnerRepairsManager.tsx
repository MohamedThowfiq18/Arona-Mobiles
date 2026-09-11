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
  pending: { label: 'Pending', color: '#D97706', bg: 'rgba(245, 158, 11, 0.12)' },
  booked: { label: 'Booked', color: '#2563EB', bg: 'rgba(37, 99, 235, 0.12)' },
  confirmed: { label: 'Confirmed', color: '#2563EB', bg: 'rgba(37, 99, 235, 0.12)' },
  in_progress: { label: 'In Progress', color: '#7C3AED', bg: 'rgba(124, 58, 237, 0.12)' },
  repaired: { label: 'Repaired', color: '#0891B2', bg: 'rgba(8, 145, 178, 0.12)' },
  completed: { label: 'Completed', color: '#059669', bg: 'rgba(5, 150, 105, 0.12)' },
  delivered: { label: 'Delivered', color: '#059669', bg: 'rgba(5, 150, 105, 0.12)' },
  cancelled: { label: 'Cancelled', color: '#DC2626', bg: 'rgba(220, 38, 38, 0.12)' },
};

export default function OwnerRepairsManager({ initialBookings }: Props) {
  const [bookings, setBookings] = useState<RepairBooking[]>(initialBookings || []);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // ── 1. Fetch Latest Bookings from Owner API ───────────────────────
  const fetchBookings = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsRefreshing(true);
    try {
      const res = await fetch('/api/owner/repairs', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data.bookings)) {
          setBookings(data.bookings);
        }
      }
    } catch (err) {
      console.warn('[OwnerRepairsManager] Fetch error:', err);
    } finally {
      if (!isSilent) setIsRefreshing(false);
    }
  }, []);

  // Update state if initialBookings prop changes
  useEffect(() => {
    if (initialBookings && initialBookings.length > 0) {
      setBookings(initialBookings);
    }
  }, [initialBookings]);

  // Client-side fetch on initial mount and when window gains focus
  useEffect(() => {
    fetchBookings(false);

    const onFocus = () => fetchBookings(true);
    window.addEventListener('focus', onFocus);

    // Smart 6-second polling fallback to guarantee real-time synchronization
    const pollInterval = setInterval(() => {
      fetchBookings(true);
    }, 6000);

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
            if (payload.eventType === 'INSERT') {
              const newRow = payload.new;
              const dev = newRow.device_info || {};
              const normalized: RepairBooking = {
                id: newRow.id,
                customer_name: newRow.customer_name || dev.customer_name || dev.name || 'Customer',
                customer_phone: newRow.customer_phone || dev.customer_phone || dev.phone || '',
                phone_brand: newRow.phone_brand || dev.brand || dev.phone_brand || '',
                phone_model: newRow.phone_model || dev.model || dev.phone_model || '',
                issue_description: newRow.issue_description || dev.issue || dev.issue_description || '',
                service_type: newRow.service_type || 'Repair Service',
                service_price: newRow.service_price ?? newRow.estimated_cost ?? null,
                preferred_date_time: newRow.preferred_date_time || newRow.scheduled_slot || null,
                status: (String(newRow.status || 'pending').toLowerCase().trim()) as RepairBooking['status'],
                notes: newRow.notes || newRow.technician_notes || '',
                created_at: newRow.created_at || new Date().toISOString(),
                updated_at: newRow.updated_at || newRow.created_at || new Date().toISOString(),
              };

              setBookings(prev => {
                if (prev.some(b => b.id === normalized.id)) return prev;
                return [normalized, ...prev];
              });

              showToast({
                type: 'info',
                title: 'New Repair Booking Received!',
                message: `${normalized.customer_name || 'A customer'} booked ${normalized.service_type}`,
              });
            } else if (payload.eventType === 'UPDATE') {
              const updatedRow = payload.new;
              const dev = updatedRow.device_info || {};
              const cleanStatus = (String(updatedRow.status || 'pending').toLowerCase().trim()) as RepairBooking['status'];

              setBookings(prev =>
                prev.map(b => {
                  if (b.id !== updatedRow.id) return b;
                  return {
                    ...b,
                    customer_name: updatedRow.customer_name || dev.customer_name || b.customer_name,
                    customer_phone: updatedRow.customer_phone || dev.customer_phone || b.customer_phone,
                    phone_brand: updatedRow.phone_brand || dev.brand || b.phone_brand,
                    phone_model: updatedRow.phone_model || dev.model || b.phone_model,
                    issue_description: updatedRow.issue_description || dev.issue || b.issue_description,
                    service_type: updatedRow.service_type || b.service_type,
                    service_price: updatedRow.service_price ?? updatedRow.estimated_cost ?? b.service_price,
                    preferred_date_time: updatedRow.preferred_date_time || updatedRow.scheduled_slot || b.preferred_date_time,
                    status: cleanStatus,
                    notes: updatedRow.notes || updatedRow.technician_notes || b.notes,
                    updated_at: updatedRow.updated_at || new Date().toISOString(),
                  };
                })
              );
            } else if (payload.eventType === 'DELETE') {
              const deletedId = payload.old?.id;
              if (deletedId) {
                setBookings(prev => prev.filter(b => b.id !== deletedId));
              }
            }
          }
        )
        .subscribe();
    } catch (err) {
      console.warn('[Realtime] Failed to subscribe to repair_bookings channel:', err);
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

  // ── 3. Update Status via Server API ──────────────────────────────
  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    const previous = bookings.find(b => b.id === id)?.status;

    // Optimistic UI update
    setBookings(prev =>
      prev.map(b => (b.id === id ? { ...b, status: newStatus as any } : b))
    );

    try {
      const res = await fetch(`/api/owner/repairs/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        // Rollback on failure
        if (previous) {
          setBookings(prev =>
            prev.map(b => (b.id === id ? { ...b, status: previous } : b))
          );
        }
        showToast({
          type: 'error',
          title: 'Status Update Failed',
          message: data.error || 'Could not update status.',
        });
      } else {
        showToast({
          type: 'success',
          title: 'Status Updated',
          message: `Booking status updated to ${newStatus.replace(/_/g, ' ')}.`,
        });
      }
    } catch (err) {
      if (previous) {
        setBookings(prev =>
          prev.map(b => (b.id === id ? { ...b, status: previous } : b))
        );
      }
      showToast({
        type: 'error',
        title: 'Network Error',
        message: 'Could not reach server to update status.',
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
          <span className={styles.liveDot} />
          Realtime Live
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
                      {statusConf.label}
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
