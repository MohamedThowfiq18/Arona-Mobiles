import React, { useState } from 'react';
import { X, ShieldCheck, BatteryCharging, CheckCircle2, MessageSquare, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';
import { Product } from '../types';
import { getWhatsAppUrl } from '../config/business';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenExchange: () => void;
}

export const ProductModal: React.FC<ProductModalProps> = ({ product, onClose, onOpenExchange }) => {
  if (!product) return null;

  const [activeImageIdx, setActiveImageIdx] = useState(0);
  const isUsed = product.condition === 'used';

  // Dynamic WhatsApp pre-filled message
  const waMessage = isUsed
    ? `Hi ARONA MOBILES, I am viewing the Pre-Owned ${product.brand} ${product.name} (${product.storage}, Grade ${product.grade}, Battery ${product.batteryHealth}%). Price: ₹${product.sellingPrice.toLocaleString()}. Please share actual physical photos and store pickup details.`
    : `Hi ARONA MOBILES, I am viewing the New ${product.brand} ${product.name} (${product.storage}, ${product.color}). Price: ₹${product.sellingPrice.toLocaleString()}. Please share current store availability and best price.`;

  const waUrl = getWhatsAppUrl(waMessage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-black/80 backdrop-blur-xl overflow-y-auto animate-in fade-in duration-200">
      
      <div className="relative w-full max-w-4xl bg-[#0d0f17] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-8 my-auto overflow-hidden text-left">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all z-20"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Image Gallery Stage */}
          <div className="lg:col-span-5 space-y-4">
            <div className="relative aspect-square glass-panel rounded-2xl p-6 flex items-center justify-center border-white/10 overflow-hidden">
              <img
                src={product.images[activeImageIdx] || product.images[0]}
                alt={product.name}
                className="max-h-full max-w-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.8)]"
              />
              
              {/* Badge Overlay */}
              <div className="absolute top-4 left-4">
                {isUsed ? (
                  <span className="px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500/40 text-purple-300 text-xs font-mono font-bold uppercase flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    Grade {product.grade} Pre-Owned
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-mono font-bold uppercase flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" />
                    Brand New Box Pack
                  </span>
                )}
              </div>
            </div>

            {/* Thumbnail Selectors */}
            {product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {product.images.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setActiveImageIdx(idx)}
                    className={`w-16 h-16 rounded-xl border p-1 glass-panel transition-all ${
                      activeImageIdx === idx ? 'border-blue-500 ring-2 ring-blue-500/30 scale-105' : 'border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} alt="thumbnail" className="w-full h-full object-contain" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Product Specifications & Report */}
          <div className="lg:col-span-7 space-y-6">
            
            <div>
              <div className="text-xs font-mono text-blue-400 uppercase font-bold tracking-widest">
                {product.brand}
              </div>
              <h2 className="font-heading font-black text-2xl sm:text-3xl text-white">
                {product.name}
              </h2>
              <div className="text-sm text-slate-300 font-medium mt-1">
                {product.storage} {product.ram && `• ${product.ram}`} • Color: <span className="text-white font-semibold">{product.color}</span>
              </div>
            </div>

            {/* Price & Offer Box */}
            <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 flex items-center justify-between">
              <div>
                <div className="text-xs text-slate-400 line-through">MRP: ₹ {product.mrp.toLocaleString()}</div>
                <div className="font-heading font-black text-3xl text-emerald-400">
                  ₹ {(product.offerPrice || product.sellingPrice).toLocaleString()}
                </div>
              </div>
              <div className="text-right space-y-1">
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-mono font-bold block">
                  In Stock & Ready
                </span>
                {product.emiMonthlyStarting && (
                  <span className="text-xs text-slate-300 font-medium block">
                    EMI starts at <strong className="text-blue-400">₹{product.emiMonthlyStarting}/mo</strong>
                  </span>
                )}
              </div>
            </div>

            {/* PRE-OWNED 8-POINT CONDITION REPORT (Requirement #14 & #15) */}
            {isUsed && product.conditionReport && (
              <div className="space-y-3 bg-purple-950/20 border border-purple-500/30 p-4 rounded-2xl">
                <div className="flex items-center justify-between border-b border-purple-500/20 pb-2">
                  <h4 className="font-heading font-bold text-sm text-purple-300 uppercase flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-purple-400" />
                    ARONA Transparent Inspection Report
                  </h4>
                  <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
                    <BatteryCharging className="w-3.5 h-3.5" />
                    {product.batteryHealth}% Battery Health
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  <div className="bg-black/30 p-2 rounded-lg">
                    <span className="text-slate-400 font-mono">Display:</span> <span className="text-white font-medium">{product.conditionReport.display}</span>
                  </div>
                  <div className="bg-black/30 p-2 rounded-lg">
                    <span className="text-slate-400 font-mono">Frame:</span> <span className="text-white font-medium">{product.conditionReport.frame}</span>
                  </div>
                  <div className="bg-black/30 p-2 rounded-lg">
                    <span className="text-slate-400 font-mono">Back Glass:</span> <span className="text-white font-medium">{product.conditionReport.backGlass}</span>
                  </div>
                  <div className="bg-black/30 p-2 rounded-lg">
                    <span className="text-slate-400 font-mono">Camera:</span> <span className="text-white font-medium">{product.conditionReport.cameraLens}</span>
                  </div>
                  <div className="bg-black/30 p-2 rounded-lg">
                    <span className="text-slate-400 font-mono">Speakers:</span> <span className="text-white font-medium">{product.conditionReport.speaker}</span>
                  </div>
                  <div className="bg-black/30 p-2 rounded-lg">
                    <span className="text-slate-400 font-mono">Repair History:</span> <span className="text-emerald-400 font-medium">{product.conditionReport.repairHistory}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-300 pt-1">
                  {product.boxAvailable && <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Box Included</span>}
                  {product.billAvailable && <span className="flex items-center gap-1 text-emerald-400"><CheckCircle2 className="w-3.5 h-3.5" /> Retail GST Bill</span>}
                  <span>Warranty: <strong className="text-white">{product.warrantyInfo}</strong></span>
                </div>
              </div>
            )}

            {/* Specifications Summary */}
            <div className="space-y-2">
              <h4 className="font-heading font-bold text-sm text-white uppercase tracking-wider">Key Specifications</h4>
              <div className="grid grid-cols-2 gap-2 text-xs text-slate-300">
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-slate-400 font-mono block text-[10px]">DISPLAY</span>
                  <span className="font-medium text-white">{product.specifications.screen}</span>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-slate-400 font-mono block text-[10px]">PROCESSOR</span>
                  <span className="font-medium text-white">{product.specifications.processor}</span>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-slate-400 font-mono block text-[10px]">CAMERA</span>
                  <span className="font-medium text-white">{product.specifications.camera}</span>
                </div>
                <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                  <span className="text-slate-400 font-mono block text-[10px]">BATTERY</span>
                  <span className="font-medium text-white">{product.specifications.battery}</span>
                </div>
              </div>
            </div>

            {/* CTAs */}
            <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <a
                href={waUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3.5 px-6 rounded-2xl bg-emerald-500 text-white font-heading font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/25 hover:bg-emerald-400 transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>INQUIRE ON WHATSAPP</span>
              </a>

              <button
                onClick={() => {
                  onClose();
                  onOpenExchange();
                }}
                className="py-3.5 px-6 rounded-2xl bg-white/5 border border-white/15 text-white font-heading font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-white/10 hover:border-white/30 transition-all"
              >
                <RefreshCw className="w-4 h-4 text-emerald-400" />
                <span>EXCHANGE YOUR OLD PHONE</span>
              </button>
            </div>

          </div>

        </div>

      </div>

    </div>
  );
};
