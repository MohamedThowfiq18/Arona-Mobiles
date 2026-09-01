import React, { useState } from 'react';
import { RefreshCw, ArrowRight, CheckCircle2, MessageSquare, Smartphone, ShieldAlert } from 'lucide-react';
import { getWhatsAppUrl } from '../config/business';

export const ExchangeSection: React.FC = () => {
  const [brand, setBrand] = useState('Apple');
  const [model, setModel] = useState('');
  const [storage, setStorage] = useState('128GB');
  const [screenCondition, setScreenCondition] = useState('Flawless (No Scratches)');
  const [bodyCondition, setBodyCondition] = useState('Good (Minor Signs)');
  const [userName, setUserName] = useState('');
  const [userPhone, setUserPhone] = useState('');
  const [estimatedValue, setEstimatedValue] = useState<number | null>(null);

  const calculateEstimate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!model.trim()) return;

    // Smart baseline estimation algorithm for demonstration
    let base = 15000;
    if (brand === 'Apple') base = 28000;
    if (brand === 'Samsung') base = 22000;
    if (brand === 'OnePlus') base = 18000;

    if (screenCondition.includes('Flawless')) base += 4000;
    if (bodyCondition.includes('Flawless')) base += 3000;
    if (storage === '256GB') base += 2500;
    if (storage === '512GB') base += 5000;

    setEstimatedValue(base);
  };

  const waMessage = `Hi ARONA MOBILES, I want to exchange my old phone.
Model: ${brand} ${model} (${storage})
Screen Condition: ${screenCondition}
Body Condition: ${bodyCondition}
Estimated Valuation: ${estimatedValue ? `₹${estimatedValue.toLocaleString()}` : 'Pending'}
My Name: ${userName || 'Customer'}
Phone: ${userPhone || 'Not provided'}`;

  const waUrl = getWhatsAppUrl(waMessage);

  return (
    <section id="exchange" className="py-20 relative bg-gradient-to-b from-[#08090d] via-[#0d0f17] to-[#08090d] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-semibold uppercase tracking-wider">
            <RefreshCw className="w-3.5 h-3.5" />
            <span>ARONA UPGRADE PROGRAM</span>
          </div>

          <h2 className="font-heading font-black text-4xl sm:text-5xl tracking-tight text-white">
            TURN YOUR OLD PHONE INTO <br />
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              YOUR NEXT ONE.
            </span>
          </h2>
          <p className="text-slate-400 text-base sm:text-lg">
            Get top exchange value for your existing smartphone. Upgrade seamlessly to any new or pre-owned device in store.
          </p>
        </div>

        {/* 4 Step Journey Banner */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-16">
          {[
            { step: '01', title: 'SELECT YOUR PHONE', desc: 'Specify your brand, model, and storage variant.' },
            { step: '02', title: 'TELL US CONDITION', desc: 'Assess screen, body, and functional status.' },
            { step: '03', title: 'GET AN ESTIMATE', desc: 'Receive instant fair exchange valuation.' },
            { step: '04', title: 'UPGRADE AT ARONA', desc: 'Visit store to complete swap in 15 minutes.' }
          ].map((item, idx) => (
            <div key={idx} className="glass-panel p-6 rounded-2xl border-white/10 text-left relative space-y-2">
              <div className="font-heading font-black text-3xl text-emerald-400/40">{item.step}</div>
              <h3 className="font-heading font-bold text-base text-white">{item.title}</h3>
              <p className="text-slate-400 text-xs">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Interactive Valuation Form & Output */}
        <div className="max-w-4xl mx-auto glass-panel p-8 sm:p-10 rounded-3xl border-emerald-500/30 shadow-2xl relative">
          
          <h3 className="font-heading font-black text-2xl text-white mb-6 text-left flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-emerald-400" />
            Calculate Trade-In Estimate
          </h3>

          <form onSubmit={calculateEstimate} className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-left">
            
            {/* Brand */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-300 uppercase">Current Brand</label>
              <select
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Apple" className="bg-[#08090d]">Apple</option>
                <option value="Samsung" className="bg-[#08090d]">Samsung</option>
                <option value="OnePlus" className="bg-[#08090d]">OnePlus</option>
                <option value="Xiaomi" className="bg-[#08090d]">Xiaomi</option>
                <option value="Vivo" className="bg-[#08090d]">Vivo / OPPO</option>
              </select>
            </div>

            {/* Model */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-300 uppercase">Model Name</label>
              <input
                type="text"
                required
                placeholder="e.g. iPhone 13 Pro or Galaxy S22"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* Storage */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-300 uppercase">Storage</label>
              <select
                value={storage}
                onChange={(e) => setStorage(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="128GB" className="bg-[#08090d]">128GB</option>
                <option value="256GB" className="bg-[#08090d]">256GB</option>
                <option value="512GB" className="bg-[#08090d]">512GB / 1TB</option>
              </select>
            </div>

            {/* Screen Condition */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-300 uppercase">Screen Condition</label>
              <select
                value={screenCondition}
                onChange={(e) => setScreenCondition(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Flawless (No Scratches)" className="bg-[#08090d]">Flawless — No scratches or cracks</option>
                <option value="Minor Scratches" className="bg-[#08090d]">Minor Hairline Scratches</option>
                <option value="Cracked Glass" className="bg-[#08090d]">Cracked Display / Glass</option>
              </select>
            </div>

            {/* User Name */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-300 uppercase">Your Name</label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            {/* User Phone */}
            <div className="space-y-2">
              <label className="text-xs font-mono font-semibold text-slate-300 uppercase">Phone Number</label>
              <input
                type="tel"
                placeholder="10-digit mobile number"
                value={userPhone}
                onChange={(e) => setUserPhone(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div className="sm:col-span-2 pt-2">
              <button
                type="submit"
                className="w-full py-4 rounded-xl bg-emerald-500 text-white font-heading font-extrabold text-sm uppercase tracking-wider shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all flex items-center justify-center gap-2"
              >
                <span>CALCULATE EXCHANGE ESTIMATE</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

          </form>

          {/* Valuation Output Result */}
          {estimatedValue !== null && (
            <div className="mt-8 p-6 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-left space-y-4 animate-in fade-in duration-300">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <div className="text-xs font-mono text-emerald-400 uppercase font-semibold">Estimated Trade-In Value</div>
                  <div className="font-heading font-black text-4xl text-white">
                    ₹ {estimatedValue.toLocaleString()} <span className="text-xs font-normal text-slate-400">*subject to in-store physical verification</span>
                  </div>
                </div>

                <a
                  href={waUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-3 px-6 rounded-xl bg-emerald-500 text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-emerald-500/30 hover:bg-emerald-400 transition-all flex-shrink-0"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>CLAIM EXCHANGE ON WHATSAPP</span>
                </a>
              </div>
            </div>
          )}

        </div>

      </div>
    </section>
  );
};
