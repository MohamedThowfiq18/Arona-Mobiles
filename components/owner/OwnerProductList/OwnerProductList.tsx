'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getSupabaseClient } from '@/lib/supabase/client';
import { showToast } from '@/components/customer/Toast/Toast';
import type { Product } from '@/lib/types';
import styles from './OwnerProductList.module.css';

interface Props { initialProducts: Product[] }

function formatPrice(p: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);
}

export default function OwnerProductList({ initialProducts }: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [search, setSearch] = useState('');
  const [filterCondition, setFilterCondition] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [toggling, setToggling] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);

  const refreshProducts = async () => {
    try {
      const res = await fetch('/api/owner/products', { cache: 'no-store' });
      if (res.ok) {
        const data = await res.json();
        if (data.success && Array.isArray(data.products)) {
          setProducts(data.products);
        }
      }
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refreshProducts();
      }
    };
    window.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', refreshProducts);

    return () => {
      window.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', refreshProducts);
    };
  }, []);

  // Realtime subscription for live dashboard updates
  useEffect(() => {
    const supabase = getSupabaseClient();
    const channel = supabase
      .channel('owner-products-live')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'products' },
        (payload: any) => {
          if (payload.eventType === 'INSERT') {
            const newP = payload.new as Product;
            setProducts(prev => [newP, ...prev.filter(p => p.id !== newP.id)]);
          } else if (payload.eventType === 'UPDATE') {
            const updatedP = payload.new as Product;
            setProducts(prev => prev.map(p => p.id === updatedP.id ? { ...p, ...updatedP } : p));
          } else if (payload.eventType === 'DELETE') {
            const oldP = payload.old as Partial<Product>;
            if (oldP.id) setProducts(prev => prev.filter(p => p.id !== oldP.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const filtered = products.filter(p => {
    const q = search.toLowerCase();
    const matchSearch = !q || p.brand.toLowerCase().includes(q) || p.model.toLowerCase().includes(q);
    const matchCond = !filterCondition || p.condition === filterCondition;
    const matchStatus = filterStatus === '' ? true : filterStatus === 'active' ? p.is_active : !p.is_active;
    return matchSearch && matchCond && matchStatus;
  });

  const toggleActive = async (product: Product) => {
    setToggling(product.id);
    try {
      const nextState = !product.is_active;
      const res = await fetch(`/api/owner/products/${product.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: nextState }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Failed to update product status');
      setProducts(prev => prev.map(p => p.id === product.id ? { ...p, is_active: nextState } : p));
      showToast({ type: 'success', title: `${product.model} ${nextState ? 'activated' : 'deactivated'}` });
    } catch (err: any) {
      showToast({ type: 'error', title: 'Could not update status', message: err?.message || 'Database update failed.' });
    } finally {
      setToggling(null);
    }
  };

  const deleteProduct = async (product: Product) => {
    if (!confirm(`Are you sure you want to delete this product?\n\n${product.brand} ${product.model}`)) return;
    setDeleting(product.id);
    try {
      const res = await fetch(`/api/owner/products/${product.id}`, {
        method: 'DELETE',
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(data.error || 'Failed to delete product from database');
      }
      setProducts(prev => prev.filter(p => p.id !== product.id));
      showToast({ type: 'success', title: 'Product deleted successfully' });
    } catch (err: any) {
      console.error('Delete product error:', err);
      showToast({
        type: 'error',
        title: 'Could not delete product',
        message: err?.message || 'Failed to delete from Supabase.',
      });
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      {/* Filters */}
      <div className={styles.filters}>
        <input
          className={`form-input ${styles.searchInput}`}
          placeholder="Search by brand or model..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          id="product-search"
        />
        <select className="form-input form-select" value={filterCondition} onChange={e => setFilterCondition(e.target.value)}>
          <option value="">All Conditions</option>
          <option value="new">New</option>
          <option value="pre-owned">Pre-Owned</option>
        </select>
        <select className="form-input form-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Status</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
        </select>
        <span className={styles.resultCount}>{filtered.length} products</span>
      </div>

      {/* Table */}
      <div className={styles.tableWrap}>
        <table className={`data-table ${styles.table}`}>
          <thead>
            <tr>
              <th>Product</th>
              <th>Condition</th>
              <th>Stock</th>
              <th>Price</th>
              <th>Sales</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: 'center', padding: 32, color: 'var(--color-text-muted)' }}>No products found.</td></tr>
            )}
            {filtered.map(p => (
              <tr key={p.id} className={!p.is_active ? styles.rowInactive : ''}>
                <td>
                  <div className={styles.productCell}>
                    <div className={styles.productImg}>
                      {p.images?.[0] ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={p.images[0]} alt="" />
                      ) : <span>📱</span>}
                    </div>
                    <div>
                      <div className={styles.productName}>{p.brand} {p.model}</div>
                      <div className={styles.productId}>{p.id.slice(0, 8)}...</div>
                    </div>
                  </div>
                </td>
                <td>
                  <span className={`badge ${p.condition === 'new' ? 'badge--new' : 'badge--preowned'}`}>
                    {p.condition === 'new' ? 'New' : `Pre-Owned${p.grade ? ` · ${p.grade}` : ''}`}
                  </span>
                </td>
                <td>
                  <span className={p.stock === 0 ? styles.stockOut : p.stock <= 5 ? styles.stockLow : styles.stockOk}>
                    {p.stock === 0 ? 'Out of Stock' : `${p.stock} units`}
                  </span>
                </td>
                <td>
                  <div className={styles.priceCell}>
                    <span>{formatPrice(p.discount_price ?? p.price)}</span>
                    {p.discount_price && p.discount_price < p.price && (
                      <span className={styles.priceOld}>{formatPrice(p.price)}</span>
                    )}
                  </div>
                </td>
                <td className={styles.salesCell}>{p.sold_count}</td>
                <td>
                  <button
                    className={`${styles.toggle} ${p.is_active ? styles.toggleActive : styles.toggleInactive}`}
                    onClick={() => toggleActive(p)}
                    disabled={toggling === p.id}
                    title={p.is_active ? 'Click to deactivate' : 'Click to activate'}
                  >
                    {toggling === p.id ? '...' : p.is_active ? '● Active' : '○ Inactive'}
                  </button>
                </td>
                <td>
                  <div className={styles.actions}>
                    <Link href={`/product/${p.id}`} target="_blank" className="btn btn--ghost btn--sm" title="View on site">👁</Link>
                    <Link href={`/owner-portal/products/${p.id}/edit`} className="btn btn--ghost btn--sm" title="Edit">✏️</Link>
                    <button
                      className="btn btn--ghost btn--sm"
                      style={{ color: 'var(--color-danger)' }}
                      onClick={() => deleteProduct(p)}
                      disabled={deleting === p.id}
                      title="Delete"
                    >
                      {deleting === p.id ? '...' : '🗑'}
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
