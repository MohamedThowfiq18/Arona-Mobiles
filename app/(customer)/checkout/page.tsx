'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import CartProvider, { useCart } from '@/components/customer/CartProvider/CartProvider';
import { showToast } from '@/components/customer/Toast/Toast';
import { useStoreSettings } from '@/components/customer/StoreSettingsProvider/StoreSettingsProvider';
import styles from './page.module.css';

function formatPrice(p: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);
}


const PAYMENT_METHODS = [
  {
    id: 'pay_at_store',
    label: '💵 Pay at Store upon Pickup (Cash / Card / UPI)',
    desc: 'Inspect and test your phone at the store before making payment.',
    badge: 'Recommended',
  },
  {
    id: 'upi',
    label: '📲 UPI Online (Instant Hold)',
    desc: 'Pay instantly via Google Pay, PhonePe, Paytm, or BHIM.',
  },
  {
    id: 'card',
    label: '💳 Credit / Debit Card Online',
    desc: 'Pay securely using Visa, MasterCard, RuPay, or Maestro.',
  },
  {
    id: 'emi',
    label: '🏦 Online EMI',
    desc: 'Credit Card & No-cost EMI options available.',
  },
];

const PICKUP_SLOTS = [
  'Today (Within 2 Hours)',
  'Today Evening (5:00 PM – 8:00 PM)',
  'Tomorrow Morning (10:30 AM – 1:30 PM)',
  'Tomorrow Evening (5:00 PM – 8:00 PM)',
  'Within 2-3 Days',
];

function CheckoutInner() {
  const { items, total, clearCart } = useCart();
  const { settings } = useStoreSettings();
  const router = useRouter();
  const [step, setStep] = useState<'pickup' | 'payment' | 'review'>('pickup');
  const [customer, setCustomer] = useState({
    name: '',
    phone: '',
    pickupSchedule: PICKUP_SLOTS[0],
    notes: '',
  });
  const [payment, setPayment] = useState('pay_at_store');
  const [loading, setLoading] = useState(false);

  const deliveryCharge = 0;
  const finalTotal = total;


  const handlePlaceOrder = async () => {
    if (!customer.name.trim() || !customer.phone.trim()) {
      showToast({ type: 'error', title: 'Missing Info', message: 'Please enter your name and phone number.' });
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/checkout/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map(i => ({
            product_id: i.product.id,
            model: `${i.product.brand} ${i.product.model}`,
            brand: i.product.brand,
            image: i.product.images?.[0] || '',
            price: i.selectedVariant?.discount_price ?? i.selectedVariant?.price ?? i.product.discount_price ?? i.product.price,
            qty: i.quantity,
            variant: i.selectedVariant ? { color: i.selectedVariant.color, storage: i.selectedVariant.storage } : undefined,
          })),
          address: {
            name: customer.name,
            phone: customer.phone,
            line1: settings.address_line1 || 'ARONA MOBILES, Opp. Town Hall',
            line2: `Preferred Pickup: ${customer.pickupSchedule}`,
            city: settings.city || 'Bangalore',
            state: settings.state || 'Karnataka',
            pincode: settings.pincode || '560001',
          },

          pickup_schedule: customer.pickupSchedule,
          pickup_notes: customer.notes,
          payment_method: payment,
          subtotal: total,
          delivery_charge: deliveryCharge,
          total: finalTotal,
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      if (payment === 'pay_at_store' || payment === 'cod' || !data.razorpayOrder) {
        clearCart();
        router.push(`/orders/${data.orderId}`);
      } else if (data.razorpayOrder) {
        // Launch Razorpay modal if online payment selected
        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: data.razorpayOrder.amount,
          currency: 'INR',
          name: 'ARONA MOBILES',
          description: 'Store Pickup Phone Reservation',
          order_id: data.razorpayOrder.id,
          handler: async (response: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string }) => {
            await fetch('/api/checkout/verify-payment', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ ...response, orderId: data.orderId }),
            });
            clearCart();
            router.push(`/orders/${data.orderId}`);
          },
          prefill: { name: customer.name, contact: customer.phone },
        };
        // @ts-expect-error Razorpay is loaded from CDN
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (e: unknown) {
      showToast({ type: 'error', title: 'Reservation failed', message: e instanceof Error ? e.message : 'Please try again' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h1 className={styles.pageTitle}>Reserve Phone for In-Store Pickup</h1>

      {/* Step indicator */}
      <div className={styles.steps}>
        {(['pickup', 'payment', 'review'] as const).map((s, i) => (
          <div
            key={s}
            className={`${styles.step} ${step === s ? styles.stepActive : (
              ['pickup', 'payment', 'review'].indexOf(step) > i ? styles.stepDone : ''
            )}`}
          >
            <div className={styles.stepNum}>{['pickup', 'payment', 'review'].indexOf(step) > i ? '✓' : i + 1}</div>
            <span>{s === 'pickup' ? '1. Customer & Pickup' : s === 'payment' ? '2. Payment Method' : '3. Confirm Reservation'}</span>
          </div>
        ))}
      </div>

      <div className={styles.layout}>
        <div className={styles.left}>
          {/* Pickup Step */}
          {step === 'pickup' && (
            <div className={styles.card}>
              <div className={styles.storePickupNotice}>
                <span style={{ fontSize: '1.4rem' }}>🏪</span>
                <div>
                  <strong>Store Pickup Location:</strong>
                  <div>{settings.store_name || 'ARONA MOBILES'} · {settings.address_line1 || 'ARONA MOBILES, Opp. Town Hall'}, {settings.address_line2 || 'Main Commercial Road'}</div>
                  <div style={{ color: 'var(--color-text-muted)', fontSize: '0.8rem', marginTop: 2 }}>
                    ⏰ Hours: {settings.hours_weekdays || 'Mon–Sat: 10:00 AM – 8:30 PM'} | 📞 {settings.phone_primary}
                  </div>
                </div>

              </div>

              <h2 className={styles.cardTitle} style={{ marginTop: 20 }}>👤 Customer &amp; Pickup Details</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Full Name *</label>
                  <input
                    id="checkout-name"
                    className="form-input"
                    placeholder="Enter your full name"
                    value={customer.name}
                    onChange={e => setCustomer(a => ({ ...a, name: e.target.value }))}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number * (for pickup confirmation)</label>
                  <input
                    id="checkout-phone"
                    className="form-input"
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={customer.phone}
                    onChange={e => setCustomer(a => ({ ...a, phone: e.target.value.replace(/\D/g, '').slice(0, 10) }))}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Pickup Time *</label>
                <select
                  id="checkout-pickup-slot"
                  className="form-input form-select"
                  value={customer.pickupSchedule}
                  onChange={e => setCustomer(a => ({ ...a, pickupSchedule: e.target.value }))}
                >
                  {PICKUP_SLOTS.map(slot => (
                    <option key={slot} value={slot}>{slot}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Special Request / Instructions (Optional)</label>
                <input
                  id="checkout-notes"
                  className="form-input"
                  placeholder="e.g., Need screen guard applied, data transfer from old phone..."
                  value={customer.notes}
                  onChange={e => setCustomer(a => ({ ...a, notes: e.target.value }))}
                />
              </div>

              <button
                className="btn btn--primary btn--lg"
                disabled={!customer.name.trim() || customer.phone.length < 10}
                onClick={() => setStep('payment')}
                id="continue-to-payment-btn"
              >
                Continue to Payment Method →
              </button>
            </div>
          )}

          {/* Payment Step */}
          {step === 'payment' && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>💳 Choose Payment Preference</h2>
              <div className={styles.paymentMethods}>
                {PAYMENT_METHODS.map(m => (
                  <label
                    key={m.id}
                    className={`${styles.paymentMethod} ${payment === m.id ? styles.paymentMethodActive : ''}`}
                  >
                    <input
                      type="radio"
                      name="payment"
                      value={m.id}
                      checked={payment === m.id}
                      onChange={() => setPayment(m.id)}
                      style={{ display: 'none' }}
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span className={styles.paymentLabel}>{m.label}</span>
                        {m.badge && (
                          <span className="badge badge--success" style={{ fontSize: 10 }}>{m.badge}</span>
                        )}
                      </div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                        {m.desc}
                      </div>
                    </div>
                    {payment === m.id && <span className={styles.paymentCheck}>✓</span>}
                  </label>
                ))}
              </div>
              <div className={styles.backNextRow}>
                <button className="btn btn--ghost" onClick={() => setStep('pickup')}>← Back</button>
                <button className="btn btn--primary btn--lg" onClick={() => setStep('review')}>
                  Review Reservation →
                </button>
              </div>
            </div>
          )}

          {/* Review Step */}
          {step === 'review' && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>📋 Review Your Store Reservation</h2>
              
              <div className={styles.reviewSection}>
                <div className={styles.reviewLabel}>Pickup Customer</div>
                <div className={styles.reviewValue}>{customer.name} · 📞 {customer.phone}</div>
              </div>

              <div className={styles.reviewSection}>
                <div className={styles.reviewLabel}>Pickup Schedule &amp; Store Location</div>
                <div className={styles.reviewValue}>
                  ⏰ <strong>{customer.pickupSchedule}</strong><br />
                  📍 {settings.address_line1 || 'ARONA MOBILES, Opp. Town Hall'}, {settings.address_line2 || 'Main Commercial Road'}, {settings.city || 'Bangalore'}
                </div>
                {customer.notes && (
                  <div style={{ fontSize: '0.85rem', color: 'var(--color-text-muted)', marginTop: 4 }}>
                    Note: &ldquo;{customer.notes}&rdquo;
                  </div>
                )}
              </div>

              <div className={styles.reviewSection}>
                <div className={styles.reviewLabel}>Payment Option</div>
                <div className={styles.reviewValue}>
                  {PAYMENT_METHODS.find(m => m.id === payment)?.label}
                </div>
              </div>

              <div className={styles.reviewItems}>
                {items.map(item => (
                  <div key={item.product.id} className={styles.reviewItem}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{item.product.brand} {item.product.model}</div>
                      {item.selectedVariant && (
                        <div style={{ fontSize: '0.8rem', color: 'var(--color-text-muted)' }}>
                          {[item.selectedVariant.color, item.selectedVariant.storage].filter(Boolean).join(' · ')}
                        </div>
                      )}
                    </div>
                    <span>×{item.quantity}</span>
                    <span style={{ fontWeight: 700 }}>
                      {formatPrice((item.selectedVariant?.discount_price ?? item.product.discount_price ?? item.product.price) * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className={styles.backNextRow}>
                <button className="btn btn--ghost" onClick={() => setStep('payment')}>← Back</button>
                <button
                  id="place-order-btn"
                  className="btn btn--primary btn--lg"
                  onClick={handlePlaceOrder}
                  disabled={loading}
                >
                  {loading ? 'Reserving Phone...' : `Confirm Reservation · ${formatPrice(finalTotal)}`}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Order summary sidebar */}
        <div className={styles.summary}>
          <div className={styles.summaryCard}>
            <h3 className={styles.summaryTitle}>Reservation Summary</h3>
            <div className={styles.summaryRows}>
              <div className={styles.summaryRow}><span>Items Subtotal</span><span>{formatPrice(total)}</span></div>
              <div className={styles.summaryRow}><span>Store Pickup</span><span style={{ color: 'var(--color-success)', fontWeight: 700 }}>FREE</span></div>
            </div>
            <hr className="divider" />
            <div className={`${styles.summaryRow} ${styles.summaryTotal}`}>
              <span>Total Payable</span><span>{formatPrice(finalTotal)}</span>
            </div>
          </div>
          <div className={styles.trustBadges}>
            <div>🏪 Inspect before Paying</div>
            <div>🛡️ 100% Genuine with Warranty</div>
            <div>⚡ 2-Hour Reservation Hold</div>
            <div>🔧 Free In-Store Data Transfer</div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  return <CartProvider><CheckoutInner /></CartProvider>;
}
