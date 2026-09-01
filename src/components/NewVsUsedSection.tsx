import React, { useState, useMemo } from 'react';
import { Sparkles, ShieldCheck, Search, Filter, X, RefreshCw } from 'lucide-react';
import { Product, ProductCondition } from '../types';
import { ProductCard } from './ProductCard';

interface NewVsUsedSectionProps {
  products: Product[];
  activeCondition: ProductCondition;
  onConditionChange: (condition: ProductCondition) => void;
  onSelectProduct: (product: Product) => void;
}

export const NewVsUsedSection: React.FC<NewVsUsedSectionProps> = ({
  products,
  activeCondition,
  onConditionChange,
  onSelectProduct,
}) => {
  const [selectedBrand, setSelectedBrand] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStorage, setSelectedStorage] = useState<string>('All');

  // Filter products dynamically
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      // Condition match
      if (p.condition !== activeCondition) return false;

      // Brand match
      if (selectedBrand !== 'All' && p.brand !== selectedBrand) return false;

      // Storage match
      if (selectedStorage !== 'All' && p.storage !== selectedStorage) return false;

      // Search match
      if (searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase();
        const nameMatch = p.name.toLowerCase().includes(query);
        const brandMatch = p.brand.toLowerCase().includes(query);
        const colorMatch = p.color.toLowerCase().includes(query);
        if (!nameMatch && !brandMatch && !colorMatch) return false;
      }

      return true;
    });
  }, [products, activeCondition, selectedBrand, selectedStorage, searchQuery]);

  const resetFilters = () => {
    setSelectedBrand('All');
    setSelectedStorage('All');
    setSearchQuery('');
  };

  const brands = ['All', 'Apple', 'Samsung', 'OnePlus', 'Google', 'Xiaomi'];
  const storages = ['All', '128GB', '256GB', '512GB'];

  return (
    <section id="shop-new" className="py-20 relative bg-[#08090d]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ARONA Catalogue</span>
          </div>

          <h2 className="font-heading font-black text-4xl sm:text-5xl tracking-tight text-white">
            FIND YOUR <span className="text-blue-500">NEXT PHONE</span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Switch between brand-new smartphones out of the box or quality-certified pre-owned devices at attractive prices.
          </p>
        </div>

        {/* Major Selector Toggle (NEW vs PRE-OWNED) */}
        <div className="max-w-2xl mx-auto mb-12 p-1.5 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-xl grid grid-cols-2 gap-2 shadow-2xl">
          
          <button
            onClick={() => onConditionChange('new')}
            className={`py-4 px-6 rounded-xl font-heading font-extrabold text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
              activeCondition === 'new'
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/40 border border-blue-400/30 scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4 text-blue-300" />
            <span>NEW MOBILES</span>
          </button>

          <button
            onClick={() => onConditionChange('used')}
            className={`py-4 px-6 rounded-xl font-heading font-extrabold text-sm tracking-wider uppercase transition-all duration-300 flex items-center justify-center gap-2 ${
              activeCondition === 'used'
                ? 'bg-purple-600 text-white shadow-xl shadow-purple-600/40 border border-purple-400/30 scale-[1.02]'
                : 'text-slate-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-purple-300" />
            <span>PRE-OWNED MOBILES</span>
          </button>

        </div>

        {/* Pre-Owned Guarantee Banner (When Pre-Owned is selected) */}
        {activeCondition === 'used' && (
          <div className="mb-10 p-6 rounded-3xl bg-gradient-to-r from-purple-950/40 via-purple-900/20 to-blue-950/40 border border-purple-500/30 flex flex-col md:flex-row items-center justify-between gap-6 text-left shadow-xl">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-purple-400 font-mono text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>ARONA Certified Smart Value</span>
              </div>
              <h3 className="font-heading font-extrabold text-2xl text-white">
                Transparent 8-Point Inspection & Real Battery Health
              </h3>
              <p className="text-slate-300 text-xs sm:text-sm max-w-2xl">
                Every pre-owned phone is rigorously tested for display clarity, camera focus, speaker loudness, and genuine battery health. Includes store warranty and original bill support.
              </p>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <span className="px-4 py-2 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-200 text-xs font-mono font-bold">
                Grade A+ & Grade A
              </span>
            </div>
          </div>
        )}

        {/* Filter Controls Row */}
        <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between glass-panel p-4 rounded-2xl border-white/10">
          
          {/* Brand Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            <span className="text-xs text-slate-400 font-mono uppercase mr-1 flex items-center gap-1 flex-shrink-0">
              <Filter className="w-3.5 h-3.5" /> Brand:
            </span>
            {brands.map((b) => (
              <button
                key={b}
                onClick={() => setSelectedBrand(b)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-heading font-semibold transition-all flex-shrink-0 ${
                  selectedBrand === b
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                    : 'bg-white/5 text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {b}
              </button>
            ))}
          </div>

          {/* Storage Filter & Search Box */}
          <div className="flex items-center gap-3 w-full md:w-auto justify-end">
            <select
              value={selectedStorage}
              onChange={(e) => setSelectedStorage(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-heading font-medium text-slate-200 focus:outline-none focus:border-blue-500"
            >
              <option value="All" className="bg-[#08090d]">All Storage</option>
              {storages.filter(s => s !== 'All').map(s => (
                <option key={s} value={s} className="bg-[#08090d]">{s}</option>
              ))}
            </select>

            {/* Quick Search */}
            <div className="relative flex-1 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search model, brand..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl pl-9 pr-8 py-1.5 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {(selectedBrand !== 'All' || selectedStorage !== 'All' || searchQuery !== '') && (
              <button
                onClick={resetFilters}
                className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-mono"
                title="Reset Filters"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
              />
            ))}
          </div>
        ) : (
          /* Empty State */
          <div className="py-20 text-center glass-panel rounded-3xl p-8 border-white/10 max-w-lg mx-auto space-y-4">
            <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center mx-auto text-slate-400">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-xl text-white">No Matching Products Found</h3>
            <p className="text-slate-400 text-xs">
              We couldn't find any {activeCondition === 'new' ? 'new' : 'pre-owned'} mobiles matching your current filter choices.
            </p>
            <button
              onClick={resetFilters}
              className="px-6 py-2.5 rounded-full bg-blue-600 text-white font-heading font-bold text-xs uppercase tracking-wider hover:bg-blue-500 transition-all inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Clear All Filters</span>
            </button>
          </div>
        )}

      </div>
    </section>
  );
};
