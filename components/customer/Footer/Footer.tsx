import Link from 'next/link';
import styles from './Footer.module.css';

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={`container ${styles.footerGrid}`}>
        <div className={styles.brand}>
          <div className={styles.logo}>
            <span>📱</span>
            <div>
              <span className={styles.logoName}>ARONA MOBILES</span>
              <span className={styles.logoTagline}>Your trusted phone store</span>
            </div>
          </div>
          <p className={styles.tagline}>
            New smartphones, certified pre-owned phones, accessories, trade-ins, and repairs — visit our store or order for quick pickup!
          </p>
          <div className={styles.social}>
            <a href="tel:+919876543210" aria-label="Phone Call">📞</a>
            <a
              href="https://wa.me/919876543210?text=Hi%20ARONA%20MOBILES!%20I%20have%20an%20inquiry."
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
            <li><Link href="/shop?category=accessories">Accessories</Link></li>
            <li><Link href="/compare">Compare Phones</Link></li>
            <li><Link href="/search">Search</Link></li>
          </ul>
        </div>

        <div>
          <h4 className={styles.colTitle}>Store &amp; Help</h4>
          <ul className={styles.links}>
            <li><Link href="/account/orders">My Orders &amp; Pickups</Link></li>
            <li><Link href="/account">My Account</Link></li>
            <li><Link href="/wishlist">Wishlist</Link></li>
            <li><a href="tel:+919876543210">📞 +91 98765 43210</a></li>
            <li>
              <a
                href="https://wa.me/919876543210?text=Hi%20ARONA%20MOBILES!"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: '#25D366', fontWeight: 600 }}
              >
                💬 WhatsApp Store
              </a>
            </li>
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
          <span>© {new Date().getFullYear()} Arona Mobiles. All rights reserved.</span>
          <div className={styles.legalLinks}>
            <span>📍  (10 AM – 8 PM)</span>

          </div>
        </div>
      </div>
    </footer>
  );
}
