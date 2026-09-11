'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Accessory, Product } from '@/lib/types';
import { useStoreSettings } from '@/components/customer/StoreSettingsProvider/StoreSettingsProvider';
import { useCart } from '@/components/customer/CartProvider/CartProvider';
import { showToast } from '@/components/customer/Toast/Toast';
import AccessoryCard from '@/components/customer/AccessoryCard/AccessoryCard';
import styles from './AccessoryDetail.module.css';

interface Props {
  accessory: Accessory;
  similarAccessories: Accessory[];
}

function formatPrice(p: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);
}

export default function AccessoryDetailClient({ accessory, similarAccessories }: Props) {
  const { addToCart } = useCart();
  const { primaryPhoneRaw, getWhatsAppInquiryUrl } = useStoreSettings();

  const allImages = accessory.images && accessory.images.length > 0 
    ? accessory.images 
    : (accessory.image_url ? [accessory.image_url] : []);
  
  const [selectedImage, setSelectedImage] = useState<string>(allImages[0] || '');
  const [adding, setAdding] = useState(false);

  const displayPrice = accessory.discount_price ?? accessory.price;
  const hasDiscount = Boolean(accessory.original_price && accessory.original_price > displayPrice);
  const discountPercent = accessory.discount_percent || (hasDiscount ? Math.round(((accessory.original_price! - displayPrice) / accessory.original_price!) * 100) : 0);
  const isOutOfStock = accessory.stock === 0;

  const handleAddToCart = () => {
    if (isOutOfStock || adding) return;
    setAdding(true);

    const cartProduct: Product = {
      id: accessory.id,
      brand: accessory.brand,
      model: accessory.name,
      variant: accessory.color || 'Standard',
      price: accessory.price,
      discount_price: accessory.discount_price,
      stock: accessory.stock,
      image_url: accessory.image_url || allImages[0] || '',
      images: allImages,
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

    addToCart(cartProduct);
    setTimeout(() => setAdding(false), 800);
  };

  return (
    <div className="container">
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link> › <Link href="/accessories">Accessories</Link> › <Link href={`/accessories?category=${encodeURIComponent(accessory.category)}`}>{accessory.category}</Link> › <span>{accessory.name}</span>
      </div>

      {/* Main Product Layout */}
      <div className={styles.detailGrid}>
        {/* Gallery */}
        <div className={styles.gallery}>
          <div className={styles.mainImageWrap}>
            {selectedImage ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={selectedImage} alt={accessory.name} className={styles.mainImage} />
            ) : (
              <div className={styles.imagePlaceholder}>🔌</div>
            )}
          </div>

          {allImages.length > 1 && (
            <div className={styles.thumbRow}>
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`${styles.thumbBtn} ${selectedImage === img ? styles.thumbActive : ''}`}
                  onClick={() => setSelectedImage(img)}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className={styles.thumbImg} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Info Column */}
        <div className={styles.infoCol}>
          <div className={styles.brandRow}>
            <span className={styles.brand}>{accessory.brand}</span>
            <span className={styles.categoryBadge}>{accessory.category}</span>
            {accessory.model_sku && (
              <span className={styles.skuBadge}>SKU: {accessory.model_sku}</span>
            )}
          </div>

          <h1 className={styles.title}>{accessory.name}</h1>

          {/* Rating */}
          <div className={styles.ratingRow}>
            <span className={styles.ratingBadge}>★ {accessory.average_rating.toFixed(1)}</span>
            <span className={styles.ratingCount}>{accessory.review_count} Customer Ratings</span>
            <span className={styles.ratingDivider}>•</span>
            <span className={styles.inStockBadge}>{accessory.stock > 0 ? '✓ In Stock at Store' : 'Out of Stock'}</span>
          </div>

          {/* Price Box */}
          <div className={styles.priceBox}>
            <div className={styles.priceRow}>
              <span className={styles.currentPrice}>{formatPrice(displayPrice)}</span>
              {hasDiscount && accessory.original_price && (
                <>
                  <span className={styles.oldPrice}>{formatPrice(accessory.original_price)}</span>
                  <span className={styles.discountBadge}>⚡ {discountPercent}% OFF</span>
                </>
              )}
            </div>
            {accessory.offer && (
              <div className={styles.offerTag}>🎉 {accessory.offer}</div>
            )}
          </div>

          {/* Compatibility */}
          {accessory.compatibility && (
            <div className={styles.featureBox}>
              <span className={styles.featureLabel}>Compatibility:</span>
              <span className={styles.featureValue}>{accessory.compatibility}</span>
            </div>
          )}

          {/* Color */}
          {accessory.color && (
            <div className={styles.featureBox}>
              <span className={styles.featureLabel}>Color:</span>
              <span className={styles.featureValue}>{accessory.color}</span>
            </div>
          )}

          {/* Description */}
          {accessory.description && (
            <div className={styles.descriptionBlock}>
              <h3 className={styles.subHeading}>Product Overview</h3>
              <p className={styles.description}>{accessory.description}</p>
            </div>
          )}

          {/* Specs */}
          {accessory.specs && Object.keys(accessory.specs).length > 0 && (
            <div className={styles.specsBlock}>
              <h3 className={styles.subHeading}>Key Specifications</h3>
              <div className={styles.specsTable}>
                {Object.entries(accessory.specs).map(([key, val]) => (
                  <div key={key} className={styles.specRow}>
                    <span className={styles.specKey}>{key.replace(/_/g, ' ')}</span>
                    <span className={styles.specVal}>{String(val)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className={styles.actionsBox}>
            <button
              className={`btn btn--primary btn--lg ${styles.buyBtn} ${adding ? styles.adding : ''}`}
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              type="button"
            >
              {adding ? '✓ Added to Cart!' : isOutOfStock ? 'Out of Stock' : '🛒 Add to Cart'}
            </button>

            <div className={styles.contactRow}>
              <a href={`tel:${primaryPhoneRaw}`} className={`btn btn--secondary ${styles.callBtn}`}>
                📞 Call Store to Reserve
              </a>
              <a
                href={getWhatsAppInquiryUrl(accessory.name, displayPrice)}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.whatsappBtn}
              >
                💬 WhatsApp Chat
              </a>
            </div>
          </div>

          {/* Store Service Highlights */}
          <div className={styles.highlightsGrid}>
            <div className={styles.highlightItem}>
              <span>🏪</span>
              <div>
                <strong>In-Store Pickup</strong>
                <p>Pick up immediately at our store</p>
              </div>
            </div>
            <div className={styles.highlightItem}>
              <span>🛡️</span>
              <div>
                <strong>100% Genuine</strong>
                <p>Official manufacturer warranty</p>
              </div>
            </div>
            <div className={styles.highlightItem}>
              <span>✨</span>
              <div>
                <strong>Free Fitment</strong>
                <p>Free installation for cases & glass</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Similar Accessories Section */}
      {similarAccessories.length > 0 && (
        <section className={styles.similarSection}>
          <div className={styles.similarHeader}>
            <h2 className="section-title">Similar Accessories</h2>
            <Link href={`/accessories?category=${encodeURIComponent(accessory.category)}`} className={styles.viewMore}>
              View All {accessory.category} →
            </Link>
          </div>
          <div className={styles.similarGrid}>
            {similarAccessories.map(a => (
              <AccessoryCard key={a.id} accessory={a} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
