'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { showToast } from '@/components/customer/Toast/Toast';
import type { Accessory, AccessoryCategory } from '@/lib/types';
import { INITIAL_ACCESSORY_CATEGORIES } from '@/lib/accessory-constants';
import styles from './OwnerAccessoryForm.module.css';

interface Props {
  mode: 'add' | 'edit';
  accessory?: Accessory;
  categories?: AccessoryCategory[];
}

const BRANDS = ['Apple', 'Samsung', 'boAt', 'Noise', 'Anker', 'Spigen', 'Stuffcool', 'Realme', 'OnePlus', 'Xiaomi', 'Portronics', 'Ambrane', 'Arona Guard', 'Other'];

export default function OwnerAccessoryForm({ mode, accessory, categories = INITIAL_ACCESSORY_CATEGORIES }: Props) {
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Form state
  const [name, setName] = useState(accessory?.name || '');
  const [brand, setBrand] = useState(accessory?.brand || 'Apple');
  const [category, setCategory] = useState(accessory?.category || 'Chargers');
  const [customCategory, setCustomCategory] = useState('');
  const [subcategory, setSubcategory] = useState(accessory?.subcategory || '');
  const [modelSku, setModelSku] = useState(accessory?.model_sku || '');
  
  // Pricing & Stock
  const [price, setPrice] = useState(String(accessory?.price || ''));
  const [originalPrice, setOriginalPrice] = useState(accessory?.original_price ? String(accessory.original_price) : '');
  const [offer, setOffer] = useState(accessory?.offer || '');
  const [stock, setStock] = useState(accessory?.stock !== undefined ? String(accessory.stock) : '10');

  // Details
  const [color, setColor] = useState(accessory?.color || '');
  const [compatibility, setCompatibility] = useState(accessory?.compatibility || '');
  const [description, setDescription] = useState(accessory?.description || '');

  // Specs
  const [specList, setSpecList] = useState<{ key: string; val: string }[]>(
    accessory?.specs
      ? Object.entries(accessory.specs).map(([key, val]) => ({ key, val: String(val) }))
      : [
          { key: 'warranty', val: '6 Months Store Warranty' },
          { key: 'port_type', val: 'Type-C' },
        ]
  );

  // Images
  const [images, setImages] = useState<string[]>(
    accessory?.images && accessory.images.length > 0 
      ? accessory.images 
      : (accessory?.image_url ? [accessory.image_url] : [])
  );
  const [imageUrlInput, setImageUrlInput] = useState('');

  // Status
  const [isFeatured, setIsFeatured] = useState(accessory?.is_featured ?? false);
  const [isActive, setIsActive] = useState(accessory?.is_active ?? true);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Photo upload to Supabase Storage
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
      const newUrls: string[] = [];
      for (const file of filesToUpload) {
        if (!file.type.startsWith('image/')) {
          showToast({ type: 'error', title: 'Invalid format', message: `${file.name} is not an image.` });
          continue;
        }

        const formData = new FormData();
        formData.append('file', file);
        formData.append('productId', accessory?.id || `acc-${Date.now()}`);

        const res = await fetch('/api/owner/upload', {
          method: 'POST',
          body: formData,
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || `Failed to upload ${file.name}`);
        }

        const uploadedUrl = data.url || (Array.isArray(data.urls) ? data.urls[0] : null);
        if (uploadedUrl) newUrls.push(uploadedUrl);
      }

      if (newUrls.length > 0) {
        setImages(prev => [...prev, ...newUrls]);
        showToast({
          type: 'success',
          title: 'Photo uploaded!',
          message: `${newUrls.length} image${newUrls.length > 1 ? 's' : ''} stored in Supabase Storage.`,
        });
      }
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Upload failed',
        message: err.message || 'Failed to upload photo to Supabase Storage.',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleAddImageUrl = () => {
    const url = imageUrlInput.trim();
    if (!url) return;
    if (images.length >= 5) {
      showToast({ type: 'error', title: 'Maximum 5 images allowed' });
      return;
    }
    setImages(prev => [...prev, url]);
    setImageUrlInput('');
    showToast({ type: 'success', title: 'Image URL added' });
  };

  const removeImage = (url: string) => setImages(prev => prev.filter(i => i !== url));

  const setAsMainImage = (index: number) => {
    if (index === 0) return;
    setImages(prev => {
      const copy = [...prev];
      const [selected] = copy.splice(index, 1);
      return [selected, ...copy];
    });
    showToast({ type: 'success', title: 'Main picture updated' });
  };

  const addSpecRow = () => {
    setSpecList(prev => [...prev, { key: '', val: '' }]);
  };

  const removeSpecRow = (idx: number) => {
    setSpecList(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSave = async () => {
    const finalCategory = category === 'CUSTOM' ? customCategory.trim() : category;

    if (!name.trim() || !brand.trim() || !finalCategory || !price || stock === '') {
      showToast({
        type: 'error',
        title: 'Required fields missing',
        message: 'Name, brand, category, price, and stock quantity are required.',
      });
      return;
    }

    setSaving(true);
    try {
      const primaryImage = images.length > 0 ? images[0] : 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800';
      const allImages = images.length > 0 ? images : [primaryImage];

      const specsObj: Record<string, string> = {};
      specList.forEach(s => {
        if (s.key.trim() && s.val.trim()) {
          specsObj[s.key.trim()] = s.val.trim();
        }
      });

      const numPrice = Number(price);
      const numOriginalPrice = originalPrice ? Number(originalPrice) : undefined;
      const discountPercent = numOriginalPrice && numOriginalPrice > numPrice
        ? Math.round(((numOriginalPrice - numPrice) / numOriginalPrice) * 100)
        : 0;

      const payload = {
        name: name.trim(),
        brand: brand.trim(),
        category: finalCategory,
        subcategory: subcategory.trim() || null,
        model_sku: modelSku.trim() || null,
        price: numPrice,
        original_price: numOriginalPrice ?? null,
        discount_price: numPrice,
        discount_percent: discountPercent,
        offer: offer.trim() || null,
        stock: Number(stock),
        color: color.trim() || null,
        compatibility: compatibility.trim() || null,
        description: description.trim() || null,
        specs: specsObj,
        images: allImages,
        image_url: primaryImage,
        is_featured: isFeatured,
        is_active: isActive,
        published: isActive,
        available: Number(stock) > 0 && isActive,
      };

      const url = mode === 'add' ? '/api/owner/accessories' : `/api/owner/accessories/${accessory?.id}`;
      const method = mode === 'add' ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to save accessory');
      }

      showToast({
        type: 'success',
        title: mode === 'add' ? 'Accessory created!' : 'Accessory updated!',
        message: `${name} saved to Supabase successfully.`,
      });

      router.push('/owner-portal/accessories');
      router.refresh();
    } catch (err: any) {
      showToast({
        type: 'error',
        title: 'Save failed',
        message: err.message || 'An error occurred while saving the accessory.',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.formContainer}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>{mode === 'add' ? '➕ Add New Accessory' : `✏️ Edit ${accessory?.name}`}</h1>
          <p className={styles.subtitle}>Manage accessory details, stock, pricing, and Supabase Storage photos</p>
        </div>
        <div className={styles.headerActions}>
          <button
            type="button"
            className="btn btn--secondary"
            onClick={() => router.push('/owner-portal/accessories')}
          >
            Cancel
          </button>
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? 'Saving...' : mode === 'add' ? 'Publish Accessory' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className={styles.sections}>
        {/* Section 1: Basic Info */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>1. Basic Information</h2>
          <div className={styles.grid2}>
            <div className="form-group">
              <label className="form-label">Accessory Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Apple 20W USB-C Power Adapter"
                value={name}
                onChange={e => setName(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Brand *</label>
              <input
                type="text"
                className="form-input"
                list="brand-suggestions"
                placeholder="e.g. Apple, Samsung, boAt"
                value={brand}
                onChange={e => setBrand(e.target.value)}
              />
              <datalist id="brand-suggestions">
                {BRANDS.map(b => <option key={b} value={b} />)}
              </datalist>
            </div>
          </div>

          <div className={styles.grid2}>
            <div className="form-group">
              <label className="form-label">Category *</label>
              <select
                className="form-input form-select"
                value={category}
                onChange={e => setCategory(e.target.value)}
              >
                {categories.map(c => (
                  <option key={c.name} value={c.name}>{c.icon || '🔌'} {c.name}</option>
                ))}
                <option value="CUSTOM">+ Custom Category</option>
              </select>
              {category === 'CUSTOM' && (
                <input
                  type="text"
                  className="form-input"
                  style={{ marginTop: 8 }}
                  placeholder="Enter custom category name"
                  value={customCategory}
                  onChange={e => setCustomCategory(e.target.value)}
                />
              )}
            </div>
            <div className="form-group">
              <label className="form-label">Subcategory / Type</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Power Adapters, MagSafe Cases"
                value={subcategory}
                onChange={e => setSubcategory(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.grid2}>
            <div className="form-group">
              <label className="form-label">Model / SKU Code</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. MHJE3HN/A, AIRDOPES-141"
                value={modelSku}
                onChange={e => setModelSku(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Color / Finish</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. White, Matte Black, Gunmetal"
                value={color}
                onChange={e => setColor(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Device Compatibility</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. iPhone 15/14/13, Samsung S24, Type-C devices"
              value={compatibility}
              onChange={e => setCompatibility(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description / Features</label>
            <textarea
              className="form-input"
              rows={3}
              placeholder="Detailed description of features, materials, warranty, etc."
              value={description}
              onChange={e => setDescription(e.target.value)}
            />
          </div>
        </div>

        {/* Section 2: Pricing, Stock & Offers */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>2. Pricing, Stock & Offers</h2>
          <div className={styles.grid3}>
            <div className="form-group">
              <label className="form-label">Selling Price (₹) *</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 1499"
                value={price}
                onChange={e => setPrice(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Original MSRP (₹)</label>
              <input
                type="number"
                className="form-input"
                placeholder="e.g. 1999 (for discount badge)"
                value={originalPrice}
                onChange={e => setOriginalPrice(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Stock Quantity *</label>
              <input
                type="number"
                className="form-input"
                placeholder="Units in stock"
                value={stock}
                onChange={e => setStock(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Special Offer Tag / Banner</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Special In-Store Offer, Free Cable Included"
              value={offer}
              onChange={e => setOffer(e.target.value)}
            />
          </div>

          <div className={styles.toggles}>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={isActive}
                onChange={e => setIsActive(e.target.checked)}
              />
              <span><strong>Published & Active</strong> (Visible to customers on website)</span>
            </label>
            <label className={styles.toggleLabel}>
              <input
                type="checkbox"
                checked={isFeatured}
                onChange={e => setIsFeatured(e.target.checked)}
              />
              <span><strong>Featured Top Pick</strong> (Prioritized in listings)</span>
            </label>
          </div>
        </div>

        {/* Section 3: Photos (Supabase Storage) */}
        <div className={styles.card}>
          <h2 className={styles.cardTitle}>3. Product Photos (Supabase Storage)</h2>
          
          <div
            className={`${styles.dropzone} ${isDragging ? styles.dropzoneActive : ''}`}
            onDragOver={e => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={e => {
              e.preventDefault();
              setIsDragging(false);
              const files = Array.from(e.dataTransfer.files || []);
              uploadFiles(files);
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={e => uploadFiles(Array.from(e.target.files || []))}
              multiple
              accept="image/*"
              style={{ display: 'none' }}
            />
            <span className={styles.uploadIcon}>📷</span>
            <div className={styles.uploadText}>
              <strong>Click to upload photos</strong> or drag & drop image files
            </div>
            <span className={styles.uploadSub}>Stored directly in Supabase Storage bucket (JPG, PNG, WEBP max 5MB)</span>
            {uploading && <div className={styles.uploadingMsg}>Uploading to Supabase Storage...</div>}
          </div>

          {/* Direct URL input */}
          <div className={styles.urlInputRow}>
            <input
              type="url"
              className={`form-input ${styles.urlInput}`}
              placeholder="Or paste an image URL..."
              value={imageUrlInput}
              onChange={e => setImageUrlInput(e.target.value)}
            />
            <button type="button" className="btn btn--secondary" onClick={handleAddImageUrl}>
              Add URL
            </button>
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className={styles.imageGrid}>
              {images.map((img, idx) => (
                <div key={idx} className={styles.imageCard}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={img} alt="" className={styles.previewImg} />
                  <div className={styles.imageMeta}>
                    {idx === 0 ? (
                      <span className={styles.primaryBadge}>★ Main Photo</span>
                    ) : (
                      <button
                        type="button"
                        className={styles.setMainBtn}
                        onClick={() => setAsMainImage(idx)}
                      >
                        Set as Main
                      </button>
                    )}
                    <button
                      type="button"
                      className={styles.deleteImgBtn}
                      onClick={() => removeImage(img)}
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Section 4: Specifications */}
        <div className={styles.card}>
          <div className={styles.cardHeaderFlex}>
            <h2 className={styles.cardTitle}>4. Technical Specifications</h2>
            <button type="button" className="btn btn--secondary btn--sm" onClick={addSpecRow}>
              ➕ Add Specification
            </button>
          </div>

          <div className={styles.specRows}>
            {specList.map((spec, idx) => (
              <div key={idx} className={styles.specInputRow}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Spec name (e.g. wattage, battery)"
                  value={spec.key}
                  onChange={e => {
                    const copy = [...specList];
                    copy[idx].key = e.target.value;
                    setSpecList(copy);
                  }}
                />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Value (e.g. 20W, 42 Hours)"
                  value={spec.val}
                  onChange={e => {
                    const copy = [...specList];
                    copy[idx].val = e.target.value;
                    setSpecList(copy);
                  }}
                />
                <button
                  type="button"
                  className="btn btn--ghost btn--sm"
                  onClick={() => removeSpecRow(idx)}
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
