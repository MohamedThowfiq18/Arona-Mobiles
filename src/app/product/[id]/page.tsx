'use client';

import React, { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Heart, 
  Layers, 
  ShieldCheck, 
  Star, 
  Check, 
  Battery, 
  Truck, 
  RotateCcw, 
  Sparkles, 
  MessageSquare, 
  ChevronRight,
  ArrowLeft
} from 'lucide-react';
import { useProductStore } from '@/store/useProductStore';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCompareStore } from '@/store/useCompareStore';
import { ProductCard } from '@/components/ProductCard';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params?.id as string;

  const { products, addToast } = useProductStore();
  const product = products.find((p) => p.id === productId) || products[0];

  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { toggleCompare, isInCompare } = useCompareStore();

  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedStorage, setSelectedStorage] = useState(product?.variants[0]?.storage || '256GB');
  const [selectedColor, setSelectedColor] = useState(product?.variants[0]?.color || 'Default');
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '', name: '' });

  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Product Not Found</h2>
        <Link href="/shop" className="text-cyan-400 underline">Return to shop</Link>
      </div>
    );
  }

  const activeVariant = product.variants.find(
    (v) => v.storage === selectedStorage && v.color === selectedColor
  ) || product.variants[0] || {
    storage: 'Standard',
    color: 'Default',
    priceModifier: 0,
    stock: product.stock
  };

  const finalPrice = product.price + (activeVariant.priceModifier || 0);
  const isLiked = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  const relatedProducts = products
    .filter((p) => p.id !== product.id && (p.brand === product.brand || p.condition === product.condition))
    .slice(0, 4);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.comment.trim() || !newReview.name.trim()) return;

    addToast({
      type: 'success',
      title: '⭐ Review Submitted!',
      description: 'Thank you for sharing your experience with ARONA MOBILES.'
    });

    setReviewModalOpen(false);
    setNewReview({ rating: 5, comment: '', name: '' });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-16">
      
      {/* Back Navigation */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center gap-2 text-xs font-mono text-slate-400 hover:text-cyan-400 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Catalog
      </button>

      {/* Main Grid: Gallery & Product Info */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Column: Gallery */}
        <div className="lg:col-span-6 space-y-4 sticky top-24">
          
          <div className="glass-panel p-4 rounded-3xl border border-slate-800 relative overflow-hidden group">
            <img
              src={product.images[selectedImageIndex] || product.images[0]}
              alt={product.model}
              className="w-full h-96 sm:h-[450px] object-cover rounded-2xl bg-slate-950 transform group-hover:scale-102 transition-transform duration-500"
            />
            {product.badge && (
              <span className="absolute top-6 left-6 font-mono text-xs px-3 py-1 rounded-full bg-cyan-500 text-slate-950 font-bold shadow-cyan-glow">
                ⚡ {product.badge}
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all ${
                    idx === selectedImageIndex ? 'border-cyan-400 shadow-cyan-glow' : 'border-slate-800 opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover bg-slate-950" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Buying Options & Specs */}
        <div className="lg:col-span-6 space-y-6">
          
          {/* Header Info */}
          <div>
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-mono uppercase text-slate-400 font-semibold">{product.brand}</span>
              <div className="flex items-center gap-1.5 text-amber-400">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold text-sm">{product.rating}</span>
                <span className="text-slate-500">({product.reviewsCount} verified reviews)</span>
              </div>
            </div>

            <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
              {product.model}
            </h1>

            {/* Condition Badge */}
            <div className="mt-3 flex items-center gap-3">
              {product.condition === 'preowned' ? (
                <span className="px-3 py-1 rounded-full badge-glow-preowned text-cyan-300 font-mono text-xs font-bold inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Certified Pre-Owned Grade {product.gradeIfPreowned}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full badge-glow-new text-blue-300 font-mono text-xs font-bold">
                  Brand New Sealed
                </span>
              )}
              <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> In Stock ({activeVariant.stock} left)
              </span>
            </div>
          </div>

          {/* Pricing & EMI Calculation */}
          <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl font-extrabold font-mono text-cyan-400">
                ${finalPrice}
              </span>
              {product.originalPrice && (
                <span className="text-sm font-mono text-slate-500 line-through">
                  ${product.originalPrice}
                </span>
              )}
              <span className="text-xs font-mono text-emerald-400 ml-auto">
                Save ${ (product.originalPrice || finalPrice + 100) - finalPrice }
              </span>
            </div>

            <div className="text-xs text-slate-400 flex items-center gap-2 pt-1 border-t border-slate-800">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>Or <strong>${Math.round(finalPrice / 24)}/mo</strong> with 0% APR 24-month financing option</span>
            </div>
          </div>

          {/* Storage Capacity Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 font-mono">Select Storage</label>
            <div className="flex flex-wrap gap-2">
              {Array.from(new Set(product.variants.map((v) => v.storage))).map((storage) => {
                const isSelected = selectedStorage === storage;
                return (
                  <button
                    key={storage}
                    onClick={() => setSelectedStorage(storage)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                      isSelected
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-cyan-glow'
                        : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {storage}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Selector */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 font-mono">Select Color: <span className="text-cyan-400">{selectedColor}</span></label>
            <div className="flex flex-wrap gap-2">
              {product.variants.map((variant) => {
                const isSelected = selectedColor === variant.color;
                return (
                  <button
                    key={variant.color}
                    onClick={() => setSelectedColor(variant.color)}
                    className={`px-4 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-slate-800 text-white border-cyan-400 ring-1 ring-cyan-400'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:bg-slate-800'
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full border border-slate-700"
                      style={{ backgroundColor: variant.colorHex || '#3b82f6' }}
                    />
                    <span>{variant.color}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Main CTAs */}
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => addItem(product, activeVariant)}
              className="flex-1 py-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-bold text-sm shadow-glow transition-all flex items-center justify-center gap-2 group"
            >
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              <span>Add to Shopping Bag (${finalPrice})</span>
            </button>

            <button
              onClick={() => toggleWishlist(product)}
              className={`p-4 rounded-xl border transition-all ${
                isLiked ? 'bg-pink-500 text-white border-pink-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-pink-400'
              }`}
            >
              <Heart className={`w-5 h-5 ${isLiked ? 'fill-current' : ''}`} />
            </button>

            <button
              onClick={() => toggleCompare(product)}
              className={`p-4 rounded-xl border transition-all ${
                isCompared ? 'bg-cyan-500 text-slate-950 border-cyan-400' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-cyan-400'
              }`}
            >
              <Layers className="w-5 h-5" />
            </button>
          </div>

          {/* Pre-Owned Condition Report Card (If preowned) */}
          {product.inspectionReport && (
            <div className="glass-card p-6 rounded-3xl border border-cyan-500/30 space-y-4 bg-gradient-to-br from-slate-950 to-blue-950/20">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-cyan-400" />
                  Hardware 8-Point Inspection Report
                </h3>
                <span className="text-xs font-mono text-emerald-400 font-bold">100% Passed</span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Battery className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-300">Battery Health</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">{product.inspectionReport.batteryHealth}%</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-300">Display Grade</span>
                  <span className="font-mono font-bold text-cyan-400">{product.inspectionReport.screenGrade.split(' ')[1]}</span>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <label className="text-[11px] font-mono text-slate-400 uppercase">Verification Checklist</label>
                <div className="space-y-1 text-xs">
                  {product.inspectionReport.checklist.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between py-1 border-b border-slate-900">
                      <span className="text-slate-300 flex items-center gap-1.5">
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> {item.name}
                      </span>
                      <span className="font-mono text-slate-400">{item.score}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Technical Specs Table */}
          <div className="space-y-3 pt-4">
            <h3 className="text-base font-bold text-white font-display">Technical Specifications</h3>
            <div className="glass-card rounded-2xl overflow-hidden border border-slate-800 text-xs">
              <table className="w-full text-left">
                <tbody className="divide-y divide-slate-800/80">
                  <tr>
                    <td className="p-3 font-semibold text-slate-400 bg-slate-950/40 w-1/3">Display</td>
                    <td className="p-3 text-slate-200">{product.specs.display}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400 bg-slate-950/40">Processor</td>
                    <td className="p-3 text-slate-200">{product.specs.processor}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400 bg-slate-950/40">Camera Optics</td>
                    <td className="p-3 text-slate-200">{product.specs.camera}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400 bg-slate-950/40">Battery Capacity</td>
                    <td className="p-3 text-slate-200">{product.specs.battery}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400 bg-slate-950/40">Operating System</td>
                    <td className="p-3 text-slate-200">{product.specs.os}</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-semibold text-slate-400 bg-slate-950/40">Connectivity</td>
                    <td className="p-3 text-slate-200">{product.specs.connectivity}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <div className="pt-10 border-t border-slate-800 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-bold font-display text-white">Verified Customer Reviews</h3>
            <p className="text-xs text-slate-400">Based on {product.reviewsCount} verified purchases</p>
          </div>
          <button
            onClick={() => setReviewModalOpen(true)}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />
            Write a Review
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Alexander Chen</span>
              <span className="text-[10px] font-mono text-emerald-400">Verified Purchase</span>
            </div>
            <div className="flex text-amber-400 text-xs">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              "Phenomenal phone. Speed is insane, display is ultra bright even in direct sunlight, and ARONA MOBILES delivered it overnight!"
            </p>
          </div>

          <div className="glass-card p-5 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-white">Sarah Jenkins</span>
              <span className="text-[10px] font-mono text-emerald-400">Verified Purchase</span>
            </div>
            <div className="flex text-amber-400 text-xs">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-3.5 h-3.5 fill-current" />
              ))}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              "Condition was described accurately. 96% battery health and zero cosmetic scuffs. Saved $300 compared to brand new."
            </p>
          </div>
        </div>
      </div>

      {/* Related Products Carousel */}
      {relatedProducts.length > 0 && (
        <div className="space-y-6 pt-10 border-t border-slate-800">
          <h3 className="text-xl font-bold font-display text-white">Similar Flagship Recommendations</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}

      {/* Sticky Mobile Add-to-Cart Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-30 glass-panel p-4 border-t border-slate-800 flex items-center justify-between gap-4">
        <div>
          <span className="text-xs text-slate-400 block line-clamp-1">{product.model}</span>
          <span className="text-base font-bold font-mono text-cyan-400">${finalPrice}</span>
        </div>
        <button
          onClick={() => addItem(product, activeVariant)}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-xs shadow-glow"
        >
          Add to Cart
        </button>
      </div>

      {/* Write a Review Modal */}
      {reviewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold text-white font-display">Write a Verified Review</h3>
            <form onSubmit={handleReviewSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={newReview.name}
                  onChange={(e) => setNewReview({ ...newReview, name: e.target.value })}
                  placeholder="e.g. John Doe"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Rating</label>
                <select
                  value={newReview.rating}
                  onChange={(e) => setNewReview({ ...newReview, rating: Number(e.target.value) })}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-amber-400 focus:outline-none focus:border-cyan-500 font-mono"
                >
                  <option value={5}>⭐⭐⭐⭐⭐ (5/5) Excellent</option>
                  <option value={4}>⭐⭐⭐⭐ (4/5) Great</option>
                  <option value={3}>⭐⭐⭐ (3/5) Average</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Review Comment</label>
                <textarea
                  required
                  rows={3}
                  value={newReview.comment}
                  onChange={(e) => setNewReview({ ...newReview, comment: e.target.value })}
                  placeholder="Tell us about the phone's battery, condition, and performance..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setReviewModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-cyan-glow"
                >
                  Post Review
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
