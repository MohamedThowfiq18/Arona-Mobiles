'use client';

import { useRouter } from 'next/navigation';
import styles from './FilterSidebar.module.css';

const BRANDS = ['Apple','Samsung','OnePlus','Xiaomi','Realme','Vivo','Google'];
const PRICE_RANGES = [
  { label: 'Under ₹15,000',  min: 0,     max: 15000 },
  { label: '₹15,000–₹30,000',min: 15000, max: 30000 },
  { label: '₹30,000–₹60,000',min: 30000, max: 60000 },
  { label: '₹60,000–₹1,00,000', min: 60000, max: 100000 },
  { label: 'Above ₹1,00,000',min: 100000,max: 9999999 },
];

interface Props {
  currentParams: Record<string, string | string[] | undefined>;
}

export default function FilterSidebar({ currentParams }: Props) {
  const router = useRouter();

  const setParam = (key: string, value: string | undefined) => {
    const url = new URL(window.location.href);
    if (value) url.searchParams.set(key, value);
    else url.searchParams.delete(key);
    router.push(url.pathname + url.search);
  };

  const toggleBrand = (brand: string) => {
    const current = currentParams.brand as string | undefined;
    setParam('brand', current === brand.toLowerCase() ? undefined : brand.toLowerCase());
  };

  const setPriceRange = (min: number, max: number) => {
    const url = new URL(window.location.href);
    url.searchParams.set('minPrice', String(min));
    url.searchParams.set('maxPrice', String(max));
    router.push(url.pathname + url.search);
  };

  const clearAll = () => router.push('/shop');

  const hasFilters = !!(currentParams.brand || currentParams.condition ||
    currentParams.minPrice || currentParams.maxPrice);

  return (
    <div className={styles.sidebar}>
      <div className={styles.header}>
        <h3 className={styles.heading}>Filters</h3>
        {hasFilters && (
          <button className={styles.clearBtn} onClick={clearAll}>Clear All</button>
        )}
      </div>

      {/* Condition */}
      <div className={styles.group}>
        <div className={styles.groupTitle}>Condition</div>
        {[{ label: 'New', value: 'new' }, { label: 'Certified Pre-Owned', value: 'pre-owned' }].map(c => (
          <label key={c.value} className={styles.checkLabel}>
            <input
              type="radio"
              name="condition"
              className={styles.radio}
              checked={currentParams.condition === c.value}
              onChange={() => setParam('condition', c.value)}
            />
            {c.label}
          </label>
        ))}
      </div>

      {/* Brand */}
      <div className={styles.group}>
        <div className={styles.groupTitle}>Brand</div>
        {BRANDS.map(b => (
          <label key={b} className={styles.checkLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={currentParams.brand === b.toLowerCase()}
              onChange={() => toggleBrand(b)}
            />
            {b}
          </label>
        ))}
      </div>

      {/* Price */}
      <div className={styles.group}>
        <div className={styles.groupTitle}>Price Range</div>
        {PRICE_RANGES.map(r => (
          <label key={r.label} className={styles.checkLabel}>
            <input
              type="radio"
              name="price"
              className={styles.radio}
              checked={
                currentParams.minPrice === String(r.min) &&
                currentParams.maxPrice === String(r.max)
              }
              onChange={() => setPriceRange(r.min, r.max)}
            />
            {r.label}
          </label>
        ))}
      </div>

      {/* Grade (pre-owned only) */}
      {currentParams.condition === 'pre-owned' && (
        <div className={styles.group}>
          <div className={styles.groupTitle}>Condition Grade</div>
          {['A','B','C'].map(g => (
            <label key={g} className={styles.checkLabel}>
              <input
                type="radio"
                name="grade"
                className={styles.radio}
                checked={currentParams.grade === g}
                onChange={() => setParam('grade', g)}
              />
              Grade {g}{g === 'A' ? ' — Like New' : g === 'B' ? ' — Good' : ' — Fair'}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
