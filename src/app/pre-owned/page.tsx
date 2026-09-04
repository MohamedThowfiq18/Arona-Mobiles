'use client';

import React from 'react';
import Link from 'next/link';
import { 
  ShieldCheck, 
  Battery, 
  Smartphone, 
  Camera, 
  Lock, 
  Wifi, 
  Shield, 
  Volume2, 
  Zap,
  CheckCircle2,
  Award,
  ArrowRight
} from 'lucide-react';
import { useProductStore } from '@/store/useProductStore';
import { ProductCard } from '@/components/ProductCard';

export default function PreOwnedPage() {
  const { products } = useProductStore();
  const preOwnedProducts = products.filter((p) => p.condition === 'preowned');

  const inspectionSteps = [
    {
      step: '01',
      title: 'Battery Health & Capacity',
      icon: Battery,
      description: 'Tested under 4K peak benchmark loads. Guaranteed > 85% maximum capacity or we replace the cell with an OEM battery.'
    },
    {
      step: '02',
      title: 'Display & Touch Digitizer',
      icon: Smartphone,
      description: 'Multi-touch gesture calibration and TrueTone spectrum color testing. Zero dead pixels or touch delay tolerated.'
    },
    {
      step: '03',
      title: 'Camera & Optical Sensors',
      icon: Camera,
      description: 'Autofocus speed, sensor shift optical image stabilization, and portrait depth sensor lens inspection.'
    },
    {
      step: '04',
      title: 'Biometrics & Security',
      icon: Lock,
      description: 'Infrared FaceID TrueDepth camera sensor and in-display ultrasonic fingerprint unlock verification.'
    },
    {
      step: '05',
      title: '5G Modem & Wireless Speed',
      icon: Wifi,
      description: 'Dual SIM, eSIM, Wi-Fi 6E/7, and 5G Sub-6/mmWave antenna throughput tested at 1.2 Gbps peak.'
    },
    {
      step: '06',
      title: 'Chassis & Structural Frame',
      icon: Shield,
      description: 'Structural bend assessment, water resistance seals, and back glass cosmetic grading.'
    },
    {
      step: '07',
      title: 'Stereo Audio & Microphones',
      icon: Volume2,
      description: 'Dual speaker frequency response acoustic test and active noise cancellation mic testing.'
    },
    {
      step: '08',
      title: 'Port & Fast Charging System',
      icon: Zap,
      description: 'USB-C/Lightning data transfer speeds and 20W+ Power Delivery fast charging cycle check.'
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-20">
      
      {/* Hero Header */}
      <div className="glass-panel p-8 sm:p-14 rounded-3xl border border-slate-800 text-center max-w-4xl mx-auto space-y-6 relative overflow-hidden">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full badge-glow-preowned text-cyan-300 text-xs font-mono font-bold">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span>CERTIFIED HARDWARE EXCELLENCE</span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-white">
          The 8-Point Certified <br />
          <span className="gradient-text-emerald">Pre-Owned Guarantee</span>
        </h1>

        <p className="text-slate-300 text-base font-sans max-w-2xl mx-auto leading-relaxed">
          Why pay full retail price? Our certified pre-owned smartphones pass an intensive 8-point hardware diagnostic test by certified engineers and include a full 12-month warranty.
        </p>

        <div className="pt-2 flex flex-wrap justify-center gap-4">
          <a
            href="#inspection-steps"
            className="px-6 py-3 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs shadow-cyan-glow transition-all"
          >
            Explore 8-Point Checklist ↓
          </a>
          <a
            href="#preowned-inventory"
            className="px-6 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-semibold text-xs transition-all"
          >
            Browse Pre-Owned Stock ({preOwnedProducts.length}) →
          </a>
        </div>
      </div>

      {/* 8-Point Inspection Steps Grid */}
      <div id="inspection-steps" className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold font-display text-white">Our 8-Point Inspection Process</h2>
          <p className="text-xs text-slate-400">Every single phone is verified before going on sale</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {inspectionSteps.map((step) => {
            const Icon = step.icon;
            return (
              <div key={step.step} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-3 relative group hover:border-cyan-500/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-cyan-400">STEP {step.step}</span>
                  <div className="p-2.5 rounded-xl bg-cyan-500/10 text-cyan-400 group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                </div>

                <h3 className="text-base font-bold text-white font-display">{step.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed font-sans">{step.description}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Grading Standards Breakdown */}
      <div className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl font-bold font-display text-white">Transparent Cosmetic Grading Standard</h2>
          <p className="text-xs text-slate-400">Know exactly what to expect before opening your delivery box</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          <div className="glass-card p-6 rounded-3xl border border-cyan-500/40 space-y-4 bg-slate-950/60">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/40">
                GRADE A+ PRISTINE
              </span>
              <Award className="w-5 h-5 text-cyan-400" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">Like New Condition</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Zero visible scratches on display or body</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Battery health guaranteed &gt; 95%</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Includes 12-Month ARONA Care Warranty</span>
              </li>
            </ul>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-blue-500/30 space-y-4 bg-slate-950/60">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 font-mono text-xs font-bold border border-blue-500/40">
                GRADE A EXCELLENT
              </span>
              <Award className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">Excellent Value</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Micro hairline scuffs invisible from 12 inches</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Battery health guaranteed &gt; 88%</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Includes 12-Month ARONA Care Warranty</span>
              </li>
            </ul>
          </div>

          <div className="glass-card p-6 rounded-3xl border border-slate-700 space-y-4 bg-slate-950/60">
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 font-mono text-xs font-bold">
                GRADE B GOOD
              </span>
              <Award className="w-5 h-5 text-slate-400" />
            </div>
            <h3 className="text-lg font-bold text-white font-display">Budget Saver</h3>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Minor cosmetic signs of normal usage</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Battery health guaranteed &gt; 85%</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Includes 12-Month ARONA Care Warranty</span>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* Pre-Owned Inventory Section */}
      <div id="preowned-inventory" className="space-y-6 pt-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold font-display text-white">Available Pre-Owned Stock</h2>
            <p className="text-xs text-slate-400">Ready for instant express shipping with 12-month coverage</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {preOwnedProducts.map((prod) => (
            <ProductCard key={prod.id} product={prod} />
          ))}
        </div>
      </div>

    </div>
  );
}
