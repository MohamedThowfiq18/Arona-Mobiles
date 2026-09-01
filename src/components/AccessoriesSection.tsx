import React, { useState } from 'react';
import { Headphones, Star, MessageSquare } from 'lucide-react';
import { SAMPLE_ACCESSORIES } from '../data/accessories';
import { getWhatsAppUrl } from '../config/business';

export const AccessoriesSection: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('All');

  const categories = ['All', 'Chargers', 'Earbuds', 'Cases', 'Power Banks', 'Screen Protection'];

  const filtered = activeCategory === 'All'
    ? SAMPLE_ACCESSORIES
    : SAMPLE_ACCESSORIES.filter(a => a.category === activeCategory);

  return (
    <section id="accessories" className="py-20 relative bg-[#08090d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <Headphones className="w-3.5 h-3.5" />
            <span>ORIGINAL ACCESSORIES</span>
          </div>
          <h2 className="font-heading font-black text-4xl sm:text-5xl text-white">
            COMPLETE YOUR <span className="text-cyan-400">SETUP.</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Genuine chargers, protective cases, wireless audio, and tempered glass engineered for maximum phone longevity.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex items-center justify-center gap-2 overflow-x-auto pb-4 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-heading font-semibold transition-all ${
                activeCategory === cat
                  ? 'bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/30'
                  : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accessories Showcase Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
          {filtered.map((acc) => {
            const waUrl = getWhatsAppUrl(`Hi ARONA MOBILES, I am interested in the ${acc.brand} ${acc.name} priced at ₹${acc.price.toLocaleString()}. Please share availability.`);

            return (
              <div key={acc.id} className="glass-panel p-6 rounded-3xl border-white/10 flex flex-col justify-between hover:border-cyan-500/40 transition-all group">
                <div>
                  <div className="h-44 flex items-center justify-center mb-4">
                    <img src={acc.image} alt={acc.name} className="max-h-full object-contain group-hover:scale-105 transition-transform duration-500" />
                  </div>
                  <div className="text-[10px] font-mono text-cyan-400 uppercase font-bold">{acc.brand} • {acc.category}</div>
                  <h3 className="font-heading font-bold text-base text-white mt-1 group-hover:text-cyan-300 transition-colors line-clamp-1">{acc.name}</h3>
                  <div className="text-xs text-slate-400 mt-1 font-medium">{acc.compatibility}</div>
                </div>

                <div className="pt-4 border-t border-white/10 mt-4 flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-400 line-through mr-2">₹{acc.originalPrice.toLocaleString()}</span>
                    <span className="font-heading font-extrabold text-xl text-white">₹{acc.price.toLocaleString()}</span>
                  </div>

                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2.5 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 hover:bg-cyan-500 hover:text-black transition-all"
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
    </section>
  );
};
