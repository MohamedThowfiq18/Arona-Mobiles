'use client';

import { useState, useEffect } from 'react';
import ProductCard from '@/components/customer/ProductCard/ProductCard';
import type { Product } from '@/lib/types';
import styles from './FlashSaleBanner.module.css';

interface Props { products: Product[]; }

function useCountdown(endTime: Date) {
  const [time, setTime] = useState({ h: 0, m: 0, s: 0 });

  useEffect(() => {
    const tick = () => {
      const diff = Math.max(0, endTime.getTime() - Date.now());
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTime({ h, m, s });
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endTime]);

  return time;
}

export default function FlashSaleBanner({ products }: Props) {
  // End at midnight today
  const endTime = new Date();
  endTime.setHours(23, 59, 59, 0);
  const { h, m, s } = useCountdown(endTime);

  if (products.length === 0) return null;

  const pad = (n: number) => String(n).padStart(2, '0');

  return (
    <section className={styles.section}>
      <div className="container">
        <div className={styles.header}>
          <div className={styles.titleGroup}>
            <span className={styles.flashIcon}>⚡</span>
            <h2 className={styles.title}>Flash Sale</h2>
            <span className={styles.subtitle}>Deals end today</span>
          </div>
          <div className={styles.countdown}>
            {[{ val: pad(h), label: 'HRS' }, { val: pad(m), label: 'MIN' }, { val: pad(s), label: 'SEC' }].map((seg, i) => (
              <span key={seg.label} className={styles.timerGroup}>
                {i > 0 && <span className={styles.sep}>:</span>}
                <span className={styles.segment}>
                  <span className={styles.segVal}>{seg.val}</span>
                  <span className={styles.segLabel}>{seg.label}</span>
                </span>
              </span>
            ))}
          </div>
          <a href="/shop?sort=discount" className={styles.viewAll}>View All Deals →</a>
        </div>
        <div className={styles.grid}>
          {products.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
