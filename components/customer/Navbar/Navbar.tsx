'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { getSupabaseClient, isSupabaseConfigured } from '@/lib/supabase/client';
import type { Product } from '@/lib/types';
import { useStoreSettings } from '@/components/customer/StoreSettingsProvider/StoreSettingsProvider';
import styles from './Navbar.module.css';


const CATEGORIES = [
  { label: 'Smartphones', href: '/shop?category=smartphones' },
  { label: 'Certified Pre-Owned', href: '/shop?category=certified-pre-owned' },
  { label: 'Accessories', href: '/shop?category=accessories' },
  { label: 'Trade-In', href: '/trade-in' },
  { label: 'Repair', href: '/repair' },
];

const BRANDS = [
  { label: 'Apple', href: '/shop?brand=apple' },
  { label: 'Samsung', href: '/shop?brand=samsung' },
  { label: 'OnePlus', href: '/shop?brand=oneplus' },
  { label: 'Xiaomi', href: '/shop?brand=xiaomi' },
  { label: 'Google', href: '/shop?brand=google' },
  { label: 'Realme', href: '/shop?brand=realme' },
];

export default function Navbar() {
  const router = useRouter();
  const pathname = usePathname();
  const { primaryPhone, primaryPhoneRaw, secondaryPhone, secondaryPhoneRaw, whatsappNumber, googleMapsUrl, getWhatsAppSupportUrl } = useStoreSettings();
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [showCategoryMenu, setShowCategoryMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const supabase = getSupabaseClient();

  // Close suggestions on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileMenuOpen(false); }, [pathname]);

  // Search autosuggest with debounce
  const fetchSuggestions = useCallback(async (q: string) => {
    if (q.length < 2 || !isSupabaseConfigured()) { setSuggestions([]); return; }
    try {
      const { data } = await supabase
        .from('products')
        .select('id, brand, model, images, price, discount_price, slug')
        .or(`brand.ilike.%${q}%,model.ilike.%${q}%`)
        .eq('is_active', true)
        .limit(6);
      setSuggestions((data as Product[]) || []);
    } catch {
      setSuggestions([]);
    }
  }, [supabase]);

  useEffect(() => {
    const timer = setTimeout(() => fetchSuggestions(searchQuery), 250);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchSuggestions]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowSuggestions(false);
    }
  };

  const formatPrice = (price: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(price);

  return (
    <>
      {/* Main navbar */}
      <header className={styles.navbar}>
        <div className={`container ${styles.navbarInner}`}>
          {/* Logo */}
          <Link href="/" className={styles.logo}>
            <span className={styles.logoIcon}>📱</span>
            <span className={styles.logoTextGroup}>
              <span className={styles.logoName}>ARONA</span>
              <span className={styles.logoSub}>MOBILES</span>
            </span>
          </Link>

          {/* Search bar */}
          <div className={styles.searchWrap} ref={searchRef}>
            <form onSubmit={handleSearch} className={styles.searchForm}>
              <input
                id="navbar-search"
                className={styles.searchInput}
                type="search"
                placeholder="Search phones, brands, models..."
                value={searchQuery}
                onChange={e => { setSearchQuery(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                autoComplete="off"
              />
              <button type="submit" className={styles.searchBtn} aria-label="Search">
                🔍
              </button>
            </form>
            {showSuggestions && suggestions.length > 0 && (
              <div className={styles.suggestions}>
                {suggestions.map(p => (
                  <Link
                    key={p.id}
                    href={`/product/${p.id}`}
                    className={styles.suggestionItem}
                    onClick={() => { setShowSuggestions(false); setSearchQuery(''); }}
                  >
                    {p.images?.[0] && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.images[0]} alt={p.model} className={styles.suggestionImg} />
                    )}
                    <span className={styles.suggestionDetails}>
                      <span className={styles.suggestionName}>{p.brand} {p.model}</span>
                      <span className={styles.suggestionPrice}>
                        {formatPrice(p.discount_price ?? p.price)}
                      </span>
                    </span>
                  </Link>
                ))}
                <Link
                  href={`/search?q=${encodeURIComponent(searchQuery)}`}
                  className={styles.suggestionViewAll}
                  onClick={() => setShowSuggestions(false)}
                >
                  View all results for &ldquo;{searchQuery}&rdquo; →
                </Link>
              </div>
            )}
          </div>

          {/* Right actions: Call Store, Location & Owner Portal */}
          <div className={styles.navActions}>
            <a
              href={`tel:${primaryPhoneRaw}`}
              className={styles.callStoreBtn}
              title={`Call Store: ${primaryPhone} / ${secondaryPhone}`}
              id="nav-call-store-btn"
            >
              <span className={styles.callStoreIcon}>📞</span>
              <span className={styles.callStoreText}>Call Store</span>
            </a>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.locationBtn}
              title="View Store Location on Google Maps"
              id="nav-location-btn"
            >
              <span className={styles.locationIcon}>📍</span>
              <span className={styles.locationText}>Location</span>
            </a>
            <Link
              href="/owner-portal/login"
              id="nav-owner-portal-btn"
              className={styles.ownerBtn}
              title="Owner Portal"
            >
              <span className={styles.ownerBtnIcon}>👑</span>
              <span className={styles.ownerBtnText}>Owner</span>
            </Link>
            <button
              className={styles.mobileMenuBtn}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              ☰
            </button>
          </div>
        </div>
      </header>

      {/* Category nav */}
      <nav className={styles.categoryNav}>
        <div className={`container ${styles.categoryNavInner}`}>
          <div
            className={styles.categoryDropdownTrigger}
            onMouseEnter={() => setShowCategoryMenu(true)}
            onMouseLeave={() => setShowCategoryMenu(false)}
          >
            <span>☰ All Categories</span>
            {showCategoryMenu && (
              <div className={styles.categoryDropdown}>
                <div className={styles.dropdownSection}>
                  <div className={styles.dropdownTitle}>CATEGORIES</div>
                  {CATEGORIES.map(c => (
                    <Link key={c.href} href={c.href} className={styles.dropdownItem}>{c.label}</Link>
                  ))}
                </div>
                <div className={styles.dropdownSection}>
                  <div className={styles.dropdownTitle}>BRANDS</div>
                  {BRANDS.map(b => (
                    <Link key={b.href} href={b.href} className={styles.dropdownItem}>{b.label}</Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          {CATEGORIES.map(c => (
            <Link key={c.href} href={c.href} className={styles.categoryNavLink}>{c.label}</Link>
          ))}
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className={styles.mobileMenu}>
          <div className={styles.mobileMenuHeader}>
            <span className={styles.mobileMenuTitle}>Menu</span>
            <button onClick={() => setMobileMenuOpen(false)}>✕</button>
          </div>
          <div className={styles.mobileContactSection}>
            <a href={`tel:${primaryPhoneRaw}`} className={styles.mobileCallBtn}>
              📞 Call: {primaryPhone}
            </a>
            {secondaryPhoneRaw && (
              <a href={`tel:${secondaryPhoneRaw}`} className={styles.mobileCallBtn} style={{ background: '#15803d' }}>
                📞 Alt: {secondaryPhone}
              </a>
            )}
            <a
              href={getWhatsAppSupportUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mobileWhatsappBtn}
            >
              💬 Chat on WhatsApp (+{whatsappNumber})
            </a>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.mobileLocationBtn}
            >
              📍 Store Location (Google Maps)
            </a>
          </div>
          <div className={styles.ownerMobileSection}>
            <Link href="/owner-portal/login" className={styles.ownerMobileBtn}>
              👑 Owner Portal
            </Link>
            <Link href="/owner-portal/products/add" className={styles.ownerMobileAddBtn}>
              + Add Phone
            </Link>
          </div>
          <hr className="divider" />
          {CATEGORIES.map(c => (
            <Link key={c.href} href={c.href} className={styles.mobileMenuItem}>{c.label}</Link>
          ))}
          <hr className="divider" />
          {BRANDS.map(b => (
            <Link key={b.href} href={b.href} className={styles.mobileMenuItem}>{b.label}</Link>
          ))}
        </div>
      )}
    </>
  );
}

