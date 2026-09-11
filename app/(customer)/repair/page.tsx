'use client';

import { useState } from 'react';
import Link from 'next/link';
import { showToast } from '@/components/customer/Toast/Toast';
import { useStoreSettings } from '@/components/customer/StoreSettingsProvider/StoreSettingsProvider';
import styles from './page.module.css';

const SERVICES = [
  { id: 'screen', label: 'Screen Replacement', icon: '📱', price: 'From ₹1,499', numericPrice: 1499 },
  { id: 'battery', label: 'Battery Replacement', icon: '🔋', price: 'From ₹799', numericPrice: 799 },
  { id: 'charging_port', label: 'Charging Port Repair', icon: '🔌', price: 'From ₹599', numericPrice: 599 },
  { id: 'camera', label: 'Camera Repair', icon: '📷', price: 'From ₹999', numericPrice: 999 },
  { id: 'speaker', label: 'Speaker / Mic Repair', icon: '🔊', price: 'From ₹499', numericPrice: 499 },
  { id: 'water_damage', label: 'Water Damage Treatment', icon: '💧', price: 'From ₹1,999', numericPrice: 1999 },
  { id: 'software', label: 'Software Issues / Reset', icon: '⚙️', price: 'From ₹299', numericPrice: 299 },
  { id: 'other', label: 'Other Issue', icon: '🔧', price: 'Get a quote', numericPrice: null },
];

interface BookingSuccessData {
  id: string;
  customerName: string;
  customerPhone: string;
  phoneBrand: string;
  phoneModel: string;
  serviceType: string;
  servicePrice: number | null;
  preferredDateTime: string;
  status: string;
}

export default function RepairPage() {
  const { settings } = useStoreSettings();
  const [selectedService, setSelectedService] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [device, setDevice] = useState({ brand: '', model: '', issue: '' });
  const [slot, setSlot] = useState('');
  const [submittedData, setSubmittedData] = useState<BookingSuccessData | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyBookingId = (id: string) => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(id).then(() => {
        setCopied(true);
        showToast({ type: 'success', title: 'Booking ID copied!', message: 'You can use it anytime to track your repair.' });
        setTimeout(() => setCopied(false), 2500);
      }).catch(() => {
        showToast({ type: 'info', title: 'Booking ID', message: id });
      });
    }
  };

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // Client-side quick checks before submitting
    if (!selectedService) {
      showToast({ type: 'error', title: 'Please select a repair service.' });
      return;
    }
    if (!customerName.trim() || customerName.trim().length < 2) {
      showToast({ type: 'error', title: 'Please enter your name.' });
      return;
    }
    const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanPhone)) {
      showToast({ type: 'error', title: 'Please enter a valid 10-digit Indian mobile number.' });
      return;
    }
    if (!device.brand.trim()) {
      showToast({ type: 'error', title: 'Please enter your phone brand (e.g. Apple, Samsung).' });
      return;
    }
    if (!device.model.trim()) {
      showToast({ type: 'error', title: 'Please enter your phone model (e.g. iPhone 13).' });
      return;
    }
    if (!slot) {
      showToast({ type: 'error', title: 'Please select your preferred appointment date and time.' });
      return;
    }

    const serviceObj = SERVICES.find(s => s.id === selectedService);
    const serviceLabel = serviceObj?.label || selectedService;
    const servicePrice = serviceObj?.numericPrice ?? null;

    setLoading(true);

    try {
      const response = await fetch('/api/repairs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          customerName: customerName.trim(),
          customerPhone: cleanPhone,
          phoneBrand: device.brand.trim(),
          phoneModel: device.model.trim(),
          issueDescription: device.issue.trim() || undefined,
          serviceType: serviceLabel,
          servicePrice,
          preferredDateTime: slot,
        }),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok || !result.success) {
        showToast({
          type: 'error',
          title: 'Booking Failed',
          message: result.error || 'Unable to submit your repair booking. Please try again.',
        });
        return;
      }

      setSubmittedData(result.booking);
      showToast({
        type: 'success',
        title: 'Repair appointment booked successfully!',
        message: 'We have recorded your booking and will confirm your slot shortly.',
      });
    } catch (err) {
      console.error('[Repair Booking] Network error:', err);
      showToast({
        type: 'error',
        title: 'Network Error',
        message: 'Could not reach server. Please check your connection and try again.',
      });
    } finally {
      setLoading(false);
    }
  };

  if (submittedData) {
    const formattedDate = new Date(submittedData.preferredDateTime).toLocaleString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    return (
      <div className={`container ${styles.success}`}>
        <span className={styles.successIcon}>🔧</span>
        <h1>Repair appointment booked successfully!</h1>
        <p className={styles.desc}>
          Thank you, <strong>{submittedData.customerName}</strong>. Your repair appointment has been confirmed in our system.
          Our technicians will prepare for your visit.
        </p>

        <div className={styles.confirmationCard}>
          <div className={styles.confirmRow} style={{ flexWrap: 'wrap', gap: '8px' }}>
            <span className={styles.confirmLabel}>Your Booking ID</span>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span className={styles.bookingIdBadge}>{submittedData.id}</span>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={() => handleCopyBookingId(submittedData.id)}
                style={{ padding: '4px 10px', fontSize: '12px' }}
              >
                {copied ? '✓ Copied!' : '📋 Copy Booking ID'}
              </button>
            </div>
          </div>
          <div style={{ fontSize: '12px', color: 'var(--color-text-muted)', textAlign: 'left', marginTop: '-4px', marginBottom: '8px' }}>
            💡 Save this Booking ID to track your repair.
          </div>
          <div className={styles.confirmRow}>
            <span className={styles.confirmLabel}>Customer Name</span>
            <span className={styles.confirmValue}>{submittedData.customerName}</span>
          </div>
          <div className={styles.confirmRow}>
            <span className={styles.confirmLabel}>Mobile Number</span>
            <span className={styles.confirmValue}>+91 {submittedData.customerPhone}</span>
          </div>
          <div className={styles.confirmRow}>
            <span className={styles.confirmLabel}>Device</span>
            <span className={styles.confirmValue}>{submittedData.phoneBrand} {submittedData.phoneModel}</span>
          </div>
          <div className={styles.confirmRow}>
            <span className={styles.confirmLabel}>Selected Service</span>
            <span className={styles.confirmValue}>{submittedData.serviceType}</span>
          </div>
          <div className={styles.confirmRow}>
            <span className={styles.confirmLabel}>Preferred Date &amp; Time</span>
            <span className={styles.confirmValue}>{formattedDate}</span>
          </div>
          <div className={styles.confirmRow}>
            <span className={styles.confirmLabel}>Status</span>
            <span className={styles.confirmValue} style={{ color: '#F59E0B', textTransform: 'capitalize' }}>
              {submittedData.status}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <Link
            href={`/repair/status?id=${encodeURIComponent(submittedData.id)}&phone=${encodeURIComponent(submittedData.customerPhone)}`}
            className="btn btn--primary btn--lg"
          >
            🔍 Check Repair Status
          </Link>
          <button
            type="button"
            className="btn btn--secondary btn--lg"
            onClick={() => {
              setSubmittedData(null);
              setSelectedService('');
              setDevice({ brand: '', model: '', issue: '' });
              setSlot('');
            }}
          >
            Book Another Repair
          </button>
          <Link href="/" className="btn btn--secondary btn--lg">
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.hero}>
        <div className="container">
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px', background: 'var(--color-bg-subtle, #F3F4F6)', padding: '6px 14px', borderRadius: '9999px', fontSize: '13px', fontWeight: 600 }}>
            <span>Already booked?</span>
            <Link href="/repair/status" style={{ color: 'var(--color-accent)', textDecoration: 'underline' }}>
              Check Repair Status →
            </Link>
          </div>
          <h1 className={styles.title}>Expert Mobile Repair &amp; Service</h1>
          <p className={styles.sub}>
            Fast, reliable phone repairs with 100% genuine parts &amp; 3-month store warranty.
          </p>
        </div>
      </div>

      <div className="container">
        <div className={styles.layout}>
          <div className={styles.left}>
            <form onSubmit={handleSubmit} className={styles.formCard}>
              {/* Section 1: Service Selection */}
              <h2 className={styles.sectionTitle}>1. Select Service Needed *</h2>
              <div className={styles.serviceGrid}>
                {SERVICES.map(s => (
                  <button
                    key={s.id}
                    type="button"
                    className={`${styles.serviceBtn} ${selectedService === s.id ? styles.selected : ''}`}
                    onClick={() => setSelectedService(s.id)}
                  >
                    <span className={styles.serviceIcon}>{s.icon}</span>
                    <span className={styles.serviceLabel}>{s.label}</span>
                    <span className={styles.servicePrice}>{s.price}</span>
                  </button>
                ))}
              </div>

              {/* Section 2: Customer Details */}
              <h2 className={styles.sectionTitle} style={{ marginTop: 32 }}>2. Customer Details</h2>
              <div className="form-group">
                <label className="form-label" htmlFor="customerName">Customer Name *</label>
                <input
                  id="customerName"
                  className="form-input"
                  placeholder="Enter your full name"
                  value={customerName}
                  onChange={e => setCustomerName(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="customerPhone">Customer Phone Number *</label>
                <input
                  id="customerPhone"
                  type="tel"
                  className="form-input"
                  placeholder="e.g. 9876543210 (10-digit mobile number)"
                  value={customerPhone}
                  onChange={e => setCustomerPhone(e.target.value)}
                  maxLength={10}
                  required
                />
              </div>

              {/* Section 3: Device Details */}
              <h2 className={styles.sectionTitle} style={{ marginTop: 32 }}>3. Device Details</h2>
              <div className="form-group">
                <label className="form-label" htmlFor="phoneBrand">Phone Brand *</label>
                <input
                  id="phoneBrand"
                  className="form-input"
                  placeholder="e.g. Apple, Samsung, OnePlus, Xiaomi"
                  value={device.brand}
                  onChange={e => setDevice(d => ({ ...d, brand: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="phoneModel">Phone Model *</label>
                <input
                  id="phoneModel"
                  className="form-input"
                  placeholder="e.g. iPhone 13 Pro, Galaxy S22 Ultra, Nord CE"
                  value={device.model}
                  onChange={e => setDevice(d => ({ ...d, model: e.target.value }))}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="deviceIssue">Describe the Issue (Optional)</label>
                <textarea
                  id="deviceIssue"
                  className="form-input"
                  rows={3}
                  placeholder="e.g. Screen glass shattered, touch working fine, battery discharging quickly..."
                  value={device.issue}
                  onChange={e => setDevice(d => ({ ...d, issue: e.target.value }))}
                />
              </div>

              {/* Section 4: Preferred Date & Time */}
              <h2 className={styles.sectionTitle} style={{ marginTop: 32 }}>4. Preferred Appointment Slot *</h2>
              <div className="form-group">
                <label className="form-label" htmlFor="appointmentSlot">Preferred Date &amp; Time *</label>
                <input
                  id="appointmentSlot"
                  className="form-input"
                  type="datetime-local"
                  value={slot}
                  onChange={e => setSlot(e.target.value)}
                  required
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn--primary btn--lg btn--full"
                disabled={loading}
                style={{ marginTop: 24 }}
              >
                {loading ? 'Booking...' : '🔧 Book Repair Appointment'}
              </button>
            </form>
          </div>

          <div className={styles.right}>
            <div className={styles.infoCard}>
              <h3>Why Choose Us?</h3>
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
              <p>{settings.hours_weekdays || 'Mon–Sat: 10:00 AM – 8:30 PM'}</p>
              <p>{settings.hours_sunday || 'Sunday: 11:00 AM – 6:00 PM'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
