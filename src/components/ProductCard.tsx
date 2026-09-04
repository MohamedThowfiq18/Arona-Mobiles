'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  ShoppingBag, 
  Heart, 
  Layers, 
  ShieldCheck, 
  Star, 
  Sparkles, 
  Check, 
  Eye,
  Battery
} from 'lucide-react';
import { Product } from '@/types';
import { useCartStore } from '@/store/useCartStore';
import { useWishlistStore } from '@/store/useWishlistStore';
import { useCompareStore } from '@/store/useCompareStore';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const [hovered, setHovered] = useState(false);
  const { addItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { toggleCompare, isInCompare } = useCompareStore();

  const isLiked = isInWishlist(product.id);
  const isCompared = isInCompare(product.id);

  const displayImage = hovered && product.images[1] ? product.images[1] : product.images[0];

  return (
    <div 
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="glass-card rounded-2xl p-4 flex flex-col justify-between relative group transition-all duration-300 hover:-translate-y-1.5"
    >
      {/* Top Badges */}
      <div className="flex items-center justify-between z-10 mb-2">
        <div>
          {product.condition === 'preowned' ? (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full badge-glow-preowned text-cyan-300 flex items-center gap-1 font-semibold">
              <ShieldCheck className="w-3 h-3 text-cyan-400" />
              Pre-Owned Grade {product.gradeIfPreowned}
            </span>
          ) : (
            <span className="text-[11px] font-mono px-2 py-0.5 rounded-full badge-glow-new text-blue-300 font-semibold">
              New Sealed
            </span>
          )}
        </div>

        {/* Wishlist & Compare Icons */}
        <div className="flex items-center space-x-1 opacity-90 group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => toggleCompare(product)}
            className={`p-2 rounded-xl transition-all ${
              isCompared 
                ? 'bg-cyan-500 text-slate-950 shadow-cyan-glow' 
                : 'bg-slate-900/80 border border-slate-700/60 text-slate-400 hover:text-cyan-400'
            }`}
            title="Compare Specs"
          >
            <Layers className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => toggleWishlist(product)}
            className={`p-2 rounded-xl transition-all ${
              isLiked 
                ? 'bg-pink-500 text-white shadow-lg' 
                : 'bg-slate-900/80 border border-slate-700/60 text-slate-400 hover:text-pink-400'
            }`}
            title="Save to Wishlist"
          >
            <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-current' : ''}`} />
          </button>
        </div>
      </div>

      {/* Product Image with Hover-Swap */}
      <Link href={`/product/${product.id}`} className="block relative mb-4 overflow-hidden rounded-xl bg-slate-950 group/img">
        <img
          src={displayImage}
          alt={product.model}
          className="w-full h-48 object-cover object-center transform group-hover/img:scale-105 transition-transform duration-500"
        />
        {product.badge && (
          <span className="absolute bottom-2 left-2 text-[10px] font-mono px-2 py-0.5 rounded bg-slate-950/80 text-amber-300 border border-amber-500/30">
            ⚡ {product.badge}
          </span>
        )}
      </Link>

      {/* Details */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono uppercase tracking-wider">{product.brand}</span>
          <div className="flex items-center gap-1 text-amber-400">
            <Star className="w-3 h-3 fill-current" />
            <span className="font-semibold">{product.rating}</span>
            <span className="text-[10px] text-slate-500">({product.reviewsCount})</span>
          </div>
        </div>

        <Link href={`/product/${product.id}`} className="block">
          <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors line-clamp-1">
            {product.model}
          </h3>
        </Link>

        {/* Specs highlight line */}
        <p className="text-xs text-slate-400 line-clamp-1 font-sans">
          {product.specs.display.split(',')[0]} • {product.specs.processor.split('(')[0]}
        </p>

        {/* Pre-Owned Battery Health Callout if applicable */}
        {product.inspectionReport && (
          <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono pt-0.5">
            <Battery className="w-3.5 h-3.5" />
            <span>Battery Health: <strong>{product.inspectionReport.batteryHealth}% Tested</strong></span>
          </div>
        )}

        {/* Price & Action */}
        <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-base font-bold font-mono text-cyan-400">
                ${product.price}
              </span>
              {product.originalPrice && (
                <span className="text-xs font-mono text-slate-500 line-through">
                  ${product.originalPrice}
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 block">
              or ${Math.round(product.price / 24)}/mo EMI
            </span>
          </div>

          <button
            onClick={() => addItem(product)}
            className="px-3 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-xs font-semibold shadow-glow transition-all flex items-center gap-1.5"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Add</span>
          </button>
        </div>
      </div>
    </div>
  );
}
