import { getSupabaseAdminClient, isSupabaseConfigured } from '@/lib/supabase/server';
import type { Metadata } from 'next';
import Link from 'next/link';
import { getAllProducts } from '@/lib/products';
import styles from './page.module.css';

export const metadata: Metadata = { title: 'Dashboard' };

function formatPrice(p: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);
}

async function getDashboardStats() {
  const localProducts = await getAllProducts(true);
  const localActiveProducts = localProducts.filter(p => p.is_active !== false);
  const localLowStock = localActiveProducts.filter(p => p.stock < 5 && p.stock > 0).slice(0, 10);

  let activeProducts = localActiveProducts.length;
  let lowStockCount = localLowStock.length;
  let pendingTradeIns = 0;
  let pendingRepairs = 0;
  let totalReviews = 0;
  let activeCoupons = 0;
  let lowStockProducts: any[] = localLowStock;

  if (isSupabaseConfigured()) {
    try {
      const supabase = getSupabaseAdminClient();

      const [
        resActive,
        resLowStock,
        resTradeIns,
        resRepairs,
        resReviews,
        resCoupons,
      ] = await Promise.all([
        supabase.from('products').select('*', { count: 'exact', head: true }).eq('is_active', true),
        supabase.from('products').select('*').eq('is_active', true).lt('stock', 5).gt('stock', 0).limit(10),
        supabase.from('trade_in_requests').select('*', { count: 'exact', head: true }).eq('status', 'submitted'),
        supabase.from('repair_bookings').select('*', { count: 'exact', head: true }).eq('status', 'booked'),
        supabase.from('reviews').select('*', { count: 'exact', head: true }),
        supabase.from('coupons').select('*', { count: 'exact', head: true }).eq('is_active', true),
      ]);

      if (resActive.count !== null && resActive.count !== undefined) activeProducts = resActive.count;
      if (resTradeIns.count !== null && resTradeIns.count !== undefined) pendingTradeIns = resTradeIns.count;
      if (resRepairs.count !== null && resRepairs.count !== undefined) pendingRepairs = resRepairs.count;
      if (resReviews.count !== null && resReviews.count !== undefined) totalReviews = resReviews.count;
      if (resCoupons.count !== null && resCoupons.count !== undefined) activeCoupons = resCoupons.count;
      if (resLowStock.data && resLowStock.data.length > 0) {
        lowStockProducts = resLowStock.data;
        lowStockCount = resLowStock.data.length;
      }
    } catch {
      // fallback to local data
    }
  }

  return {
    activeProducts,
    lowStockCount,
    pendingTradeIns,
    pendingRepairs,
    totalReviews,
    activeCoupons,
    lowStockProducts,
  };
}

export default async function OwnerDashboardPage() {
  const stats = await getDashboardStats();

  const statCards = [
    { label: 'Active Phones',     value: stats.activeProducts,    icon: '📱', color: '#EDE9FE', href: '/owner-portal/products' },
    { label: 'Low Stock Alerts',  value: stats.lowStockCount,     icon: '⚠️', color: '#FEE2E2', href: '/owner-portal/products' },
    { label: 'Pending Trade-Ins', value: stats.pendingTradeIns,   icon: '🔁', color: '#FEF3C7', href: '/owner-portal/trade-in' },
    { label: 'Pending Repairs',   value: stats.pendingRepairs,    icon: '🔧', color: '#DBEAFE', href: '/owner-portal/repairs' },
    { label: 'Customer Reviews',  value: stats.totalReviews,      icon: '⭐', color: '#DCFCE7', href: '/owner-portal/reviews' },
    { label: 'Active Coupons',    value: stats.activeCoupons,     icon: '🎟️', color: '#F0FFF4', href: '/owner-portal/coupons' },
  ];

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Store Management Dashboard</h1>
          <p className={styles.subtitle}>{new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
        <Link href="/owner-portal/products/add" className="btn btn--primary" id="add-product-btn">
          + Add New Phone
        </Link>
      </div>

      {/* Stat cards */}
      <div className={styles.statsGrid}>
        {statCards.map(s => (
          <Link key={s.label} href={s.href} className={styles.statCard} style={{ '--card-color': s.color } as React.CSSProperties}>
            <div className={styles.statIcon} style={{ background: s.color }}>{s.icon}</div>
            <div className={styles.statValue}>{s.value}</div>
            <div className={styles.statLabel}>{s.label}</div>
          </Link>
        ))}
      </div>

      <div className={styles.grid}>
        {/* Low Stock Alert */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>⚠️ Low Stock Inventory</h2>
            <Link href="/owner-portal/products" className={styles.viewAll}>Manage All →</Link>
          </div>
          {stats.lowStockProducts.length === 0 ? (
            <div className={styles.empty}>✅ All products are well-stocked.</div>
          ) : (
            <div className={styles.lowStockList}>
              {stats.lowStockProducts.map(p => (
                <div key={p.id} className={styles.lowStockItem}>
                  <div>
                    <div className={styles.lowStockName}>{p.brand} {p.model}</div>
                    <div className={styles.orderDate}>{formatPrice(p.discount_price ?? p.price)}</div>
                  </div>
                  <div className={styles.lowStockQty}>
                    <span className={styles.stockNum}>{p.stock}</span> left
                  </div>
                  <Link href={`/owner-portal/products/${p.id}/edit`} className="btn btn--ghost btn--sm">
                    Restock
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions & Store Inquiries */}
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>⚡ Quick Operations</h2>
          </div>
          <div className={styles.quickActions} style={{ marginTop: 0, gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))' }}>
            {[
              { icon: '➕', label: 'Add New Phone',   href: '/owner-portal/products/add' },
              { icon: '📱', label: 'Manage Phones',    href: '/owner-portal/products' },
              { icon: '🔁', label: 'Trade-In Queue',   href: '/owner-portal/trade-in' },
              { icon: '🔧', label: 'Repair Bookings',  href: '/owner-portal/repairs' },
              { icon: '🎟️', label: 'Discount Coupons', href: '/owner-portal/coupons' },
              { icon: '⭐', label: 'Customer Reviews', href: '/owner-portal/reviews' },
            ].map(a => (
              <Link key={a.href} href={a.href} className={styles.quickAction}>
                <span className={styles.quickIcon}>{a.icon}</span>
                <span>{a.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
