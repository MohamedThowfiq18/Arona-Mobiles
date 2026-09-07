import { Suspense } from 'react';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/customer/ProductCard/ProductCard';
import HeroBanner from '@/components/customer/HeroBanner/HeroBanner';
import CartProvider from '@/components/customer/CartProvider/CartProvider';
import { getFeaturedProducts, getPreOwnedProducts } from '@/lib/products';
import styles from './page.module.css';

export default async function HomePage() {
  const [featured, preOwned] = await Promise.all([
    getFeaturedProducts(),
    getPreOwnedProducts(),
  ]);

  return (
    <CartProvider>
      {/* Hero Banner / Carousel */}
      <HeroBanner />

      {/* Category Tiles */}
      <section className={`section ${styles.categories}`}>
        <div className="container">
          <h2 className="section-title">Shop by Category</h2>
          <div className={styles.categoryGrid}>
            {[
              { icon: '📱', label: 'New Smartphones', href: '/shop?condition=new', color: '#DBEAFE' },
              { icon: '✅', label: 'Certified Pre-Owned', href: '/certified-preowned', color: '#EDE9FE' },
              { icon: '🔌', label: 'Accessories', href: '/shop?category=accessories', color: '#ECFDF5' },
              { icon: '🔁', label: 'Trade-In', href: '/trade-in', color: '#FEF3C7' },
              { icon: '🔧', label: 'Repair & Care', href: '/repair', color: '#FEE2E2' },
              { icon: '⚡', label: 'Flash Deals', href: '/shop?sort=discount', color: '#FFF7ED' },
            ].map(cat => (
              <a key={cat.href} href={cat.href} className={styles.categoryTile} style={{ '--cat-color': cat.color } as React.CSSProperties}>
                <span className={styles.categoryIcon}>{cat.icon}</span>
                <span className={styles.categoryLabel}>{cat.label}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featured.length > 0 && (
        <section className="section section--gray">
          <div className="container">
            <div className={styles.sectionHeader}>
              <h2 className="section-title">Featured Phones</h2>
              <a href="/shop" className={styles.viewAll}>View All →</a>
            </div>
            <Suspense fallback={<ProductGridSkeleton count={8} />}>
              <ProductGridClient products={featured} />
            </Suspense>
          </div>
        </section>
      )}

      {/* Pre-Owned Section */}
      {preOwned.length > 0 && (
        <section className="section section--gray">
          <div className="container">
            <div className={styles.preOwnedBanner}>
              <div className={styles.preOwnedText}>
                <span className={styles.preOwnedBadge}>✅ 8-Point Certified</span>
                <h2 className={styles.preOwnedTitle}>Certified Pre-Owned Phones</h2>
                <p className={styles.preOwnedDesc}>
                  Every pre-owned phone is inspected, graded, and comes with a 6-month warranty. Save up to 50% vs. new.
                </p>
                <a href="/certified-preowned" className="btn btn--secondary">Learn More →</a>
              </div>
              <div className={styles.preOwnedProducts}>
                {preOwned.map(p => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Why Arona Mobiles */}
      <section className="section">
        <div className="container">
          <h2 className="section-title">Why Shop with Us?</h2>
          <div className={styles.trustGrid}>
            {[
              { icon: '🏪', title: 'In-Store Demo & Pickup', desc: 'Inspect, test, and hold your phone before payment. Free data transfer in store.' },
              { icon: '🛡️', title: 'Official Store Warranty', desc: '100% authentic devices with official brand and store warranty coverage.' },
              { icon: '📞', title: 'Call & WhatsApp Buying', desc: 'Quick inquiries, live phone pictures, and instant reservation over chat or call.' },
              { icon: '💵', title: 'Flexible Payments', desc: 'Pay at store via Cash, Card, or UPI, or reserve instantly with online payment.' },
              { icon: '🔧', title: 'Expert Repair & Care', desc: 'In-house certified technicians. Fast repairs with genuine spares.' },
              { icon: '🔁', title: 'Instant Trade-In', desc: 'Exchange your old phone on the spot and upgrade at the best valuation.' },
            ].map(f => (
              <div key={f.title} className={styles.trustCard}>
                <div className={styles.trustIcon}>{f.icon}</div>
                <h3 className={styles.trustTitle}>{f.title}</h3>
                <p className={styles.trustDesc}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </CartProvider>
  );
}

function ProductGridClient({ products }: { products: Product[] }) {
  return (
    <div className={styles.productGrid}>
      {products.map(p => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}

function ProductGridSkeleton({ count }: { count: number }) {
  return (
    <div className={styles.productGrid}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className={styles.productSkeleton}>
          <div className={`skeleton ${styles.skeletonImg}`} />
          <div className={styles.skeletonInfo}>
            <div className="skeleton" style={{ height: 12, width: '60%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 16, width: '80%', marginBottom: 8 }} />
            <div className="skeleton" style={{ height: 20, width: '50%' }} />
          </div>
        </div>
      ))}
    </div>
  );
}
