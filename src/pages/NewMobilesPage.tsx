import React, { useState, useEffect, useMemo } from 'react';
import { Sparkles, Search, Filter } from 'lucide-react';
import { getStoredProducts } from '../data/productStore';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';

export const NewMobilesPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(getStoredProducts);
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [selectedStorage, setSelectedStorage] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const handleUpdate = () => {
      setProducts(getStoredProducts());
    };
    window.addEventListener('arona_products_updated', handleUpdate);
    window.addEventListener('arona_master_data_updated', handleUpdate);
    return () => {
      window.removeEventListener('arona_products_updated', handleUpdate);
      window.removeEventListener('arona_master_data_updated', handleUpdate);
    };
  }, []);

  const newProducts = useMemo(() => {
    return products.filter(p => p.condition === 'new').filter(p => {
      if (selectedBrand !== 'All' && p.brand !== selectedBrand) return false;
      if (selectedStorage !== 'All' && p.storage !== selectedStorage) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, selectedBrand, selectedStorage, searchQuery]);

  const brands = ['All', 'Apple', 'Samsung', 'OnePlus', 'Vivo', 'OPPO', 'Xiaomi', 'Google'];

  return (
    <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
      
      {/* Header */}
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-mono font-bold uppercase">
          <Sparkles className="w-3.5 h-3.5 text-blue-600" />
          <span>BRAND NEW CATALOGUE</span>
        </div>
        <h1 className="font-heading font-black text-4xl sm:text-5xl text-slate-900">
          BRAND NEW SMARTPHONES
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl">
          Original factory-sealed smartphones uploaded by our store owner with official brand warranty and GST retail invoice.
        </p>
      </div>

      {/* Filter Row */}
      <div className="bg-white border border-slate-200 shadow-sm p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Brand:
          </span>
          {brands.map(b => (
            <button
              key={b}
              onClick={() => setSelectedBrand(b)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedBrand === b ? 'bg-blue-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {b}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search new phones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {newProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

    </div>
  );
};
