'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './OwnerSidebar.module.css';

const NAV = [
  { href: '/owner-portal',          label: 'Dashboard',      icon: '📊' },
  { href: '/owner-portal/products', label: 'Products',       icon: '📱' },
  { href: '/owner-portal/settings', label: 'Store & Phones', icon: '📞' },
  { href: '/owner-portal/trade-in', label: 'Trade-Ins',      icon: '🔁' },
  { href: '/owner-portal/repairs',  label: 'Repairs',        icon: '🔧' },
  { href: '/owner-portal/reviews',  label: 'Reviews & Q&A',  icon: '⭐' },
  { href: '/owner-portal/coupons',  label: 'Coupons',        icon: '🎟️' },
];

export default function OwnerSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const isAuthPage =
    pathname === '/owner-portal/login' ||
    pathname === '/owner-portal/verify-otp' ||
    pathname === '/owner-portal/forgot-password';

  // Automatically close sidebar drawer when page route changes
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Lock body scroll when mobile drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (isAuthPage) return null;

  const handleLogout = async () => {
    await fetch('/api/auth/owner-logout', { method: 'POST' });
    router.push('/owner-portal/login');
  };

  return (
    <>
      {/* Mobile Top Header (only visible on mobile screens <= 768px) */}
      <header className={styles.mobileHeader}>
        <div className={styles.mobileHeaderLeft}>
          <button
            type="button"
            className={styles.menuToggleBtn}
            onClick={() => setIsOpen(prev => !prev)}
            aria-label="Toggle owner navigation menu"
          >
            <span className={styles.hamburgerIcon}>{isOpen ? '✕' : '☰'}</span>
          </button>

          <Link href="/owner-portal" className={styles.mobileHeaderLogo} onClick={() => setIsOpen(false)}>
            <span className={styles.logoIcon}>📱</span>
            <div>
              <div className={styles.logoName}>ARONA</div>
              <div className={styles.logoSub}>Owner Portal</div>
            </div>
          </Link>
        </div>

        <Link
          href="/owner-portal/products/add"
          className={styles.mobileAddBtn}
          title="Add New Phone"
          onClick={() => setIsOpen(false)}
        >
          <span>➕</span>
          <span>Add Phone</span>
        </Link>
      </header>

      {/* Backdrop overlay for mobile drawer */}
      {isOpen && (
        <div
          className={styles.backdrop}
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Sidebar: Fixed left on desktop, Slide-in Drawer on mobile */}
      <aside className={`${styles.sidebar} ${isOpen ? styles.sidebarOpen : ''}`}>
        {/* Sidebar Header / Logo */}
        <div className={styles.logo}>
          <div className={styles.logoBrand}>
            <span className={styles.logoIcon}>📱</span>
            <div>
              <div className={styles.logoName}>ARONA</div>
              <div className={styles.logoSub}>Owner Portal</div>
            </div>
          </div>
          <button
            type="button"
            className={styles.drawerCloseBtn}
            onClick={() => setIsOpen(false)}
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        {/* Navigation */}
        <nav className={styles.nav}>
          <div className={styles.addBtnContainer}>
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
              onClick={() => setIsOpen(false)}
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
                onClick={() => setIsOpen(false)}
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
    </>
  );
}

