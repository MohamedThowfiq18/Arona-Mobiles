'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import CartProvider from '@/components/customer/CartProvider/CartProvider';
import ProductCard from '@/components/customer/ProductCard/ProductCard';
import type { Product } from '@/lib/types';
import styles from './page.module.css';

const WISHLIST_KEY = 'arona_wishlist';

export default function WishlistPage() {
  const [wishlistedProducts, setWishlistedProducts] = useState<Product[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(WISHLIST_KEY) || '[]') as Product[];
      setWishlistedProducts(stored);
    } catch { setWishlistedProducts([]); }
  }, []);

  const remove = (id: string) => {
    const updated = wishlistedProducts.filter(p => p.id !== id);
    setWishlistedProducts(updated);
    localStorage.setItem(WISHLIST_KEY, JSON.stringify(updated));
  };

  return (
    <CartProvider>
      <div className="container">
        <div className={styles.page}>
          <div className={styles.header}>
            <h1 className={styles.title}>❤️ My Wishlist</h1>
            <span className={styles.count}>{wishlistedProducts.length} items</span>
          </div>

          {wishlistedProducts.length === 0 ? (
            <div className={styles.empty}>
              <span className={styles.emptyIcon}>❤️</span>
              <h2>Your wishlist is empty</h2>
              <p>Save products you love and come back to them anytime.</p>
              <Link href="/shop" className="btn btn--primary btn--lg">Browse Phones</Link>
            </div>
          ) : (
            <div className={styles.grid}>
              {wishlistedProducts.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  isWishlisted
                  onWishlistToggle={() => remove(p.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </CartProvider>
  );
}
