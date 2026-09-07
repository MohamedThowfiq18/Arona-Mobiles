'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { CartItem, Coupon } from '@/lib/types';
import CartProvider, { useCart } from '@/components/customer/CartProvider/CartProvider';
import styles from './page.module.css';

function formatPrice(p: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);
}

function CartPageInner() {
  const { items, removeFromCart, updateQty, total, itemCount } = useCart();
  const [couponCode, setCouponCode] = useState('');
  const [couponDiscount, setCouponDiscount] = useState(0);
  const [couponError, setCouponError] = useState('');
  const [couponApplied, setCouponApplied] = useState('');

  const finalTotal = Math.max(0, total - couponDiscount);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    try {
      const res = await fetch(`/api/coupons/validate?code=${couponCode}&amount=${total}`);
      const data = await res.json();
      if (data.error) {
        setCouponError(data.error);
        setCouponDiscount(0);
        setCouponApplied('');
      } else {
        setCouponDiscount(data.discount);
        setCouponApplied(couponCode.toUpperCase());
        setCouponError('');
      }
    } catch {
      setCouponError('Failed to validate coupon. Try again.');
    }
  };

  if (items.length === 0) {
    return (
      <div className={styles.empty}>
        <div className={styles.emptyIcon}>🛒</div>
        <h1 className={styles.emptyTitle}>Your cart is empty</h1>
        <p className={styles.emptyDesc}>Looks like you haven&apos;t added anything yet.</p>
        <Link href="/shop" className="btn btn--primary btn--lg">Continue Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className={styles.pageTitle}>Shopping Cart ({itemCount} items)</h1>
      <div className={styles.layout}>
        {/* Items */}
        <div className={styles.items}>
          {items.map((item: CartItem) => {
            const key = `${item.product.id}::${item.selectedVariant?.color}::${item.selectedVariant?.storage}`;
            const price = item.selectedVariant?.discount_price ?? item.selectedVariant?.price
              ?? item.product.discount_price ?? item.product.price;
            const origPrice = item.selectedVariant?.price ?? item.product.price;

            return (
              <div key={key} className={styles.cartItem}>
                <div className={styles.cartItemImg}>
                  {item.product.images?.[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={item.product.images[0]} alt={item.product.model} />
                  ) : <span>📱</span>}
                </div>
                <div className={styles.cartItemInfo}>
                  <Link href={`/product/${item.product.id}`} className={styles.cartItemName}>
                    {item.product.brand} {item.product.model}
                  </Link>
                  {item.selectedVariant && (
                    <div className={styles.cartItemVariant}>
                      {item.selectedVariant.color} · {item.selectedVariant.storage}
                    </div>
                  )}
                  <div className={styles.cartItemPriceRow}>
                    <span className={styles.cartItemPrice}>{formatPrice(price)}</span>
                    {price < origPrice && (
                      <span className={styles.cartItemOld}>{formatPrice(origPrice)}</span>
                    )}
                  </div>
                  <div className={styles.cartItemActions}>
                    <div className="qty-stepper">
                      <button className="qty-stepper__btn"
                        onClick={() => updateQty(item.product.id, item.quantity - 1, key)}>−</button>
                      <span className="qty-stepper__value">{item.quantity}</span>
                      <button className="qty-stepper__btn"
                        onClick={() => updateQty(item.product.id, item.quantity + 1, key)}>+</button>
                    </div>
                    <button className={styles.removeBtn}
                      onClick={() => removeFromCart(item.product.id, key)}>
                      🗑 Remove
                    </button>
                    <Link href="/wishlist" className={styles.saveBtn}>❤️ Save for later</Link>
                  </div>
                </div>
                <div className={styles.cartItemTotal}>
                  {formatPrice(price * item.quantity)}
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className={styles.summary}>
          <div className={styles.summaryCard}>
            <h2 className={styles.summaryTitle}>Order Summary</h2>

            {/* Coupon */}
            <div className={styles.couponRow}>
              <input
                id="coupon-input"
                className="form-input"
                placeholder="Enter coupon code"
                value={couponCode}
                onChange={e => setCouponCode(e.target.value.toUpperCase())}
              />
              <button className="btn btn--secondary" onClick={applyCoupon}>Apply</button>
            </div>
            {couponError && <div className="form-error">{couponError}</div>}
            {couponApplied && (
              <div className={`alert alert--success`} style={{ marginTop: 8 }}>
                🎟 Coupon <strong>{couponApplied}</strong> applied! You save {formatPrice(couponDiscount)}.
              </div>
            )}

            <hr className="divider" />

            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}>
                <span>Subtotal ({itemCount} items)</span>
                <span>{formatPrice(total)}</span>
              </div>
              {couponDiscount > 0 && (
                <div className={`${styles.summaryRow} ${styles.discount}`}>
                  <span>Coupon Discount</span>
                  <span>− {formatPrice(couponDiscount)}</span>
                </div>
              )}
              <div className={styles.summaryRow}>
                <span>Store Pickup</span>
                <span className={styles.freeDelivery}>FREE</span>
              </div>
            </div>

            <hr className="divider" />

            <div className={`${styles.summaryRow} ${styles.total}`}>
              <span>Total Amount</span>
              <span>{formatPrice(finalTotal)}</span>
            </div>

            <Link
              href={`/checkout?discount=${couponDiscount}&coupon=${couponApplied}`}
              className="btn btn--primary btn--full btn--lg"
              id="proceed-to-checkout-btn"
              style={{ marginTop: 16 }}
            >
              Proceed to Reserve Phone →
            </Link>

            <div className={styles.safePayment}>
              🏪 In-Store Pickup &amp; Demo · Pay at store or online
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CartPage() {
  return (
    <CartProvider>
      <CartPageInner />
    </CartProvider>
  );
}
