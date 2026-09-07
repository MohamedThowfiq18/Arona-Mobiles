'use client';

import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { showToast } from '@/components/customer/Toast/Toast';
import styles from './page.module.css';

const SERVICES = [
  { id: 'screen', label: 'Screen Replacement', icon: '📱', price: 'From ₹1,499' },
  { id: 'battery', label: 'Battery Replacement', icon: '🔋', price: 'From ₹799' },
  { id: 'charging_port', label: 'Charging Port Repair', icon: '🔌', price: 'From ₹599' },
  { id: 'camera', label: 'Camera Repair', icon: '📷', price: 'From ₹999' },
  { id: 'speaker', label: 'Speaker / Mic Repair', icon: '🔊', price: 'From ₹499' },
  { id: 'water_damage', label: 'Water Damage Treatment', icon: '💧', price: 'From ₹1,999' },
  { id: 'software', label: 'Software Issues / Reset', icon: '⚙️', price: 'From ₹299' },
  { id: 'other', label: 'Other Issue', icon: '🔧', price: 'Get a quote' },
];

export default function RepairPage() {
  const [selectedService, setSelectedService] = useState('');
  const [device, setDevice] = useState({ brand: '', model: '', issue: '' });
  const [slot, setSlot] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!selectedService || !device.brand || !device.model) {
      showToast({ type: 'error', title: 'Please fill all required fields' });
      return;
    }
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      await supabase.from('repair_bookings').insert({
        service_type: SERVICES.find(s => s.id === selectedService)?.label || selectedService,
        device_info: device,
        scheduled_slot: slot || null,
        status: 'booked',
      });
      setSubmitted(true);
      showToast({ type: 'success', title: 'Repair booked!', message: 'We\'ll confirm your appointment shortly.' });
    } catch {
      showToast({ type: 'error', title: 'Booking failed', message: 'Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={`container ${styles.success}`}>
        <span className={styles.successIcon}>🔧</span>
        <h1>Repair Booked Successfully!</h1>
        <p>We&apos;ll confirm your appointment via SMS. Bring your device to our service centre or we&apos;ll pick it up.</p>
        <a href="/" className="btn btn--primary btn--lg">Back to Home</a>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={styles.page}>
        <div className={styles.hero}>
          <h1 className={styles.title}>📱 Repair & Mobile Care</h1>
          <p className={styles.desc}>Expert repairs by certified technicians. Same-day service for most repairs. 3-month warranty on all work.</p>
        </div>

        <div className={styles.layout}>
          <div className={styles.left}>
            {/* Service selection */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Select Service</h2>
              <div className={styles.serviceGrid}>
                {SERVICES.map(s => (
                  <button
                    key={s.id}
                    className={`${styles.serviceCard} ${selectedService === s.id ? styles.serviceCardActive : ''}`}
                    onClick={() => setSelectedService(s.id)}
                  >
                    <span className={styles.serviceIcon}>{s.icon}</span>
                    <span className={styles.serviceLabel}>{s.label}</span>
                    <span className={styles.servicePrice}>{s.price}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Device info */}
            <div className={styles.section}>
              <h2 className={styles.sectionTitle}>Your Device</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div className="form-group">
                  <label className="form-label">Brand *</label>
                  <input className="form-input" placeholder="e.g. Apple, Samsung" value={device.brand}
                    onChange={e => setDevice(d => ({ ...d, brand: e.target.value }))} />
                </div>
                <div className="form-group">
                  <label className="form-label">Model *</label>
                  <input className="form-input" placeholder="e.g. iPhone 13, S23" value={device.model}
                    onChange={e => setDevice(d => ({ ...d, model: e.target.value }))} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Describe the issue (optional)</label>
                <textarea className="form-input" rows={3} placeholder="Any extra details..." value={device.issue}
                  onChange={e => setDevice(d => ({ ...d, issue: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Preferred Date & Time (optional)</label>
                <input className="form-input" type="datetime-local" value={slot}
                  onChange={e => setSlot(e.target.value)} min={new Date().toISOString().slice(0, 16)} />
              </div>
              <button
                id="book-repair-btn"
                className="btn btn--primary btn--lg btn--full"
                onClick={submit}
                disabled={loading}
              >
                {loading ? 'Booking...' : '🔧 Book Repair'}
              </button>
            </div>
          </div>

          <div className={styles.right}>
            <div className={styles.infoCard}>
              <h3>Why Arona Mobiles Repair?</h3>
              <ul className={styles.bullets}>
                <li>✅ Certified technicians</li>
                <li>🛡️ 3-month repair warranty</li>
                <li>⚡ Same-day repair for most issues</li>
                <li>💯 Genuine spare parts</li>
                <li>🏪 Quick in-store inspection &amp; diagnosis</li>
                <li>💬 Status updates via WhatsApp &amp; SMS</li>
              </ul>
            </div>
            <div className={styles.infoCard}>
              <h3>Service Hours</h3>
              <p>Mon–Sat: 10:00 AM – 8:30 PM</p>
              <p>Sunday: 11:00 AM – 6:00 PM</p>
              <p style={{ marginTop: 12, color: 'var(--color-accent)', fontWeight: 600 }}>
                <a href="tel:+919787061617" style={{ color: 'inherit' }}>📞 +91 97870 61617</a>
                <br />
                <a href="tel:+919659458606" style={{ color: 'inherit' }}>📞 +91 96594 58606</a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
