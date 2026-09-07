'use client';

import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { showToast } from '@/components/customer/Toast/Toast';
import { v4 as uuidv4 } from 'uuid';
import styles from './OwnerCouponsClient.module.css';

interface Coupon {
  id: string; code: string; description?: string;
  discount_type: 'flat' | 'percent'; discount_value: number; max_discount?: number;
  min_order_value?: number; usage_limit?: number; used_count: number;
  is_active: boolean; expires_at?: string; created_at: string;
}

const emptyForm = (): Omit<Coupon, 'id' | 'used_count' | 'created_at'> => ({
  code: '', description: '', discount_type: 'flat', discount_value: 0,
  max_discount: undefined, min_order_value: undefined, usage_limit: undefined,
  is_active: true, expires_at: '',
});

export default function OwnerCouponsClient({ coupons: init }: { coupons: Coupon[] }) {
  const [coupons, setCoupons] = useState(init);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm());
  const [saving, setSaving] = useState(false);

  const toggle = (id: string, current: boolean) => {
    const supabase = getSupabaseClient();
    supabase.from('coupons').update({ is_active: !current }).eq('id', id);
    setCoupons(prev => prev.map(c => c.id === id ? { ...c, is_active: !current } : c));
    showToast({ type: 'success', title: `Coupon ${!current ? 'activated' : 'deactivated'}` });
  };

  const deleteCoupon = async (id: string, code: string) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    const supabase = getSupabaseClient();
    await supabase.from('coupons').delete().eq('id', id);
    setCoupons(prev => prev.filter(c => c.id !== id));
    showToast({ type: 'success', title: 'Coupon deleted' });
  };

  const save = async () => {
    if (!form.code || !form.discount_value) {
      showToast({ type: 'error', title: 'Code and discount value are required' });
      return;
    }
    setSaving(true);
    try {
      const supabase = getSupabaseClient();
      const payload = {
        ...form,
        code: form.code.toUpperCase().trim(),
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
        max_discount: form.max_discount || null,
        min_order_value: form.min_order_value || null,
        usage_limit: form.usage_limit || null,
      };
      const { data, error } = await supabase.from('coupons').insert({ id: uuidv4(), used_count: 0, ...payload }).select().single();
      if (error) throw error;
      setCoupons(prev => [data as Coupon, ...prev]);
      setShowForm(false);
      setForm(emptyForm());
      showToast({ type: 'success', title: `Coupon "${payload.code}" created!` });
    } catch (e: unknown) {
      showToast({ type: 'error', title: 'Save failed', message: e instanceof Error ? e.message : '' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className={styles.header}>
        <h1 className={styles.title}>🎟️ Coupons</h1>
        <button className="btn btn--primary" id="add-coupon-btn" onClick={() => setShowForm(s => !s)}>
          {showForm ? 'Cancel' : '+ Create Coupon'}
        </button>
      </div>

      {/* Create form */}
      {showForm && (
        <div className={styles.formCard}>
          <h2 className={styles.formTitle}>New Coupon</h2>
          <div className={styles.formGrid}>
            <div className="form-group">
              <label className="form-label">Coupon Code *</label>
              <input className="form-input" value={form.code} placeholder="e.g. ARONA200"
                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Discount Type *</label>
              <select className="form-input form-select" value={form.discount_type}
                onChange={e => setForm(f => ({ ...f, discount_type: e.target.value as 'flat' | 'percent' }))}>
                <option value="flat">Flat (₹)</option>
                <option value="percent">Percentage (%)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Discount Value *</label>
              <input className="form-input" type="number" min="1" value={form.discount_value || ''}
                onChange={e => setForm(f => ({ ...f, discount_value: Number(e.target.value) }))}
                placeholder={form.discount_type === 'flat' ? '₹200' : '10%'} />
            </div>
            {form.discount_type === 'percent' && (
              <div className="form-group">
                <label className="form-label">Max Discount (₹)</label>
                <input className="form-input" type="number" min="0" value={form.max_discount || ''}
                  onChange={e => setForm(f => ({ ...f, max_discount: Number(e.target.value) || undefined }))} />
              </div>
            )}
            <div className="form-group">
              <label className="form-label">Min Order Value (₹)</label>
              <input className="form-input" type="number" min="0" value={form.min_order_value || ''}
                onChange={e => setForm(f => ({ ...f, min_order_value: Number(e.target.value) || undefined }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Usage Limit</label>
              <input className="form-input" type="number" min="1" value={form.usage_limit || ''}
                onChange={e => setForm(f => ({ ...f, usage_limit: Number(e.target.value) || undefined }))}
                placeholder="Leave blank for unlimited" />
            </div>
            <div className="form-group">
              <label className="form-label">Expires At</label>
              <input className="form-input" type="datetime-local" value={form.expires_at}
                onChange={e => setForm(f => ({ ...f, expires_at: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <input className="form-input" value={form.description} placeholder="Internal note"
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </div>
          </div>
          <div className={styles.formActions}>
            <button className="btn btn--ghost" onClick={() => setShowForm(false)}>Cancel</button>
            <button className="btn btn--primary" onClick={save} disabled={saving} id="save-coupon-btn">
              {saving ? 'Creating...' : 'Create Coupon'}
            </button>
          </div>
        </div>
      )}

      {/* Coupon table */}
      <div className={styles.tableWrap}>
        <table className={`data-table ${styles.table}`}>
          <thead>
            <tr>
              <th>Code</th>
              <th>Discount</th>
              <th>Min Order</th>
              <th>Usage</th>
              <th>Expires</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {coupons.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--color-text-muted)' }}>No coupons yet. Create one above!</td></tr>
            )}
            {coupons.map(c => (
              <tr key={c.id}>
                <td>
                  <code className={styles.couponCode}>{c.code}</code>
                  {c.description && <div className={styles.couponDesc}>{c.description}</div>}
                </td>
                <td>
                  {c.discount_type === 'flat'
                    ? `₹${c.discount_value}`
                    : `${c.discount_value}%${c.max_discount ? ` (max ₹${c.max_discount})` : ''}`}
                </td>
                <td>{c.min_order_value ? `₹${c.min_order_value.toLocaleString('en-IN')}` : '—'}</td>
                <td>{c.used_count}{c.usage_limit ? ` / ${c.usage_limit}` : ''}</td>
                <td className={styles.expires}>
                  {c.expires_at
                    ? new Date(c.expires_at) < new Date()
                      ? <span className={styles.expired}>Expired</span>
                      : new Date(c.expires_at).toLocaleDateString('en-IN')
                    : '—'}
                </td>
                <td>
                  <button
                    className={`${styles.statusToggle} ${c.is_active ? styles.active : styles.inactive}`}
                    onClick={() => toggle(c.id, c.is_active)}
                  >
                    {c.is_active ? '● Active' : '○ Inactive'}
                  </button>
                </td>
                <td>
                  <button className="btn btn--ghost btn--sm" style={{ color: 'var(--color-danger)' }}
                    onClick={() => deleteCoupon(c.id, c.code)}>🗑</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
