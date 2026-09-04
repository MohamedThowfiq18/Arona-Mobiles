'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  X, 
  ShoppingBag, 
  Plus, 
  Minus, 
  Trash2, 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Tag,
  CheckCircle2
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';

export function CartDrawer() {
  const router = useRouter();
  const { 
    items, 
    isOpen, 
    closeCart, 
    removeItem, 
    updateQuantity, 
    getSubtotal, 
    getTax, 
    getShipping, 
    getGrandTotal,
    getItemCount 
  } = useCartStore();

  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);

  if (!isOpen) return null;

  const subtotal = getSubtotal();
  const shipping = getShipping();
  const tax = getTax();
  const grandTotal = promoApplied ? Math.max(0, getGrandTotal() - 25) : getGrandTotal();
  const freeShippingThreshold = 299;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'ARONA25' || promoCode.trim().toUpperCase() === 'WELCOME') {
      setPromoApplied(true);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-slate-900 border-l border-slate-800 flex flex-col justify-between shadow-2xl">
          
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-blue-500/10 border border-blue-500/20 text-cyan-400">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white font-display">Your Shopping Bag</h3>
                <p className="text-xs text-slate-400">{getItemCount()} items selected</p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Meter */}
          <div className="px-5 py-3 bg-blue-950/30 border-b border-slate-800/80 text-xs">
            {subtotal >= freeShippingThreshold ? (
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>You unlocked FREE Express Shipping!</span>
              </div>
            ) : (
              <div className="space-y-1.5">
                <div className="flex justify-between text-slate-300">
                  <span>Add <strong className="text-cyan-400">${(freeShippingThreshold - subtotal).toFixed(2)}</strong> for Free Express Shipping</span>
                  <span className="font-mono text-slate-400">{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-800 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-300"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Cart Item List */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {items.length === 0 ? (
              <div className="text-center py-16 space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-sm font-semibold text-white">Your cart is currently empty</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto mt-1">
                    Explore our certified pre-owned deals and flagship devices to get started!
                  </p>
                </div>
                <button
                  onClick={() => {
                    closeCart();
                    router.push('/shop');
                  }}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-600 text-white text-xs font-semibold shadow-glow hover:from-blue-500 hover:to-cyan-500 transition-all"
                >
                  Browse Phone Catalog →
                </button>
              </div>
            ) : (
              items.map((item, idx) => {
                const itemPrice = item.product.price + (item.selectedVariant.priceModifier || 0);
                return (
                  <div 
                    key={`${item.product.id}-${item.selectedVariant.storage}-${item.selectedVariant.color}-${idx}`}
                    className="p-3.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 flex gap-3.5 relative group hover:border-slate-700 transition-colors"
                  >
                    <img 
                      src={item.product.images[0]} 
                      alt={item.product.model}
                      className="w-16 h-16 object-cover rounded-xl bg-slate-900 shrink-0"
                    />

                    <div className="flex-1 space-y-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-white group-hover:text-cyan-400 transition-colors">
                            {item.product.brand} {item.product.model}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                            <span>{item.selectedVariant.storage}</span>
                            <span>•</span>
                            <span>{item.selectedVariant.color}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => removeItem(item.product.id, item.selectedVariant.color, item.selectedVariant.storage)}
                          className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Condition Badge */}
                      <div className="flex items-center gap-2">
                        {item.product.condition === 'preowned' ? (
                          <span className="text-[10px] px-1.5 py-0.5 rounded badge-glow-preowned text-cyan-300 font-mono flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-cyan-400" />
                            Grade {item.product.gradeIfPreowned}
                          </span>
                        ) : (
                          <span className="text-[10px] px-1.5 py-0.5 rounded badge-glow-new text-blue-300 font-mono">
                            Brand New
                          </span>
                        )}
                      </div>

                      {/* Quantity Controls & Line Item Price */}
                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                          <button
                            onClick={() => updateQuantity(
                              item.product.id, 
                              item.quantity - 1, 
                              item.selectedVariant.color, 
                              item.selectedVariant.storage
                            )}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="text-xs font-mono text-white px-1.5">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(
                              item.product.id, 
                              item.quantity + 1, 
                              item.selectedVariant.color, 
                              item.selectedVariant.storage
                            )}
                            className="p-1 text-slate-400 hover:text-white"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                        <span className="text-xs font-bold font-mono text-cyan-400">
                          ${(itemPrice * item.quantity).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer Totals & Checkout */}
          {items.length > 0 && (
            <div className="p-5 border-t border-slate-800 bg-slate-950/80 space-y-3">
              
              {/* Promo Code Input */}
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={promoCode}
                    onChange={(e) => setPromoCode(e.target.value)}
                    placeholder="Promo code (e.g. ARONA25)"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 uppercase font-mono"
                  />
                </div>
                <button
                  type="submit"
                  className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white transition-colors"
                >
                  Apply
                </button>
              </form>

              {promoApplied && (
                <div className="text-xs text-emerald-400 flex items-center justify-between bg-emerald-950/40 p-2 rounded-lg border border-emerald-500/30 font-mono">
                  <span>Voucher ARONA25 applied (-$25)</span>
                  <button onClick={() => setPromoApplied(false)} className="text-rose-400">Remove</button>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-400">
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
                {promoApplied && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Promo Voucher</span>
                    <span className="font-mono">-$25.00</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold text-white pt-2 border-t border-slate-800">
                  <span>Total</span>
                  <span className="font-mono text-cyan-400 text-base">${grandTotal.toFixed(2)}</span>
                </div>
              </div>

              {/* Checkout Button */}
              <button
                onClick={() => {
                  closeCart();
                  router.push('/checkout');
                }}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-semibold text-sm shadow-glow transition-all flex items-center justify-center gap-2 group"
              >
                <span>Proceed to Secure Checkout</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
