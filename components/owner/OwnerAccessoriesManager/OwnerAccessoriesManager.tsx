'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client';
import { showToast } from '@/components/customer/Toast/Toast';
import type { Accessory, AccessoryCategory } from '@/lib/types';
import styles from './OwnerAccessoriesManager.module.css';

interface Props {
  initialAccessories: Accessory[];
  categories: AccessoryCategory[];
}

function formatPrice(p: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);
}

export default function OwnerAccessoriesManager({ initialAccessories, categories }: Props) {
  const [accessories, setAccessories] = useState<Accessory[]>(initialAccessories);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const refreshAccessories = async () => {
    try {
      const res = await fetch('/api/owner/accessories', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.accessories)) {
          setAccessories(data.accessories);
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshAccessories();
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', refreshAccessories);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', refreshAccessories);
    };
  }, []);

  // Supabase Realtime subscription for live owner dashboard
  useEffect(() => {
    const supabase = getSupabaseClient();
    const channel = supabase
      .channel('owner-accessories-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'accessories' },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            const newA = payload.new as Accessory;
            setAccessories(prev => [newA, ...prev.filter(a => a.id !== newA.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedA = payload.new as Accessory;
            setAccessories(prev => prev.map(a => a.id === updatedA.id ? { ...a, ...updatedA } : a));
          } else if (payload.eventType === 'DELETE') {
            const oldA = payload.old as Partial<Accessory>;
            if (oldA.id) setAccessories(prev => prev.filter(a => a.id !== oldA.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Filter list
  const filtered = accessories.filter(a => {
    const q = search.toLowerCase();
    const matchSearch = !q || a.name.toLowerCase().includes(q) || a.brand.toLowerCase().includes(q) || (a.category && a.category.toLowerCase().includes(q));
    const matchCat = !filterCategory || a.category.toLowerCase() === filterCategory.toLowerCase();
    const matchStatus = filterStatus === '' ? true : filterStatus === 'active' ? a.is_active : !a.is_active;
    return matchSearch && matchCat && matchStatus;
  });

  const totalStock = accessories.reduce((acc, curr) => acc + (curr.stock || 0), 0);
  const lowStockCount = accessories.filter(a => a.stock > 0 && a.stock <= 5).length;
  const outOfStockCount = accessories.filter(a => a.stock === 0).length;

  const toggleActive = async (accessory: Accessory) => {
    setToggling(accessory.id);
    try {
      const nextState = !accessory.is_active;
      const res = await fetch(`/api/owner/accessories/${accessory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextState }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed to update status');
      setAccessories(prev => prev.map(a => a.id === accessory.id ? { ...a, is_active: nextState } : a));
      showToast({ type: 'success', title: `${accessory.name} ${nextState ? 'published' : 'unpublished'}` });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Could not update status', message: err?.message || 'Please try again.' });
    } finally {
      setToggling(null);
    }
  };

  const deleteAccessory = async (accessory: Accessory) => {
    if (!confirm(`Are you sure you want to delete this accessory?\n\n${accessory.name}`)) return;
    setDeleting(accessory.id);
    try {
      const res = await fetch(`/api/owner/accessories/${accessory.id}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete accessory from database');
      }
      setAccessories(prev => prev.filter(a => a.id !== accessory.id));
      showToast({ type: 'success', title: 'Accessory deleted successfully' });
    } catch (err: any) {
      console.error('Delete accessory error:', err);
      showToast({
        type: 'error',
        title: 'Could not delete accessory',
        message: err?.message || 'Failed to delete from Supabase.',
      });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      {/* Top Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>🔌 Accessories Management</h1>
          <p className={styles.subtitle}>Add, edit, manage stock, and publish mobile accessories</p>
        </div>
        <Link href="/owner-portal/accessories/add" className="btn btn--primary">
          ➕ Add New Accessory
        </Link>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Total Products</div>
          <div className={styles.statVal}>{accessories.length}</div>
          <div className={styles.statSub}>{totalStock} units in inventory</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Active & Published</div>
          <div className={styles.statVal} style={{ color: 'var(--color-success)' }}>
            {accessories.filter(a => a.is_active).length}
          </div>
          <div className={styles.statSub}>Visible on website</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Low Stock (≤5)</div>
          <div className={styles.statVal} style={{ color: 'var(--color-warning)' }}>
            {lowStockCount}
          </div>
          <div className={styles.statSub}>Need reordering soon</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statLabel}>Out of Stock</div>
          <div className={styles.statVal} style={{ color: 'var(--color-danger)' }}>
            {outOfStockCount}
          </div>
          <div className={styles.statSub}>0 units remaining</div>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className={styles.filters}>
        <input
          className={`form-input ${styles.searchInput}`}
          placeholder="Search by accessory name, brand, category..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select
          className="form-input form-select"
          value={filterCategory}
          onChange={e => setFilterCategory(e.target.value)}
        >
          <option value="">All Categories</option>
          {categories.map(c => (
            <option key={c.name} value={c.name}>{c.name}</option>
          ))}
        </select>
        <select
          className="form-input form-select"
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="active">Published</option>
          <option value="inactive">Unpublished</option>
        </select>
        <span className={styles.resultCount}>{filtered.length} accessories</span>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={`data-table ${styles.table}`}>
          <thead>
            <tr>
              <th>Accessory</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Offer</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', padding: 36, color: 'var(--color-text-muted)' }}>
                  No accessories found. Click &quot;Add New Accessory&quot; above to create one.
                </td>
              </tr>
            )}
            {filtered.map(a => (
              <tr key={a.id} className={!a.is_active ? styles.rowInactive : ''}>
                <td>
                  <div className={styles.productCell}>
                    <div className={styles.productImg}>
                      {(a.image_url || a.images?.[0]) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={a.image_url || a.images[0]} alt="" />
                      ) : (
                        <span>🔌</span>
                      )}
                    </div>
                    <div>
                      <div className={styles.productName}>{a.name}</div>
                      <div className={styles.productBrand}>
                        {a.brand} {a.model_sku && `• SKU: ${a.model_sku}`}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={styles.categoryBadge}>{a.category}</span>
                </td>
                <td>
                  <span className={a.stock === 0 ? styles.stockOut : a.stock <= 5 ? styles.stockLow : styles.stockOk}>
                    {a.stock === 0 ? 'Out of Stock' : `${a.stock} units`}
                  </span>
                </td>
                <td>
                  <div className={styles.priceCell}>
                    <span className={styles.priceMain}>{formatPrice(a.discount_price ?? a.price)}</span>
                    {a.original_price && a.original_price > a.price && (
                      <span className={styles.priceOld}>{formatPrice(a.original_price)}</span>
                    )}
                  </div>
                </td>
                <td>
                  {a.offer ? <span className={styles.offerTag}>🎉 {a.offer}</span> : <span className={styles.dash}>—</span>}
                </td>
                <td>
                  <button
                    className={`${styles.toggle} ${a.is_active ? styles.toggleActive : styles.toggleInactive}`}
                    onClick={() => toggleActive(a)}
                    disabled={toggling === a.id}
                    title={a.is_active ? 'Click to unpublish' : 'Click to publish'}
                    type="button"
                  >
                    {toggling === a.id ? '...' : a.is_active ? '● Published' : '○ Draft'}
                  </button>
                </td>
                <td>
                  <div className={styles.actions}>
                    <Link href={`/accessory/${a.id}`} target="_blank" className="btn btn--ghost btn--sm" title="View on site">
                      👁
                    </Link>
                    <Link href={`/owner-portal/accessories/${a.id}/edit`} className="btn btn--ghost btn--sm" title="Edit">
                      ✏️
                    </Link>
                    <button
                      className="btn btn--ghost btn--sm"
                      style={{ color: 'var(--color-danger)' }}
                      onClick={() => deleteAccessory(a)}
                      disabled={deleting === a.id}
                      title="Delete"
                      type="button"
                    >
                      {deleting === a.id ? '...' : '🗑'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
