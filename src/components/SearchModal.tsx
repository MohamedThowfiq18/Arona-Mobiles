import React, { useState } from 'react';
import { Search, X, ShieldCheck, Sparkles, ArrowRight } from 'lucide-react';
import { Product } from '../types';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onSelectProduct: (product: Product) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, products, onSelectProduct }) => {
  if (!isOpen) return null;

  const [query, setQuery] = useState('');

  const results = query.trim() === ''
    ? []
    : products.filter(p => {
        const q = query.toLowerCase();
        return (
          p.name.toLowerCase().includes(q) ||
          p.brand.toLowerCase().includes(q) ||
          (p.storage && p.storage.toLowerCase().includes(q)) ||
          p.color.toLowerCase().includes(q)
        );
      });

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-200">
      
      <div className="w-full max-w-2xl bg-[#0d0f17] border border-white/15 rounded-3xl p-6 shadow-2xl space-y-6 text-left relative overflow-hidden">
        
        {/* Search Bar Input */}
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-blue-400 absolute left-4" />
          <input
            type="text"
            autoFocus
            placeholder="Search Apple, Samsung, iPhone 15 Pro, 256GB..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-10 py-4 text-sm text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 font-heading font-medium"
          />
          <button onClick={onClose} className="absolute right-4 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Results List */}
        <div className="max-h-96 overflow-y-auto space-y-3 pr-1">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-slate-500 text-xs font-mono">
              TYPE A BRAND OR MODEL TO INSTANTLY SEARCH OUR INVENTORY
            </div>
          ) : results.length > 0 ? (
            results.map((p) => (
              <div
                key={p.id}
                onClick={() => {
                  onSelectProduct(p);
                  onClose();
                }}
                className="glass-panel p-3 rounded-2xl border-white/5 hover:border-blue-500/40 flex items-center justify-between gap-4 cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-white/5 p-1 flex items-center justify-center flex-shrink-0">
                    <img src={p.images[0]} alt={p.name} className="max-h-full max-w-full object-contain" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-heading font-bold text-sm text-white group-hover:text-blue-400 transition-colors">{p.name}</span>
                      {p.condition === 'used' ? (
                        <span className="px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 text-[9px] font-mono font-bold flex items-center gap-0.5">
                          <ShieldCheck className="w-3 h-3" /> Pre-Owned {p.grade}
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[9px] font-mono font-bold flex items-center gap-0.5">
                          <Sparkles className="w-3 h-3" /> New
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-slate-400">{p.storage} • {p.color}</div>
                  </div>
                </div>

                <div className="text-right flex items-center gap-3">
                  <div>
                    <div className="font-heading font-black text-base text-emerald-400">₹{(p.offerPrice || p.sellingPrice).toLocaleString()}</div>
                    <div className="text-[10px] text-slate-400 line-through">₹{p.mrp.toLocaleString()}</div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center space-y-2">
              <div className="text-slate-400 font-heading font-bold text-base">NO RESULTS FOUND FOR "{query}"</div>
              <p className="text-xs text-slate-500">Try searching for "iPhone", "Samsung", "256GB", or "Pre-Owned".</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
