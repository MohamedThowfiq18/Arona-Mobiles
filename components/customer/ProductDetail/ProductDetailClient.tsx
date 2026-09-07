'use client';

import { useState } from 'react';
import Link from 'next/link';
import type { Product, Review, ProductQA, ProductVariant } from '@/lib/types';
import ProductCard from '@/components/customer/ProductCard/ProductCard';
import CartProvider, { useCart } from '@/components/customer/CartProvider/CartProvider';
import { STORE_CONFIG, getWhatsAppInquiryUrl } from '@/lib/constants';
import styles from './ProductDetailClient.module.css';

interface Props {
  product: Product;
  reviews: Review[];
  qa: ProductQA[];
  similar: Product[];
}

function formatPrice(price: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR', maximumFractionDigits: 0,
  }).format(price);
}

function Stars({ rating }: { rating: number }) {
  return (
    <span>
      {Array.from({ length: 5 }, (_, i) => (
        <span key={i} style={{ color: i < Math.round(rating) ? '#F59E0B' : '#D1D5DB' }}>★</span>
      ))}
    </span>
  );
}

function ProductDetailInner({ product, reviews, qa, similar }: Props) {
  const { addToCart } = useCart();
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | undefined>(
    product.variants?.[0]
  );
  const [activeImage, setActiveImage] = useState(0);
  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState<'specs' | 'reviews' | 'qa'>('specs');

  const displayPrice = selectedVariant?.discount_price ?? selectedVariant?.price
    ?? product.discount_price ?? product.price;
  const originalPrice = selectedVariant?.price ?? product.price;
  const hasDiscount = displayPrice < originalPrice;
  const discount = hasDiscount ? Math.round(((originalPrice - displayPrice) / originalPrice) * 100) : 0;
  const stock = selectedVariant?.stock ?? product.stock;
  const isLow = stock > 0 && stock <= 5;

  // EMI calculation (0% EMI simulation)
  const emi6 = Math.round(displayPrice / 6);
  const emi12 = Math.round(displayPrice / 12);

  const rawImages = [
    product.image_url,
    ...(product.images || []),
    ...(selectedVariant?.images || []),
  ].filter(Boolean) as string[];
  const images = Array.from(new Set(rawImages));

  return (
    <div className="container">
      {/* Breadcrumb */}
      <div className={styles.breadcrumb}>
        <Link href="/">Home</Link> ›{' '}
        <Link href="/shop">Shop</Link> ›{' '}
        <Link href={`/shop?brand=${product.brand.toLowerCase()}`}>{product.brand}</Link> ›{' '}
        <span>{product.model}</span>
      </div>

      {/* Main layout */}
      <div className={styles.main}>
        {/* Left: images */}
        <div className={styles.gallery}>
          <div className={styles.mainImageWrap}>
            {images.length > 0 ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={images[activeImage] || images[0]}
                alt={`${product.brand} ${product.model}`}
                className={styles.mainImage}
              />
            ) : (
              <div className={styles.imagePlaceholder}>📱</div>
            )}
            {product.condition === 'pre-owned' && product.grade && (
              <div className={styles.gradeTag}>
                Grade {product.grade} — {product.grade === 'A' ? 'Like New' : product.grade === 'B' ? 'Good' : 'Fair'}
              </div>
            )}
          </div>
          {images.length > 1 && (
            <div className={styles.thumbRow}>
              {images.map((img, i) => (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  key={i}
                  src={img}
                  alt=""
                  className={`${styles.thumb} ${i === activeImage ? styles.thumbActive : ''}`}
                  onClick={() => setActiveImage(i)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right: info */}
        <div className={styles.info}>
          <div className={styles.brandBadge}>{product.brand}</div>
          <h1 className={styles.title}>{product.model}</h1>
          {product.short_description && (
            <p className={styles.shortDesc}>{product.short_description}</p>
          )}

          {/* Rating */}
          {product.review_count > 0 && (
            <div className={styles.ratingRow}>
              <span className={styles.ratingScore}>★ {product.average_rating.toFixed(1)}</span>
              <Stars rating={product.average_rating} />
              <a href="#reviews" className={styles.ratingCount}>
                {product.review_count.toLocaleString('en-IN')} ratings
              </a>
              <span className={styles.pipe}>|</span>
              <span className={styles.soldCount}>{product.sold_count} sold</span>
            </div>
          )}

          <hr className="divider" />

          {/* Price */}
          <div className={styles.priceBlock}>
            <span className={styles.price}>{formatPrice(displayPrice)}</span>
            {hasDiscount && (
              <>
                <span className={styles.priceOld}>{formatPrice(originalPrice)}</span>
                <span className={styles.discount}>{discount}% off</span>
              </>
            )}
          </div>

          {/* EMI */}
          <div className={styles.emiRow}>
            <span className={styles.emiLabel}>EMI from</span>
            <span className={styles.emiValue}>{formatPrice(emi6)}/mo</span>
            <span className={styles.emiLabel}>(6 months)</span>
            <span className={styles.emiSep}>·</span>
            <span className={styles.emiValue}>{formatPrice(emi12)}/mo</span>
            <span className={styles.emiLabel}>(12 months)</span>
          </div>

          {/* Variants — Color */}
          {product.variants && product.variants.length > 0 && (
            <>
              {/* Unique colors */}
              {[...new Set(product.variants.map(v => v.color))].length > 1 && (
                <div className={styles.variantSection}>
                  <div className={styles.variantLabel}>
                    Color: <strong>{selectedVariant?.color}</strong>
                  </div>
                  <div className={styles.variantChips}>
                    {[...new Set(product.variants.map(v => v.color))].map(color => (
                      <button
                        key={color}
                        className={`${styles.variantChip} ${selectedVariant?.color === color ? styles.variantChipActive : ''}`}
                        onClick={() => {
                          const v = product.variants.find(x => x.color === color && x.storage === selectedVariant?.storage)
                            || product.variants.find(x => x.color === color);
                          setSelectedVariant(v);
                          setActiveImage(0);
                        }}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Unique storages */}
              {[...new Set(product.variants.map(v => v.storage))].length > 1 && (
                <div className={styles.variantSection}>
                  <div className={styles.variantLabel}>Storage:</div>
                  <div className={styles.variantChips}>
                    {[...new Set(product.variants.map(v => v.storage))].map(storage => {
                      const v = product.variants.find(x => x.storage === storage && x.color === selectedVariant?.color)
                        || product.variants.find(x => x.storage === storage);
                      if (!v) return null;
                      return (
                        <button
                          key={storage}
                          className={`${styles.variantChip} ${selectedVariant?.storage === storage ? styles.variantChipActive : ''}`}
                          onClick={() => setSelectedVariant(v)}
                        >
                          {storage}
                          {v.discount_price && (
                            <span className={styles.variantPrice}>{formatPrice(v.discount_price)}</span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Stock */}
          <div className={styles.stockRow}>
            {stock === 0 ? (
              <span className={styles.outOfStock}>❌ Out of Stock</span>
            ) : isLow ? (
              <span className={styles.lowStock}>⚡ Only {stock} left in stock — order soon!</span>
            ) : (
              <span className={styles.inStock}>✅ In Stock</span>
            )}
          </div>

          {/* Quantity */}
          <div className={styles.qtyRow}>
            <span className={styles.qtyLabel}>Qty:</span>
            <div className="qty-stepper">
              <button className="qty-stepper__btn" onClick={() => setQty(q => Math.max(1, q - 1))}>−</button>
              <span className="qty-stepper__value">{qty}</span>
              <button className="qty-stepper__btn" onClick={() => setQty(q => Math.min(stock, q + 1))} disabled={qty >= stock}>+</button>
            </div>
          </div>

          {/* CTA buttons */}
          <div className={styles.ctaButtons}>
            <button
              className="btn btn--primary btn--lg"
              disabled={stock === 0}
              onClick={() => addToCart(product, selectedVariant)}
              id="add-to-cart-btn"
            >
              🛒 Add to Cart
            </button>
            <Link
              href="/checkout"
              className="btn btn--secondary btn--lg"
              onClick={() => addToCart(product, selectedVariant)}
              id="buy-now-btn"
            >
              Reserve &amp; Pick Up
            </Link>
          </div>

          {/* Call & WhatsApp Quick Buy Row */}
          <div className={styles.quickContactSection}>
            <div className={styles.quickContactTitle}>Direct Store Inquiry &amp; Instant Booking:</div>
            <div className={styles.quickContactGrid}>
              <a
                href={`tel:${STORE_CONFIG.phoneRaw}`}
                className={styles.detailCallBtn}
                title="Call store directly"
                id="product-call-buy-btn"
              >
                <span>📞</span> Call to Buy ({STORE_CONFIG.phone})
              </a>
              <a
                href={getWhatsAppInquiryUrl(
                  `${product.brand} ${product.model}`,
                  displayPrice,
                  [selectedVariant?.color, selectedVariant?.storage].filter(Boolean).join(' / ')
                )}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.detailWhatsappBtn}
                title="Chat with store on WhatsApp"
                id="product-whatsapp-inquiry-btn"
              >
                <span>💬</span> WhatsApp Inquiry
              </a>
            </div>
          </div>

          {/* In-Store Pickup Card */}
          <div className={styles.pickupCard}>
            <div className={styles.pickupHeader}>
              <span className={styles.pickupIcon}>🏪</span>
              <div>
                <div className={styles.pickupTitle}>In-Store Pickup Available Today</div>
                <div className={styles.pickupSubtitle}>
                  Visit ARONA MOBILES Store · {STORE_CONFIG.address.line1}
                </div>
              </div>
            </div>
            <div className={styles.pickupDetails}>
              <div className={styles.pickupDetailItem}>
                <span className={styles.pickupCheck}>✓</span>
                <span>Inspect and test phone hands-on before payment</span>
              </div>
              <div className={styles.pickupDetailItem}>
                <span className={styles.pickupCheck}>✓</span>
                <span>Free data transfer and screen guard installation in store</span>
              </div>
              <div className={styles.pickupDetailItem}>
                <span className={styles.pickupCheck}>✓</span>
                <span>Store Hours: {STORE_CONFIG.hours.shortHours}</span>
              </div>
            </div>
          </div>

          {/* Highlights */}
          <div className={styles.highlights}>
            <div className={styles.highlightItem}>🛡️ 100% Genuine Warranty</div>
            <div className={styles.highlightItem}>🏪 Ready for Store Pickup</div>
            <div className={styles.highlightItem}>💵 Pay at Store or Online</div>
            <div className={styles.highlightItem}>🔧 Expert Store Support</div>
          </div>
        </div>
      </div>

      {/* Tabs: Specs / Reviews / Q&A */}
      <div className={styles.tabs}>
        <div className={styles.tabBar}>
          {(['specs', 'reviews', 'qa'] as const).map(tab => (
            <button
              key={tab}
              className={`${styles.tabBtn} ${activeTab === tab ? styles.tabActive : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab === 'specs' ? 'Specifications' : tab === 'reviews' ? `Reviews (${reviews.length})` : 'Q&A'}
            </button>
          ))}
        </div>

        {/* Specs */}
        {activeTab === 'specs' && product.specs && (
          <div className={styles.tabContent}>
            <table className="data-table">
              <tbody>
                {Object.entries(product.specs).map(([key, val]) => (
                  val !== undefined && (
                    <tr key={key}>
                      <td className={styles.specKey}>{key.replace(/_/g, ' ').replace('5g', '5G')}</td>
                      <td>{String(val === true ? 'Yes' : val === false ? 'No' : val)}</td>
                    </tr>
                  )
                ))}
              </tbody>
            </table>

            {/* Pre-owned inspection report */}
            {product.condition === 'pre-owned' && product.inspection_report && (
              <div className={styles.inspectionReport}>
                <h3 className={styles.inspectionTitle}>🔍 8-Point Inspection Report</h3>
                <div className={styles.inspectionGrid}>
                  {Object.entries(product.inspection_report).map(([key, val]) => (
                    val && (
                      <div key={key} className={styles.inspectionItem}>
                        <span className={styles.inspectionCheck}>✅</span>
                        <div>
                          <div className={styles.inspectionKey}>{key.replace(/_/g, ' ')}</div>
                          <div className={styles.inspectionVal}>{String(val)}</div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviews */}
        {activeTab === 'reviews' && (
          <div id="reviews" className={styles.tabContent}>
            {reviews.length === 0 ? (
              <div className={styles.emptyTab}>
                <p>No reviews yet. Be the first to review this product!</p>
              </div>
            ) : (
              <div className={styles.reviewList}>
                <div className={styles.reviewSummary}>
                  <div className={styles.reviewScore}>{product.average_rating.toFixed(1)}</div>
                  <Stars rating={product.average_rating} />
                  <div className={styles.reviewTotal}>{product.review_count} ratings</div>
                </div>
                {reviews.map(r => (
                  <div key={r.id} className={styles.reviewCard}>
                    <div className={styles.reviewHeader}>
                      <Stars rating={r.rating} />
                      {r.verified_purchase && (
                        <span className={styles.verifiedTag}>✅ Verified Purchase</span>
                      )}
                    </div>
                    {r.title && <div className={styles.reviewTitle}>{r.title}</div>}
                    <p className={styles.reviewComment}>{r.comment}</p>
                    <div className={styles.reviewMeta}>
                      <span>{r.user?.name || 'Anonymous'}</span>
                      <span>·</span>
                      <span>{new Date(r.created_at).toLocaleDateString('en-IN')}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Q&A */}
        {activeTab === 'qa' && (
          <div className={styles.tabContent}>
            {qa.length === 0 ? (
              <div className={styles.emptyTab}>
                <p>No questions yet. Ask a question below!</p>
              </div>
            ) : (
              <div className={styles.qaList}>
                {qa.map(q => (
                  <div key={q.id} className={styles.qaItem}>
                    <div className={styles.qaQuestion}>❓ {q.question}</div>
                    {q.answer && (
                      <div className={styles.qaAnswer}>
                        <span className={styles.qaAnswerLabel}>💬 Arona Mobiles:</span> {q.answer}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Similar Products */}
      {similar.length > 0 && (
        <section className={`section ${styles.similar}`}>
          <h2 className="section-title">Similar Products</h2>
          <div className={styles.similarGrid}>
            {similar.map(p => <ProductCard key={p.id} product={p} />)}
          </div>
        </section>
      )}
    </div>
  );
}

export default function ProductDetailClient(props: Props) {
  return (
    <CartProvider>
      <ProductDetailInner {...props} />
    </CartProvider>
  );
}
