'use client';

import { useState, useEffect } from 'react';
import { showToast } from '@/components/customer/Toast/Toast';
import type { StoreSettings } from '@/lib/types';
import styles from './page.module.css';

export default function OwnerSettingsPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form State
  const [storeName, setStoreName] = useState('ARONA MOBILES');
  const [tagline, setTagline] = useState('Your Trusted Mobile Phone Store');
  const [phonePrimary, setPhonePrimary] = useState('+91 97870 61617');
  const [phoneSecondary, setPhoneSecondary] = useState('+91 96594 58606');
  const [whatsappNumber, setWhatsappNumber] = useState('919787061617');
  const [authorizedPhones, setAuthorizedPhones] = useState<string[]>(['9787061617', '9659458606', '9994235672']);
  const [newAuthPhone, setNewAuthPhone] = useState('');

  // Store Address & Hours
  const [line1, setLine1] = useState('ARONA MOBILES, Opp. Town Hall');
  const [line2, setLine2] = useState('Main Commercial Road');
  const [city, setCity] = useState('Bangalore');
  const [state, setState] = useState('Karnataka');
  const [pincode, setPincode] = useState('560001');
  const [landmark, setLandmark] = useState('Opposite Town Hall, near Central Junction');
  const [hoursWeekdays, setHoursWeekdays] = useState('Mon–Sat: 10:00 AM – 8:30 PM');
  const [hoursSunday, setHoursSunday] = useState('Sunday: 11:00 AM – 6:00 PM');
  const [mapsUrl, setMapsUrl] = useState('https://maps.app.goo.gl/BREhQPtfQ333NG248?g_st=ac');
  const [announcement, setAnnouncement] = useState('🎉 Big Exchange Offers & Same-Day In-Store Pickup Available!');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/owner/settings');
      if (res.ok) {
        const data = await res.json();
        if (data.settings) {
          const s: StoreSettings = data.settings;
          setStoreName(s.store_name || 'ARONA MOBILES');
          setTagline(s.tagline || 'Your Trusted Mobile Phone Store');
          setPhonePrimary(s.phone_primary || '+91 97870 61617');
          setPhoneSecondary(s.phone_secondary || '+91 96594 58606');
          setWhatsappNumber(s.whatsapp_number || '919787061617');
          if (Array.isArray(s.authorized_owner_phones)) {
            setAuthorizedPhones(s.authorized_owner_phones);
          }
          setLine1(s.address_line1 || 'ARONA MOBILES, Opp. Town Hall');
          setLine2(s.address_line2 || 'Main Commercial Road');
          setCity(s.city || 'Bangalore');
          setState(s.state || 'Karnataka');
          setPincode(s.pincode || '560001');
          setLandmark(s.landmark || 'Opposite Town Hall, near Central Junction');
          setHoursWeekdays(s.hours_weekdays || 'Mon–Sat: 10:00 AM – 8:30 PM');
          setHoursSunday(s.hours_sunday || 'Sunday: 11:00 AM – 6:00 PM');
          setMapsUrl(s.google_maps_url || 'https://maps.app.goo.gl/BREhQPtfQ333NG248?g_st=ac');
          setAnnouncement(s.announcement_bar || '');
        }
      }
    } catch {
      showToast({ type: 'error', title: 'Failed to load store settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddAuthPhone = () => {
    const clean = newAuthPhone.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) {
      showToast({ type: 'error', title: 'Invalid phone number', message: 'Enter a valid 10-digit mobile number' });
      return;
    }
    if (authorizedPhones.includes(clean)) {
      showToast({ type: 'error', title: 'Number already authorized' });
      return;
    }
    setAuthorizedPhones(prev => [...prev, clean]);
    setNewAuthPhone('');
    showToast({ type: 'success', title: `Authorized ${clean}` });
  };

  const handleRemoveAuthPhone = (phone: string) => {
    if (authorizedPhones.length <= 1) {
      showToast({ type: 'error', title: 'Cannot remove last owner phone' });
      return;
    }
    setAuthorizedPhones(prev => prev.filter(p => p !== phone));
  };

  const handleSave = async () => {
    if (!phonePrimary.trim()) {
      showToast({ type: 'error', title: 'Primary phone is required' });
      return;
    }

    setSaving(true);
    try {
      const payload: Partial<StoreSettings> = {
        store_name: storeName.trim(),
        tagline: tagline.trim(),
        phone_primary: phonePrimary.trim(),
        phone_secondary: phoneSecondary.trim(),
        whatsapp_number: whatsappNumber.trim(),
        authorized_owner_phones: authorizedPhones,
        address_line1: line1.trim(),
        address_line2: line2.trim(),
        city: city.trim(),
        state: state.trim(),
        pincode: pincode.trim(),
        landmark: landmark.trim(),
        hours_weekdays: hoursWeekdays.trim(),
        hours_sunday: hoursSunday.trim(),
        google_maps_url: mapsUrl.trim(),
        announcement_bar: announcement.trim(),
      };

      const res = await fetch('/api/owner/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save settings');
      }

      showToast({
        type: 'success',
        title: 'Phone numbers & Store settings updated!',
        message: 'Changes are live in the database and updated for all users in real-time.',
      });

      if (data.settings) {
        setPhonePrimary(data.settings.phone_primary);
        setPhoneSecondary(data.settings.phone_secondary);
        setWhatsappNumber(data.settings.whatsapp_number);
      }
    } catch (err: unknown) {
      showToast({
        type: 'error',
        title: 'Update failed',
        message: err instanceof Error ? err.message : 'Please try again',
      });
    } finally {
      setSaving(false);
    }
  };

  const rawPrimary = phonePrimary.replace(/\D/g, '').slice(-10);
  const rawSecondary = phoneSecondary.replace(/\D/g, '').slice(-10);
  const rawWa = whatsappNumber.replace(/\D/g, '');

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Store & Phone Management</h1>
          <p className={styles.subtitle}>
            Manage owner contact numbers, WhatsApp support, and authorized owner login accounts centrally in the cloud database.
          </p>
        </div>
        <button
          id="save-settings-btn"
          type="button"
          className="btn btn--primary btn--lg"
          onClick={handleSave}
          disabled={saving || loading}
        >
          {saving ? 'Saving...' : '💾 Save All Changes'}
        </button>
      </div>

      <div className={styles.grid}>
        {/* Left Column: Form Fields */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          {/* Owner Phone Numbers Card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span>📞</span>
              <span>Owner & Store Contact Numbers</span>
            </h2>
            <p className={styles.cardDesc}>
              These phone numbers are displayed to all customers across the website header, footer, product inquiry buttons, call buttons, and checkout.
            </p>

            <div className={styles.formGrid}>
              <div className="form-group">
                <label className="form-label">Primary Call Phone Number *</label>
                <input
                  id="settings-primary-phone"
                  className="form-input"
                  value={phonePrimary}
                  onChange={e => setPhonePrimary(e.target.value)}
                  placeholder="e.g. +91 97870 61617 or 9787061617"
                />
                <div className={styles.inputHelper}>
                  Primary calling line for customer inquiries and reservations.
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Secondary / Alternative Phone Number</label>
                <input
                  id="settings-secondary-phone"
                  className="form-input"
                  value={phoneSecondary}
                  onChange={e => setPhoneSecondary(e.target.value)}
                  placeholder="e.g. +91 96594 58606 or 9659458606"
                />
                <div className={styles.inputHelper}>
                  Alternative store phone line.
                </div>
              </div>

              <div className={`form-group ${styles.fullWidth}`}>
                <label className="form-label">WhatsApp Business / Support Number *</label>
                <input
                  id="settings-whatsapp-phone"
                  className="form-input"
                  value={whatsappNumber}
                  onChange={e => setWhatsappNumber(e.target.value)}
                  placeholder="e.g. 919787061617 or 9787061617"
                />
                <div className={styles.inputHelper}>
                  WhatsApp number used for instant product inquiries, pre-order chat, and floating WhatsApp widget.
                </div>
              </div>
            </div>
          </div>

          {/* Authorized Owner Login Numbers Card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span>👑</span>
              <span>Authorized Owner Portal Login Numbers</span>
            </h2>
            <p className={styles.cardDesc}>
              Only mobile numbers listed here can log in to the Owner Portal. Add or update numbers to grant owner access.
            </p>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                className="form-input"
                style={{ flex: 1 }}
                value={newAuthPhone}
                onChange={e => setNewAuthPhone(e.target.value)}
                placeholder="Enter 10-digit mobile number (e.g. 9876543210)"
                maxLength={12}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddAuthPhone();
                  }
                }}
              />
              <button
                type="button"
                className="btn btn--secondary"
                onClick={handleAddAuthPhone}
                id="add-auth-phone-btn"
              >
                + Add Number
              </button>
            </div>

            <div className={styles.phoneTagList}>
              {authorizedPhones.map(phone => (
                <span key={phone} className={styles.phoneTag}>
                  📱 +91 {phone.slice(0, 5)} {phone.slice(5)}
                  <button
                    type="button"
                    className={styles.phoneTagRemove}
                    onClick={() => handleRemoveAuthPhone(phone)}
                    title="Remove access"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Store Address & Hours Card */}
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span>🏪</span>
              <span>Store Location & Hours</span>
            </h2>

            <div className={styles.formGrid}>
              <div className="form-group">
                <label className="form-label">Store Name</label>
                <input
                  className="form-input"
                  value={storeName}
                  onChange={e => setStoreName(e.target.value)}
                  placeholder="ARONA MOBILES"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Tagline</label>
                <input
                  className="form-input"
                  value={tagline}
                  onChange={e => setTagline(e.target.value)}
                  placeholder="Your Trusted Mobile Phone Store"
                />
              </div>

              <div className={`form-group ${styles.fullWidth}`}>
                <label className="form-label">Address Line 1</label>
                <input
                  className="form-input"
                  value={line1}
                  onChange={e => setLine1(e.target.value)}
                  placeholder="ARONA MOBILES, Opp. Town Hall"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Address Line 2 / Landmark</label>
                <input
                  className="form-input"
                  value={line2}
                  onChange={e => setLine2(e.target.value)}
                  placeholder="Main Commercial Road"
                />
              </div>

              <div className="form-group">
                <label className="form-label">City, State, Pincode</label>
                <div className={styles.cityGrid}>
                  <input className="form-input" value={city} onChange={e => setCity(e.target.value)} placeholder="City" />
                  <input className="form-input" value={state} onChange={e => setState(e.target.value)} placeholder="State" />
                  <input className="form-input" value={pincode} onChange={e => setPincode(e.target.value)} placeholder="PIN" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Weekday Hours</label>
                <input
                  className="form-input"
                  value={hoursWeekdays}
                  onChange={e => setHoursWeekdays(e.target.value)}
                  placeholder="Mon–Sat: 10:00 AM – 8:30 PM"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Sunday Hours</label>
                <input
                  className="form-input"
                  value={hoursSunday}
                  onChange={e => setHoursSunday(e.target.value)}
                  placeholder="Sunday: 11:00 AM – 6:00 PM"
                />
              </div>

              <div className={`form-group ${styles.fullWidth}`}>
                <label className="form-label">Google Maps URL</label>
                <input
                  className="form-input"
                  value={mapsUrl}
                  onChange={e => setMapsUrl(e.target.value)}
                  placeholder="https://maps.app.goo.gl/..."
                />
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Storefront Preview & Quick Test */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>
              <span>⚡</span>
              <span>Live Action & Test Links</span>
            </h2>
            <p className={styles.cardDesc}>
              Test how customer call and WhatsApp links work on all mobile and desktop devices.
            </p>

            <div className={styles.previewBox}>
              <div className={styles.previewTitle}>Active Store Contact Preview</div>

              <div className={styles.previewItem}>
                <div className={styles.previewItemLabel}>
                  <span>📞 Primary Call</span>
                </div>
                <div className={styles.previewItemValue}>{phonePrimary}</div>
              </div>

              <div className={styles.previewItem}>
                <div className={styles.previewItemLabel}>
                  <span>📞 Secondary Call</span>
                </div>
                <div className={styles.previewItemValue}>{phoneSecondary}</div>
              </div>

              <div className={styles.previewItem}>
                <div className={styles.previewItemLabel}>
                  <span>💬 WhatsApp</span>
                </div>
                <div className={styles.previewItemValue}>+{rawWa || '919787061617'}</div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
                <a
                  href={`tel:+91${rawPrimary}`}
                  className={styles.testBtn}
                  style={{ background: '#2563eb', color: '#fff', justifyContent: 'center' }}
                >
                  📞 Test Call Primary Phone
                </a>
                <a
                  href={`https://wa.me/${rawWa.length >= 10 ? (rawWa.startsWith('91') ? rawWa : `91${rawWa}`) : '919787061617'}?text=${encodeURIComponent('Hi ARONA MOBILES! Testing store WhatsApp contact.')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.testBtn}
                  style={{ background: '#16a34a', color: '#fff', justifyContent: 'center' }}
                >
                  💬 Test WhatsApp Direct Chat
                </a>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.testBtn}
                  style={{ justifyContent: 'center' }}
                >
                  📍 Open Store on Google Maps
                </a>
              </div>
            </div>

            <div style={{ marginTop: '12px', padding: '12px', background: 'rgba(59, 130, 246, 0.08)', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
              <div style={{ fontWeight: 700, fontSize: '0.85rem', color: 'var(--color-primary)' }}>
                🔄 Automatic Real-Time Sync
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-muted)', marginTop: '4px', lineHeight: 1.4 }}>
                When you click &ldquo;Save All Changes&rdquo;, the updated numbers are saved to the cloud database and instantly broadcast to all active website visitors without requiring any redeployment.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
