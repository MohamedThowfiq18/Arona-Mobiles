'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { 
  Smartphone, 
  ShieldCheck, 
  Truck, 
  RotateCcw, 
  Zap, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  Send,
  CreditCard,
  CheckCircle2
} from 'lucide-react';
import { useProductStore } from '@/store/useProductStore';

export function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const addToast = useProductStore((state) => state.addToast);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) return;

    setSubscribed(true);
    addToast({
      type: 'success',
      title: '🎉 Subscribed to VIP Phone Drops!',
      description: `We sent a 10% trade-in voucher code to ${email}`
    });
    setEmail('');
  };

  return (
    <footer className="bg-slate-950 border-t border-slate-800 text-slate-400 font-sans pt-16 pb-12">
      {/* Top Trust Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-6 rounded-2xl glass-panel border border-slate-800">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">8-Point Inspection</h4>
              <p className="text-xs text-slate-400">Certified by hardware engineers</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
              <RotateCcw className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">12-Month Warranty</h4>
              <p className="text-xs text-slate-400">14-day hassle-free returns</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <Truck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Express Delivery</h4>
              <p className="text-xs text-slate-400">Free shipping on orders over $299</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-white">Instant Trade-In Credit</h4>
              <p className="text-xs text-slate-400">Upgrade on the spot today</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 mb-12">
        
        {/* Brand Column */}
        <div className="lg:col-span-2 space-y-4">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-0.5 shadow-glow">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Smartphone className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <span className="text-xl font-bold font-display tracking-tight text-white">
              ARONA <span className="text-blue-500">MOBILES</span>
            </span>
          </Link>
          <p className="text-xs leading-relaxed text-slate-400 max-w-sm">
            Your premier destination for new flagship smartphones, certified pre-owned devices with 8-point hardware reports, mobile care repairs, and instant upgrade trade-ins.
          </p>
          <div className="pt-2 flex items-center gap-3 text-xs text-slate-400">
            <MapPin className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>104 Tech Boulevard, Metro Plaza, Suite 400</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>+1 (800) 555-ARONA (2766)</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <Clock className="w-4 h-4 text-cyan-400 shrink-0" />
            <span>Mon - Sat: 9:00 AM - 9:00 PM | Sun: 10 AM - 6 PM</span>
          </div>
        </div>

        {/* Categories */}
        <div>
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono mb-4">
            Shop Catalog
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link href="/shop?condition=new" className="hover:text-cyan-400 transition-colors">New Smartphones</Link></li>
            <li><Link href="/pre-owned" className="hover:text-cyan-400 transition-colors">Certified Pre-Owned</Link></li>
            <li><Link href="/shop?brand=Apple" className="hover:text-cyan-400 transition-colors">Apple iPhones</Link></li>
            <li><Link href="/shop?brand=Samsung" className="hover:text-cyan-400 transition-colors">Samsung Galaxy Series</Link></li>
            <li><Link href="/shop?brand=Google" className="hover:text-cyan-400 transition-colors">Google Pixel Devices</Link></li>
            <li><Link href="/shop?category=accessories" className="hover:text-cyan-400 transition-colors">Chargers & Accessories</Link></li>
          </ul>
        </div>

        {/* Services & Support */}
        <div>
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono mb-4">
            Services & Support
          </h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link href="/trade-in" className="hover:text-emerald-400 transition-colors">Instant Trade-In Valuation</Link></li>
            <li><Link href="/repair" className="hover:text-cyan-400 transition-colors">Book a Mobile Repair</Link></li>
            <li><Link href="/repair?tab=track" className="hover:text-cyan-400 transition-colors">Track Repair Status</Link></li>
            <li><Link href="/pre-owned#inspection" className="hover:text-cyan-400 transition-colors">8-Point Inspection Standards</Link></li>
            <li><Link href="/account" className="hover:text-cyan-400 transition-colors">Order Tracking</Link></li>
            <li><Link href="/contact" className="hover:text-cyan-400 transition-colors">Store Locator & Maps</Link></li>
          </ul>
        </div>

        {/* Newsletter Signup */}
        <div>
          <h4 className="text-xs font-semibold text-white uppercase tracking-wider font-mono mb-4">
            VIP Price Drop Alerts
          </h4>
          <p className="text-xs text-slate-400 mb-3">
            Subscribe for instant notification on flash sales & rare certified pre-owned arrivals.
          </p>
          <form onSubmit={handleSubscribe} className="space-y-2">
            <div className="relative">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email..."
                required
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 pr-10"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1.5 p-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            {subscribed && (
              <div className="text-[11px] text-emerald-400 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Voucher sent to your inbox!
              </div>
            )}
          </form>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <p className="text-slate-500">
          © 2026 ARONA MOBILES Retail Inc. All rights reserved. "Smarter. Bolder. Connected."
        </p>
        <div className="flex items-center space-x-4 text-slate-400">
          <span className="flex items-center gap-1"><CreditCard className="w-4 h-4" /> Stripe / Razorpay Secured</span>
          <span>•</span>
          <Link href="/contact" className="hover:underline">Privacy Policy</Link>
          <span>•</span>
          <Link href="/contact" className="hover:underline">Terms of Service</Link>
        </div>
      </div>
    </footer>
  );
}
