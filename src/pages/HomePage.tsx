import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ShieldCheck, RefreshCw, ArrowRight, Zap, Award, CreditCard, HeartHandshake, MapPin } from 'lucide-react';
import { getStoredProducts } from '../data/productStore';
import { ProductCard } from '../components/ProductCard';
import { CustomerReviewsSection } from '../components/CustomerReviewsSection';
import { BUSINESS_CONFIG } from '../config/business';
import { Product } from '../types';

export const HomePage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>(getStoredProducts);

  useEffect(() => {
    const handleUpdate = () => {
      setProducts(getStoredProducts());
    };
    window.addEventListener('arona_products_updated', handleUpdate);
    return () => window.removeEventListener('arona_products_updated', handleUpdate);
  }, []);

  const flashProducts = products.filter(p => p.flashDeal || p.offerPrice || p.featured);
  const featuredProduct = products[0];

  return (
    <div className="pt-24 pb-16 space-y-20">
      
      {/* Hero Section - TetTrack Style 3D Mobile Showcase */}
      <section className="bg-slate-900 text-slate-100 border-b border-slate-800 py-16 lg:py-24 relative overflow-hidden">
        
        {/* Ambient Back Glow */}
        <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center text-left">
            
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/20 border border-blue-500/40 text-blue-400 text-xs font-mono font-bold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" />
                <span>AUTHENTIC MOBILE STORE</span>
              </div>

              <h1 className="font-heading font-black text-5xl sm:text-6xl lg:text-7xl text-white tracking-tight leading-[1.02]">
                YOUR TRUSTED <br />
                <span className="text-blue-500">MOBILE STORE</span> <br />
                IN TECH CITY.
              </h1>

              <p className="text-slate-300 text-lg sm:text-xl max-w-xl font-normal leading-relaxed">
                Browse brand-new smartphones, certified pre-owned devices uploaded directly by our store owner, original accessories, and instant device trade-ins.
              </p>

              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  to="/new-mobiles"
                  className="px-8 py-4 rounded-full bg-blue-600 text-white font-heading font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-600/30 hover:bg-blue-500 hover:scale-105 transition-all flex items-center gap-2"
                >
                  <span>EXPLORE NEW MOBILES</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/pre-owned"
                  className="px-8 py-4 rounded-full bg-slate-800 border border-slate-700 text-purple-300 font-heading font-bold text-xs uppercase tracking-wider hover:bg-slate-700 transition-all flex items-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-400" />
                  <span>PRE-OWNED MOBILES</span>
                </Link>
              </div>
            </div>

            {/* 3D Mobile Showcase Card */}
            <div className="lg:col-span-5 perspective-container flex justify-center">
              <div className="bg-slate-900 border border-slate-700 shadow-2xl rounded-3xl p-6 max-w-md w-full relative space-y-4 mobile-3d-card">
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-mono font-bold uppercase flex items-center gap-1">
                    <Award className="w-3.5 h-3.5 text-emerald-400" /> 3D Device Showcase
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Live Inventory</span>
                </div>

                <div className="aspect-[4/3] bg-slate-950 rounded-2xl overflow-hidden relative border border-slate-800 flex items-center justify-center p-4">
                  <img
                    src={featuredProduct?.images[0] || 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80'}
                    alt="Featured Mobile 3D"
                    className="max-h-full max-w-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.9)] transform hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent flex items-end p-4 text-white">
                    <div>
                      <h3 className="font-heading font-bold text-lg">{featuredProduct?.name || 'Featured Mobile'}</h3>
                      <p className="text-emerald-400 font-bold text-sm">
                        ₹{featuredProduct?.sellingPrice.toLocaleString('en-IN') || '129,900'} 
                        {featuredProduct?.mrp && (
                          <span className="text-slate-400 line-through text-xs ml-2">₹{featuredProduct?.mrp.toLocaleString('en-IN')}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 text-xs text-slate-300 text-left pt-1">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-blue-400 flex-shrink-0" />
                    <span>{BUSINESS_CONFIG.address} ({BUSINESS_CONFIG.landmark})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <HeartHandshake className="w-4 h-4 text-purple-400 flex-shrink-0" />
                    <span>100% Verified devices uploaded by shop owner</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Featured Devices Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 text-left">
        <div className="flex items-center justify-between border-b border-slate-200 pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-800 text-xs font-mono font-bold uppercase">
              <Zap className="w-3.5 h-3.5 text-blue-600" />
              <span>STORE INVENTORY</span>
            </div>
            <h2 className="font-heading font-black text-3xl sm:text-4xl text-slate-900 mt-1">
              CURRENTLY AVAILABLE MOBILES
            </h2>
          </div>

          <Link
            to="/new-mobiles"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            <span>View Full Catalog ({products.length})</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {flashProducts.slice(0, 8).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* Customer Reviews Section */}
      <CustomerReviewsSection />

      {/* Promises Bar */}
      <section className="bg-slate-100 py-12 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {BUSINESS_CONFIG.promises.map((p, idx) => (
            <div key={idx} className="bg-white p-6 rounded-2xl border border-slate-200 space-y-2 shadow-sm">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 font-bold">
                {idx === 0 && <Award className="w-5 h-5" />}
                {idx === 1 && <ShieldCheck className="w-5 h-5 text-purple-600" />}
                {idx === 2 && <RefreshCw className="w-5 h-5 text-emerald-600" />}
                {idx === 3 && <CreditCard className="w-5 h-5 text-amber-600" />}
              </div>
              <h3 className="font-heading font-bold text-slate-900 text-sm">{p.title}</h3>
              <p className="text-slate-600 text-xs leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
};
