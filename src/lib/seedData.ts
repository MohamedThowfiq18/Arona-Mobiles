import { Product } from '@/types';

export const SEED_PRODUCTS: Product[] = [
  {
    id: 'prod-01',
    brand: 'Apple',
    model: 'iPhone 15 Pro Max',
    condition: 'new',
    price: 1199,
    originalPrice: 1299,
    stock: 8,
    badge: 'Flagship Leader',
    rating: 4.9,
    reviewsCount: 142,
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1695048133021-9951528652f1?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { storage: '256GB', color: 'Natural Titanium', colorHex: '#a8a29e', priceModifier: 0, stock: 5 },
      { storage: '512GB', color: 'Blue Titanium', colorHex: '#1e3a8a', priceModifier: 200, stock: 3 },
      { storage: '1TB', color: 'Black Titanium', colorHex: '#18181b', priceModifier: 400, stock: 2 }
    ],
    specs: {
      display: '6.7-inch Super Retina XDR OLED, 120Hz ProMotion',
      processor: 'A17 Pro Chip (3nm)',
      camera: '48MP Main + 12MP Telephoto 5x Optical + 12MP Ultra Wide',
      battery: '4422 mAh (29 hours video playback)',
      os: 'iOS 17 (Upgradable to iOS 18)',
      connectivity: '5G, Wi-Fi 6E, Bluetooth 5.3, USB-C (10Gbps)',
      ram: '8GB'
    }
  },
  {
    id: 'prod-02',
    brand: 'Apple',
    model: 'iPhone 14 Pro',
    condition: 'preowned',
    gradeIfPreowned: 'A+',
    price: 799,
    originalPrice: 999,
    stock: 4,
    badge: 'Certified 8-Point Checked',
    rating: 4.8,
    reviewsCount: 98,
    images: [
      'https://images.unsplash.com/photo-1663499482523-1c0c1bae4ce1?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { storage: '128GB', color: 'Deep Purple', colorHex: '#4c1d95', priceModifier: 0, stock: 2 },
      { storage: '256GB', color: 'Space Black', colorHex: '#27272a', priceModifier: 90, stock: 2 }
    ],
    inspectionReport: {
      batteryHealth: 96,
      screenGrade: 'Grade A+ Pristine (Original OEM)',
      cosmeticScore: '9.8 / 10',
      checklist: [
        { name: 'Battery Health & Cycle Count', status: 'passed', score: '96%', details: 'Tested under 4K peak load; 180 total cycles.' },
        { name: 'Display & Touch Responsiveness', status: 'passed', score: 'OEM 100%', details: 'Multi-touch gesture test & color calibration passed.' },
        { name: 'Camera & Optical Stabilization', status: 'passed', score: 'Passed', details: 'Sensor shift OIS & 48MP focus test passed.' },
        { name: 'Face ID & Biometrics', status: 'passed', score: 'Passed', details: 'TrueDepth infrared camera verified.' },
        { name: '5G & Wi-Fi Modem', status: 'passed', score: '1.2 Gbps', details: 'Full band speed & signal strength verified.' },
        { name: 'Chassis & Enclosure Integrity', status: 'passed', score: 'Grade A+', details: 'No deep scratches or structural bends.' },
        { name: 'Microphone & Stereo Speakers', status: 'passed', score: 'Clean', details: 'Frequency response & noise cancellation tested.' },
        { name: 'Lightning / Charging Port', status: 'passed', score: 'Passed', details: '20W fast charging & data transfer verified.' }
      ]
    },
    specs: {
      display: '6.1-inch Super Retina XDR OLED, Dynamic Island',
      processor: 'A16 Bionic',
      camera: '48MP Main + 12MP Telephoto + 12MP Ultra Wide',
      battery: '3200 mAh (96% Health)',
      os: 'iOS 17',
      connectivity: '5G, Wi-Fi 6, Bluetooth 5.3',
      ram: '6GB'
    }
  },
  {
    id: 'prod-03',
    brand: 'Samsung',
    model: 'Galaxy S24 Ultra',
    condition: 'new',
    price: 1299,
    originalPrice: 1399,
    stock: 6,
    badge: 'AI Powered Flagship',
    rating: 4.9,
    reviewsCount: 87,
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { storage: '256GB', color: 'Titanium Gray', colorHex: '#6b7280', priceModifier: 0, stock: 3 },
      { storage: '512GB', color: 'Titanium Violet', colorHex: '#581c87', priceModifier: 150, stock: 3 }
    ],
    specs: {
      display: '6.8-inch Dynamic AMOLED 2X, 120Hz, 2600 nits',
      processor: 'Snapdragon 8 Gen 3 for Galaxy (4nm)',
      camera: '200MP Main + 50MP 5x Telephoto + 10MP 3x + 12MP Ultra Wide',
      battery: '5000 mAh (45W wired charging)',
      os: 'Android 14 (One UI 6.1 Galaxy AI)',
      connectivity: '5G, Wi-Fi 7, S-Pen included',
      ram: '12GB'
    }
  },
  {
    id: 'prod-04',
    brand: 'Samsung',
    model: 'Galaxy S23 Ultra',
    condition: 'preowned',
    gradeIfPreowned: 'A',
    price: 749,
    originalPrice: 1199,
    stock: 5,
    badge: 'Certified Value Deal',
    rating: 4.7,
    reviewsCount: 112,
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { storage: '256GB', color: 'Phantom Black', colorHex: '#18181b', priceModifier: 0, stock: 3 },
      { storage: '512GB', color: 'Cream', colorHex: '#fef3c7', priceModifier: 80, stock: 2 }
    ],
    inspectionReport: {
      batteryHealth: 92,
      screenGrade: 'Grade A (Micro hairline scratch near top bezel, invisible when screen is on)',
      cosmeticScore: '9.2 / 10',
      checklist: [
        { name: 'Battery Health & Capacity', status: 'passed', score: '92%', details: '4600 mAh usable capacity.' },
        { name: 'Display & S-Pen Sensitivity', status: 'passed', score: 'Passed', details: 'Digitizer & pressure levels verified.' },
        { name: '200MP Quad Camera Array', status: 'passed', score: '100X Zoom OK', details: 'Laser autofocus & optical zoom verified.' },
        { name: 'Biometric Ultrasonic Sensor', status: 'passed', score: 'Passed', details: 'In-display fingerprint scanner instant unlock.' },
        { name: '5G Sub-6 & mmWave Modem', status: 'passed', score: 'Passed', details: 'Dual SIM & eSIM tested.' },
        { name: 'Aluminum Frame & Back Glass', status: 'passed', score: 'Grade A', details: 'No cracks or chips.' },
        { name: 'Stereo Speakers tuned by AKG', status: 'passed', score: 'Clean', details: 'Dolby Atmos acoustic playback tested.' },
        { name: 'USB-C Charging & Wireless Qi', status: 'passed', score: 'Passed', details: '45W fast charge & Reverse wireless charging verified.' }
      ]
    },
    specs: {
      display: '6.8-inch Dynamic AMOLED 2X, 120Hz',
      processor: 'Snapdragon 8 Gen 2 for Galaxy',
      camera: '200MP Main + 10MP 10x Optical + 10MP 3x + 12MP Ultra Wide',
      battery: '5000 mAh (92% Health)',
      os: 'Android 14 (One UI 6.0)',
      connectivity: '5G, Wi-Fi 6E, S-Pen',
      ram: '12GB'
    }
  },
  {
    id: 'prod-05',
    brand: 'Google',
    model: 'Pixel 8 Pro',
    condition: 'new',
    price: 899,
    originalPrice: 999,
    stock: 7,
    badge: 'Best Camera AI',
    rating: 4.8,
    reviewsCount: 64,
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { storage: '128GB', color: 'Bay Blue', colorHex: '#0284c7', priceModifier: 0, stock: 4 },
      { storage: '256GB', color: 'Obsidian Black', colorHex: '#090d16', priceModifier: 70, stock: 3 }
    ],
    specs: {
      display: '6.7-inch Super Actua OLED, 1-120Hz LTPO',
      processor: 'Google Tensor G3 (Titan M2 Security)',
      camera: '50MP Main + 48MP Telephoto 5x + 48MP Ultra Wide with Macro Focus',
      battery: '5050 mAh (30W wired + wireless)',
      os: 'Pure Android 14 (7 years OS updates)',
      connectivity: '5G, Wi-Fi 7, Temperature Sensor',
      ram: '12GB'
    }
  },
  {
    id: 'prod-06',
    brand: 'Apple',
    model: 'iPhone 13',
    condition: 'preowned',
    gradeIfPreowned: 'A',
    price: 499,
    originalPrice: 699,
    stock: 9,
    badge: 'Popular Choice',
    rating: 4.9,
    reviewsCount: 230,
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { storage: '128GB', color: 'Midnight', colorHex: '#1e293b', priceModifier: 0, stock: 5 },
      { storage: '256GB', color: 'Starlight', colorHex: '#f1f5f9', priceModifier: 60, stock: 4 }
    ],
    inspectionReport: {
      batteryHealth: 89,
      screenGrade: 'Grade A Pristine Display',
      cosmeticScore: '9.0 / 10',
      checklist: [
        { name: 'Battery Health', status: 'passed', score: '89%', details: 'Tested over 8 hours video playback.' },
        { name: 'OLED Display', status: 'passed', score: 'Passed', details: 'TrueTone color sensor verified.' },
        { name: 'Dual 12MP Camera System', status: 'passed', score: 'Passed', details: 'Cinematic mode 1080p verified.' },
        { name: 'Face ID Biometrics', status: 'passed', score: 'Passed', details: 'Verified responsive.' },
        { name: '5G Wireless Signal', status: 'passed', score: 'Passed', details: 'Full cellular signal strength.' },
        { name: 'Aluminum Housing', status: 'passed', score: 'Grade A', details: 'Minor shell wear.' },
        { name: 'Audio Output', status: 'passed', score: 'Passed', details: 'Dual speaker output tested.' },
        { name: 'Lightning Port', status: 'passed', score: 'Passed', details: 'Fast charging verified.' }
      ]
    },
    specs: {
      display: '6.1-inch Super Retina XDR OLED',
      processor: 'A15 Bionic',
      camera: 'Dual 12MP Wide + Ultra Wide',
      battery: '3240 mAh (89% Health)',
      os: 'iOS 17',
      connectivity: '5G, Wi-Fi 6',
      ram: '4GB'
    }
  },
  {
    id: 'prod-07',
    brand: 'OnePlus',
    model: 'OnePlus 12',
    condition: 'new',
    price: 799,
    originalPrice: 899,
    stock: 6,
    badge: '100W Super Fast Charge',
    rating: 4.8,
    reviewsCount: 45,
    images: [
      'https://images.unsplash.com/photo-1546054454-aa26e2b734c7?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { storage: '256GB', color: 'Flowy Emerald', colorHex: '#047857', priceModifier: 0, stock: 3 },
      { storage: '512GB', color: 'Silky Black', colorHex: '#18181b', priceModifier: 100, stock: 3 }
    ],
    specs: {
      display: '6.82-inch 2K 120Hz ProXDR AMOLED (4500 nits peak)',
      processor: 'Snapdragon 8 Gen 3',
      camera: '4th Gen Hasselblad Camera for Mobile (50MP + 64MP 3x + 48MP)',
      battery: '5400 mAh (100W SUPERVOOC Charge in 26 mins)',
      os: 'OxygenOS 14 (Android 14)',
      connectivity: '5G, Wi-Fi 7, Bluetooth 5.4',
      ram: '16GB'
    }
  },
  {
    id: 'prod-08',
    brand: 'Samsung',
    model: 'Galaxy Z Fold 5',
    condition: 'preowned',
    gradeIfPreowned: 'A+',
    price: 1099,
    originalPrice: 1799,
    stock: 3,
    badge: 'Foldable Perfection',
    rating: 4.7,
    reviewsCount: 52,
    images: [
      'https://images.unsplash.com/photo-1584006682522-dc17d6c0d963?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { storage: '512GB', color: 'Icy Blue', colorHex: '#38bdf8', priceModifier: 0, stock: 3 }
    ],
    inspectionReport: {
      batteryHealth: 95,
      screenGrade: 'Grade A+ Dual Displays (Zero crease damage)',
      cosmeticScore: '9.7 / 10',
      checklist: [
        { name: 'Dual Display & Flex Hinge', status: 'passed', score: 'Passed', details: 'Zero resistance, 200,000 fold test clearance.' },
        { name: 'Inner Ultra Thin Glass', status: 'passed', score: 'Pristine', details: 'Factory protector intact.' },
        { name: 'Triple Camera Array', status: 'passed', score: 'Passed', details: '50MP main & telephoto tested.' },
        { name: 'Fingerprint Sensor Hinge', status: 'passed', score: 'Passed', details: 'Side mounted sensor instant unlock.' },
        { name: 'Battery System', status: 'passed', score: '95%', details: 'Dual cell 4400 mAh.' },
        { name: 'Armor Aluminum Frame', status: 'passed', score: 'Grade A+', details: 'No scuffs.' },
        { name: 'Stereo Audio', status: 'passed', score: 'Clean', details: 'Dual speakers tested.' },
        { name: 'Wireless Charging', status: 'passed', score: 'Passed', details: '15W Fast Qi charging verified.' }
      ]
    },
    specs: {
      display: '7.6-inch QXGA+ Dynamic AMOLED 2X + 6.2-inch Cover Screen',
      processor: 'Snapdragon 8 Gen 2 for Galaxy',
      camera: '50MP Main + 10MP Telephoto 3x + 12MP Ultra Wide',
      battery: '4400 mAh (95% Health)',
      os: 'Android 14 (One UI 6.1 Fold Edition)',
      connectivity: '5G, Wi-Fi 6E, S-Pen Support',
      ram: '12GB'
    }
  },
  {
    id: 'prod-09',
    brand: 'Apple',
    model: 'MagSafe 20W USB-C Charger & Cable Kit',
    condition: 'new',
    price: 39,
    originalPrice: 49,
    stock: 25,
    badge: 'Official Accessory',
    rating: 4.9,
    reviewsCount: 310,
    images: [
      'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { storage: 'Standard', color: 'White', colorHex: '#ffffff', priceModifier: 0, stock: 25 }
    ],
    specs: {
      display: 'N/A',
      processor: 'Apple Smart Power Delivery',
      camera: 'N/A',
      battery: '20W Fast Charge Output',
      os: 'Universal iOS / iPadOS Compatible',
      connectivity: 'USB-C to MagSafe Magnetic Connector',
      ram: 'N/A'
    }
  },
  {
    id: 'prod-10',
    brand: 'Anker',
    model: '737 Power Bank (PowerCore 24K 140W)',
    condition: 'new',
    price: 129,
    originalPrice: 149,
    stock: 14,
    badge: 'Ultra Fast Power',
    rating: 4.9,
    reviewsCount: 180,
    images: [
      'https://images.unsplash.com/photo-1609592424089-98319e5cc05c?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { storage: '24,000 mAh', color: 'Dark Slate', colorHex: '#1e293b', priceModifier: 0, stock: 14 }
    ],
    specs: {
      display: 'Smart Digital Display (Watts, Temperature, Battery %)',
      processor: 'GaNPrime Power IQ 4.0',
      camera: 'N/A',
      battery: '24,000 mAh High Density Lithium Cell',
      os: 'N/A',
      connectivity: 'Dual USB-C 140W + USB-A 18W',
      ram: 'N/A'
    }
  },
  {
    id: 'prod-11',
    brand: 'Sony',
    model: 'WF-1000XM5 Wireless Noise Canceling Earbuds',
    condition: 'new',
    price: 279,
    originalPrice: 299,
    stock: 10,
    badge: 'Industry Best ANC',
    rating: 4.8,
    reviewsCount: 95,
    images: [
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { storage: 'Standard', color: 'Black', colorHex: '#090d16', priceModifier: 0, stock: 6 },
      { storage: 'Standard', color: 'Silver', colorHex: '#e2e8f0', priceModifier: 0, stock: 4 }
    ],
    specs: {
      display: 'N/A',
      processor: 'Sony Integrated Processor V2 + QN2e',
      camera: 'N/A',
      battery: '8 Hours (24 Hours with Case)',
      os: 'Sony Headphones Connect App',
      connectivity: 'Bluetooth 5.3, LDAC Hi-Res Audio, Multipoint',
      ram: 'N/A'
    }
  },
  {
    id: 'prod-12',
    brand: 'Apple',
    model: 'AirPods Pro (2nd Gen with USB-C)',
    condition: 'new',
    price: 229,
    originalPrice: 249,
    stock: 18,
    badge: 'Best Seller',
    rating: 4.9,
    reviewsCount: 420,
    images: [
      'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?w=800&auto=format&fit=crop&q=80'
    ],
    variants: [
      { storage: 'MagSafe Case', color: 'White', colorHex: '#ffffff', priceModifier: 0, stock: 18 }
    ],
    specs: {
      display: 'N/A',
      processor: 'Apple H2 Headphone Chip',
      camera: 'N/A',
      battery: 'up to 6 hours active ANC (30h total)',
      os: 'iOS Integrated Spatial Audio',
      connectivity: 'Bluetooth 5.3, USB-C MagSafe Charging Case',
      ram: 'N/A'
    }
  }
];
