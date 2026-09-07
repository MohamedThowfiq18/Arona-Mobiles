import Link from 'next/link';
import styles from './BrandStrip.module.css';

const BRANDS = [
  { name: 'Apple',   emoji: '🍎', slug: 'apple' },
  { name: 'Samsung', emoji: '🔵', slug: 'samsung' },
  { name: 'OnePlus', emoji: '🔴', slug: 'oneplus' },
  { name: 'Xiaomi',  emoji: '🟠', slug: 'xiaomi' },
  { name: 'Realme',  emoji: '🟡', slug: 'realme' },
  { name: 'Vivo',    emoji: '🔷', slug: 'vivo' },
  { name: 'Google',  emoji: '🌈', slug: 'google' },
];

export default function BrandStrip() {
  return (
    <div className={styles.strip}>
      <div className={`container ${styles.inner}`}>
        <span className={styles.label}>Shop by Brand</span>
        {BRANDS.map(b => (
          <Link key={b.slug} href={`/shop?brand=${b.slug}`} className={styles.brandBtn}>
            <span className={styles.brandEmoji}>{b.emoji}</span>
            <span className={styles.brandName}>{b.name}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
