'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Smartphone, 
  ShieldCheck, 
  RotateCcw, 
  Zap, 
  Repeat, 
  Wrench, 
  ArrowRight, 
  Star, 
  Sparkles, 
  CheckCircle2, 
  Battery, 
  Sliders, 
  Award,
  ChevronRight,
  ShoppingBag
} from 'lucide-react';
import { useProductStore } from '@/store/useProductStore';
import { ProductCard } from '@/components/ProductCard';

export default function HomePage() {
  const { products } = useProductStore();
  const [activeHeroIndex, setActiveHeroIndex] = useState(0);

  // Hero flagship showcase phones
  const heroProducts = products.filter(p => ['prod-01', 'prod-03', 'prod-02'].includes(p.id));
  const activeHero = heroProducts[activeHeroIndex] || products[0];

  const featuredDevices = products.slice(0, 8);
  const preOwnedHighlights = products.filter(p => p.condition === 'preowned');

  return (
    <div className="space-y-20 pb-20">
      
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-8 pb-16 lg:pt-16 lg:pb-24 border-b border-slate-800/60">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-1/4 translate-x-1/2 w-[400px] h-[400px] bg-cyan-500/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Content */}
            <div className="lg:col-span-7 space-y-6">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-cyan-400 text-xs font-mono">
                <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                <span>NEW ARRIVALS & CERTIFIED PRE-OWNED DROP</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-display tracking-tight text-white leading-[1.1]">
                Smarter. Bolder. <br />
                <span className="gradient-text-blue">Connected.</span>
              </h1>

              <p className="text-base sm:text-lg text-slate-300 max-w-xl font-sans leading-relaxed">
                Experience the next era of mobile retail. Certified pre-owned flagships with 8-point hardware reports, 12-month warranties, instant trade-in upgrades, and expert care.
              </p>

              {/* CTAs */}
              <div className="flex flex-wrap gap-4 pt-2">
                <Link
                  href="/shop"
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-semibold text-sm shadow-glow transition-all flex items-center gap-2 group"
                >
                  <span>Explore All Devices</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>

                <Link
                  href="/trade-in"
                  className="px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 font-semibold text-sm transition-all flex items-center gap-2"
                >
                  <Repeat className="w-4 h-4 text-emerald-400" />
                  <span>Instant Trade-In Calculator</span>
                </Link>
              </div>

              {/* Trust Callouts */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-slate-800/80 text-xs text-slate-400 font-mono">
                <div>
                  <div className="text-white font-bold text-base">8-Point</div>
                  <span>Hardware Checked</span>
                </div>
                <div>
                  <div className="text-cyan-400 font-bold text-base">12-Month</div>
                  <span>Full Warranty</span>
                </div>
                <div>
                  <div className="text-emerald-400 font-bold text-base">100% Live</div>
                  <span>Supabase Sync</span>
                </div>
              </div>
            </div>

            {/* Right Hero Interactive Device Carousel */}
            {activeHero && (
              <div className="lg:col-span-5 relative">
                <div className="glass-panel p-6 rounded-3xl border border-slate-700/80 shadow-2xl relative group">
                  
                  {/* Floating Badge */}
                  <div className="absolute top-4 right-4 z-20">
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-cyan-500 text-slate-950 shadow-cyan-glow">
                      {activeHero.badge || 'Featured Flagship'}
                    </span>
                  </div>

                  <img
                    src={activeHero.images[0]}
                    alt={activeHero.model}
                    className="w-full h-80 object-cover rounded-2xl bg-slate-950 mb-6 transform group-hover:scale-102 transition-transform duration-500"
                  />

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">
                        {activeHero.brand}
                      </span>
                      <div className="flex items-center gap-1 text-amber-400 text-xs">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="font-bold">{activeHero.rating}</span>
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-white font-display">
                      {activeHero.model}
                    </h3>

                    <p className="text-xs text-slate-300 line-clamp-2 font-sans">
                      {activeHero.specs.display} • {activeHero.specs.processor}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-slate-800">
                      <div>
                        <span className="text-2xl font-extrabold font-mono text-cyan-400">
                          ${activeHero.price}
                        </span>
                        <span className="text-xs text-slate-500 block">
                          Stock: {activeHero.stock} units left
                        </span>
                      </div>

                      <Link
                        href={`/product/${activeHero.id}`}
                        className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white border border-slate-600 transition-colors flex items-center gap-1"
                      >
                        View Specs →
                      </Link>
                    </div>
                  </div>

                  {/* Device Switcher Dots */}
                  <div className="flex justify-center gap-2 pt-6">
                    {heroProducts.map((p, idx) => (
                      <button
                        key={p.id}
                        onClick={() => setActiveHeroIndex(idx)}
                        className={`w-3 h-3 rounded-full transition-all ${
                          idx === activeHeroIndex ? 'bg-cyan-400 w-8 shadow-cyan-glow' : 'bg-slate-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. CATEGORY SELECTION TILES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold font-display text-white">Browse By Category</h2>
            <p className="text-xs text-slate-400">Find exactly what you need with guaranteed quality</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          <Link href="/shop?condition=new" className="glass-card p-5 rounded-2xl group hover:border-blue-500/50 transition-all">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400 w-fit mb-4 group-hover:scale-110 transition-transform">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">New Smartphones</h3>
            <p className="text-xs text-slate-400 mt-1">Sealed box, full factory warranty</p>
          </Link>

          <Link href="/pre-owned" className="glass-card p-5 rounded-2xl group hover:border-cyan-500/50 transition-all">
            <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 w-fit mb-4 group-hover:scale-110 transition-transform">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">Certified Pre-Owned</h3>
            <p className="text-xs text-slate-400 mt-1">8-point inspected, save up to 40%</p>
          </Link>

          <Link href="/trade-in" className="glass-card p-5 rounded-2xl group hover:border-emerald-500/50 transition-all">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 w-fit mb-4 group-hover:scale-110 transition-transform">
              <Repeat className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">Instant Trade-In</h3>
            <p className="text-xs text-slate-400 mt-1">Get instant value valuation</p>
          </Link>

          <Link href="/repair" className="glass-card p-5 rounded-2xl group hover:border-amber-500/50 transition-all">
            <div className="p-3 rounded-xl bg-amber-500/10 text-amber-400 w-fit mb-4 group-hover:scale-110 transition-transform">
              <Wrench className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors">Repair & Care</h3>
            <p className="text-xs text-slate-400 mt-1">Screen & battery fix in 45 mins</p>
          </Link>

          <Link href="/shop?category=accessories" className="glass-card p-5 rounded-2xl group hover:border-purple-500/50 transition-all">
            <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400 w-fit mb-4 group-hover:scale-110 transition-transform">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-purple-400 transition-colors">Chargers & Audio</h3>
            <p className="text-xs text-slate-400 mt-1">Official MagSafe & Anker gear</p>
          </Link>
        </div>
      </section>

      {/* 3. FEATURED PRODUCTS GRID (SYNCED LIVE WITH REALTIME) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold font-display text-white">Featured Smartphones</h2>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                ⚡ Realtime Live Sync
              </span>
            </div>
            <p className="text-xs text-slate-400">Top rated flagship devices available today</p>
          </div>
          <Link href="/shop" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold flex items-center gap-1">
            View All Catalog ({products.length}) →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredDevices.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>

      {/* 4. VISUAL 8-POINT INSPECTION FEATURE SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-slate-700/80 bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950/40 relative overflow-hidden">
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 text-xs font-mono border border-cyan-500/30">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>CERTIFIED PRE-OWNED GUARANTEE</span>
              </div>

              <h2 className="text-3xl font-extrabold font-display text-white">
                The 8-Point Hardware Inspection Standard
              </h2>

              <p className="text-sm text-slate-300 leading-relaxed font-sans">
                Every pre-owned phone undergoes rigorous testing by certified engineers before reaching our store. We measure battery degradation, test 5G modems under peak load, and verify display touch sensors.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center gap-2 text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Battery Health &gt; 85% Guaranteed</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center gap-2 text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Original OEM Touch & OLED</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center gap-2 text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>Biometric FaceID/Fingerprint</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs flex items-center gap-2 text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>12-Month Coverage Warranty</span>
                </div>
              </div>

              <Link
                href="/pre-owned"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-cyan-glow transition-all"
              >
                Learn About Inspection Grading & Standards →
              </Link>
            </div>

            {/* Right Card */}
            <div className="glass-card p-6 rounded-2xl border border-cyan-500/30 space-y-4">
              <h3 className="text-base font-bold text-white font-display flex items-center justify-between">
                <span>Sample Inspection Report</span>
                <span className="text-xs font-mono text-cyan-400">Grade A+ Certified</span>
              </h3>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-950 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Battery className="w-4 h-4 text-emerald-400" />
                    <span className="text-slate-300">Battery Health & Capacity</span>
                  </div>
                  <span className="font-mono font-bold text-emerald-400">96% Passed</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Smartphone className="w-4 h-4 text-cyan-400" />
                    <span className="text-slate-300">Display Digitizer Calibration</span>
                  </div>
                  <span className="font-mono font-bold text-cyan-400">Original OEM 100%</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-purple-400" />
                    <span className="text-slate-300">Camera & Optical Stabilization</span>
                  </div>
                  <span className="font-mono font-bold text-purple-400">48MP Sensor Passed</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-400 pt-2 text-center italic">
                * Each device includes its printed verification certificate inside the box.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. CERTIFIED PRE-OWNED HIGHLIGHT CAROUSEL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold font-display text-white">Certified Pre-Owned Deals</h2>
            <p className="text-xs text-slate-400">Save up to $400 compared to original MSRP</p>
          </div>
          <Link href="/pre-owned" className="text-xs text-cyan-400 hover:text-cyan-300 font-semibold">
            View Pre-Owned Lineup →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {preOwnedHighlights.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </section>

      {/* 6. VERIFIED TESTIMONIALS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl font-bold font-display text-white">Trusted By 15,000+ Customers</h2>
          <p className="text-xs text-slate-400">Real verified reviews from recent phone buyers & trade-in upgrades</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="glass-card p-6 rounded-2xl space-y-3 border border-slate-800">
            <div className="flex items-center gap-1 text-amber-400 text-xs">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              "Bought a pre-owned iPhone 14 Pro Grade A+. Battery health was 96% as listed and it looks brand new. Arrived in 24 hours!"
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <span className="font-bold text-white">Marcus Vance</span>
              <span className="text-[10px] text-emerald-400 font-mono">Verified Buyer</span>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3 border border-slate-800">
            <div className="flex items-center gap-1 text-amber-400 text-xs">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              "Traded in my Galaxy S21 Ultra online. Instant valuation gave me $320 store credit and I upgraded to the S24 Ultra same day."
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <span className="font-bold text-white">Elena Rostova</span>
              <span className="text-[10px] text-emerald-400 font-mono">Verified Trade-In</span>
            </div>
          </div>

          <div className="glass-card p-6 rounded-2xl space-y-3 border border-slate-800">
            <div className="flex items-center gap-1 text-amber-400 text-xs">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              "Screen replacement on my Pixel 8 Pro was booked online in 2 minutes. Done in under 45 minutes at their Metro Plaza location."
            </p>
            <div className="flex items-center justify-between pt-3 border-t border-slate-800 text-xs">
              <span className="font-bold text-white">David K.</span>
              <span className="text-[10px] text-emerald-400 font-mono">Verified Repair</span>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
