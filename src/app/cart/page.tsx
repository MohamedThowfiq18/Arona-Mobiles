'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShoppingBag, 
  Trash2, 
  Plus, 
  Minus, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Tag 
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

export default function CartPage() {
  const router = useRouter();
  const { 
    items, 
    removeItem, 
    updateQuantity, 
    getSubtotal, 
    getTax, 
    getShipping, 
    getGrandTotal,
    clearCart 
  } = useCartStore();

  const subtotal = getSubtotal();
  const tax = getTax();
  const shipping = getShipping();
  const grandTotal = getGrandTotal();

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto" />
        <h2 className="text-2xl font-bold font-display text-white">Your Shopping Cart is Empty</h2>
        <p className="text-xs text-slate-400 max-w-sm mx-auto">
          Explore our certified pre-owned lineup and flagship smartphones to fill your cart!
        </p>
        <Link
          href="/shop"
          className="inline-block px-6 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-cyan-glow"
        >
          Explore Catalog →
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <h1 className="text-3xl font-extrabold font-display text-white">Shopping Cart ({items.length} items)</h1>
        <button onClick={clearCart} className="text-xs font-mono text-slate-400 hover:text-rose-400">
          Clear Entire Cart
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Cart Items List */}
        <div className="lg:col-span-8 space-y-4">
          {items.map((item, idx) => {
            const itemPrice = item.product.price + (item.selectedVariant.priceModifier || 0);
            return (
              <div 
                key={`${item.product.id}-${idx}`}
                className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.product.images[0]}
                    alt={item.product.model}
                    className="w-20 h-20 object-cover rounded-xl bg-slate-950 shrink-0"
                  />
                  <div>
                    <h3 className="text-sm font-bold text-white">{item.product.brand} {item.product.model}</h3>
                    <div className="text-xs text-slate-400 font-mono">
                      {item.selectedVariant.storage} • {item.selectedVariant.color}
                    </div>
                    <div className="mt-1">
                      {item.product.condition === 'preowned' ? (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded badge-glow-preowned text-cyan-300">
                          Pre-Owned Grade {item.product.gradeIfPreowned}
                        </span>
                      ) : (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded badge-glow-new text-blue-300">
                          Brand New Sealed
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-6 pt-3 sm:pt-0 border-t sm:border-0 border-slate-800">
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl p-1">
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity - 1, item.selectedVariant.color, item.selectedVariant.storage)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="text-xs font-mono text-white px-2 font-bold">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.product.id, item.quantity + 1, item.selectedVariant.color, item.selectedVariant.storage)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <div className="text-base font-bold font-mono text-cyan-400">
                      ${(itemPrice * item.quantity).toFixed(2)}
                    </div>
                    <span className="text-[10px] text-slate-500 block">${itemPrice} each</span>
                  </div>

                  <button
                    onClick={() => removeItem(item.product.id, item.selectedVariant.color, item.selectedVariant.storage)}
                    className="p-2 text-slate-500 hover:text-rose-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Order Summary Column */}
        <div className="lg:col-span-4 glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white font-display">Order Summary</h3>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono text-white">${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Estimated Tax (8%)</span>
              <span className="font-mono text-white">${tax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Express Shipping</span>
              <span className="font-mono text-white">
                {shipping === 0 ? <strong className="text-emerald-400">FREE</strong> : `$${shipping.toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold text-white pt-3 border-t border-slate-800">
              <span>Grand Total</span>
              <span className="font-mono text-cyan-400 text-lg">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/checkout')}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-bold text-sm shadow-glow flex items-center justify-center gap-2"
          >
            <span>Proceed to Secure Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
