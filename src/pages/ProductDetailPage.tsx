import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ShieldCheck, BatteryCharging, CheckCircle2, MessageSquare, Sparkles, RefreshCw, ArrowLeft } from 'lucide-react';
import { getStoredProducts } from '../data/productStore';
import { getWhatsAppUrl } from '../config/business';
import { Product } from '../types';

export const ProductDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [products, setProducts] = useState<Product[]>(getStoredProducts);
  const [activeImgIdx, setActiveImgIdx] = useState(0);

  useEffect(() => {
    const handleUpdate = () => setProducts(getStoredProducts());
    window.addEventListener('arona_products_updated', handleUpdate);
    return () => window.removeEventListener('arona_products_updated', handleUpdate);
  }, []);

  const product = products.find(p => p.id === id) || products[0];

  const isUsed = product.condition === 'used';
  const waMessage = isUsed
    ? `Hi ARONA MOBILES, I am interested in the Pre-Owned ${product.brand} ${product.name} (${product.storage}, Grade ${product.grade}, Battery ${product.batteryHealth}%). Listed at ₹${product.sellingPrice.toLocaleString()}. Please share actual photos.`
    : `Hi ARONA MOBILES, I am interested in the brand new ${product.brand} ${product.name} (${product.storage}, ${product.color}). Listed at ₹${product.sellingPrice.toLocaleString()}. Please share best price.`;

  const waUrl = getWhatsAppUrl(waMessage);

  return (
    <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
      
      {/* Back Button */}
      <Link 
        to={isUsed ? "/pre-owned" : "/new-mobiles"} 
        className="inline-flex items-center gap-2 text-xs font-heading font-bold text-slate-600 hover:text-slate-900"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to {isUsed ? "Pre-Owned Mobiles" : "New Mobiles"}</span>
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        
        {/* Left Gallery Stage */}
        <div className="lg:col-span-6 space-y-4">
          <div className="clean-card rounded-3xl p-8 flex items-center justify-center relative min-h-[380px]">
            <img
              src={product.images[activeImgIdx] || product.images[0]}
              alt={product.name}
              className="max-h-80 object-contain drop-shadow-lg"
            />

            <div className="absolute top-4 left-4">
              {isUsed ? (
                <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-800 border border-purple-200 text-xs font-mono font-bold uppercase flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-purple-600" /> Grade {product.grade} Pre-Owned
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-800 border border-blue-200 text-xs font-mono font-bold uppercase flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Brand New
                </span>
              )}
            </div>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImgIdx(idx)}
                  className={`w-20 h-20 rounded-2xl border p-2 clean-card transition-all ${
                    activeImgIdx === idx ? 'border-blue-600 ring-2 ring-blue-600/30' : 'border-slate-200 opacity-60'
                  }`}
                >
                  <img src={img} alt="thumb" className="w-full h-full object-contain" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Product Inspector */}
        <div className="lg:col-span-6 space-y-6">
          
          <div>
            <div className="text-xs font-mono text-blue-600 font-bold uppercase tracking-widest">{product.brand}</div>
            <h1 className="font-heading font-black text-3xl sm:text-4xl text-slate-900">{product.name}</h1>
            <div className="text-sm text-slate-600 font-medium mt-1">
              {product.storage} {product.ram && `• ${product.ram}`} • Color: <strong className="text-slate-900">{product.color}</strong>
            </div>
          </div>

          {/* Price Box */}
          <div className="clean-card p-5 rounded-2xl flex items-center justify-between">
            <div>
              <div className="text-xs text-slate-400 line-through">MRP: ₹{product.mrp.toLocaleString()}</div>
              <div className="font-heading font-black text-3xl text-slate-900">
                ₹{(product.offerPrice || product.sellingPrice).toLocaleString()}
              </div>
            </div>

            {product.emiMonthlyStarting && (
              <div className="text-right">
                <div className="text-xs text-slate-500 font-mono">EMI Available</div>
                <div className="text-sm font-bold text-blue-600">From ₹{product.emiMonthlyStarting}/mo</div>
              </div>
            )}
          </div>

          {/* Pre-Owned 8-Point Condition Breakdown */}
          {isUsed && product.conditionReport && (
            <div className="bg-purple-50/80 border border-purple-200 p-5 rounded-2xl space-y-3">
              <div className="flex items-center justify-between border-b border-purple-200 pb-2">
                <h3 className="font-heading font-bold text-sm text-purple-900 uppercase flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-purple-600" />
                  ARONA Transparent Inspection Report
                </h3>
                <span className="text-xs font-mono font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
                  <BatteryCharging className="w-3.5 h-3.5" /> {product.batteryHealth}% Battery Health
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                  <span className="text-slate-500 font-mono">Display:</span> <strong className="text-slate-900">{product.conditionReport.display}</strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                  <span className="text-slate-500 font-mono">Frame:</span> <strong className="text-slate-900">{product.conditionReport.frame}</strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                  <span className="text-slate-500 font-mono">Back Glass:</span> <strong className="text-slate-900">{product.conditionReport.backGlass}</strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                  <span className="text-slate-500 font-mono">Camera:</span> <strong className="text-slate-900">{product.conditionReport.cameraLens}</strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                  <span className="text-slate-500 font-mono">Speakers:</span> <strong className="text-slate-900">{product.conditionReport.speaker}</strong>
                </div>
                <div className="bg-white p-2.5 rounded-lg border border-purple-100">
                  <span className="text-slate-500 font-mono">Repair History:</span> <strong className="text-emerald-700">{product.conditionReport.repairHistory}</strong>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-600 pt-1">
                {product.boxAvailable && <span className="flex items-center gap-1 text-emerald-700 font-medium"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Original Box</span>}
                {product.billAvailable && <span className="flex items-center gap-1 text-emerald-700 font-medium"><CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> GST Invoice Bill</span>}
              </div>
            </div>
          )}

          {/* Specifications */}
          <div className="space-y-3">
            <h3 className="font-heading font-bold text-sm text-slate-900 uppercase">Specifications</h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-mono block text-[10px]">DISPLAY</span>
                <span className="font-bold text-slate-900">{product.specifications.screen}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-mono block text-[10px]">PROCESSOR</span>
                <span className="font-bold text-slate-900">{product.specifications.processor}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-mono block text-[10px]">CAMERA</span>
                <span className="font-bold text-slate-900">{product.specifications.camera}</span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-slate-500 font-mono block text-[10px]">BATTERY</span>
                <span className="font-bold text-slate-900">{product.specifications.battery}</span>
              </div>
            </div>
          </div>

          {/* CTAs */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-4 px-6 rounded-2xl bg-emerald-600 text-white font-heading font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 shadow-md hover:bg-emerald-700 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>INQUIRE ON WHATSAPP</span>
            </a>

            <Link
              to="/exchange"
              className="py-4 px-6 rounded-2xl bg-slate-100 border border-slate-200 text-slate-900 font-heading font-bold text-sm uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-slate-200 transition-all"
            >
              <RefreshCw className="w-4 h-4 text-emerald-600" />
              <span>EXCHANGE OLD PHONE</span>
            </Link>
          </div>

        </div>

      </div>
    </div>
  );
};
