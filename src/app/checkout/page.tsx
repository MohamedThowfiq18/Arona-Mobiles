'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, 
  CreditCard, 
  Lock, 
  CheckCircle2, 
  Truck, 
  ArrowRight,
  ShoppingBag
} from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useProductStore } from '@/store/useProductStore';

export default function CheckoutPage() {
  const router = useRouter();
  const { items, getSubtotal, getTax, getShipping, getGrandTotal, clearCart } = useCartStore();
  const addToast = useProductStore((state) => state.addToast);

  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'razorpay' | 'cod'>('stripe');
  const [isProcessing, setIsProcessing] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<any>(null);

  // Address Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [street, setStreet] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  const grandTotal = getGrandTotal();

  if (items.length === 0 && !completedOrder) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center space-y-4">
        <h2 className="text-xl font-bold text-white">Your cart is empty</h2>
        <Link href="/shop" className="text-cyan-400 underline">Return to shop catalog</Link>
      </div>
    );
  }

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    setTimeout(() => {
      const orderId = `ARN-${Math.floor(100000 + Math.random() * 900000)}`;

      const orderData = {
        orderId,
        customerName: fullName,
        email,
        items: [...items],
        total: grandTotal,
        paymentMethod: paymentMethod.toUpperCase(),
        createdAt: new Date().toLocaleDateString()
      };

      setCompletedOrder(orderData);
      setIsProcessing(false);
      clearCart();

      addToast({
        type: 'success',
        title: '🎉 Payment Successful!',
        description: `Order ${orderId} placed successfully with ${paymentMethod.toUpperCase()}.`
      });
    }, 1500);
  };

  if (completedOrder) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="glass-panel p-8 sm:p-12 rounded-3xl border border-emerald-500/40 bg-slate-950/80 space-y-6">
          <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest block">ORDER CONFIRMED #{completedOrder.orderId}</span>
            <h1 className="text-3xl font-extrabold font-display text-white mt-1">Thank You for Your Order!</h1>
            <p className="text-xs text-slate-300 max-w-md mx-auto mt-2">
              We sent an order receipt and live tracking updates to <strong className="text-cyan-400">{completedOrder.email}</strong>.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 text-left text-xs space-y-2 font-mono">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Charged</span>
              <span className="text-cyan-400 font-bold">${completedOrder.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Payment Gateway</span>
              <span className="text-emerald-400">{completedOrder.paymentMethod} (Verified)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Estimated Delivery</span>
              <span className="text-white">1 - 2 Business Days (Express)</span>
            </div>
          </div>

          <Link
            href="/account"
            className="inline-block px-6 py-3 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs shadow-cyan-glow"
          >
            View Order in Account Dashboard →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
      <div className="flex items-center gap-3">
        <Lock className="w-5 h-5 text-cyan-400" />
        <h1 className="text-2xl font-extrabold font-display text-white">256-Bit Encrypted Checkout</h1>
      </div>

      <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Shipping Address */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white font-display">1. Delivery Address</h3>
            
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
                <label className="text-xs text-slate-300 block mb-1">Street Address</label>
                <input
                  type="text"
                  required
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="104 Tech Blvd, Apt 2B"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </div>

          {/* Payment Method Placeholder */}
          <div className="glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-base font-bold text-white font-display">2. Select Payment Gateway</h3>

            <div className="grid grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('stripe')}
                className={`p-3.5 rounded-2xl border text-center font-mono text-xs transition-all ${
                  paymentMethod === 'stripe' ? 'bg-blue-500/10 border-blue-400 text-blue-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                💳 Stripe Pay
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('razorpay')}
                className={`p-3.5 rounded-2xl border text-center font-mono text-xs transition-all ${
                  paymentMethod === 'razorpay' ? 'bg-cyan-500/10 border-cyan-400 text-cyan-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                ⚡ Razorpay
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod('cod')}
                className={`p-3.5 rounded-2xl border text-center font-mono text-xs transition-all ${
                  paymentMethod === 'cod' ? 'bg-emerald-500/10 border-emerald-400 text-emerald-300 font-bold' : 'bg-slate-950 border-slate-800 text-slate-400'
                }`}
              >
                💵 Cash on Delivery
              </button>
            </div>
          </div>

        </div>

        {/* Right Summary Column */}
        <div className="lg:col-span-5 glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
          <h3 className="text-base font-bold text-white font-display">Order Items ({items.length})</h3>

          <div className="space-y-3 max-h-60 overflow-y-auto">
            {items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs py-2 border-b border-slate-800/60">
                <div className="flex items-center gap-2">
                  <img src={item.product.images[0]} alt={item.product.model} className="w-10 h-10 object-cover rounded bg-slate-950" />
                  <div>
                    <div className="font-bold text-white">{item.product.model}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{item.selectedVariant.storage} • x{item.quantity}</div>
                  </div>
                </div>
                <span className="font-mono text-cyan-400 font-bold">
                  ${((item.product.price + (item.selectedVariant.priceModifier || 0)) * item.quantity).toFixed(2)}
                </span>
              </div>
            ))}
          </div>

          <div className="pt-3 border-t border-slate-800 space-y-2 text-xs text-slate-300">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="font-mono text-white">${getSubtotal().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Tax (8%)</span>
              <span className="font-mono text-white">${getTax().toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span>Shipping</span>
              <span className="font-mono text-emerald-400 font-bold">
                {getShipping() === 0 ? 'FREE' : `$${getShipping().toFixed(2)}`}
              </span>
            </div>
            <div className="flex justify-between text-lg font-bold text-white pt-2 border-t border-slate-800">
              <span>Total Due</span>
              <span className="font-mono text-cyan-400">${grandTotal.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isProcessing}
            className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-500 hover:from-blue-500 hover:to-emerald-400 text-white font-bold text-sm shadow-glow flex items-center justify-center gap-2"
          >
            {isProcessing ? 'Processing Transaction...' : `Pay $${grandTotal.toFixed(2)} Now →`}
          </button>
        </div>

      </form>
    </div>
  );
}
