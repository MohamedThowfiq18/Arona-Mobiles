'use client';

import { useState, useEffect } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { showToast } from '@/components/customer/Toast/Toast';
import type { Product } from '@/lib/types';
import styles from './page.module.css';

const CONDITION_QUESTIONS = [
  { id: 'screen_condition', label: 'Screen condition?', options: ['Like New', 'Minor Scratches', 'Visible Cracks', 'Shattered'] },
  { id: 'body_condition', label: 'Body / back condition?', options: ['Like New', 'Minor Scratches', 'Dents/Bends', 'Broken'] },
  { id: 'battery_health', label: 'Approximate battery life?', options: ['All day (80%+)', 'Half day (60–80%)', 'Poor (below 60%)', 'Not sure'] },
  { id: 'charging_port', label: 'Charging port working?', options: ['Yes, perfectly', 'Sometimes', 'No'] },
  { id: 'camera_condition', label: 'Camera working?', options: ['Perfect', 'Minor issues', 'Not working'] },
  { id: 'accessories', label: 'What do you have?', options: ['Phone only', 'Phone + Box', 'Phone + Charger + Box', 'All accessories'] },
];

/**
 * Resolves the phone's current Arona Mobiles selling price from catalog data.
 * Uses current selling price (discount_price or price), NOT launch price or MRP.
 */
function getPhoneSellingPrice(
  brand: string,
  model: string,
  storage: string,
  products: Product[]
): number {
  if (!products || products.length === 0) {
    return 30000;
  }

  const cleanBrand = (brand || '').trim().toLowerCase();
  const cleanModel = (model || '').trim().toLowerCase();
  const cleanStorage = (storage || '').trim().toLowerCase();

  // 1. Exact match on brand and model
  let matched = products.find(
    p => p.brand.toLowerCase() === cleanBrand && p.model.toLowerCase() === cleanModel
  );

  // 2. Partial match (e.g. "iPhone 14" in catalog product title/model)
  if (!matched && cleanModel) {
    matched = products.find(
      p =>
        (p.brand.toLowerCase() === cleanBrand || cleanBrand === 'other') &&
        (p.model.toLowerCase().includes(cleanModel) || cleanModel.includes(p.model.toLowerCase()))
    );
  }

  // 3. Fallback to same brand
  if (!matched && cleanBrand && cleanBrand !== 'other') {
    matched = products.find(p => p.brand.toLowerCase() === cleanBrand);
  }

  // 4. Extract current selling price (variant price if matching storage, else product selling price)
  if (matched) {
    if (cleanStorage && Array.isArray(matched.variants) && matched.variants.length > 0) {
      const variant = matched.variants.find(
        v => v.storage && v.storage.toLowerCase().includes(cleanStorage)
      );
      if (variant) {
        const vPrice = Number(variant.discount_price ?? variant.price);
        if (vPrice > 0) return vPrice;
      }
    }

    const sPrice = Number(matched.discount_price ?? matched.price);
    if (sPrice > 0) return sPrice;
  }

  // 5. Dynamic average across active catalog
  const activePrices = products
    .map(p => Number(p.discount_price ?? p.price))
    .filter(p => p > 0);

  if (activePrices.length > 0) {
    const avg = activePrices.reduce((a, b) => a + b, 0) / activePrices.length;
    return Math.round(avg);
  }

  return 30000;
}

/**
 * Calculates Trade-In estimate based primarily on CURRENT ARONA MOBILES SELLING PRICE.
 * Condition Maximums:
 * - Excellent: UP TO 83% of selling price
 * - Good:      UP TO 73% of selling price
 * - Fair:      UP TO 63% of selling price
 * - Poor:      UP TO 50% of selling price
 * 
 * Safety Invariant: Estimate is strictly lower than selling price (never equal or greater).
 */
function estimateValue(
  brand: string,
  model: string,
  storage: string,
  answers: Record<string, string>,
  products: Product[]
): number {
  const sellingPrice = getPhoneSellingPrice(brand, model, storage, products);
  if (sellingPrice <= 0) return 0;

  const screen = answers.screen_condition || 'Like New';
  const body = answers.body_condition || 'Like New';
  const battery = answers.battery_health || 'All day (80%+)';
  const charging = answers.charging_port || 'Yes, perfectly';
  const camera = answers.camera_condition || 'Perfect';
  const accessories = answers.accessories || 'All accessories';

  // Determine Condition Tier
  const isPoor =
    screen === 'Shattered' ||
    body === 'Broken' ||
    camera === 'Not working' ||
    charging === 'No' ||
    battery === 'Poor (below 60%)';

  const isFair =
    !isPoor &&
    (screen === 'Visible Cracks' ||
      body === 'Dents/Bends' ||
      camera === 'Minor issues' ||
      charging === 'Sometimes');

  const isGood =
    !isPoor &&
    !isFair &&
    (screen === 'Minor Scratches' ||
      body === 'Minor Scratches' ||
      battery === 'Half day (60–80%)' ||
      battery === 'Not sure');

  let maxConditionPercentage = 0.83; // Excellent: UP TO 83%
  if (isPoor) {
    maxConditionPercentage = 0.50;  // Poor: UP TO 50%
  } else if (isFair) {
    maxConditionPercentage = 0.63;  // Fair: UP TO 63%
  } else if (isGood) {
    maxConditionPercentage = 0.73;  // Good: UP TO 73%
  }

  // Deductions based on detailed inspection answers
  let deductionPct = 0;

  // Accessories
  if (accessories === 'Phone only') {
    deductionPct += 0.03;
  } else if (accessories === 'Phone + Box') {
    deductionPct += 0.015;
  }

  // Minor wear inside Good tier
  if (isGood) {
    if (screen === 'Minor Scratches') deductionPct += 0.005;
    if (body === 'Minor Scratches') deductionPct += 0.005;
    if (battery === 'Not sure') deductionPct += 0.01;
  }

  // Fair tier deductions
  if (isFair) {
    if (screen === 'Visible Cracks') deductionPct += 0.02;
    if (body === 'Dents/Bends') deductionPct += 0.015;
    if (camera === 'Minor issues') deductionPct += 0.015;
    if (charging === 'Sometimes') deductionPct += 0.015;
  }

  // Poor tier deductions
  if (isPoor) {
    if (screen === 'Shattered') deductionPct += 0.03;
    if (body === 'Broken') deductionPct += 0.03;
    if (camera === 'Not working') deductionPct += 0.02;
    if (charging === 'No') deductionPct += 0.02;
  }

  const effectivePct = Math.max(0.20, maxConditionPercentage - deductionPct);
  let rawEstimate = Math.round(sellingPrice * effectivePct);

  // Round to nearest 50 for clean presentation
  let estimate = Math.round(rawEstimate / 50) * 50;

  // Condition maximum cap (e.g. 83% for excellent, 73% for good, 63% for fair, 50% for poor)
  const conditionMax = Math.round(sellingPrice * maxConditionPercentage);
  estimate = Math.min(estimate, conditionMax);

  // CRITICAL INVARIANT: Trade-in value must NEVER equal or exceed the Arona selling price
  const absoluteMax = Math.max(0, sellingPrice - 500);
  estimate = Math.min(estimate, absoluteMax);

  return Math.max(500, estimate);
}

export default function TradeInPage() {
  const [step, setStep] = useState(1);
  const [device, setDevice] = useState({ brand: '', model: '', storage: '' });
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [estimate, setEstimate] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [slot, setSlot] = useState('');
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    async function loadCatalog() {
      try {
        const res = await fetch('/api/products');
        if (res.ok) {
          const data = await res.json();
          if (data.products && Array.isArray(data.products)) {
            setProducts(data.products);
          }
        }
      } catch (err) {
        console.error('Error fetching catalog for trade-in:', err);
      }
    }
    loadCatalog();
  }, []);

  const handleAnswer = (id: string, val: string) => setAnswers(a => ({ ...a, [id]: val }));

  const getEstimate = () => {
    const val = estimateValue(device.brand, device.model, device.storage, answers, products);
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
                <input
                  className="form-input"
                  list="trade-in-models"
                  value={device.model}
                  onChange={e => setDevice(d => ({ ...d, model: e.target.value }))}
                  placeholder="Enter exact model name"
                />
                <datalist id="trade-in-models">
                  {products
                    .filter(p => !device.brand || p.brand.toLowerCase() === device.brand.toLowerCase())
                    .map(p => (
                      <option key={p.id} value={p.model} />
                    ))}
                </datalist>
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
