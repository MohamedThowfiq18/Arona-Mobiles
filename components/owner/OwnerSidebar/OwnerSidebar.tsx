'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './OwnerSidebar.module.css';

const NAV = [
  { href: '/owner-portal',          label: 'Dashboard',      icon: '📊' },
  { href: '/owner-portal/products', label: 'Products',       icon: '📱' },
  { href: '/owner-portal/trade-in', label: 'Trade-Ins',      icon: '🔁' },
  { href: '/owner-portal/repairs',  label: 'Repairs',        icon: '🔧' },
  { href: '/owner-portal/reviews',  label: 'Reviews & Q&A',  icon: '⭐' },
  { href: '/owner-portal/coupons',  label: 'Coupons',        icon: '🎟️' },
];

export default function OwnerSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = async () => {
    await fetch('/api/auth/owner-logout', { method: 'POST' });
    router.push('/owner-portal/login');
  };

  return (
    <aside className={styles.sidebar}>
      {/* Logo */}
      <div className={styles.logo}>
        <span className={styles.logoIcon}>📱</span>
        <div>
          <div className={styles.logoName}>ARONA</div>
          <div className={styles.logoSub}>Owner Portal</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        <div style={{ padding: '0 12px 14px 12px' }}>
          <Link
            href="/owner-portal/products/add"
            className="btn btn--primary btn--full"
            style={{
              padding: '10px 14px',
              fontSize: '0.85rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              boxShadow: '0 2px 8px rgba(234, 88, 12, 0.3)',
            }}
          >
            <span>➕</span>
            <span>Add New Phone</span>
          </Link>
        </div>

        {NAV.map(item => {
          const isActive = item.href === '/owner-portal'
            ? pathname === '/owner-portal'
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
            >
              <span className={styles.navIcon}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <a href="/" className={styles.footerLink} target="_blank">← View Store</a>
        <button className={styles.logoutBtn} onClick={handleLogout}>🚪 Sign Out</button>
      </div>
    </aside>
  );
}
