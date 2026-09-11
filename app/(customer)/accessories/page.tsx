import { Suspense } from 'react';
import type { Metadata } from 'next';
import { getAllAccessories, getAccessoryCategories } from '@/lib/accessories';
import RealtimeAccessoryGrid from '@/components/customer/RealtimeAccessoryGrid/RealtimeAccessoryGrid';
import CartProvider from '@/components/customer/CartProvider/CartProvider';
import styles from './page.module.css';

export const metadata: Metadata = {
  title: 'Mobile Accessories — Chargers, Cases, TWS & More | Arona Mobiles',
  description: 'Shop genuine smartphone accessories at Arona Mobiles. Mobile cases, fast chargers, screen protectors, earbuds, power banks, and smart watches.',
};

export const dynamic = 'force-dynamic';
export const revalidate = 0;

interface PageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default async function AccessoriesPage({ searchParams }: PageProps) {
  const params = searchParams ?? {};
  const selectedCategory = params.category as string | undefined;
  const selectedBrand = params.brand as string | undefined;
  const searchQuery = params.q as string | undefined;
  const sort = (params.sort as string) || 'featured';

  const [allAccessories, categories] = await Promise.all([
    getAllAccessories(false),
    getAccessoryCategories(),
  ]);

  // Extract unique brands for filtering
  const allBrands = Array.from(new Set(allAccessories.map(a => a.brand))).filter(Boolean).sort();

  return (
    <CartProvider>
      <div className="container">
        {/* Breadcrumb */}
        <div className={styles.breadcrumb}>
          <a href="/">Home</a> › <span>Accessories</span>
          {selectedCategory && (
            <> › <span className={styles.activeBreadcrumb}>{selectedCategory}</span></>
          )}
        </div>

        {/* Hero / Header Banner */}
        <div className={styles.headerBanner}>
          <div className={styles.bannerContent}>
            <span className={styles.bannerBadge}>⚡ 100% Genuine Accessories</span>
            <h1 className={styles.pageTitle}>Mobile Accessories & Care</h1>
            <p className={styles.pageSubtitle}>
              Elevate your smartphone experience with premium cases, fast chargers, wireless earbuds, smartwatches, and tempered glass.
            </p>
          </div>
        </div>

        {/* Quick Category Chips */}
        <div className={styles.categoryChipsSection}>
          <a
            href="/accessories"
            className={`${styles.categoryChip} ${!selectedCategory ? styles.categoryChipActive : ''}`}
          >
            <span>✨</span>
            <span>All Accessories</span>
          </a>
          {categories.map(cat => {
            const isActive = selectedCategory?.toLowerCase() === cat.name.toLowerCase() ||
                             selectedCategory?.toLowerCase() === cat.slug.toLowerCase();
            return (
              <a
                key={cat.id || cat.slug}
                href={`/accessories?category=${encodeURIComponent(cat.name)}`}
                className={`${styles.categoryChip} ${isActive ? styles.categoryChipActive : ''}`}
              >
                <span>{cat.icon || '🔌'}</span>
                <span>{cat.name}</span>
              </a>
            );
          })}
        </div>

        {/* Main Content Layout */}
        <div className={styles.layout}>
          {/* Filter Sidebar */}
          <aside className={styles.sidebar}>
            <div className={styles.filterCard}>
              <div className={styles.filterHeader}>
                <h3 className={styles.filterTitle}>Filter Accessories</h3>
                {(selectedCategory || selectedBrand || searchQuery) && (
                  <a href="/accessories" className={styles.clearFilters}>Clear All</a>
                )}
              </div>

              {/* Categories Filter */}
              <div className={styles.filterGroup}>
                <h4 className={styles.filterGroupTitle}>Categories</h4>
                <ul className={styles.filterList}>
                  <li>
                    <a
                      href="/accessories"
                      className={`${styles.filterItem} ${!selectedCategory ? styles.filterItemActive : ''}`}
                    >
                      All Categories
                    </a>
                  </li>
                  {categories.map(cat => {
                    const isActive = selectedCategory?.toLowerCase() === cat.name.toLowerCase();
                    const count = allAccessories.filter(a => a.category.toLowerCase() === cat.name.toLowerCase()).length;
                    return (
                      <li key={cat.name}>
                        <a
                          href={`/accessories?category=${encodeURIComponent(cat.name)}`}
                          className={`${styles.filterItem} ${isActive ? styles.filterItemActive : ''}`}
                        >
                          <span>{cat.name}</span>
                          <span className={styles.filterCount}>({count})</span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>

              {/* Brand Filter */}
              {allBrands.length > 0 && (
                <div className={styles.filterGroup}>
                  <h4 className={styles.filterGroupTitle}>Popular Brands</h4>
                  <ul className={styles.filterList}>
                    {allBrands.map(b => {
                      const isActive = selectedBrand?.toLowerCase() === b.toLowerCase();
                      const count = allAccessories.filter(a => a.brand.toLowerCase() === b.toLowerCase()).length;
                      return (
                        <li key={b}>
                          <a
                            href={`/accessories?${selectedCategory ? `category=${encodeURIComponent(selectedCategory)}&` : ''}brand=${encodeURIComponent(b)}`}
                            className={`${styles.filterItem} ${isActive ? styles.filterItemActive : ''}`}
                          >
                            <span>{b}</span>
                            <span className={styles.filterCount}>({count})</span>
                          </a>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}

              {/* In-Store Guarantee Info */}
              <div className={styles.storeInfoBox}>
                <div className={styles.storeInfoIcon}>🏪</div>
                <div>
                  <div className={styles.storeInfoTitle}>Free In-Store Fitment</div>
                  <div className={styles.storeInfoDesc}>
                    Get screen protectors and mobile cases applied for free by our technicians in store.
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Product Listing Area */}
          <main className={styles.main}>
            {/* Top Toolbar */}
            <div className={styles.toolbar}>
              <div>
                <h2 className={styles.resultsHeading}>
                  {selectedCategory ? selectedCategory : 'All Accessories'}
                </h2>
                <span className={styles.resultsCount}>
                  Showing genuine accessories for your phone
                </span>
              </div>

              {/* Search + Sort Bar */}
              <div className={styles.toolbarControls}>
                <form action="/accessories" method="GET" className={styles.searchForm}>
                  {selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}
                  <input
                    type="search"
                    name="q"
                    defaultValue={searchQuery || ''}
                    placeholder="Search accessories (chargers, cases...)"
                    className={`form-input ${styles.searchInput}`}
                  />
                  <button type="submit" className={styles.searchBtn}>🔍</button>
                </form>

                <div className={styles.sortWrapper}>
                  <label htmlFor="accessory-sort" className={styles.sortLabel}>Sort:</label>
                  <form action="/accessories" method="GET" className={styles.sortForm}>
                    {selectedCategory && <input type="hidden" name="category" value={selectedCategory} />}
                    {selectedBrand && <input type="hidden" name="brand" value={selectedBrand} />}
                    {searchQuery && <input type="hidden" name="q" value={searchQuery} />}
                    <select
                      id="accessory-sort"
                      name="sort"
                      defaultValue={sort}
                      className={`form-input form-select ${styles.sortSelect}`}
                    >
                      <option value="featured">Featured First</option>
                      <option value="newest">Newest Arrivals</option>
                      <option value="price_asc">Price: Low to High</option>
                      <option value="price_desc">Price: High to Low</option>
                      <option value="name_asc">Name: A to Z</option>
                    </select>
                  </form>
                </div>
              </div>
            </div>

            {/* Realtime Accessories Grid */}
            <Suspense fallback={<div className={styles.loading}>Loading accessories...</div>}>
              <RealtimeAccessoryGrid
                initialAccessories={allAccessories}
                filterCategory={selectedCategory}
                filterBrand={selectedBrand}
                filterSearch={searchQuery}
                sortBy={sort}
                emptyMessage="No accessories matched your filter. Try clearing filters or exploring other categories."
              />
            </Suspense>
          </main>
        </div>
      </div>
    </CartProvider>
  );
}
