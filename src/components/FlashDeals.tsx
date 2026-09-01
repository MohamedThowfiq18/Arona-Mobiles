import React from 'react';
import { Zap, MessageSquare, ArrowRight } from 'lucide-react';
import { Product } from '../types';
import { getWhatsAppUrl } from '../config/business';

interface FlashDealsProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const FlashDeals: React.FC<FlashDealsProps> = ({ products, onSelectProduct }) => {
  const flashProducts = products.filter(p => p.flashDeal || p.offerPrice);

  return (
    <section className="py-16 relative bg-[#090b11] border-y border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-semibold uppercase tracking-wider mb-2">
              <Zap className="w-3.5 h-3.5" />
              <span>ARONA FLASH DROPS</span>
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-white">
              LIMITED-TIME <span className="text-amber-400">TECH DROPS</span>
            </h2>
          </div>

          <span className="text-xs font-mono text-slate-400">
            Updated Daily • In-Store & Online Reservations
          </span>
        </div>

        {/* Horizontal Deals Carousel / Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flashProducts.map((p) => {
            const savings = p.mrp - (p.offerPrice || p.sellingPrice);
            const waUrl = getWhatsAppUrl(`Hi ARONA MOBILES, I want to reserve the Flash Drop deal for ${p.name} at ₹${(p.offerPrice || p.sellingPrice).toLocaleString()}.`);

            return (
              <div 
                key={p.id}
                className="glass-panel p-6 rounded-3xl border-amber-500/30 relative flex flex-col justify-between hover:border-amber-500/60 transition-all group text-left"
              >
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span className="px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                    <Zap className="w-3 h-3 text-amber-400" />
                    SAVE ₹{savings.toLocaleString()}
                  </span>
                  <span className="text-xs font-mono text-slate-400">{p.condition === 'used' ? `Pre-Owned Grade ${p.grade}` : 'Brand New'}</span>
                </div>

                <div className="h-40 flex items-center justify-center my-2 cursor-pointer" onClick={() => onSelectProduct(p)}>
                  <img src={p.images[0]} alt={p.name} className="max-h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                </div>

                <div className="space-y-2 mt-4">
                  <div className="text-xs font-mono text-slate-400 uppercase">{p.brand}</div>
                  <h3 className="font-heading font-bold text-lg text-white group-hover:text-amber-400 transition-colors">{p.name}</h3>
                  <div className="text-xs text-slate-300">{p.storage} • {p.color}</div>

                  <div className="flex items-baseline justify-between pt-2 border-t border-white/10">
                    <div>
                      <span className="text-xs text-slate-400 line-through mr-2">₹{p.mrp.toLocaleString()}</span>
                      <span className="font-heading font-black text-2xl text-amber-400">
                        ₹{(p.offerPrice || p.sellingPrice).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-4 mt-2">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3 rounded-xl bg-amber-500 text-black font-heading font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 hover:bg-amber-400 transition-all shadow-lg shadow-amber-500/20"
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>CLAIM FLASH DEAL</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
