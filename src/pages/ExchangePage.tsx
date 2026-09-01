import React, { useState } from 'react';
import { RefreshCw, ArrowRight, Smartphone, MessageSquare } from 'lucide-react';
import { getWhatsAppUrl } from '../config/business';

export const ExchangePage: React.FC = () => {
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
    <div className="pt-28 pb-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
      
      <div className="text-left space-y-2 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-mono font-bold uppercase">
          <RefreshCw className="w-3.5 h-3.5 text-emerald-600" />
          <span>ARONA UPGRADE PROGRAM</span>
        </div>
        <h1 className="font-heading font-black text-4xl sm:text-5xl text-slate-900">
          EXCHANGE & TRADE-IN
        </h1>
        <p className="text-slate-600 text-sm max-w-2xl">
          Turn your old smartphone into your next upgrade with instant fair trade-in valuation.
        </p>
      </div>

      <div className="max-w-4xl mx-auto clean-card p-8 sm:p-10 rounded-3xl text-left border-slate-200 space-y-6">
        <h2 className="font-heading font-bold text-2xl text-slate-900 flex items-center gap-2">
          <Smartphone className="w-6 h-6 text-emerald-600" />
          Calculate Trade-In Value
        </h2>

        <form onSubmit={calculateEstimate} className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold text-slate-700 uppercase">Current Brand</label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
            >
              <option value="Apple">Apple</option>
              <option value="Samsung">Samsung</option>
              <option value="OnePlus">OnePlus</option>
              <option value="Xiaomi">Xiaomi</option>
              <option value="Vivo">Vivo / OPPO</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold text-slate-700 uppercase">Model Name</label>
            <input
              type="text"
              required
              placeholder="e.g. iPhone 13 Pro or Galaxy S22"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold text-slate-700 uppercase">Storage</label>
            <select
              value={storage}
              onChange={(e) => setStorage(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
            >
              <option value="128GB">128GB</option>
              <option value="256GB">256GB</option>
              <option value="512GB">512GB / 1TB</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold text-slate-700 uppercase">Screen Condition</label>
            <select
              value={screenCondition}
              onChange={(e) => setScreenCondition(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 focus:border-emerald-600 focus:outline-none"
            >
              <option value="Flawless (No Scratches)">Flawless — No scratches or cracks</option>
              <option value="Minor Scratches">Minor Hairline Scratches</option>
              <option value="Cracked Glass">Cracked Display / Glass</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold text-slate-700 uppercase">Your Name</label>
            <input
              type="text"
              placeholder="Enter your name"
              value={userName}
              onChange={(e) => setUserName(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-mono font-semibold text-slate-700 uppercase">Phone Number</label>
            <input
              type="tel"
              placeholder="10-digit mobile number"
              value={userPhone}
              onChange={(e) => setUserPhone(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-slate-900 placeholder-slate-400 focus:border-emerald-600 focus:outline-none"
            />
          </div>

          <div className="sm:col-span-2 pt-2">
            <button
              type="submit"
              className="w-full py-4 rounded-xl bg-emerald-600 text-white font-heading font-extrabold text-xs uppercase tracking-wider shadow-md hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
            >
              <span>GET EXCHANGE ESTIMATE</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {estimatedValue !== null && (
          <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono text-emerald-800 font-bold uppercase">Estimated Trade-In Valuation</div>
              <div className="font-heading font-black text-4xl text-slate-900">
                ₹ {estimatedValue.toLocaleString()}
              </div>
            </div>

            <a
              href={waUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-6 rounded-xl bg-emerald-600 text-white font-heading font-bold text-xs uppercase tracking-wider flex items-center gap-2 hover:bg-emerald-700 transition-all"
            >
              <MessageSquare className="w-4 h-4" />
              <span>CLAIM ON WHATSAPP</span>
            </a>
          </div>
        )}

      </div>

    </div>
  );
};
