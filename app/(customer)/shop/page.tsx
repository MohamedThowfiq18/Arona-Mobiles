import { Suspense } from 'react';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Product, ShopFilters, SortOption } from '@/lib/types';
import RealtimeProductGrid from '@/components/customer/RealtimeProductGrid/RealtimeProductGrid';
import FilterSidebar from '@/components/customer/FilterSidebar/FilterSidebar';

import CartProvider from '@/components/customer/CartProvider/CartProvider';
import SortSelect from '@/components/customer/SortSelect/SortSelect';
import styles from './page.module.css';
import type { Metadata } from 'next';


export const metadata: Metadata = { title: 'Shop Phones' };

interface PageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export const dynamic = 'force-dynamic';

import { getAllProducts } from '@/lib/products';

async function fetchProducts(params: Record<string, string | string[] | undefined>): Promise<Product[]> {
  const brand    = params.brand as string | undefined;
  const condition= params.condition as string | undefined;
  const category = params.category as string | undefined;
  const minPrice = params.minPrice ? Number(params.minPrice) : undefined;
  const maxPrice = params.maxPrice ? Number(params.maxPrice) : undefined;
  const sort     = (params.sort as SortOption) || 'newest';

  try {
    const supabase = await getSupabaseServerClient();

    let q = supabase.from('products').select('*').eq('is_active', true);

    if (brand)     q = q.ilike('brand', brand);
    if (condition) q = q.eq('condition', condition);
    if (category)  q = q.eq('category_id', category);
    if (minPrice)  q = q.gte('price', minPrice);
    if (maxPrice)  q = q.lte('price', maxPrice);

    switch (sort) {
      case 'price_asc':   q = q.order('price', { ascending: true }); break;
      case 'price_desc':  q = q.order('price', { ascending: false }); break;
      case 'popularity':  q = q.order('sold_count', { ascending: false }); break;
      case 'rating':      q = q.order('average_rating', { ascending: false }); break;
      default:            q = q.order('created_at', { ascending: false }); break;
    }

    const { data } = await q.limit(48);
    if (data && data.length > 0) return data as Product[];
  } catch {
    // fallback
  }

  // Fallback to local products store
  let list = await getAllProducts();

  if (brand) list = list.filter(p => p.brand.toLowerCase() === brand.toLowerCase());
  if (condition) list = list.filter(p => p.condition === condition);
  if (category) list = list.filter(p => p.category_id === category);
  if (minPrice !== undefined) list = list.filter(p => (p.discount_price ?? p.price) >= minPrice);
  if (maxPrice !== undefined) list = list.filter(p => (p.discount_price ?? p.price) <= maxPrice);

  switch (sort) {
    case 'price_asc': list.sort((a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price)); break;
    case 'price_desc': list.sort((a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price)); break;
    case 'popularity': list.sort((a, b) => (b.sold_count || 0) - (a.sold_count || 0)); break;
    case 'rating': list.sort((a, b) => (b.average_rating || 0) - (a.average_rating || 0)); break;
    default: list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()); break;
  }

  return list;
}


const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest',    label: 'Newest First' },
  { value: 'popularity',label: 'Most Popular' },
  { value: 'rating',    label: 'Highest Rated' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc',label: 'Price: High to Low' },
];

export default async function ShopPage({ searchParams }: PageProps) {
  const params = searchParams ?? {};
  const products = await fetchProducts(params);
  const sort = (params.sort as string) || 'newest';
  const condition = params.condition as string | undefined;
  const brand = params.brand as string | undefined;

  const heading = brand
    ? `${brand.charAt(0).toUpperCase() + brand.slice(1)} Phones`
    : condition === 'new' ? 'New Smartphones'
    : condition === 'pre-owned' ? 'Certified Pre-Owned'
    : 'All Phones';

  return (
    <CartProvider>
      <div className="container">
        <div className={styles.breadcrumb}>
          <a href="/">Home</a> › <span>{heading}</span>
        </div>

        <div className={styles.layout}>
          {/* Sidebar */}
          <aside className={styles.sidebar}>
            <FilterSidebar currentParams={params} />
          </aside>

          {/* Main */}
          <div className={styles.main}>
            {/* Header row */}
            <div className={styles.listHeader}>
              <div>
                <h1 className={styles.title}>{heading}</h1>
                <span className={styles.count}>{products.length} products found</span>
              </div>
              <div className={styles.sortWrap}>
                <label htmlFor="sort-select" className={styles.sortLabel}>Sort by:</label>
                <SortSelect current={sort} options={SORT_OPTIONS} className={`form-input form-select ${styles.sortSelect}`} />
              </div>
            </div>

            {products.length === 0 ? (
              <div className={styles.empty}>
                <span className={styles.emptyIcon}>🔍</span>
                <h2>No phones found</h2>
                <p>Try adjusting your filters.</p>
                <a href="/shop" className="btn btn--secondary">Clear Filters</a>
              </div>
            ) : (
              <RealtimeProductGrid initialProducts={products} className={styles.grid} />
            )}
          </div>
        </div>
      </div>
    </CartProvider>
  );
}


