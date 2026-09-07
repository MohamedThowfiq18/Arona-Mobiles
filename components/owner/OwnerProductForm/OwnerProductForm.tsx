'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';
import { showToast } from '@/components/customer/Toast/Toast';
import type { Product } from '@/lib/types';
import styles from './OwnerProductForm.module.css';

interface Props {
  mode: 'add' | 'edit';
  product?: Product;
}

const BRANDS = ['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme', 'Vivo', 'Google', 'Motorola', 'Nothing', 'Other'];
const GRADES = ['A', 'B', 'C'] as const;

const REAL_PHONE_PRESETS = [
  { name: 'iPhone 15 Pro Titanium', url: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800' },
  { name: 'Samsung S24 Ultra', url: 'https://images.unsplash.com/photo-1706438374239-42dd864bde9a?w=800' },
  { name: 'OnePlus 12 Emerald', url: 'https://images.unsplash.com/photo-1598327105854-c8674faddf79?w=800' },
  { name: 'Google Pixel 8a', url: 'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800' },
  { name: 'Xiaomi 14 Leica', url: 'https://images.unsplash.com/photo-1574944985070-8f3ebc6b79d2?w=800' },
  { name: 'iPhone 14 Midnight', url: 'https://images.unsplash.com/photo-1664478546384-d57ffe74a78c?w=800' },
  { name: 'Realme 12 Pro+', url: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800' },
  { name: 'Nothing Phone', url: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800' },
];

const defaultSpecs = {
  display: '',
  processor: '',
  ram: '',
  storage_built: '',
  battery: '',
  charging: '',
  camera: '',
  os: '',
  '5g': false,
};

export default function OwnerProductForm({ mode, product }: Props) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Basic info
  const [brand, setBrand] = useState(product?.brand || '');
  const [model, setModel] = useState(product?.model || '');
  const [shortDesc, setShortDesc] = useState(product?.short_description || '');
  const [condition, setCondition] = useState<'new' | 'pre-owned'>(product?.condition || 'new');
  const [grade, setGrade] = useState<'A' | 'B' | 'C' | ''>(product?.grade || '');

  // Pricing
  const [price, setPrice] = useState(String(product?.price || ''));
  const [discountPrice, setDiscountPrice] = useState(String(product?.discount_price || ''));
  const [stock, setStock] = useState(String(product?.stock || ''));

  // Images
  const [images, setImages] = useState<string[]>(product?.images || []);
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Specs
  const [specs, setSpecs] = useState<Record<string, any>>((product?.specs as any) || defaultSpecs);

  // Flags
  const [isFeatured, setIsFeatured] = useState(product?.is_featured ?? true);
  const [isActive, setIsActive] = useState(product?.is_active ?? true);
  const [flashSaleEnds, setFlashSaleEnds] = useState(product?.flash_sale_ends_at ? product.flash_sale_ends_at.slice(0, 16) : '');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  // Upload real image files to Supabase Storage (product-images) or local backend
  const uploadFiles = async (files: File[]) => {
    if (!files.length) return;
    const remainingSlots = 5 - images.length;
    if (remainingSlots <= 0) {
      showToast({ type: 'error', title: 'Maximum 5 images allowed' });
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);
    setUploading(true);

    try {
      const supabase = getSupabaseClient();
      const newUrls: string[] = [];

      for (const file of filesToUpload) {
        // Validate type
        if (!file.type.startsWith('image/')) {
          showToast({ type: 'error', title: 'Invalid format', message: `${file.name} is not an image file.` });
          continue;
        }
        // Validate size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
          showToast({ type: 'error', title: 'File too large', message: `${file.name} exceeds 5MB limit.` });
          continue;
        }

        let uploadedUrl: string | null = null;

        // 1. Try uploading to Supabase Storage bucket: product-images
        try {
          const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
          const fileName = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;
          const filePath = `phones/${fileName}`;

          const { data, error } = await supabase.storage
            .from('product-images')
            .upload(filePath, file, { cacheControl: '3600', upsert: true });

          if (!error && data) {
            const { data: { publicUrl } } = supabase.storage
              .from('product-images')
              .getPublicUrl(data.path);
            uploadedUrl = publicUrl;
          }
        } catch {
          // Supabase storage not connected / fallback
        }

        // 2. Fallback to /api/owner/upload
        if (!uploadedUrl) {
          const formData = new FormData();
          formData.append('file', file);

          const res = await fetch('/api/owner/upload', {
            method: 'POST',
            body: formData,
          });

          const data = await res.json();
          if (res.ok && data.success) {
            uploadedUrl = data.url || (Array.isArray(data.urls) ? data.urls[0] : null);
          }
        }

        if (uploadedUrl) {
          newUrls.push(uploadedUrl);
        }
      }

      if (newUrls.length > 0) {
        setImages(prev => [...prev, ...newUrls]);
        showToast({
          type: 'success',
          title: 'Photo uploaded!',
          message: `${newUrls.length} image${newUrls.length > 1 ? 's' : ''} saved to product media.`,
        });
      }
    } catch (err: unknown) {
      showToast({
        type: 'error',
        title: 'Upload failed',
        message: err instanceof Error ? err.message : 'Please try again',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
      if (cameraInputRef.current) cameraInputRef.current.value = '';
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    uploadFiles(files);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files || []);
    uploadFiles(files);
  };

  const addImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    if (images.length >= 5) {
      showToast({ type: 'error', title: 'Maximum 5 images allowed' });
      return;
    }
    setImages(prev => [...prev, url]);
    setImageUrlInput('');
    showToast({ type: 'success', title: 'Image URL added!' });
  };

  const removeImage = (url: string) => setImages(prev => prev.filter(i => i !== url));

  const setAsMainImage = (index: number) => {
    if (index === 0) return;
    setImages(prev => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
    showToast({ type: 'success', title: 'Main picture updated!' });
  };

  const handleSave = async () => {
    if (!brand || !model || !price || !stock) {
      showToast({
        type: 'error',
        title: 'Required fields missing',
        message: 'Brand, model, price, and stock are required.',
      });
      return;
    }

    setSaving(true);
    try {
      const primaryImage = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1598327105854-c8674faddf79?w=600';
      const allImages = images.length > 0 ? images : [primaryImage];

      const payload = {
        brand,
        model,
        short_description: shortDesc || null,
        condition,
        grade: condition === 'pre-owned' ? (grade || null) : null,
        price: Number(price),
        discount_price: discountPrice ? Number(discountPrice) : null,
        stock: Number(stock),
        image_url: primaryImage,
        images: allImages,
        specs,
        is_featured: isFeatured,
        is_active: isActive,
        flash_sale_ends_at: flashSaleEnds ? new Date(flashSaleEnds).toISOString() : null,
      };

      // 1. Direct Supabase write
      try {
        const supabase = getSupabaseClient();
        if (mode === 'add') {
          await supabase.from('products').insert(payload);
        } else if (product?.id) {
          await supabase.from('products').update(payload).eq('id', product.id);
        }
      } catch (sbErr) {
        console.warn('Direct client Supabase write failed:', sbErr);
      }

      // 2. Server API write
      const url = mode === 'add' ? '/api/owner/products' : `/api/owner/products/${product!.id}`;
      const res = await fetch(url, {
        method: mode === 'add' ? 'POST' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save product');
      }

      showToast({
        type: 'success',
        title: mode === 'add' ? 'Phone added successfully!' : 'Phone updated!',
        message: 'It is now live across the customer store and owner portal.',
      });

      router.push('/owner-portal/products');
      router.refresh();
    } catch (e: unknown) {
      showToast({
        type: 'error',
        title: 'Save failed',
        message: e instanceof Error ? e.message : 'Please try again',
      });
    } finally {
      setSaving(false);
    }
  };

  const formatPreviewPrice = (val: string) => {
    const num = Number(val);
    if (isNaN(num) || !num) return '₹0';
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(num);
  };

  return (
    <div className={styles.form}>
      <div className={styles.grid}>
        {/* Left column */}
        <div className={styles.leftCol}>
          {/* Basic Info */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Basic Information</h2>
            <div className={styles.row}>
              <div className="form-group">
                <label className="form-label">Brand *</label>
                <select className="form-input form-select" value={brand} onChange={e => setBrand(e.target.value)}>
                  <option value="">Select brand</option>
                  {BRANDS.map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Model Name *</label>
                <input
                  className="form-input"
                  value={model}
                  onChange={e => setModel(e.target.value)}
                  placeholder="e.g. iPhone 15 Pro Max / Galaxy S24 Ultra"
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Short Description</label>
              <textarea
                className="form-input"
                rows={2}
                value={shortDesc}
                onChange={e => setShortDesc(e.target.value)}
                placeholder="Highlight key features (e.g. Titanium design, 200MP camera, 120Hz display)"
              />
            </div>

            <div className={styles.row}>
              <div className="form-group">
                <label className="form-label">Condition *</label>
                <select
                  className="form-input form-select"
                  value={condition}
                  onChange={e => setCondition(e.target.value as 'new' | 'pre-owned')}
                >
                  <option value="new">New</option>
                  <option value="pre-owned">Certified Pre-Owned</option>
                </select>
              </div>
              {condition === 'pre-owned' && (
                <div className="form-group">
                  <label className="form-label">Grade</label>
                  <select
                    className="form-input form-select"
                    value={grade}
                    onChange={e => setGrade(e.target.value as 'A' | 'B' | 'C' | '')}
                  >
                    <option value="">Select grade</option>
                    {GRADES.map(g => (
                      <option key={g} value={g}>Grade {g}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>

          {/* Pricing & Stock */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Pricing & Inventory</h2>
            <div className={styles.row3}>
              <div className="form-group">
                <label className="form-label">MRP / Base Price (₹) *</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  value={price}
                  onChange={e => setPrice(e.target.value)}
                  placeholder="e.g. 129999"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Sale Price (₹)</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  value={discountPrice}
                  onChange={e => setDiscountPrice(e.target.value)}
                  placeholder="Leave blank if no discount"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Stock Qty *</label>
                <input
                  className="form-input"
                  type="number"
                  min="0"
                  value={stock}
                  onChange={e => setStock(e.target.value)}
                  placeholder="e.g. 25"
                />
              </div>
            </div>
            {discountPrice && price && Number(discountPrice) < Number(price) && (
              <div className={styles.discountPreview}>
                ✅ {Math.round(((Number(price) - Number(discountPrice)) / Number(price)) * 100)}% discount applied to customers
              </div>
            )}
          </div>

          {/* Specs */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Specifications</h2>
            <div className={styles.row}>
              {[
                { key: 'display', label: 'Display' },
                { key: 'processor', label: 'Processor / Chipset' },
                { key: 'ram', label: 'RAM' },
                { key: 'storage_built', label: 'Built-in Storage' },
                { key: 'battery', label: 'Battery' },
                { key: 'charging', label: 'Charging Speed' },
                { key: 'camera', label: 'Main Camera' },
                { key: 'os', label: 'Operating System' },
              ].map(s => (
                <div key={s.key} className="form-group">
                  <label className="form-label">{s.label}</label>
                  <input
                    className="form-input"
                    value={String(specs[s.key] || '')}
                    onChange={e => setSpecs(prev => ({ ...prev, [s.key]: e.target.value }))}
                    placeholder={s.label}
                  />
                </div>
              ))}
            </div>
            <label className={styles.checkboxRow}>
              <input
                type="checkbox"
                checked={Boolean(specs['5g'])}
                onChange={e => setSpecs(prev => ({ ...prev, '5g': e.target.checked }))}
              />
              <span>5G Supported</span>
            </label>
          </div>
        </div>

        {/* Right column */}
        <div className={styles.rightCol}>
          {/* Images Section */}
          <div className={styles.section}>
            <div className={styles.sectionTitle}>
              <span>Product Pictures</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', fontWeight: 500 }}>
                {images.length}/5 images
              </span>
            </div>

            {/* Existing Image Thumbnails Grid */}
            {images.length > 0 && (
              <div className={styles.imageGrid}>
                {images.map((img, i) => (
                  <div key={img} className={styles.imageThumb} title={i === 0 ? 'Main Store Picture' : 'Click "Set Main" to make primary'}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img} alt={`Product ${i + 1}`} />
                    <button
                      type="button"
                      className={styles.removeImg}
                      onClick={() => removeImage(img)}
                      title="Remove picture"
                    >
                      ×
                    </button>
                    {i === 0 ? (
                      <span className={styles.mainImgBadge}>★ Main</span>
                    ) : (
                      <button
                        type="button"
                        className={styles.setMainBtn}
                        onClick={() => setAsMainImage(i)}
                        title="Set as main store picture"
                      >
                        Set Main
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Drag & Drop Upload Zone */}
            {images.length < 5 && (
              <div
                className={`${styles.uploadDropzone} ${isDragging ? styles.uploadDropzoneActive : ''}`}
                onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div style={{ fontSize: '1.8rem', marginBottom: '4px' }}>
                  {uploading ? '⏳' : '📷'}
                </div>
                <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--color-text)' }}>
                  {uploading ? 'Uploading Real Picture...' : 'Upload Real Phone Photos'}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--color-text-muted)', marginTop: '2px' }}>
                  Drag & drop here or click to browse files from device
                </div>

                <div className={styles.uploadButtonsRow} onClick={e => e.stopPropagation()}>
                  <button
                    type="button"
                    className={styles.uploadBtn}
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                  >
                    📁 Browse Files
                  </button>
                  <button
                    type="button"
                    className={styles.uploadBtn}
                    onClick={() => cameraInputRef.current?.click()}
                    disabled={uploading}
                    title="Open device camera to snap photo"
                  >
                    📸 Take Photo
                  </button>
                </div>

                {/* Hidden file inputs */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleFileInputChange}
                  disabled={uploading}
                />
                <input
                  ref={cameraInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  hidden
                  onChange={handleFileInputChange}
                  disabled={uploading}
                />
              </div>
            )}

            {/* URL input */}
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <input
                className="form-input"
                style={{ flex: 1, fontSize: '0.82rem' }}
                placeholder="Or paste image URL (https://...)"
                value={imageUrlInput}
                onChange={e => setImageUrlInput(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addImageUrl();
                  }
                }}
              />
              <button type="button" className="btn btn--secondary btn--sm" onClick={addImageUrl}>
                Add
              </button>
            </div>

            {/* Quick Sample Presets */}
            <div style={{ marginTop: '12px', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', display: 'block', marginBottom: '6px' }}>
                Quick Real Phone Samples (1-Click Add):
              </span>
              <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                {REAL_PHONE_PRESETS.map(p => (
                  <button
                    key={p.name}
                    type="button"
                    className={styles.presetBtn}
                    onClick={() => {
                      if (images.length < 5 && !images.includes(p.url)) {
                        setImages(prev => [...prev, p.url]);
                        showToast({ type: 'success', title: `Added ${p.name} photo` });
                      }
                    }}
                  >
                    + {p.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Live Store Card Preview */}
          <div className={styles.previewSection}>
            <div className={styles.previewHeader}>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase', color: 'var(--color-text-muted)' }}>
                Storefront Live Preview
              </span>
              <span className={styles.previewBadge}>Customer View</span>
            </div>
            <div className={styles.previewCardInner}>
              <div className={styles.previewImgWrap}>
                {images[0] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={images[0]} alt="Phone Preview" />
                ) : (
                  <div style={{ fontSize: '2.5rem' }}>📱</div>
                )}
                {discountPrice && price && Number(discountPrice) < Number(price) && (
                  <span
                    style={{
                      position: 'absolute',
                      top: 8,
                      left: 8,
                      background: '#ef4444',
                      color: '#fff',
                      fontSize: '10px',
                      fontWeight: 700,
                      padding: '2px 6px',
                      borderRadius: '4px',
                    }}
                  >
                    ⚡ SALE
                  </span>
                )}
              </div>
              <div className={styles.previewInfo}>
                <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>
                  {brand || 'Brand'}
                </div>
                <div style={{ fontSize: '0.95rem', fontWeight: 700, margin: '2px 0 6px 0', color: 'var(--color-text)' }}>
                  {model || 'Phone Model Name'}
                </div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-accent)' }}>
                    {formatPreviewPrice(discountPrice || price)}
                  </span>
                  {discountPrice && price && Number(discountPrice) < Number(price) && (
                    <span style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', textDecoration: 'line-through' }}>
                      {formatPreviewPrice(price)}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Listing Settings */}
          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Listing Visibility</h2>

            <label className={styles.toggleRow}>
              <div className={styles.toggleLabel}>
                <div className={styles.toggleTitle}>Active Listing</div>
                <div className={styles.toggleSubtitle}>Visible on customer store</div>
              </div>
              <input
                type="checkbox"
                className={styles.toggleInput}
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
                id="active-toggle"
              />
            </label>

            <label className={styles.toggleRow}>
              <div className={styles.toggleLabel}>
                <div className={styles.toggleTitle}>Featured Phone</div>
                <div className={styles.toggleSubtitle}>Shown on homepage featured section</div>
              </div>
              <input
                type="checkbox"
                className={styles.toggleInput}
                checked={isFeatured}
                onChange={e => setIsFeatured(e.target.checked)}
                id="featured-toggle"
              />
            </label>

            <div className="form-group" style={{ marginTop: '12px' }}>
              <label className="form-label">Flash Sale Ends At (optional)</label>
              <input
                className="form-input"
                type="datetime-local"
                value={flashSaleEnds}
                onChange={e => setFlashSaleEnds(e.target.value)}
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className={styles.actions}>
            <button type="button" className="btn btn--ghost" onClick={() => router.back()} disabled={saving}>
              Cancel
            </button>
            <button
              id="save-product-btn"
              type="button"
              className="btn btn--primary btn--lg"
              onClick={handleSave}
              disabled={saving || uploading}
            >
              {saving ? 'Saving...' : mode === 'add' ? '+ Add Phone to Store' : 'Save Changes'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
