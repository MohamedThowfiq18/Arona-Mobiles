'use client';

import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { showToast } from '@/components/customer/Toast/Toast';
import styles from './OwnerQueuePage.module.css';

interface Props {
  title: string;
  icon: string;
  items: Record<string, any>[];
  table: string;
  statusOptions: string[];
  renderSummary?: (item: Record<string, any>) => React.ReactNode;
}

export default function OwnerQueuePage({ title, icon, items: initialItems, table, statusOptions, renderSummary }: Props) {
  const [items, setItems] = useState(initialItems);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const filtered = items.filter(item => {
    const matchStatus = !statusFilter || item.status === statusFilter;
    const q = search.toLowerCase();
    const str = JSON.stringify(item).toLowerCase();
    return matchStatus && (!q || str.includes(q));
  });

  const updateStatus = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    const supabase = getSupabaseClient();
    const { error } = await supabase.from(table).update({ status: newStatus }).eq('id', id);
    if (error) {
      showToast({ type: 'error', title: 'Update failed' });
    } else {
      setItems(prev => prev.map(i => i.id === id ? { ...i, status: newStatus } : i));
      showToast({ type: 'success', title: `Status updated to ${newStatus}` });
    }
    setUpdatingId(null);
  };

  const STATUS_COLORS: Record<string, string> = {
    submitted: '#3B82F6', inspecting: '#8B5CF6', valued: '#F59E0B', completed: '#16A34A', rejected: '#DC2626',
    booked: '#3B82F6', in_progress: '#F59E0B', repaired: '#06B6D4', delivered: '#16A34A', cancelled: '#DC2626',
    published: '#16A34A', pending: '#F59E0B', rejected_review: '#DC2626',
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>{icon} {title}</h1>
        <span className={styles.count}>{filtered.length} items</span>
      </div>

      <div className={styles.filters}>
        <input className={`form-input ${styles.search}`} placeholder="Search..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <select className="form-input form-select" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          {statusOptions.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
        </select>
      </div>

      {filtered.length === 0 && (
        <div className={styles.empty}>No {title.toLowerCase()} found.</div>
      )}

      <div className={styles.list}>
        {filtered.map(item => (
          <div key={String(item.id)} className={styles.card}>
            <div className={styles.cardLeft}>
              <div className={styles.summary}>
                {renderSummary ? (
                  renderSummary(item)
                ) : table === 'trade_in_requests' ? (
                  <>
                    <div><strong>{item.device_info?.brand} {item.device_info?.model}</strong> · {item.device_info?.storage}</div>
                    <div>Est. value: <strong>₹{item.estimated_value?.toLocaleString('en-IN') || '—'}</strong></div>
                  </>
                ) : table === 'repair_bookings' ? (
                  <>
                    <div><strong>{String(item.service_type || '')}</strong></div>
                    <div>{item.device_info?.brand} {item.device_info?.model}</div>
                    {item.scheduled_slot && <div>Slot: {new Date(item.scheduled_slot).toLocaleString('en-IN')}</div>}
                  </>
                ) : (
                  <div>{JSON.stringify(item)}</div>
                )}
              </div>
              <div className={styles.meta}>
                Submitted: {new Date(String(item.created_at)).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                {item.scheduled_slot && ` · Slot: ${new Date(String(item.scheduled_slot)).toLocaleString('en-IN')}`}
              </div>
            </div>
            <div className={styles.cardRight}>
              <span className={styles.statusBadge}
                style={{
                  background: (STATUS_COLORS[String(item.status)] || '#6B7280') + '20',
                  color: STATUS_COLORS[String(item.status)] || '#6B7280',
                }}>
                {String(item.status).replace(/_/g, ' ')}
              </span>
              <select
                className={`form-input form-select ${styles.statusSelect}`}
                value={String(item.status)}
                onChange={e => updateStatus(String(item.id), e.target.value)}
                disabled={updatingId === String(item.id)}
              >
                {statusOptions.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
