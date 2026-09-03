import React, { useState, useEffect, useMemo } from 'react';
import { ShieldCheck, Search, Filter } from 'lucide-react';
import { getStoredProducts } from '../data/productStore';
import { ProductCard } from '../components/ProductCard';
import { Product } from '../types';

export const PreOwnedPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(getStoredProducts);
  const [selectedGrade, setSelectedGrade] = useState('All');
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

  const usedProducts = useMemo(() => {
    return products.filter(p => p.condition === 'used').filter(p => {
      if (selectedGrade !== 'All' && p.grade !== selectedGrade) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q);
      }
      return true;
    });
  }, [products, selectedGrade, searchQuery]);

  return (
    <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
      
      {/* Header */}
      <div className="space-y-2 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-100 text-purple-900 text-xs font-mono font-bold uppercase">
          <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
          <span>CERTIFIED PRE-OWNED CATALOGUE</span>
        </div>
        <h1 className="font-heading font-black text-4xl sm:text-5xl text-slate-900">
          PRE-OWNED SMARTPHONES
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl">
          High-value pre-owned devices uploaded by our store owner with 8-point technical inspection, verified battery health, GST invoice, and store warranty.
        </p>
      </div>

      {/* Filter Row */}
      <div className="bg-white border border-slate-200 shadow-sm p-4 rounded-2xl flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Condition Grade:
          </span>
          {['All', 'A+', 'A'].map(g => (
            <button
              key={g}
              onClick={() => setSelectedGrade(g)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedGrade === g ? 'bg-purple-600 text-white shadow-sm' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {g === 'All' ? 'All Grades' : `Grade ${g}`}
            </button>
          ))}
        </div>

        <div className="relative w-full md:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search pre-owned phones..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-1.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-purple-600"
          />
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {usedProducts.map(product => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

    </div>
  );
};
