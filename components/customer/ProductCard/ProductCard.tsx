'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Product } from '@/lib/types';
import { useStoreSettings } from '@/components/customer/StoreSettingsProvider/StoreSettingsProvider';
import styles from './ProductCard.module.css';

interface Props {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onWishlistToggle?: (productId: string) => void;
  isWishlisted?: boolean;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(price);
}

function discountPercent(original: number, discounted: number) {
  return Math.round(((original - discounted) / original) * 100);
}

function StarRating({ rating, count }: { rating: number; count: number }) {
  return (
    <div className={styles.rating}>
      <span className={styles.ratingBadge}>
        ★ {rating.toFixed(1)}
      </span>
      <span className={styles.ratingCount}>({count.toLocaleString('en-IN')})</span>
    </div>
  );
}

export default function ProductCard({ product, onAddToCart, onWishlistToggle, isWishlisted = false }: Props) {
  const { primaryPhoneRaw, getWhatsAppInquiryUrl } = useStoreSettings();
  const [wishlisted, setWishlisted] = useState(isWishlisted);
  const [adding, setAdding] = useState(false);


  const displayPrice = product.discount_price ?? product.price;
  const hasDiscount = product.discount_price && product.discount_price < product.price;
  const discount = hasDiscount ? discountPercent(product.price, product.discount_price!) : 0;
  const isLowStock = product.stock > 0 && product.stock <= 5;
  const isOutOfStock = product.stock === 0;
  const isFlashSale = Boolean(product.flash_sale_ends_at && new Date(product.flash_sale_ends_at).getTime() > 0);

  const handleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setWishlisted(w => !w);
    onWishlistToggle?.(product.id);
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || adding) return;
    setAdding(true);
    onAddToCart?.(product);
    setTimeout(() => setAdding(false), 1000);
  };

  return (
    <div className={styles.card} tabIndex={0}>
      {/* Image */}
      <div className={styles.imageContainer}>
        <Link href={`/product/${product.id}`} className={styles.imageWrap} tabIndex={-1}>
          {(product.image_url || product.images?.[0]) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={product.image_url || product.images[0]}
              alt={`${product.brand} ${product.model}`}
              className={styles.image}
              loading="lazy"
            />
          ) : (
            <span className={styles.imagePlaceholder}>📱</span>
          )}
        </Link>

        {/* Badges */}
        <div className={styles.badges}>
          {isFlashSale && <span className={`badge badge--sale ${styles.badge}`}>⚡ SALE</span>}
          {product.condition === 'pre-owned' && (
            <span className={`badge badge--preowned ${styles.badge}`}>
              Certified {product.grade && `· Grade ${product.grade}`}
            </span>
          )}
          {product.is_featured && product.condition === 'new' && !isFlashSale && (
            <span className={`badge badge--new ${styles.badge}`}>Featured</span>
          )}
        </div>

        {/* Wishlist button */}
        <button
          className={`${styles.wishlistBtn} ${wishlisted ? styles.wishlisted : ''}`}
          onClick={handleWishlist}
          aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          title={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
          type="button"
        >
          {wishlisted ? '❤️' : '🤍'}
        </button>
      </div>

      {/* Info */}
      <div className={styles.info}>
        <div className={styles.brandName}>{product.brand}</div>
        <Link href={`/product/${product.id}`} className={styles.modelNameLink}>
          <h3 className={styles.modelName}>{product.model}</h3>
        </Link>

        {/* Specs chips */}
        {product.specs && (
          <div className={styles.specChips}>
            {product.specs.ram && <span className={styles.specChip}>{product.specs.ram} RAM</span>}
            {product.specs.battery && <span className={styles.specChip}>{product.specs.battery}</span>}
            {product.specs['5g'] && <span className={`${styles.specChip} ${styles.specChipFiveG}`}>5G</span>}
          </div>
        )}

        {/* Rating */}
        {product.review_count > 0 && (
          <StarRating rating={product.average_rating} count={product.review_count} />
        )}

        {/* Price */}
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(displayPrice)}</span>
          {hasDiscount && (
            <>
              <span className={styles.priceOld}>{formatPrice(product.price)}</span>
              <span className={styles.discount}>{discount}% off</span>
            </>
          )}
        </div>

        {/* Stock urgency */}
        {isLowStock && (
          <div className={styles.stockWarning}>⚡ Only {product.stock} left in stock!</div>
        )}
        {isOutOfStock && (
          <div className={styles.outOfStock}>Out of Stock</div>
        )}

        {/* Actions */}
        <div className={styles.cardActions}>
          <button
            className={`btn btn--primary btn--full ${styles.addToCart} ${adding ? styles.adding : ''}`}
            onClick={handleAddToCart}
            disabled={isOutOfStock}
            type="button"
          >
            {adding ? '✓ Added!' : isOutOfStock ? 'Out of Stock' : '🛒 Add to Cart'}
          </button>
          <div className={styles.contactRow}>
            <a
              href={`tel:${primaryPhoneRaw}`}
              className={styles.callBtn}
              title={`Call store to buy ${product.brand} ${product.model}`}
              aria-label="Call to Buy"
            >
              📞 Call
            </a>
            <a
              href={getWhatsAppInquiryUrl(`${product.brand} ${product.model}`, displayPrice)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappBtn}
              title="Chat on WhatsApp about this phone"
              aria-label="WhatsApp Inquiry"
            >
              💬 WhatsApp
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}
