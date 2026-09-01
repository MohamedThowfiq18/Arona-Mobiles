import React, { useState } from 'react';
import { Headphones, MessageSquare } from 'lucide-react';
import { SAMPLE_ACCESSORIES } from '../data/accessories';
import { getWhatsAppUrl } from '../config/business';

export const AccessoriesPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const categories = ['All', 'Chargers', 'Earbuds', 'Cases', 'Power Banks', 'Screen Protection'];

  const filtered = activeCategory === 'All'
    ? SAMPLE_ACCESSORIES
    : SAMPLE_ACCESSORIES.filter(a => a.category === activeCategory);

  return (
    <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
      
      <div className="text-left space-y-2 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 text-slate-800 text-xs font-mono font-bold uppercase">
          <Headphones className="w-3.5 h-3.5" />
          <span>ORIGINAL ACCESSORIES</span>
        </div>
        <h1 className="font-heading font-black text-4xl sm:text-5xl text-slate-900">
          MOBILE ACCESSORIES
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl">
          Genuine chargers, protective cases, wireless audio, and tempered glass screen protectors.
        </p>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeCategory === cat ? 'bg-slate-900 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
        {filtered.map(acc => {
          const waUrl = getWhatsAppUrl(`Hi ARONA MOBILES, I am interested in the ${acc.brand} ${acc.name} priced at ₹${acc.price.toLocaleString()}. Please share availability.`);

          return (
            <div key={acc.id} className="clean-card p-6 rounded-3xl flex flex-col justify-between group">
              <div>
                <div className="h-44 flex items-center justify-center mb-4">
                  <img src={acc.image} alt={acc.name} className="max-h-full object-contain group-hover:scale-105 transition-transform" />
                </div>
                <div className="text-[10px] font-mono text-slate-500 uppercase font-bold">{acc.brand} • {acc.category}</div>
                <h3 className="font-heading font-bold text-base text-slate-900 mt-1 line-clamp-1">{acc.name}</h3>
                <div className="text-xs text-slate-500 mt-1">{acc.compatibility}</div>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 line-through mr-2">₹{acc.originalPrice.toLocaleString()}</span>
                  <span className="font-heading font-black text-xl text-slate-900">₹{acc.price.toLocaleString()}</span>
                </div>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-600 hover:text-white transition-all"
                  title="Inquire on WhatsApp"
                >
                  <MessageSquare className="w-4 h-4" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};
