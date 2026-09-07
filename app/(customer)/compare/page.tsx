'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Product } from '@/lib/types';
import styles from './page.module.css';

const COMPARE_KEY = 'arona_compare';
const MAX_COMPARE = 3;

const SPEC_KEYS = [
  { key: 'display',    label: 'Display' },
  { key: 'processor', label: 'Processor' },
  { key: 'ram',       label: 'RAM' },
  { key: 'storage_built', label: 'Storage' },
  { key: 'battery',   label: 'Battery' },
  { key: 'charging',  label: 'Charging' },
  { key: 'camera',    label: 'Main Camera' },
  { key: 'os',        label: 'Operating System' },
  { key: '5g',        label: '5G' },
];

function formatPrice(p: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);
}

export default function ComparePage() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      setProducts(JSON.parse(localStorage.getItem(COMPARE_KEY) || '[]'));
    } catch { setProducts([]); }
  }, []);

  const remove = (id: string) => {
    const updated = products.filter(p => p.id !== id);
    setProducts(updated);
    localStorage.setItem(COMPARE_KEY, JSON.stringify(updated));
  };

  const bestPrice = products.length > 1 ? Math.min(...products.map(p => p.discount_price ?? p.price)) : null;

  return (
    <div className="container">
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Compare Phones</h1>
          <span className={styles.subtitle}>Add up to {MAX_COMPARE} phones to compare side-by-side.</span>
        </div>

        {products.length === 0 ? (
          <div className={styles.empty}>
            <span className={styles.emptyIcon}>⚖️</span>
            <h2>No phones added to compare</h2>
            <p>Browse phones and click the compare button to add them here.</p>
            <Link href="/shop" className="btn btn--primary btn--lg">Browse Phones</Link>
          </div>
        ) : (
          <div className={styles.table}>
            {/* Header row with product cards */}
            <div className={styles.tableRow}>
              <div className={styles.labelCell}>
                <span className={styles.labelCellText}>Product</span>
              </div>
              {products.map(p => {
                const price = p.discount_price ?? p.price;
                const isBest = bestPrice !== null && price === bestPrice && products.length > 1;
                return (
                  <div key={p.id} className={styles.productHeader}>
                    {isBest && <div className={styles.bestBadge}>Best Price</div>}
                    <div className={styles.productImg}>
                      {p.images?.[0]
                        // eslint-disable-next-line @next/next/no-img-element
                        ? <img src={p.images[0]} alt={p.model} />
                        : <span>📱</span>}
                    </div>
                    <div className={styles.productBrand}>{p.brand}</div>
                    <div className={styles.productModel}>{p.model}</div>
                    <div className={styles.productPrice}>{formatPrice(price)}</div>
                    {p.discount_price && p.discount_price < p.price && (
                      <div className={styles.productOld}>{formatPrice(p.price)}</div>
                    )}
                    <div className={styles.productActions}>
                      <Link href={`/product/${p.id}`} className="btn btn--primary btn--sm">View</Link>
                      <button className="btn btn--ghost btn--sm" onClick={() => remove(p.id)}>Remove</button>
                    </div>
                  </div>
                );
              })}
              {products.length < MAX_COMPARE && (
                <div className={styles.addSlot}>
                  <Link href="/shop" className={styles.addBtn}>
                    <span>+</span>
                    <span>Add Phone</span>
                  </Link>
                </div>
              )}
            </div>

            {/* Spec rows */}
            {SPEC_KEYS.map(spec => (
              <div key={spec.key} className={`${styles.tableRow} ${styles.specRow}`}>
                <div className={styles.labelCell}>{spec.label}</div>
                {products.map(p => {
                  const val = p.specs?.[spec.key];
                  return (
                    <div key={p.id} className={styles.specCell}>
                      {val === true ? '✅ Yes'
                        : val === false ? '❌ No'
                        : val ? String(val)
                        : '—'}
                    </div>
                  );
                })}
                {products.length < MAX_COMPARE && <div className={styles.specCell} />}
              </div>
            ))}

            {/* Rating row */}
            <div className={`${styles.tableRow} ${styles.specRow}`}>
              <div className={styles.labelCell}>Rating</div>
              {products.map(p => (
                <div key={p.id} className={styles.specCell}>
                  {p.review_count > 0
                    ? `★ ${p.average_rating.toFixed(1)} (${p.review_count})`
                    : 'No reviews'}
                </div>
              ))}
              {products.length < MAX_COMPARE && <div className={styles.specCell} />}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
