'use client';

import { useState } from 'react';
import Link from 'next/link';
import styles from './page.module.css';

const TABS = ['Orders', 'Wishlist', 'Addresses', 'Profile'] as const;
type Tab = typeof TABS[number];

export default function AccountPage() {
  const [tab, setTab] = useState<Tab>('Orders');
  const [isLoggedIn] = useState(false); // In real app, check Supabase auth

  if (!isLoggedIn) {
    return (
      <div className={`container ${styles.authPrompt}`}>
        <span className={styles.authIcon}>👤</span>
        <h1>Sign In to Your Account</h1>
        <p>View your store reservations, manage your wishlist, and update your profile.</p>
        <div className={styles.authButtons}>
          <button className="btn btn--primary btn--lg" id="signin-btn">Sign In</button>
          <button className="btn btn--secondary btn--lg" id="signup-btn">Create Account</button>
        </div>
        <div className={styles.authBenefits}>
          <div>📱 Manage phone reservations</div>
          <div>❤️ Save to wishlist</div>
          <div>⚡ Quick store pickup</div>
          <div>🎟️ Exclusive store offers</div>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={styles.page}>
        <div className={styles.sidebar}>
          <div className={styles.userCard}>
            <div className={styles.avatar}>👤</div>
            <div>
              <div className={styles.userName}>John Doe</div>
              <div className={styles.userEmail}>john@example.com</div>
            </div>
          </div>
          {TABS.map(t => (
            <button key={t} className={`${styles.navItem} ${tab === t ? styles.navItemActive : ''}`}
              onClick={() => setTab(t)}>
              {t === 'Orders' ? '📦' : t === 'Wishlist' ? '❤️' : t === 'Addresses' ? '📍' : '👤'} {t}
            </button>
          ))}
          <button className={`${styles.navItem} ${styles.logout}`}>🚪 Sign Out</button>
        </div>
        <div className={styles.content}>
          {tab === 'Orders' && (
            <div>
              <h2 className={styles.tabTitle}>My Orders</h2>
              <div className={styles.emptyState}>
                <span>📦</span>
                <p>No orders yet. <Link href="/shop">Start shopping!</Link></p>
              </div>
            </div>
          )}
          {tab === 'Wishlist' && (
            <div>
              <h2 className={styles.tabTitle}>My Wishlist</h2>
              <div className={styles.emptyState}>
                <span>❤️</span>
                <p>Your wishlist is empty. <Link href="/shop">Browse phones</Link></p>
              </div>
            </div>
          )}
          {tab === 'Addresses' && (
            <div>
              <h2 className={styles.tabTitle}>Saved Addresses</h2>
              <button className="btn btn--secondary" id="add-address-btn">+ Add New Address</button>
            </div>
          )}
          {tab === 'Profile' && (
            <div>
              <h2 className={styles.tabTitle}>My Profile</h2>
              <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" defaultValue="John Doe" /></div>
              <div className="form-group"><label className="form-label">Email</label><input className="form-input" defaultValue="john@example.com" /></div>
              <div className="form-group"><label className="form-label">Phone</label><input className="form-input" defaultValue="+91 98765 43210" /></div>
              <button className="btn btn--primary">Save Changes</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
