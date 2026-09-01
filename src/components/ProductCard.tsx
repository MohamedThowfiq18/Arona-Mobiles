import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, MessageSquare, ArrowUpRight, BatteryCharging, CheckCircle2, Sparkles } from 'lucide-react';
import { Product } from '../types';
import { getWhatsAppUrl } from '../config/business';

interface ProductCardProps {
  product: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const isUsed = product.condition === 'used';
  const discountPct = Math.round(((product.mrp - product.sellingPrice) / product.mrp) * 100);

  const waMessage = isUsed
    ? `Hi ARONA MOBILES, I am interested in the Pre-Owned ${product.brand} ${product.name} (${product.storage}, Grade ${product.grade}, Battery ${product.batteryHealth}%). Listed at ₹${product.sellingPrice.toLocaleString()}. Please share actual photos.`
    : `Hi ARONA MOBILES, I am interested in the brand new ${product.brand} ${product.name} (${product.storage}, ${product.color}). Listed at ₹${product.sellingPrice.toLocaleString()}. Please share best price and EMI options.`;

  const waUrl = getWhatsAppUrl(waMessage);

  return (
    <div className="clean-card rounded-3xl p-5 flex flex-col justify-between relative group text-left">
      
      {/* Top Header Tags */}
      <div className="flex items-center justify-between gap-2 z-10 mb-3">
        {isUsed ? (
          <span className="px-2.5 py-1 rounded-full bg-purple-100 border border-purple-200 text-purple-800 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            PRE-OWNED {product.grade && `GRADE ${product.grade}`}
          </span>
        ) : (
          <span className="px-2.5 py-1 rounded-full bg-blue-100 border border-blue-200 text-blue-800 text-[11px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            BRAND NEW
          </span>
        )}

        {discountPct > 0 && (
          <span className="px-2 py-0.5 rounded-full bg-red-100 text-red-700 border border-red-200 text-[10px] font-mono font-bold">
            {discountPct}% OFF
          </span>
        )}
      </div>

      {/* Product Image Stage */}
      <Link 
        to={`/product/${product.id}`}
        className="relative my-2 py-4 h-48 flex items-center justify-center cursor-pointer group-hover:scale-105 transition-transform duration-500"
      >
        <img 
          src={product.images[0]} 
          alt={product.name}
          className="max-h-full max-w-full object-contain drop-shadow-md" 
        />
      </Link>

      {/* Specs & Details */}
      <div className="space-y-3 pt-2">
        
        <div>
          <div className="text-[11px] font-mono font-semibold text-slate-500 uppercase tracking-widest">
            {product.brand}
          </div>
          <Link 
            to={`/product/${product.id}`}
            className="font-heading font-bold text-lg text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1 block"
          >
            {product.name}
          </Link>
          <div className="text-xs text-slate-600 font-medium">
            {product.storage} {product.ram && `• ${product.ram}`} • {product.color}
          </div>
        </div>

        {/* Pre-Owned Metrics */}
        {isUsed && (
          <div className="bg-purple-50/70 border border-purple-100 rounded-xl p-2.5 space-y-1 text-xs">
            <div className="flex items-center justify-between font-mono">
              <span className="text-purple-800 flex items-center gap-1 font-semibold">
                <BatteryCharging className="w-3.5 h-3.5 text-emerald-600" />
                Battery Health:
              </span>
              <strong className="text-emerald-700 font-bold">{product.batteryHealth}%</strong>
            </div>
            <div className="flex items-center gap-3 text-[11px] text-slate-600 font-medium">
              {product.boxAvailable && <span className="flex items-center gap-1 text-emerald-700"><CheckCircle2 className="w-3 h-3" /> Box</span>}
              {product.billAvailable && <span className="flex items-center gap-1 text-emerald-700"><CheckCircle2 className="w-3 h-3" /> GST Bill</span>}
              <span>Warranty: {product.warrantyInfo}</span>
            </div>
          </div>
        )}

        {/* Pricing Row */}
        <div className="pt-2 flex items-baseline justify-between border-t border-slate-100">
          <div>
            <span className="text-xs text-slate-400 line-through mr-2">₹ {product.mrp.toLocaleString()}</span>
            <span className="font-heading font-black text-xl text-slate-900">
              ₹ {(product.offerPrice || product.sellingPrice).toLocaleString()}
            </span>
          </div>

          {product.emiMonthlyStarting && (
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-mono">EMI from</div>
              <div className="text-xs font-bold text-blue-600">₹{product.emiMonthlyStarting}/mo</div>
            </div>
          )}
        </div>

      </div>

      {/* Bottom Action Buttons */}
      <div className="grid grid-cols-2 gap-2 pt-4 mt-2">
        <Link
          to={`/product/${product.id}`}
          className="w-full py-2.5 rounded-xl bg-slate-100 border border-slate-200 text-slate-800 hover:bg-slate-200 text-xs font-heading font-bold uppercase transition-all flex items-center justify-center gap-1"
        >
          <span>Details</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </Link>

        <a
          href={waUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition-all text-xs font-heading font-bold uppercase flex items-center justify-center gap-1.5 shadow-sm"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Get Price</span>
        </a>
      </div>

    </div>
  );
};
