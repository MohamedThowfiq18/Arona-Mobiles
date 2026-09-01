import React from 'react';
import { ArrowDown, Sparkles, ShieldCheck, RefreshCw, ChevronRight, Award, Zap, Smartphone, CheckCircle } from 'lucide-react';
import { BUSINESS_CONFIG } from '../config/business';
import { Phone360Viewer } from './Phone360Viewer';

interface HeroProps {
  onExploreMobiles: () => void;
  onVisitStore: () => void;
  onSelectUsed: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onExploreMobiles, onVisitStore, onSelectUsed }) => {
  return (
    <section id="hero" className="relative min-h-[92vh] pt-32 pb-20 flex flex-col justify-between overflow-hidden bg-slate-950 text-slate-100">
      
      {/* Ambient 3D Glow Backdrops */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-gradient-to-tr from-orange-600/25 via-amber-600/20 to-purple-500/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[450px] h-[450px] bg-emerald-500/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            {/* TetTrack Style Pill */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-orange-500/15 border border-orange-500/35 text-orange-400 text-xs font-mono font-bold uppercase tracking-wider shadow-inner">
              <Sparkles className="w-4 h-4 text-orange-400" />
              <span>IPHONE 17 PRO MAX 360° SHOWCASE</span>
            </div>

            {/* Main Headline */}
            <div className="space-y-2">
              <h1 className="font-heading font-black text-5xl sm:text-6xl md:text-7xl lg:text-8xl tracking-tight text-white leading-[0.96]">
                THE NEXT <br />
                <span className="bg-gradient-to-r from-white via-orange-300 to-amber-500 bg-clip-text text-transparent">
                  17 PRO MAX
                </span> <br />
                IN COSMIC ORANGE.
              </h1>
            </div>

            {/* Subtitle */}
            <p className="text-slate-300 text-lg sm:text-xl max-w-2xl font-normal leading-relaxed">
              Experience the new <strong className="text-orange-400 font-semibold">iPhone 17 Pro Max Cosmic Orange Titanium</strong> with interactive 360° angle live 3D viewing, A19 Pro chip, and 48MP ProFusion Camera at <strong className="text-white font-semibold">{BUSINESS_CONFIG.name}</strong>.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <button
                onClick={onExploreMobiles}
                className="px-8 py-4 rounded-full bg-gradient-to-r from-orange-500 to-amber-500 text-white font-heading font-bold text-sm tracking-wider uppercase shadow-xl shadow-orange-500/30 hover:shadow-orange-500/50 hover:scale-105 transition-all duration-300 flex items-center gap-2 group"
              >
                <span>EXPLORE ALL MOBILES</span>
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onVisitStore}
                className="px-8 py-4 rounded-full bg-white/10 border border-white/20 text-white font-heading font-bold text-sm tracking-wider uppercase hover:bg-white/20 hover:border-white/40 transition-all duration-300"
              >
                VISIT STORE
              </button>
            </div>

            {/* Key Value Metrics */}
            <div className="pt-6 border-t border-white/10 grid grid-cols-3 gap-6 max-w-xl">
              <div>
                <div className="text-2xl sm:text-3xl font-heading font-extrabold text-white">100%</div>
                <div className="text-xs text-slate-400 font-medium">Genuine Apple Warranty</div>
              </div>
              <div onClick={onSelectUsed} className="cursor-pointer group">
                <div className="text-2xl sm:text-3xl font-heading font-extrabold text-orange-400 group-hover:text-orange-300 transition-colors">360° Live</div>
                <div className="text-xs text-orange-300 font-medium">Interactive 3D View</div>
              </div>
              <div>
                <div className="text-2xl sm:text-3xl font-heading font-extrabold text-emerald-400">Instant</div>
                <div className="text-xs text-slate-400 font-medium">Trade-in Valuation</div>
              </div>
            </div>

          </div>

          {/* Right 3D Mobile Showcase Stage */}
          <div className="lg:col-span-5 relative perspective-container flex justify-center">
            <Phone360Viewer />
          </div>

        </div>
      </div>

    </section>
  );
};
