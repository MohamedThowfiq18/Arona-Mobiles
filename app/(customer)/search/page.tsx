import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/types';
import ProductCard from '@/components/customer/ProductCard/ProductCard';
import CartProvider from '@/components/customer/CartProvider/CartProvider';
import type { Metadata } from 'next';
import { getAllProducts } from '@/lib/products';
import styles from './page.module.css';

export const dynamic = 'force-dynamic';

interface Props { searchParams?: { q?: string } }

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = searchParams?.q;
  return { title: q ? `Search: "${q}"` : 'Search' };
}

export default async function SearchPage({ searchParams }: Props) {
  const q = searchParams?.q;
  let products: Product[] = [];

  if (q && q.trim().length >= 2) {
    try {
      const supabase = await getSupabaseServerClient();
      const { data } = await supabase.from('products').select('*')
        .eq('is_active', true)
        .or(`brand.ilike.%${q}%,model.ilike.%${q}%,short_description.ilike.%${q}%`)
        .order('sold_count', { ascending: false })
        .limit(48);
      if (data && data.length > 0) {
        products = data as Product[];
      }
    } catch {
      // fallback
    }

    if (products.length === 0) {
      const all = await getAllProducts();
      const lower = q.toLowerCase();
      products = all.filter(p =>
        p.brand.toLowerCase().includes(lower) ||
        p.model.toLowerCase().includes(lower) ||
        (p.short_description || '').toLowerCase().includes(lower)
      );
    }
  }

  return (
    <CartProvider>
      <div className="container">
        <div className={styles.page}>
          <div className={styles.header}>
            {q ? (
              <>
                <h1 className={styles.title}>Search results for &ldquo;{q}&rdquo;</h1>
                <span className={styles.count}>{products.length} results found</span>
              </>
            ) : (
              <h1 className={styles.title}>Search for phones, brands, models...</h1>
            )}
          </div>

          {!q && (
            <div className={styles.emptySearch}>
              <p>Start typing in the search bar above to find phones.</p>
              <div className={styles.suggestions}>
                <span className={styles.suggestLabel}>Popular searches:</span>
                {['iPhone 15', 'Samsung S24', 'OnePlus 12', 'Budget phones under 15000'].map(s => (
                  <a key={s} href={`/search?q=${encodeURIComponent(s)}`} className={styles.suggestChip}>{s}</a>
                ))}
              </div>
            </div>
          )}

          {q && products.length === 0 && (
            <div className={styles.noResults}>
              <span className={styles.noResultsIcon}>🔍</span>
              <h2>No results for &ldquo;{q}&rdquo;</h2>
              <p>Try different keywords or browse our categories.</p>
              <a href="/shop" className="btn btn--secondary">Browse All Phones</a>
            </div>
          )}

          {products.length > 0 && (
            <div className={styles.grid}>
              {products.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
          )}
        </div>
      </div>
    </CartProvider>
  );
}
