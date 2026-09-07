'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import styles from './HeroBanner.module.css';

interface Slide {
  id: number;
  title: string;
  subtitle: string;
  badge: string;
  cta: string;
  href: string;
  bg: string;
  accent: string;
  heroImage: string;
  imageAlt: string;
  features: string[];
}

const SLIDES: Slide[] = [
  {
    id: 1,
    title: 'iPhone 15 Pro',
    subtitle: 'A17 Pro chip with titanium aerospace-grade design. Experience true pro performance.',
    badge: '⚡ ₹5,000 OFF',
    cta: 'Shop Apple',
    href: '/shop?brand=apple',
    bg: '#EFF6FF',
    accent: '#1D4ED8',
    heroImage: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=900&auto=format&fit=crop&q=80',
    imageAlt: 'Person taking a photo with iPhone 15 Pro',
    features: ['48MP Pro Camera', '5G Ultra-Fast', 'A17 Pro Chip', 'In-Store Demo & Pickup'],
  },
  {
    id: 2,
    title: 'Samsung Galaxy S24 Ultra',
    subtitle: 'Built-in S Pen with 200MP camera and revolutionary Galaxy AI features.',
    badge: '⚡ ₹10,000 OFF',
    cta: 'Explore Samsung',
    href: '/shop?brand=samsung',
    bg: '#F0FDF4',
    accent: '#16A34A',
    heroImage: 'https://images.unsplash.com/photo-1533228876829-65c94e7b5025?w=900&auto=format&fit=crop&q=80',
    imageAlt: 'Person using flagship Samsung Galaxy smartphone',
    features: ['Built-in S Pen', '200MP Camera', 'Galaxy AI', 'Official Warranty'],
  },
  {
    id: 3,
    title: 'Certified Pre-Owned',
    subtitle: '8-point technical inspection with 6-month store warranty. Save up to 50%.',
    badge: '✅ From ₹21,999',
    cta: 'Browse Pre-Owned',
    href: '/certified-preowned',
    bg: '#F5F3FF',
    accent: '#7C3AED',
    heroImage: 'https://images.unsplash.com/photo-1567581935884-3349723552ca?w=900&auto=format&fit=crop&q=80',
    imageAlt: 'Customer browsing certified pre-owned smartphone',
    features: ['6-Month Store Warranty', 'Grade A/B/C Verified', '100% Tested Genuine', 'Instant Exchange'],
  },
];

export default function HeroBanner() {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrent(c => (c + 1) % SLIDES.length), 6000);
    return () => clearInterval(timer);
  }, []);

  const slide = SLIDES[current];

  return (
    <div className={styles.banner} style={{ '--slide-bg': slide.bg, '--slide-accent': slide.accent } as React.CSSProperties}>
      <div className={`container ${styles.inner}`}>
        {/* Left: Offer text stack */}
        <div className={styles.content} key={`text-${slide.id}`}>
          <div className={styles.topRow}>
            <span className={styles.badge} style={{ background: slide.accent }}>{slide.badge}</span>
          </div>
          <h1 className={styles.title}>{slide.title}</h1>
          <p className={styles.subtitle}>{slide.subtitle}</p>
          <div className={styles.features}>
            {slide.features.map(f => (
              <span key={f} className={styles.feature}>✓ {f}</span>
            ))}
          </div>
          <div className={styles.actions}>
            <Link
              href={slide.href}
              className="btn btn--primary btn--lg"
              style={{ background: slide.accent, borderColor: slide.accent }}
            >
              {slide.cta} →
            </Link>
          </div>
        </div>

        {/* Right: Candid lifestyle photo */}
        <div className={styles.visual} key={`img-${slide.id}`}>
          <div className={styles.imageFrame}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={slide.heroImage}
              alt={slide.imageAlt}
              className={styles.heroPhoto}
              loading="lazy"
            />
          </div>
        </div>
      </div>

      {/* Slide Navigation Dots */}
      <div className={styles.dots}>
        {SLIDES.map((s, i) => (
          <button
            key={s.id}
            className={`${styles.dot} ${i === current ? styles.dotActive : ''}`}
            onClick={() => setCurrent(i)}
            aria-label={`Slide ${i + 1}`}
            style={i === current ? { background: slide.accent } : undefined}
          />
        ))}
      </div>
    </div>
  );
}
