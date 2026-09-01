import { Product } from '../types';

export const SAMPLE_PRODUCTS: Product[] = [
  // --------------------------------------------------------------------------
  // BRAND NEW MOBILES
  // --------------------------------------------------------------------------
  {
    id: 'new-iphone-17-pro',
    brand: 'Apple',
    name: 'iPhone 17 Pro',
    category: 'mobile',
    condition: 'new',
    mrp: 134900,
    sellingPrice: 129900,
    offerPrice: 124900,
    emiAvailable: true,
    emiMonthlyStarting: 5499,
    storage: '256GB',
    ram: '12GB',
    color: 'Titanium Blue',
    colorHex: '#3b5998',
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    featured: true,
    flashDeal: true,
    warrantyInfo: '1 Year Apple Official Warranty',
    highlights: [
      'A19 Pro Bionic Chip with 6-core GPU',
      'ProMotion 120Hz Super Retina XDR display',
      '48MP Triple Lens Camera System with 5x Optical Telephoto',
      'Aerospace-Grade Titanium Frame'
    ],
    specifications: {
      screen: '6.3" Super Retina XDR OLED (120Hz)',
      processor: 'Apple A19 Pro Bionic',
      camera: '48MP Main + 48MP Ultrawide + 48MP 5x Telephoto',
      battery: '4400 mAh with MagSafe 25W Charging',
      os: 'iOS 19',
      network: '5G Dual SIM (nano-SIM + eSIM)'
    }
  },
  {
    id: 'new-galaxy-s26-ultra',
    brand: 'Samsung',
    name: 'Galaxy S26 Ultra 5G',
    category: 'mobile',
    condition: 'new',
    mrp: 139999,
    sellingPrice: 131999,
    offerPrice: 126999,
    emiAvailable: true,
    emiMonthlyStarting: 5699,
    storage: '512GB',
    ram: '12GB',
    color: 'Titanium Black',
    colorHex: '#1e2022',
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1580910051074-3eb694886505?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    featured: true,
    flashDeal: true,
    warrantyInfo: '1 Year Samsung India Warranty + 1 Year Screen Protection',
    highlights: [
      'Snapdragon 8 Gen 4 for Galaxy',
      'Built-in S-Pen Stylus with air gestures',
      '200MP Quad Camera with 100x Space Zoom',
      'Galaxy AI Live Translate & Circle to Search'
    ],
    specifications: {
      screen: '6.8" Dynamic AMOLED 2X (120Hz, 2600 nits)',
      processor: 'Snapdragon 8 Gen 4 (4nm)',
      camera: '200MP Main + 50MP Periscope + 50MP Ultrawide',
      battery: '5000 mAh with 45W Fast Charging',
      os: 'Android 15 (One UI 7)',
      network: '5G Dual SIM'
    }
  },
  {
    id: 'new-oneplus-13',
    brand: 'OnePlus',
    name: 'OnePlus 13 5G',
    category: 'mobile',
    condition: 'new',
    mrp: 69999,
    sellingPrice: 64999,
    offerPrice: 61999,
    emiAvailable: true,
    emiMonthlyStarting: 2799,
    storage: '256GB',
    ram: '16GB',
    color: 'Emerald Green',
    colorHex: '#0f5132',
    images: [
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    featured: true,
    warrantyInfo: '1 Year OnePlus Brand Warranty',
    highlights: [
      'Hasselblad 4th Gen Camera System',
      '100W SUPERVOOC Fast Charging (0 to 100% in 25 mins)',
      'Cryo-Velocity VC Cooling System',
      'OxygenOS 15 with Fluid Animations'
    ],
    specifications: {
      screen: '6.82" 2K ProXDR Display (120Hz LTPO)',
      processor: 'Snapdragon 8 Gen 4',
      camera: '50MP Sony LYT-808 + 64MP Telephoto + 48MP Ultrawide',
      battery: '5400 mAh with 100W Wired + 50W Wireless',
      os: 'OxygenOS 15 based on Android 15',
      network: '5G Dual Nano SIM'
    }
  },
  {
    id: 'new-pixel-9-pro',
    brand: 'Google',
    name: 'Google Pixel 9 Pro',
    category: 'mobile',
    condition: 'new',
    mrp: 109999,
    sellingPrice: 99999,
    offerPrice: 94999,
    emiAvailable: true,
    emiMonthlyStarting: 4299,
    storage: '256GB',
    ram: '16GB',
    color: 'Obsidian Black',
    colorHex: '#111827',
    images: [
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    featured: false,
    warrantyInfo: '1 Year Google Official Warranty',
    highlights: [
      'Google Tensor G4 Chip with Gemini Nano AI',
      'Super Res Zoom 30x with Pro Controls',
      '7 Years of OS & Security Updates',
      'Temperature Sensor & Emergency SOS'
    ],
    specifications: {
      screen: '6.7" Super Actua Display (1-120Hz LTPO)',
      processor: 'Google Tensor G4 + Titan M2 Security',
      camera: '50MP Octa PD Main + 48MP Ultrawide + 48MP 5x Telephoto',
      battery: '5050 mAh with Fast Wireless Charging',
      os: 'Android 15 (Stock Google Pixel Experience)',
      network: '5G Dual SIM (eSIM support)'
    }
  },

  // --------------------------------------------------------------------------
  // CERTIFIED PRE-OWNED / USED MOBILES
  // --------------------------------------------------------------------------
  {
    id: 'used-iphone-15-pro-256',
    brand: 'Apple',
    name: 'iPhone 15 Pro',
    category: 'mobile',
    condition: 'used',
    mrp: 134900,
    sellingPrice: 84900,
    offerPrice: 79900,
    emiAvailable: true,
    emiMonthlyStarting: 3499,
    storage: '256GB',
    ram: '8GB',
    color: 'Natural Titanium',
    colorHex: '#8e8d8a',
    grade: 'A+',
    batteryHealth: 94,
    deviceAgeMonths: 8,
    boxAvailable: true,
    billAvailable: true,
    accessoriesIncluded: ['Original Braided USB-C Cable', 'SIM Ejector', 'ARONA Protective Case'],
    images: [
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    featured: true,
    flashDeal: true,
    warrantyInfo: '6 Months ARONA Care Certified Warranty + Apple Care Remaining (4 Months)',
    highlights: [
      'Grade A+ Like-New Condition (Zero scratches on display)',
      '94% Original Apple Battery Health',
      'Original GST Bill & Retail Box Included',
      'Tested with ARONA 8-Point Quality Inspection'
    ],
    conditionReport: {
      display: 'Original Super Retina OLED — Pristine, no scratches or burn-in',
      frame: 'Natural Titanium — Immaculate condition, zero dents',
      backGlass: 'Original Frosted Glass — Immaculate',
      cameraLens: 'Clean lenses, crystal clear focus',
      batteryHealth: 94,
      speaker: 'Crisp dual stereo sound tested at max volume',
      chargingPort: 'Clean USB-C port, fully responsive fast charging',
      repairHistory: '100% Factory Sealed — Never Opened or Repaired'
    },
    specifications: {
      screen: '6.1" Super Retina XDR OLED (120Hz ProMotion)',
      processor: 'Apple A17 Pro Bionic',
      camera: '48MP Main + 12MP Ultrawide + 12MP 3x Telephoto',
      battery: '3274 mAh (94% Health)',
      os: 'iOS 18 (Upgradable to iOS 19)',
      network: '5G Dual SIM'
    }
  },
  {
    id: 'used-s24-ultra-512',
    brand: 'Samsung',
    name: 'Galaxy S24 Ultra 5G',
    category: 'mobile',
    condition: 'used',
    mrp: 139999,
    sellingPrice: 82900,
    offerPrice: 77900,
    emiAvailable: true,
    emiMonthlyStarting: 3299,
    storage: '512GB',
    ram: '12GB',
    color: 'Titanium Violet',
    colorHex: '#4a3b5c',
    grade: 'A',
    batteryHealth: 91,
    deviceAgeMonths: 10,
    boxAvailable: true,
    billAvailable: true,
    accessoriesIncluded: ['Original Samsung 45W Adapter', 'Type-C Cable', 'S-Pen'],
    images: [
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    featured: true,
    warrantyInfo: '6 Months ARONA Certified Store Warranty',
    highlights: [
      'Grade A Very Good Condition (Minor hairline micro-mark on rail)',
      '91% Verified Battery Capacity',
      '512GB Huge Storage Variant',
      'Original Box & 45W Charger Included'
    ],
    conditionReport: {
      display: 'Original AMOLED — Clean with screen guard pre-applied',
      frame: 'Minor micro-rub mark on bottom left corner',
      backGlass: 'Flawless condition',
      cameraLens: 'Clean 200MP sensor lenses',
      batteryHealth: 91,
      speaker: 'Loud & Clear AKG Tuned Sound',
      chargingPort: 'Fast charging verified',
      repairHistory: 'Clean — All Genuine Factory Parts'
    },
    specifications: {
      screen: '6.8" Dynamic AMOLED 2X 120Hz',
      processor: 'Snapdragon 8 Gen 3 for Galaxy',
      camera: '200MP Main + 50MP 5x Zoom + 10MP 3x + 12MP Ultrawide',
      battery: '5000 mAh (91% Health)',
      os: 'Android 15 (One UI 7)',
      network: '5G Dual SIM'
    }
  },
  {
    id: 'used-iphone-14-128',
    brand: 'Apple',
    name: 'iPhone 14',
    category: 'mobile',
    condition: 'used',
    mrp: 69900,
    sellingPrice: 42900,
    offerPrice: 39900,
    emiAvailable: true,
    emiMonthlyStarting: 1699,
    storage: '128GB',
    ram: '6GB',
    color: 'Midnight Black',
    colorHex: '#191919',
    grade: 'A',
    batteryHealth: 88,
    deviceAgeMonths: 14,
    boxAvailable: true,
    billAvailable: true,
    accessoriesIncluded: ['Lightning to USB-C Cable', 'Free Screen Protector'],
    images: [
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    featured: false,
    warrantyInfo: '6 Months ARONA Certified Warranty',
    highlights: [
      'Smart Value Flagship iPhone',
      '88% Solid Battery Health',
      'Box & Verified Retail Bill',
      'Action Mode Video & Photonic Engine'
    ],
    conditionReport: {
      display: 'Original OLED — Clean, zero cracks',
      frame: 'Light scuff near SIM tray',
      backGlass: 'Pristine condition',
      cameraLens: 'Clear 12MP Dual Lenses',
      batteryHealth: 88,
      speaker: 'Fully functional stereo sound',
      chargingPort: 'Lightning port tested',
      repairHistory: 'Original Display & Battery — Verified'
    },
    specifications: {
      screen: '6.1" Super Retina XDR OLED',
      processor: 'Apple A15 Bionic',
      camera: '12MP Main + 12MP Ultrawide',
      battery: '3279 mAh (88% Health)',
      os: 'iOS 18',
      network: '5G Dual SIM'
    }
  },
  {
    id: 'used-oneplus-12r',
    brand: 'OnePlus',
    name: 'OnePlus 12R 5G',
    category: 'mobile',
    condition: 'used',
    mrp: 39999,
    sellingPrice: 27900,
    offerPrice: 25900,
    emiAvailable: true,
    emiMonthlyStarting: 1199,
    storage: '256GB',
    ram: '8GB',
    color: 'Cool Blue',
    colorHex: '#5d8aa8',
    grade: 'A+',
    batteryHealth: 96,
    deviceAgeMonths: 5,
    boxAvailable: true,
    billAvailable: true,
    accessoriesIncluded: ['Original 100W SUPERVOOC Charger', 'Red Cable'],
    images: [
      'https://images.unsplash.com/photo-1565849904461-04a58ad377e0?auto=format&fit=crop&w=800&q=80'
    ],
    inStock: true,
    featured: false,
    warrantyInfo: '7 Months Remaining OnePlus Brand Warranty',
    highlights: [
      'Only 5 Months Old — Almost Brand New',
      '96% Exceptional Battery Health',
      '100W Ultra Fast Charger Included in Box',
      'Original Bill with Brand Warranty Remaining'
    ],
    conditionReport: {
      display: '1.5K ProXDR Curved Display — Flawless',
      frame: 'Mint condition, zero signs of use',
      backGlass: 'Metallic Blue Glass — Mint',
      cameraLens: 'Clean Sony IMX890 sensor',
      batteryHealth: 96,
      speaker: 'Dual Dolby Atmos speakers crisp',
      chargingPort: 'Fast 100W charging verified',
      repairHistory: 'Unopened — 100% Factory Stock'
    },
    specifications: {
      screen: '6.78" 1.5K AMOLED 120Hz',
      processor: 'Snapdragon 8 Gen 2',
      camera: '50MP Sony IMX890 OIS + 8MP + 2MP',
      battery: '5500 mAh (96% Health)',
      os: 'OxygenOS 15',
      network: '5G Dual SIM'
    }
  }
];
