'use client';

import React, { useState, useMemo, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { 
  Search, 
  Filter, 
  SlidersHorizontal, 
  Grid, 
  List, 
  X, 
  RotateCcw, 
  Sparkles
} from 'lucide-react';
import { useProductStore } from '@/store/useProductStore';
import { ProductCard } from '@/components/ProductCard';

function ShopContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams ? searchParams.get('q') || '' : '';
  const initialCondition = searchParams ? searchParams.get('condition') || 'all' : 'all';

  const { products, isLoading } = useProductStore();

  const [search, setSearch] = useState(initialQuery);
  const [brandFilter, setBrandFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState(initialCondition);
  const [maxPrice, setMaxPrice] = useState(1500);
  const [sortBy, setSortBy] = useState('featured');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  const brands = ['Apple', 'Samsung', 'Google', 'OnePlus', 'Sony', 'Anker'];

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesName = p.model.toLowerCase().includes(query);
        const matchesBrand = p.brand.toLowerCase().includes(query);
        const matchesSpec = p.specs.display.toLowerCase().includes(query) || p.specs.processor.toLowerCase().includes(query);
        if (!matchesName && !matchesBrand && !matchesSpec) return false;
      }

      if (brandFilter !== 'all' && p.brand.toLowerCase() !== brandFilter.toLowerCase()) {
        return false;
      }

      if (conditionFilter !== 'all' && p.condition !== conditionFilter) {
        return false;
      }

      if (p.price > maxPrice) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return a.price - b.price;
      if (sortBy === 'price-high') return b.price - a.price;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });
  }, [products, search, brandFilter, conditionFilter, maxPrice, sortBy]);

  const resetFilters = () => {
    setSearch('');
    setBrandFilter('all');
    setConditionFilter('all');
    setMaxPrice(1500);
    setSortBy('featured');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header Banner */}
      <div className="glass-panel p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-cyan-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>FULL RETAIL CATALOG ({filteredProducts.length} DEVICES AVAILABLE)</span>
          </div>
          <h1 className="text-3xl font-extrabold font-display text-white">Shop Devices</h1>
          <p className="text-xs text-slate-400 mt-1">
            Filter by brand, condition rating, or budget range with instant realtime stock updates.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative min-w-[280px] sm:min-w-[360px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter models, specs, or brands..."
            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-9 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-3 text-slate-400 hover:text-white">
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Sidebar Filters */}
        <div className="hidden lg:block space-y-6 glass-card p-6 rounded-2xl border border-slate-800 h-fit">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
              Filter Inventory
            </h3>
            <button
              onClick={resetFilters}
              className="text-[11px] text-slate-400 hover:text-cyan-400 flex items-center gap-1 font-mono"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          </div>

          {/* Condition Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 font-mono">Device Condition</label>
            <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-900 rounded-xl border border-slate-800 text-xs">
              <button
                onClick={() => setConditionFilter('all')}
                className={`py-1.5 rounded-lg font-medium transition-colors ${
                  conditionFilter === 'all' ? 'bg-cyan-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setConditionFilter('new')}
                className={`py-1.5 rounded-lg font-medium transition-colors ${
                  conditionFilter === 'new' ? 'bg-blue-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                New
              </button>
              <button
                onClick={() => setConditionFilter('preowned')}
                className={`py-1.5 rounded-lg font-medium transition-colors ${
                  conditionFilter === 'preowned' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                Pre-Owned
              </button>
            </div>
          </div>

          {/* Brand Filter */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 font-mono">Brand Manufacturer</label>
            <div className="space-y-1">
              <button
                onClick={() => setBrandFilter('all')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                  brandFilter === 'all' ? 'bg-blue-500/10 text-cyan-400 font-bold border border-blue-500/20' : 'text-slate-400 hover:bg-slate-800'
                }`}
              >
                <span>All Brands</span>
                <span className="font-mono text-[10px] text-slate-500">{products.length}</span>
              </button>
              {brands.map((brand) => {
                const count = products.filter((p) => p.brand.toLowerCase() === brand.toLowerCase()).length;
                return (
                  <button
                    key={brand}
                    onClick={() => setBrandFilter(brand)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                      brandFilter.toLowerCase() === brand.toLowerCase()
                        ? 'bg-blue-500/10 text-cyan-400 font-bold border border-blue-500/20'
                        : 'text-slate-400 hover:bg-slate-800'
                    }`}
                  >
                    <span>{brand}</span>
                    <span className="font-mono text-[10px] text-slate-500">{count}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Slider */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <label className="font-semibold text-slate-300 font-mono">Max Price</label>
              <span className="font-mono text-cyan-400 font-bold">${maxPrice}</span>
            </div>
            <input
              type="range"
              min="50"
              max="1500"
              step="50"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-cyan-400 cursor-pointer"
            />
          </div>
        </div>

        {/* Main Product Grid Area */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-400">
                Showing <strong className="text-white">{filteredProducts.length}</strong> items
              </span>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                <option value="featured">Sort: Featured</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
              </select>

              <div className="hidden sm:flex items-center gap-1 p-1 bg-slate-900 rounded-xl border border-slate-800">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'grid' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-1.5 rounded-lg transition-colors ${
                    viewMode === 'list' ? 'bg-slate-800 text-cyan-400' : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="text-center py-20 glass-card rounded-3xl space-y-4 border border-slate-800">
              <Search className="w-12 h-12 text-slate-600 mx-auto" />
              <div>
                <h3 className="text-base font-bold text-white">No devices matched your criteria</h3>
                <p className="text-xs text-slate-400 mt-1">Try broadening your search query or reset filters.</p>
              </div>
              <button
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-cyan-glow"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
              : "space-y-4"
            }>
              {filteredProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs font-mono text-slate-400">Loading catalog...</div>}>
      <ShopContent />
    </Suspense>
  );
}
