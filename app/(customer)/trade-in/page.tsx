'use client';

import { useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { showToast } from '@/components/customer/Toast/Toast';
import styles from './page.module.css';

const CONDITION_QUESTIONS = [
  { id: 'screen_condition', label: 'Screen condition?', options: ['Like New', 'Minor Scratches', 'Visible Cracks', 'Shattered'] },
  { id: 'body_condition', label: 'Body / back condition?', options: ['Like New', 'Minor Scratches', 'Dents/Bends', 'Broken'] },
  { id: 'battery_health', label: 'Approximate battery life?', options: ['All day (80%+)', 'Half day (60–80%)', 'Poor (below 60%)', 'Not sure'] },
  { id: 'charging_port', label: 'Charging port working?', options: ['Yes, perfectly', 'Sometimes', 'No'] },
  { id: 'camera_condition', label: 'Camera working?', options: ['Perfect', 'Minor issues', 'Not working'] },
  { id: 'accessories', label: 'What do you have?', options: ['Phone only', 'Phone + Box', 'Phone + Charger + Box', 'All accessories'] },
];

function estimateValue(brand: string, model: string, answers: Record<string, string>): number {
  let base = 5000;
  if (brand.toLowerCase().includes('apple')) base = 12000;
  if (brand.toLowerCase().includes('samsung')) base = 8000;

  const screenPenalty   = { 'Like New': 0, 'Minor Scratches': 0.05, 'Visible Cracks': 0.25, 'Shattered': 0.5 };
  const bodyPenalty     = { 'Like New': 0, 'Minor Scratches': 0.05, 'Dents/Bends': 0.15, 'Broken': 0.40 };
  const batteryPenalty  = { 'All day (80%+)': 0, 'Half day (60–80%)': 0.1, 'Poor (below 60%)': 0.25, 'Not sure': 0.15 };

  const sp = screenPenalty[answers.screen_condition as keyof typeof screenPenalty] || 0;
  const bp = bodyPenalty[answers.body_condition as keyof typeof bodyPenalty] || 0;
  const bap = batteryPenalty[answers.battery_health as keyof typeof batteryPenalty] || 0;

  return Math.round(base * (1 - sp - bp - bap));
}

export default function TradeInPage() {
  const [step, setStep] = useState(1);
  const [device, setDevice] = useState({ brand: '', model: '', storage: '' });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [estimate, setEstimate] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [slot, setSlot] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAnswer = (id: string, val: string) => setAnswers(a => ({ ...a, [id]: val }));

  const getEstimate = () => {
    const val = estimateValue(device.brand, device.model, answers);
    setEstimate(val);
    setStep(3);
  };

  const submit = async () => {
    setLoading(true);
    try {
      const supabase = getSupabaseClient();
      await supabase.from('trade_in_requests').insert({
        device_info: device,
        condition_answers: answers,
        estimated_value: estimate,
        status: 'submitted',
        scheduled_slot: slot || null,
      });
      setSubmitted(true);
      showToast({ type: 'success', title: 'Trade-in request submitted!', message: 'We\'ll confirm the final value within 24h.' });
    } catch {
      showToast({ type: 'error', title: 'Submission failed', message: 'Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className={`container ${styles.successPage}`}>
        <div className={styles.successIcon}>✅</div>
        <h1>Trade-In Request Submitted!</h1>
        <p>Our team will review your submission and confirm the final value within 24 hours. A pickup will be scheduled at your convenience.</p>
        <a href="/" className="btn btn--primary btn--lg">Continue Shopping</a>
      </div>
    );
  }

  return (
    <div className="container">
      <div className={styles.page}>
        <div className={styles.hero}>
          <span className={styles.heroIcon}>🔁</span>
          <h1 className={styles.heroTitle}>Trade-In Your Phone</h1>
          <p className={styles.heroDesc}>Get an instant estimate and turn your old phone into cash or credit. We pick it up for free!</p>
        </div>

        {/* Steps indicator */}
        <div className={styles.steps}>
          {['Device Info', 'Condition', 'Your Estimate'].map((s, i) => (
            <div key={s} className={`${styles.stepItem} ${step > i + 1 ? styles.done : step === i + 1 ? styles.active : ''}`}>
              <span className={styles.stepBall}>{step > i + 1 ? '✓' : i + 1}</span>
              <span>{s}</span>
            </div>
          ))}
        </div>

        <div className={styles.formCard}>
          {/* Step 1: Device Info */}
          {step === 1 && (
            <>
              <h2 className={styles.stepTitle}>Which phone do you want to trade in?</h2>
              <div className="form-group">
                <label className="form-label">Brand</label>
                <select className="form-input form-select" value={device.brand} onChange={e => setDevice(d => ({ ...d, brand: e.target.value }))}>
                  <option value="">Select brand</option>
                  {['Apple', 'Samsung', 'OnePlus', 'Xiaomi', 'Realme', 'Vivo', 'Google', 'Other'].map(b => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Model (e.g. iPhone 14, Galaxy S22)</label>
                <input className="form-input" value={device.model} onChange={e => setDevice(d => ({ ...d, model: e.target.value }))} placeholder="Enter exact model name" />
              </div>
              <div className="form-group">
                <label className="form-label">Storage</label>
                <select className="form-input form-select" value={device.storage} onChange={e => setDevice(d => ({ ...d, storage: e.target.value }))}>
                  <option value="">Select storage</option>
                  {['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
              <button className="btn btn--primary btn--lg" disabled={!device.brand || !device.model} onClick={() => setStep(2)}>
                Next: Condition Check →
              </button>
            </>
          )}

          {/* Step 2: Condition */}
          {step === 2 && (
            <>
              <h2 className={styles.stepTitle}>Tell us about your {device.brand} {device.model}</h2>
              {CONDITION_QUESTIONS.map(q => (
                <div key={q.id} className={styles.question}>
                  <div className={styles.questionLabel}>{q.label}</div>
                  <div className={styles.optionGrid}>
                    {q.options.map(opt => (
                      <button
                        key={opt}
                        className={`${styles.optionBtn} ${answers[q.id] === opt ? styles.optionBtnActive : ''}`}
                        onClick={() => handleAnswer(q.id, opt)}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
              <div className={styles.backNext}>
                <button className="btn btn--ghost" onClick={() => setStep(1)}>← Back</button>
                <button className="btn btn--primary btn--lg"
                  disabled={Object.keys(answers).length < CONDITION_QUESTIONS.length}
                  onClick={getEstimate}>
                  Get Instant Estimate →
                </button>
              </div>
            </>
          )}

          {/* Step 3: Estimate */}
          {step === 3 && estimate !== null && (
            <>
              <div className={styles.estimateBox}>
                <div className={styles.estimateLabel}>Estimated Trade-In Value</div>
                <div className={styles.estimateValue}>
                  ₹{estimate.toLocaleString('en-IN')}
                </div>
                <div className={styles.estimateNote}>
                  * Final value confirmed after physical inspection. May vary ±10%.
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Preferred Pickup Date & Time (optional)</label>
                <input className="form-input" type="datetime-local" value={slot}
                  onChange={e => setSlot(e.target.value)} min={new Date().toISOString().slice(0, 16)} />
              </div>

              <div className={styles.trustPoints}>
                <div>✅ Free doorstep pickup</div>
                <div>💰 Instant payment</div>
                <div>🔒 Data wiped securely</div>
              </div>

              <div className={styles.backNext}>
                <button className="btn btn--ghost" onClick={() => setStep(2)}>← Revise</button>
                <button className="btn btn--primary btn--lg" onClick={submit} disabled={loading}>
                  {loading ? 'Submitting...' : 'Submit Trade-In Request'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
