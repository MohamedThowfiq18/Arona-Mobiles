'use client';

import Link from 'next/link';
import { useStoreSettings } from '@/components/customer/StoreSettingsProvider/StoreSettingsProvider';
import styles from './Footer.module.css';

export default function Footer() {
  const { settings, primaryPhone, primaryPhoneRaw, secondaryPhone, secondaryPhoneRaw, whatsappNumber, getWhatsAppSupportUrl } = useStoreSettings();

  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerGrid}`}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span>📱</span>
            <div>
              <span className={styles.logoName}>{settings.store_name || 'ARONA MOBILES'}</span>
              <span className={styles.logoTagline}>{settings.tagline || 'Your trusted phone store'}</span>
            </div>
          </div>
          <p className={styles.tagline}>
            New smartphones, certified pre-owned phones, accessories, trade-ins, and repairs — visit our store or contact via Call &amp; WhatsApp!
          </p>
          <div className={styles.social}>
            <a href={`tel:${primaryPhoneRaw}`} aria-label="Phone Call">📞</a>
            <a
              href={getWhatsAppSupportUrl()}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
            >
              💬
            </a>
            <a href="#" aria-label="Instagram">📸</a>
            <a href="#" aria-label="Facebook">📘</a>
          </div>
        </div>

        <div>
          <h4 className={styles.colTitle}>Shop</h4>
          <ul className={styles.links}>
            <li><Link href="/shop">All Phones</Link></li>
            <li><Link href="/shop?brand=apple">Apple iPhones</Link></li>
            <li><Link href="/shop?brand=samsung">Samsung</Link></li>
            <li><Link href="/shop?brand=oneplus">OnePlus</Link></li>
            <li><Link href="/certified-preowned">Certified Pre-Owned</Link></li>
          </ul>
        </div>

        <div>
          <h4 className={styles.colTitle}>Services</h4>
          <ul className={styles.links}>
            <li><Link href="/trade-in">Trade-In</Link></li>
            <li><Link href="/repair">Repair &amp; Care</Link></li>
            <li><Link href="/repair/status">Check Repair Status</Link></li>
            <li><Link href="/accessories">Accessories</Link></li>
            <li><Link href="/compare">Compare Phones</Link></li>
            <li><Link href="/search">Search</Link></li>
          </ul>
        </div>

        <div>
          <h4 className={styles.colTitle}>Store &amp; Contact</h4>
          <ul className={styles.links}>
            <li><a href={`tel:${primaryPhoneRaw}`}>📞 {primaryPhone}</a></li>
            {secondaryPhoneRaw && (
              <li><a href={`tel:${secondaryPhoneRaw}`}>📞 {secondaryPhone}</a></li>
            )}
            <li>
              <a
                href={getWhatsAppSupportUrl()}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#25D366', fontWeight: 600 }}
              >
                💬 WhatsApp: +{whatsappNumber}
              </a>
            </li>
            <li><Link href="/account/orders">My Orders &amp; Pickups</Link></li>
            <li><Link href="/wishlist">Wishlist</Link></li>
            <li style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed rgba(255,255,255,0.15)' }}>
              <Link href="/owner-portal/login" style={{ color: '#fb923c', fontWeight: 600 }}>👑 Owner Portal</Link>
            </li>
            <li>
              <Link href="/owner-portal/products/add" style={{ color: '#fed7aa', fontSize: '0.85rem' }}>+ Add New Phone</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className={styles.paymentSection}>
        <div className="container">
          <div className={styles.paymentInner}>
            <div className={styles.paymentMethods}>
              <span className={styles.paymentLabel}>Payment options:</span>
              <span className={styles.paymentBadge}>Pay at Store</span>
              <span className={styles.paymentBadge}>UPI</span>
              <span className={styles.paymentBadge}>Cards</span>
              <span className={styles.paymentBadge}>EMI</span>
              <span className={styles.paymentBadge}>Net Banking</span>
            </div>
            <div className={styles.trust}>
              <span>🏪 In-Store Pickup &amp; Demo</span>
              <span>🛡️ 100% Genuine Warranty</span>
              <span>📞 Direct Store Support</span>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.bottomBar}>
        <div className={`container ${styles.bottomInner}`}>
          <span>© {new Date().getFullYear()} {settings.store_name || 'Arona Mobiles'}. All rights reserved.</span>
          <div className={styles.legalLinks}>
            <span>📍 {settings.hours_weekdays || 'Mon–Sat: 10:00 AM – 8:30 PM'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

