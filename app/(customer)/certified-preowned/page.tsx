import type { Metadata } from 'next';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/customer/ProductCard/ProductCard';
import CartProvider from '@/components/customer/CartProvider/CartProvider';
import styles from './page.module.css';

export const metadata: Metadata = { title: 'Certified Pre-Owned Phones' };

export default async function CertifiedPreOwnedPage() {
  const supabase = await getSupabaseServerClient();
  const { data } = await supabase.from('products').select('*')
    .eq('condition', 'pre-owned').eq('is_active', true)
    .order('grade').order('price', { ascending: true });
  const products = (data as Product[]) || [];

  const gradeA = products.filter(p => p.grade === 'A');
  const gradeB = products.filter(p => p.grade === 'B');
  const gradeC = products.filter(p => p.grade === 'C');

  return (
    <CartProvider>
      <div>
        {/* Hero */}
        <div className={styles.hero}>
          <div className="container">
            <h1 className={styles.heroTitle}>Certified Pre-Owned Phones</h1>
            <p className={styles.heroDesc}>Every phone tested by our technicians. Graded for transparency. Backed by warranty.</p>
            <div className={styles.badges}>
              <span>✅ 8-Point Inspection</span>
              <span>🛡️ 6-Month Warranty</span>
              <span>💯 Grade Transparency</span>
              <span>🔁 7-Day Returns</span>
            </div>
          </div>
        </div>

        {/* How grading works */}
        <section className="section section--gray">
          <div className="container">
            <h2 className="section-title">Our Grading System</h2>
            <div className={styles.gradeGrid}>
              {[
                { grade: 'A', label: 'Like New', desc: 'Minimal to no cosmetic wear. Battery health 90%+. Fully functional.', color: '#D1FAE5', accent: '#16A34A' },
                { grade: 'B', label: 'Good', desc: 'Minor visible scratches. Battery health 80%+. Everything working perfectly.', color: '#FEF3C7', accent: '#D97706' },
                { grade: 'C', label: 'Fair', desc: 'Visible wear/dents. Battery may be 70–80%. All functions 100% working.', color: '#F3F4F6', accent: '#6B7280' },
              ].map(g => (
                <div key={g.grade} className={styles.gradeCard} style={{ background: g.color, borderColor: g.accent + '40' }}>
                  <div className={styles.gradeLabel} style={{ color: g.accent }}>Grade {g.grade} — {g.label}</div>
                  <p className={styles.gradeDesc}>{g.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 8-Point inspection */}
        <section className="section">
          <div className="container">
            <h2 className="section-title">8-Point Inspection Checklist</h2>
            <div className={styles.checkGrid}>
              {['Screen Quality','Battery Health','Rear Camera','Front Camera','Speakers & Mic','All Buttons','Charging Port','Body Condition'].map(c => (
                <div key={c} className={styles.checkItem}>
                  <span className={styles.checkMark}>✅</span>
                  <span>{c}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Products by grade */}
        {[{ label: 'Grade A — Like New', products: gradeA }, { label: 'Grade B — Good', products: gradeB }, { label: 'Grade C — Fair (Best Value)', products: gradeC }]
          .filter(g => g.products.length > 0)
          .map(g => (
            <section key={g.label} className="section section--gray">
              <div className="container">
                <h2 className="section-title">{g.label}</h2>
                <div className={styles.productGrid}>
                  {g.products.map(p => <ProductCard key={p.id} product={p} />)}
                </div>
              </div>
            </section>
          ))}

        {products.length === 0 && (
          <div className={styles.empty}>
            <p>No pre-owned phones available right now. Check back soon!</p>
            <a href="/shop" className="btn btn--primary">Browse New Phones</a>
          </div>
        )}
      </div>
    </CartProvider>
  );
}
