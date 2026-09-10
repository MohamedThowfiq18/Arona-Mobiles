import { notFound } from 'next/navigation';
import { getSupabaseServerClient } from '@/lib/supabase/server';
import type { Order, OrderStatus } from '@/lib/types';
import { getStoreSettings } from '@/lib/settings';
import type { Metadata } from 'next';
import styles from './page.module.css';

export const metadata: Metadata = { title: 'Reservation Details' };

const PICKUP_STEPS: { key: string; label: string; icon: string; matchStatuses: OrderStatus[] }[] = [
  { key: 'pending',          label: 'Reservation Received',   icon: '📝', matchStatuses: ['pending', 'placed'] },
  { key: 'confirmed',        label: 'Confirmed by Store',     icon: '✅', matchStatuses: ['confirmed'] },
  { key: 'ready_for_pickup', label: 'Ready for Pickup',       icon: '🏪', matchStatuses: ['ready_for_pickup', 'packed', 'shipped', 'out_for_delivery'] },
  { key: 'collected',        label: 'Collected / Picked Up',  icon: '🤝', matchStatuses: ['collected', 'delivered'] },
];

function formatPrice(p: number) {
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(p);
}

function getStepIndex(status: OrderStatus): number {
  if (status === 'collected' || status === 'delivered') return 3;
  if (status === 'ready_for_pickup' || status === 'packed' || status === 'shipped' || status === 'out_for_delivery') return 2;
  if (status === 'confirmed') return 1;
  return 0; // pending, placed
}

export default async function OrderTrackingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [supabase, settings] = await Promise.all([
    getSupabaseServerClient(),
    getStoreSettings(),
  ]);
  const { data } = await supabase.from('orders').select('*').eq('id', id).single();
  const order = data as Order | null;

  if (!order) notFound();

  const currentIndex = getStepIndex(order.status);
  const isCancelled = order.status === 'cancelled';

  return (
    <div className="container">
      <div className={styles.page}>
        {/* Header */}
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Reservation #{order.order_number}</h1>
            <div className={styles.meta}>
              Reserved on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
              {order.address?.line2 && (
                <> · <strong>{order.address.line2}</strong></>
              )}
            </div>
          </div>
          <div className={styles.headerRight}>
            <span
              className={`badge ${order.status === 'collected' || order.status === 'delivered' ? 'badge--success' : 'badge--new'}`}
              style={{ fontSize: 13, padding: '5px 12px' }}
            >
              {order.status === 'ready_for_pickup'
                ? 'READY FOR PICKUP'
                : order.status === 'collected' || order.status === 'delivered'
                ? 'COLLECTED'
                : order.status.replace(/_/g, ' ').toUpperCase()}
            </span>
            <a
              href={`tel:${settings.phone_primary_raw}`}
              className="btn btn--secondary btn--sm"
              style={{ background: '#16a34a', color: '#fff', borderColor: '#16a34a' }}
            >
              📞 Call Store
            </a>
          </div>
        </div>


        {/* Store Confirmation Alert Banner */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            border: '1.5px solid #86efac',
            borderRadius: '12px',
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}
        >
          <span style={{ fontSize: '2rem' }}>🎉</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: '1.05rem', color: '#14532d' }}>
              Your order is reserved!
            </div>
            <div style={{ color: '#166534', fontSize: '0.9rem', marginTop: 2 }}>
              Visit <strong>ARONA MOBILES</strong> store to test and collect your device, or our store team will call you to confirm your reservation.
            </div>
          </div>
        </div>

        <div className={styles.layout}>
          {/* Left: Pickup Progress + Items */}
          <div>
            {/* Progress tracker */}
            {!isCancelled && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Pickup Status Tracker</h2>
                <div className={styles.progressBar}>
                  {PICKUP_STEPS.map((step, i) => (
                    <div
                      key={step.key}
                      className={`${styles.progressStep} ${i <= currentIndex ? styles.progressStepDone : ''} ${i === currentIndex ? styles.progressStepActive : ''}`}
                    >
                      <div className={styles.progressDot}>
                        {i < currentIndex ? '✓' : step.icon}
                      </div>
                      <div className={styles.progressLabel}>{step.label}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Detailed log */}
            {order.tracking_history && order.tracking_history.length > 0 && (
              <div className={styles.card}>
                <h2 className={styles.cardTitle}>Store Activity Updates</h2>
                <div className="timeline">
                  {[...order.tracking_history].reverse().map((event, i) => (
                    <div key={i} className={`timeline__item ${i === 0 ? 'timeline__item--active' : 'timeline__item--done'}`}>
                      <div className="timeline__dot">{i === 0 ? '●' : '✓'}</div>
                      <div className="timeline__content">
                        <div className="timeline__title">{event.status.replace(/_/g, ' ').toUpperCase()}</div>
                        <div className="timeline__time">{new Date(event.timestamp).toLocaleString('en-IN')}</div>
                        {event.note && <div className="timeline__note">{event.note}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Ordered items */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Reserved Items</h2>
              <div className={styles.orderItems}>
                {order.items.map((item, i) => (
                  <div key={i} className={styles.orderItem}>
                    <div className={styles.orderItemImg}>
                      {item.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={item.image} alt={item.model} />
                      ) : <span>📱</span>}
                    </div>
                    <div className={styles.orderItemInfo}>
                      <div className={styles.orderItemName}>{item.brand} {item.model}</div>
                      {item.variant && (
                        <div className={styles.orderItemVariant}>
                          {[item.variant.color, item.variant.storage].filter(Boolean).join(' · ')}
                        </div>
                      )}
                      <div className={styles.orderItemQty}>Qty: {item.qty}</div>
                    </div>
                    <div className={styles.orderItemPrice}>{formatPrice(item.price * item.qty)}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Store Pickup Location + Price Summary */}
          <div>
            {/* Store Location Card */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>🏪 Store Pickup Location</h2>
              <div className={styles.address}>
                <strong style={{ fontSize: '1rem', color: 'var(--color-text)' }}>{settings.store_name || 'ARONA MOBILES'}</strong><br />
                {settings.address_line1 || 'ARONA MOBILES, Opp. Town Hall'}<br />
                {settings.address_line2 || 'Main Commercial Road'}, {settings.city || 'Bangalore'}, {settings.state || 'Karnataka'} - {settings.pincode || '560001'}<br />
                {settings.landmark && (
                  <span style={{ color: 'var(--color-text-muted)', fontSize: '0.85rem' }}>
                    ({settings.landmark})
                  </span>
                )}
                <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--color-border)' }}>

                  ⏰ <strong>Store Hours:</strong> {settings.hours_weekdays || 'Mon–Sat: 10:00 AM – 8:30 PM'}<br />
                  👤 <strong>Customer:</strong> {order.address.name} (📞 {order.address.phone})
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                <a
                  href={`tel:${settings.phone_primary_raw}`}
                  className="btn btn--full"
                  style={{ background: '#16a34a', color: '#fff', fontWeight: 600 }}
                >
                  📞 Call Store ({settings.phone_primary})
                </a>
                <a
                  href={`https://wa.me/${settings.whatsapp_number}?text=${encodeURIComponent(
                    `Hi ${settings.store_name || 'ARONA MOBILES'}! I reserved Order #${order.order_number} (${order.items.map(x => x.model).join(', ')}). Could you please confirm pickup readiness?`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--ghost btn--full"
                  style={{ color: '#16a34a', borderColor: '#86efac', fontWeight: 600 }}
                >
                  💬 Chat on WhatsApp
                </a>
              </div>
            </div>


            {/* Price Summary */}
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Payment Summary</h2>
              <div className={styles.priceRows}>
                <div className={styles.priceRow}><span>Items Subtotal</span><span>{formatPrice(order.subtotal)}</span></div>
                {order.discount_amount > 0 && (
                  <div className={`${styles.priceRow} ${styles.priceRowDiscount}`}><span>Discount</span><span>−{formatPrice(order.discount_amount)}</span></div>
                )}
                <div className={styles.priceRow}><span>Store Pickup</span><span style={{ color: 'var(--color-success)', fontWeight: 700 }}>FREE</span></div>
                <hr className="divider" />
                <div className={`${styles.priceRow} ${styles.priceRowTotal}`}><span>Total</span><span>{formatPrice(order.total)}</span></div>
              </div>
              <div className={styles.paymentMethod}>
                Payment: {order.payment_method === 'pay_at_store' ? 'Pay at Store' : order.payment_method?.toUpperCase() || 'Pay at Store'} ·{' '}
                <span className={order.payment_status === 'paid' ? styles.paid : styles.pending}>
                  {order.payment_status === 'paid' ? '✅ Paid' : '⏳ Pay upon Pickup'}
                </span>
              </div>
            </div>

            {/* Store guarantee */}
            <div className={styles.card} style={{ background: 'var(--color-bg-subtle)' }}>
              <h3 style={{ fontSize: '0.9rem', fontWeight: 700, marginBottom: '6px' }}>Store Visit Checklist:</h3>
              <ul style={{ paddingLeft: '18px', fontSize: '0.85rem', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
                <li>Bring your Order #<strong>{order.order_number}</strong> or phone number.</li>
                <li>Inspect and test the device screen, camera &amp; battery in person.</li>
                <li>Our technicians can help transfer your WhatsApp &amp; data for free.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
