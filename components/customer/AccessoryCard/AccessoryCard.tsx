'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { Accessory, Product } from '@/lib/types';
import { useStoreSettings } from '@/components/customer/StoreSettingsProvider/StoreSettingsProvider';
import styles from './AccessoryCard.module.css';

interface Props {
  accessory: Accessory;
  onAddToCart?: (product: Product) => void;
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(price);
}

export default function AccessoryCard({ accessory, onAddToCart }: Props) {
  const { primaryPhoneRaw, getWhatsAppInquiryUrl } = useStoreSettings();
  const [adding, setAdding] = useState(false);

  const displayPrice = accessory.discount_price ?? accessory.price;
  const hasDiscount = Boolean(accessory.original_price && accessory.original_price > displayPrice);
  const discountPercent = accessory.discount_percent || (hasDiscount ? Math.round(((accessory.original_price! - displayPrice) / accessory.original_price!) * 100) : 0);
  const isLowStock = accessory.stock > 0 && accessory.stock <= 5;
  const isOutOfStock = accessory.stock === 0;

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isOutOfStock || adding) return;
    setAdding(true);

    // Convert accessory to Product structure for Cart compatibility
    const cartProduct: Product = {
      id: accessory.id,
      brand: accessory.brand,
      model: accessory.name,
      variant: accessory.color || 'Standard',
      price: accessory.price,
      discount_price: accessory.discount_price,
      stock: accessory.stock,
      image_url: accessory.image_url || accessory.images?.[0] || '',
      images: accessory.images || [],
      condition: 'new',
      is_active: accessory.is_active,
      is_featured: accessory.is_featured,
      specs: accessory.specs || {},
      variants: [],
      tags: accessory.tags || ['accessory'],
      average_rating: accessory.average_rating,
      review_count: accessory.review_count,
      sold_count: accessory.sold_count,
      slug: accessory.id,
      created_at: accessory.created_at,
      updated_at: accessory.updated_at,
    };

    onAddToCart?.(cartProduct);
    setTimeout(() => setAdding(false), 1000);
  };

  return (
    <div className={styles.card} tabIndex={0}>
      {/* Image Wrap */}
      <div className={styles.imageContainer}>
        <Link href={`/accessory/${accessory.id}`} className={styles.imageWrap} tabIndex={-1}>
          {(accessory.image_url || accessory.images?.[0]) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={accessory.image_url || accessory.images[0]}
              alt={accessory.name}
              className={styles.image}
              loading="lazy"
            />
          ) : (
            <span className={styles.imagePlaceholder}>🔌</span>
          )}
        </Link>

        {/* Badges */}
        <div className={styles.badges}>
          {hasDiscount && discountPercent > 0 && (
            <span className={`badge ${styles.saleBadge}`}>⚡ {discountPercent}% OFF</span>
          )}
          {accessory.is_featured && (
            <span className={`badge ${styles.featuredBadge}`}>⭐ Top Pick</span>
          )}
        </div>
      </div>

      {/* Info Container */}
      <div className={styles.info}>
        <div className={styles.categoryHeader}>
          <span className={styles.brandName}>{accessory.brand}</span>
          <span className={styles.categoryBadge}>{accessory.category}</span>
        </div>

        <Link href={`/accessory/${accessory.id}`} className={styles.nameLink}>
          <h3 className={styles.name}>{accessory.name}</h3>
        </Link>

        {/* Compatibility info chip */}
        {accessory.compatibility && (
          <div className={styles.compatibilityChip} title={accessory.compatibility}>
            <span>🔌 {accessory.compatibility}</span>
          </div>
        )}

        {/* Rating */}
        {accessory.review_count > 0 && (
          <div className={styles.rating}>
            <span className={styles.ratingBadge}>★ {accessory.average_rating.toFixed(1)}</span>
            <span className={styles.ratingCount}>({accessory.review_count})</span>
          </div>
        )}

        {/* Price Row */}
        <div className={styles.priceRow}>
          <span className={styles.price}>{formatPrice(displayPrice)}</span>
          {hasDiscount && accessory.original_price && (
            <>
              <span className={styles.priceOld}>{formatPrice(accessory.original_price)}</span>
              <span className={styles.discountText}>{discountPercent}% off</span>
            </>
          )}
        </div>

        {/* Stock & Urgency */}
        {isLowStock && (
          <div className={styles.stockWarning}>⚡ Only {accessory.stock} left in store!</div>
        )}
        {isOutOfStock && (
          <div className={styles.outOfStock}>Out of Stock</div>
        )}

        {/* Action Buttons */}
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
              title={`Call store to inquire about ${accessory.name}`}
              aria-label="Call to Buy"
            >
              📞 Call
            </a>
            <a
              href={getWhatsAppInquiryUrl(accessory.name, displayPrice)}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.whatsappBtn}
              title="Chat on WhatsApp about this accessory"
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
