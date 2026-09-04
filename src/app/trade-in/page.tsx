'use client';

import React, { useState } from 'react';
import { 
  Repeat, 
  Smartphone, 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  Clock, 
  MapPin, 
  DollarSign, 
  ShieldCheck, 
  Sparkles,
  ChevronRight,
  AlertCircle
} from 'lucide-react';
import { useProductStore } from '@/store/useProductStore';

export default function TradeInPage() {
  const addToast = useProductStore((state) => state.addToast);

  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1);

  // Form State
  const [selectedBrand, setSelectedBrand] = useState('Apple');
  const [selectedModel, setSelectedModel] = useState('iPhone 13');
  const [selectedStorage, setSelectedStorage] = useState('128GB');

  // Condition State
  const [screenCondition, setScreenCondition] = useState<'flawless' | 'good' | 'cracked'>('flawless');
  const [bodyCondition, setBodyCondition] = useState<'flawless' | 'scratched' | 'dented'>('flawless');
  const [batteryHealth, setBatteryHealth] = useState<'above85' | 'below85'>('above85');
  const [powersOn, setPowersOn] = useState(true);

  // Logistics State
  const [logisticsType, setLogisticsType] = useState<'pickup' | 'dropoff'>('pickup');
  const [pickupDate, setPickupDate] = useState('');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 1:00 PM');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  const [submittedRequest, setSubmittedRequest] = useState<any>(null);

  // Instant Rule-Based Price Estimator
  const calculateEstimatedValue = () => {
    let base = 250;
    if (selectedModel.includes('15 Pro')) base = 650;
    else if (selectedModel.includes('14 Pro')) base = 480;
    else if (selectedModel.includes('13 Pro')) base = 380;
    else if (selectedModel.includes('S24 Ultra')) base = 620;
    else if (selectedModel.includes('S23 Ultra')) base = 450;
    else if (selectedModel.includes('Pixel 8')) base = 400;

    if (selectedStorage === '256GB') base += 50;
    if (selectedStorage === '512GB') base += 100;
    if (selectedStorage === '1TB') base += 180;

    if (screenCondition === 'good') base *= 0.85;
    if (screenCondition === 'cracked') base *= 0.45;

    if (bodyCondition === 'scratched') base *= 0.9;
    if (bodyCondition === 'dented') base *= 0.75;

    if (batteryHealth === 'below85') base -= 45;
    if (!powersOn) base *= 0.2;

    return Math.round(base);
  };

  const estimatedValue = calculateEstimatedValue();

  const handleNextStep = () => {
    setStep((prev) => (prev + 1) as any);
  };

  const handlePrevStep = () => {
    setStep((prev) => (prev - 1) as any);
  };

  const handleSubmitTradeIn = (e: React.FormEvent) => {
    e.preventDefault();
    const requestId = `TRD-${Math.floor(100000 + Math.random() * 900000)}`;

    const reqData = {
      id: requestId,
      device: `${selectedBrand} ${selectedModel} (${selectedStorage})`,
      estimatedValue,
      customer: fullName,
      email,
      phone,
      type: logisticsType,
      date: pickupDate || '2026-09-08',
      timeSlot,
      status: 'Scheduled'
    };

    setSubmittedRequest(reqData);
    setStep(5);

    addToast({
      type: 'success',
      title: '🎉 Trade-In Scheduled!',
      description: `Ticket ${requestId} created. Estimated credit $${estimatedValue} reserved.`
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      
      {/* Header */}
      <div className="glass-panel p-8 rounded-3xl border border-slate-800 text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 text-xs font-mono font-bold border border-emerald-500/30">
          <Repeat className="w-4 h-4 text-emerald-400" />
          <span>INSTANT UPGRADE ENGINE</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-white">
          Trade In Your Old Phone For <span className="gradient-text-emerald">Instant Cash</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto font-sans">
          Answer a few quick questions to receive a guaranteed valuation. Choose free home courier pickup or drop off at any ARONA store location.
        </p>
      </div>

      {/* Wizard Progress Indicator */}
      {step <= 4 && (
        <div className="flex items-center justify-between text-xs font-mono max-w-2xl mx-auto px-4">
          <div className={`flex items-center gap-2 ${step >= 1 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-6 h-6 rounded-full bg-slate-900 border border-current flex items-center justify-center">1</span>
            <span className="hidden sm:inline">Device</span>
          </div>
          <div className="h-0.5 flex-1 bg-slate-800 mx-2" />
          <div className={`flex items-center gap-2 ${step >= 2 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-6 h-6 rounded-full bg-slate-900 border border-current flex items-center justify-center">2</span>
            <span className="hidden sm:inline">Condition</span>
          </div>
          <div className="h-0.5 flex-1 bg-slate-800 mx-2" />
          <div className={`flex items-center gap-2 ${step >= 3 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-6 h-6 rounded-full bg-slate-900 border border-current flex items-center justify-center">3</span>
            <span className="hidden sm:inline">Valuation</span>
          </div>
          <div className="h-0.5 flex-1 bg-slate-800 mx-2" />
          <div className={`flex items-center gap-2 ${step >= 4 ? 'text-cyan-400 font-bold' : 'text-slate-500'}`}>
            <span className="w-6 h-6 rounded-full bg-slate-900 border border-current flex items-center justify-center">4</span>
            <span className="hidden sm:inline">Logistics</span>
          </div>
        </div>
      )}

      {/* STEP 1: Select Brand, Model, Storage */}
      {step === 1 && (
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <h3 className="text-lg font-bold text-white font-display">Step 1: Select Your Current Device</h3>
          
          {/* Brand */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 font-mono">Select Brand</label>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
              {['Apple', 'Samsung', 'Google', 'OnePlus'].map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => {
                    setSelectedBrand(b);
                    if (b === 'Apple') setSelectedModel('iPhone 14 Pro');
                    else if (b === 'Samsung') setSelectedModel('Galaxy S23 Ultra');
                    else if (b === 'Google') setSelectedModel('Pixel 8 Pro');
                    else setSelectedModel('OnePlus 11');
                  }}
                  className={`py-3 rounded-xl text-xs font-bold transition-all border ${
                    selectedBrand === b
                      ? 'bg-cyan-500 text-slate-950 border-cyan-400 shadow-cyan-glow'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {b}
                </button>
              ))}
            </div>
          </div>

          {/* Model */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 font-mono">Select Model</label>
            <select
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-cyan-500 font-mono"
            >
              {selectedBrand === 'Apple' && (
                <>
                  <option value="iPhone 15 Pro Max">iPhone 15 Pro Max</option>
                  <option value="iPhone 15 Pro">iPhone 15 Pro</option>
                  <option value="iPhone 14 Pro Max">iPhone 14 Pro Max</option>
                  <option value="iPhone 14 Pro">iPhone 14 Pro</option>
                  <option value="iPhone 13 Pro">iPhone 13 Pro</option>
                  <option value="iPhone 13">iPhone 13</option>
                </>
              )}
              {selectedBrand === 'Samsung' && (
                <>
                  <option value="Galaxy S24 Ultra">Galaxy S24 Ultra</option>
                  <option value="Galaxy S23 Ultra">Galaxy S23 Ultra</option>
                  <option value="Galaxy Z Fold 5">Galaxy Z Fold 5</option>
                  <option value="Galaxy S22 Ultra">Galaxy S22 Ultra</option>
                </>
              )}
              {selectedBrand === 'Google' && (
                <>
                  <option value="Pixel 8 Pro">Pixel 8 Pro</option>
                  <option value="Pixel 8">Pixel 8</option>
                  <option value="Pixel 7 Pro">Pixel 7 Pro</option>
                </>
              )}
              {selectedBrand === 'OnePlus' && (
                <>
                  <option value="OnePlus 12">OnePlus 12</option>
                  <option value="OnePlus 11">OnePlus 11</option>
                </>
              )}
            </select>
          </div>

          {/* Storage */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 font-mono">Storage Capacity</label>
            <div className="grid grid-cols-4 gap-2">
              {['128GB', '256GB', '512GB', '1TB'].map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setSelectedStorage(s)}
                  className={`py-2.5 rounded-xl text-xs font-mono font-bold transition-all border ${
                    selectedStorage === s
                      ? 'bg-blue-500 text-white border-blue-400'
                      : 'bg-slate-900 text-slate-400 border-slate-800'
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleNextStep}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-xs shadow-glow transition-all flex items-center justify-center gap-2"
          >
            <span>Continue to Condition Assessment →</span>
          </button>
        </div>
      )}

      {/* STEP 2: Device Condition Assessment */}
      {step === 2 && (
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <h3 className="text-lg font-bold text-white font-display">Step 2: Assess Physical Condition</h3>

          {/* Screen Condition */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 font-mono">Screen Condition</label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setScreenCondition('flawless')}
                className={`p-3 rounded-xl text-left border transition-all ${
                  screenCondition === 'flawless' ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div>✨ Flawless</div>
                <div className="text-[10px] text-slate-500 mt-1">No scratches or cracks</div>
              </button>
              <button
                type="button"
                onClick={() => setScreenCondition('good')}
                className={`p-3 rounded-xl text-left border transition-all ${
                  screenCondition === 'good' ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div>Minor Scuffs</div>
                <div className="text-[10px] text-slate-500 mt-1">Light scratches visible</div>
              </button>
              <button
                type="button"
                onClick={() => setScreenCondition('cracked')}
                className={`p-3 rounded-xl text-left border transition-all ${
                  screenCondition === 'cracked' ? 'bg-amber-500/10 border-amber-400 text-amber-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div>⚡ Cracked Screen</div>
                <div className="text-[10px] text-slate-500 mt-1">Glass crack present</div>
              </button>
            </div>
          </div>

          {/* Body Condition */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 font-mono">Body / Chassis Condition</label>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setBodyCondition('flawless')}
                className={`p-3 rounded-xl text-left border transition-all ${
                  bodyCondition === 'flawless' ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div>Pristine</div>
                <div className="text-[10px] text-slate-500 mt-1">No scuffs or chips</div>
              </button>
              <button
                type="button"
                onClick={() => setBodyCondition('scratched')}
                className={`p-3 rounded-xl text-left border transition-all ${
                  bodyCondition === 'scratched' ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div>Normal Scuffs</div>
                <div className="text-[10px] text-slate-500 mt-1">Light frame wear</div>
              </button>
              <button
                type="button"
                onClick={() => setBodyCondition('dented')}
                className={`p-3 rounded-xl text-left border transition-all ${
                  bodyCondition === 'dented' ? 'bg-amber-500/10 border-amber-400 text-amber-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div>Heavy Wear</div>
                <div className="text-[10px] text-slate-500 mt-1">Dents or deep scuffs</div>
              </button>
            </div>
          </div>

          {/* Battery Health */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-slate-300 font-mono">Battery Health Status</label>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => setBatteryHealth('above85')}
                className={`p-3 rounded-xl text-left border transition-all ${
                  batteryHealth === 'above85' ? 'bg-emerald-500/10 border-emerald-400 text-emerald-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div>🔋 Above 85% Capacity</div>
                <div className="text-[10px] text-slate-500 mt-1">Holds charge well</div>
              </button>
              <button
                type="button"
                onClick={() => setBatteryHealth('below85')}
                className={`p-3 rounded-xl text-left border transition-all ${
                  batteryHealth === 'below85' ? 'bg-slate-800 border-slate-700 text-slate-300' : 'bg-slate-900 border-slate-800 text-slate-400'
                }`}
              >
                <div>🔋 Below 85% Capacity</div>
                <div className="text-[10px] text-slate-500 mt-1">Service recommended</div>
              </button>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handlePrevStep}
              className="py-3.5 px-6 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
            >
              ← Back
            </button>
            <button
              onClick={handleNextStep}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white font-bold text-xs shadow-glow"
            >
              Calculate Valuation →
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: Instant Valuation Calculation Result */}
      {step === 3 && (
        <div className="glass-panel p-8 rounded-3xl border border-cyan-500/40 text-center space-y-6 bg-gradient-to-b from-slate-950 via-slate-900 to-cyan-950/20">
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 font-mono text-xs font-bold border border-cyan-500/40">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>ESTIMATED INSTANT TRADE-IN VALUE</span>
          </div>

          <div>
            <h2 className="text-sm font-mono text-slate-400 uppercase tracking-wider">
              {selectedBrand} {selectedModel} ({selectedStorage})
            </h2>
            <div className="text-5xl sm:text-6xl font-extrabold font-mono text-cyan-400 my-2 shadow-cyan-glow">
              ${estimatedValue}
            </div>
            <p className="text-xs text-slate-400">Guaranteed value held for 14 calendar days</p>
          </div>

          <div className="max-w-md mx-auto p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-left text-xs space-y-2">
            <div className="flex justify-between text-slate-300">
              <span>Base Device Model Value</span>
              <span className="font-mono text-white">${estimatedValue + 40}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Storage Modifier ({selectedStorage})</span>
              <span className="font-mono text-emerald-400">Included</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Physical Condition Adjustment</span>
              <span className="font-mono text-slate-400">
                {screenCondition === 'flawless' ? 'No Deduction' : '-$40 Screen Scuff'}
              </span>
            </div>
          </div>

          <div className="flex gap-3 max-w-md mx-auto">
            <button
              onClick={handlePrevStep}
              className="py-3 px-5 rounded-xl bg-slate-800 text-xs font-semibold text-slate-300"
            >
              ← Edit Condition
            </button>
            <button
              onClick={handleNextStep}
              className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 text-slate-950 font-bold text-xs shadow-cyan-glow"
            >
              Lock In $ {estimatedValue} Valuation & Schedule →
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: Logistics & Pickup Schedule */}
      {step === 4 && (
        <form onSubmit={handleSubmitTradeIn} className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
          <h3 className="text-lg font-bold text-white font-display">Step 4: Choose Pickup or Drop-Off</h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <button
              type="button"
              onClick={() => setLogisticsType('pickup')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                logisticsType === 'pickup' ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <MapPin className="w-5 h-5 mb-2 text-cyan-400" />
              <div className="text-sm font-bold text-white">Free Home Courier Pickup</div>
              <div className="text-[11px] text-slate-400 mt-1">Our agent inspects & pays at your doorstep</div>
            </button>

            <button
              type="button"
              onClick={() => setLogisticsType('dropoff')}
              className={`p-4 rounded-2xl border text-left transition-all ${
                logisticsType === 'dropoff' ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400'
              }`}
            >
              <Smartphone className="w-5 h-5 mb-2 text-emerald-400" />
              <div className="text-sm font-bold text-white">Store Location Drop-Off</div>
              <div className="text-[11px] text-slate-400 mt-1">Visit Metro Plaza store for instant payout</div>
            </button>
          </div>

          {/* Contact Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="john@example.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-300 block mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
            <div>
              <label className="text-xs text-slate-300 block mb-1">Preferred Pickup Date</label>
              <input
                type="date"
                required
                value={pickupDate}
                onChange={(e) => setPickupDate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {logisticsType === 'pickup' && (
            <div>
              <label className="text-xs text-slate-300 block mb-1">Pickup Street Address</label>
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Main Street, Apt 4B, City, State"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
              />
            </div>
          )}

          <button
            type="submit"
            className="w-full py-4 rounded-xl bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-600 text-slate-950 font-bold text-sm shadow-cyan-glow"
          >
            Confirm Trade-In Request (${estimatedValue} Reserved) →
          </button>
        </form>
      )}

      {/* STEP 5: Success Ticket Confirmation */}
      {step === 5 && submittedRequest && (
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-emerald-500/40 text-center space-y-6 bg-slate-950/80">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block">TICKET #{submittedRequest.id}</span>
            <h2 className="text-2xl font-bold font-display text-white mt-1">Trade-In Request Confirmed!</h2>
            <p className="text-xs text-slate-300 max-w-md mx-auto mt-2">
              We have reserved your estimated trade-in credit of <strong className="text-cyan-400 font-mono">${submittedRequest.estimatedValue}</strong>.
            </p>
          </div>

          <div className="max-w-md mx-auto p-5 rounded-2xl bg-slate-900 border border-slate-800 text-left text-xs space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Device</span>
              <span className="font-semibold text-white">{submittedRequest.device}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Customer</span>
              <span className="text-slate-200">{submittedRequest.customer}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Logistics</span>
              <span className="text-emerald-400 font-mono capitalize">{submittedRequest.type} Scheduled</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Slot</span>
              <span className="text-slate-200">{submittedRequest.date} ({submittedRequest.timeSlot})</span>
            </div>
          </div>

          <button
            onClick={() => setStep(1)}
            className="px-6 py-3 rounded-xl bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700 transition-colors"
          >
            Start Another Trade-In
          </button>
        </div>
      )}

    </div>
  );
}
