'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { 
  User, 
  ShoppingBag, 
  Repeat, 
  Wrench, 
  Heart 
} from 'lucide-react';
import { useWishlistStore } from '@/store/useWishlistStore';
import { ProductCard } from '@/components/ProductCard';

function AccountContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams ? searchParams.get('tab') || 'orders' : 'orders';

  const [activeTab, setActiveTab] = useState(initialTab);
  const wishlistItems = useWishlistStore((state) => state.items);

  const mockOrders = [
    {
      id: 'ARN-984210',
      date: '2026-09-02',
      items: [
        { title: 'iPhone 15 Pro Max', variant: '256GB / Natural Titanium', price: 1199, qty: 1 }
      ],
      status: 'shipped',
      trackingCode: 'TRK-984920194',
      total: 1294.92
    },
    {
      id: 'ARN-748291',
      date: '2026-08-15',
      items: [
        { title: 'iPhone 13 (Pre-Owned Grade A)', variant: '128GB / Midnight', price: 499, qty: 1 }
      ],
      status: 'delivered',
      trackingCode: 'TRK-109283921',
      total: 538.92
    }
  ];

  const mockTradeIns = [
    {
      id: 'TRD-849102',
      device: 'iPhone 13 (128GB)',
      estimatedValue: 280,
      status: 'Scheduled',
      date: '2026-09-06'
    }
  ];

  const mockRepairs = [
    {
      id: 'REP-482910',
      service: 'Screen Replacement',
      device: 'Pixel 8 Pro',
      status: 'ready',
      date: '2026-09-03',
      cost: 129
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="glass-panel p-6 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-emerald-400 p-0.5 shadow-glow">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-cyan-400 font-bold text-lg font-mono">
              JD
            </div>
          </div>
          <div>
            <h1 className="text-xl font-bold font-display text-white">John Doe</h1>
            <p className="text-xs text-slate-400 font-mono">VIP Customer • john.doe@example.com</p>
          </div>
        </div>

        <div className="flex gap-2">
          <span className="text-xs px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono font-bold">
            ⚡ 12-Month ARONA Care Active
          </span>
        </div>
      </div>

      <div className="flex border-b border-slate-800 overflow-x-auto text-xs font-mono">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-3 font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'orders' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <ShoppingBag className="w-4 h-4" />
          <span>Orders ({mockOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('trade-in')}
          className={`px-5 py-3 font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'trade-in' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Repeat className="w-4 h-4" />
          <span>Trade-Ins ({mockTradeIns.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('repairs')}
          className={`px-5 py-3 font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'repairs' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Wrench className="w-4 h-4" />
          <span>Repairs ({mockRepairs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('wishlist')}
          className={`px-5 py-3 font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'wishlist' ? 'border-cyan-400 text-cyan-400' : 'border-transparent text-slate-400 hover:text-white'
          }`}
        >
          <Heart className="w-4 h-4 text-pink-400" />
          <span>Wishlist ({wishlistItems.length})</span>
        </button>
      </div>

      <div className="space-y-6">
        {activeTab === 'orders' && (
          <div className="space-y-4">
            {mockOrders.map((ord) => (
              <div key={ord.id} className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs border-b border-slate-800 pb-3 gap-2">
                  <div>
                    <span className="font-mono text-cyan-400 font-bold">{ord.id}</span>
                    <span className="text-slate-500 ml-2">Placed on {ord.date}</span>
                  </div>
                  <div className="flex items-center gap-2 font-mono">
                    <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 uppercase text-[10px] font-bold">
                      {ord.status}
                    </span>
                    <span className="text-slate-400">Track: {ord.trackingCode}</span>
                  </div>
                </div>

                <div className="space-y-2">
                  {ord.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-xs text-slate-300">
                      <div>
                        <strong className="text-white">{item.title}</strong>
                        <span className="text-slate-400 block text-[11px] font-mono">{item.variant}</span>
                      </div>
                      <span className="font-mono text-cyan-400 font-bold">${item.price}</span>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-800 flex justify-between text-xs">
                  <span className="text-slate-400">Total Order Amount</span>
                  <span className="font-mono font-bold text-white text-sm">${ord.total}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'trade-in' && (
          <div className="space-y-4">
            {mockTradeIns.map((trd) => (
              <div key={trd.id} className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono text-cyan-400 font-bold">{trd.id}</span>
                  <h4 className="text-sm font-bold text-white">{trd.device}</h4>
                  <p className="text-slate-400 font-mono">Slot: {trd.date}</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold font-mono text-emerald-400">${trd.estimatedValue}</span>
                  <span className="block text-[10px] font-mono text-cyan-400">{trd.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'repairs' && (
          <div className="space-y-4">
            {mockRepairs.map((rep) => (
              <div key={rep.id} className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono text-cyan-400 font-bold">{rep.id}</span>
                  <h4 className="text-sm font-bold text-white">{rep.device} • {rep.service}</h4>
                  <p className="text-slate-400 font-mono">Scheduled: {rep.date}</p>
                </div>
                <div className="text-right">
                  <span className="text-base font-bold font-mono text-cyan-400">${rep.cost}</span>
                  <span className="block text-[10px] font-mono text-emerald-400 uppercase font-bold">{rep.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'wishlist' && (
          <div>
            {wishlistItems.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                No items saved to wishlist yet. Click the heart icon on any device card to save it!
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {wishlistItems.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default function AccountPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 text-xs font-mono text-slate-400">Loading account...</div>}>
      <AccountContent />
    </Suspense>
  );
}
