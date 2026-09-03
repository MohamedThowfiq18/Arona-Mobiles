/**
 * ARONA MOBILES — TypeScript Type Definitions
 */

export type ProductCondition = 'new' | 'used';
export type UsedGrade = 'A+' | 'A' | 'B';

export interface ConditionReport {
  display: string;      // e.g. "Flawless - Original OLED"
  frame: string;        // e.g. "Minor hairline micro-scratch on bottom rail"
  backGlass: string;    // e.g. "Pristine - No marks"
  cameraLens: string;   // e.g. "Crystal clear"
  batteryHealth: number;// e.g. 92%
  speaker: string;      // e.g. "Tested & Loud"
  chargingPort: string; // e.g. "Clean & Responsive"
  repairHistory: string;// e.g. "100% Original Parts - Never Opened"
}

export interface SpecificationMap {
  screen: string;
  processor: string;
  camera: string;
  battery: string;
  os: string;
  network: string;
}

export interface Product {
  id: string;
  brand: 'Apple' | 'Samsung' | 'OnePlus' | 'Xiaomi' | 'Vivo' | 'OPPO' | 'Realme' | 'Motorola' | 'Google';
  name: string;
  category: 'mobile' | 'accessory';
  condition: ProductCondition;
  
  // Pricing
  mrp: number;
  sellingPrice: number;
  offerPrice?: number;
  emiAvailable: boolean;
  emiMonthlyStarting?: number;

  // Key Attributes
  storage?: string; // e.g. "256GB"
  ram?: string;     // e.g. "8GB"
  color: string;
  colorHex?: string;
  images: string[];
  inStock: boolean;
  featured?: boolean;
  flashDeal?: boolean;

  // Pre-Owned Specific Fields
  grade?: UsedGrade;
  batteryHealth?: number;
  deviceAgeMonths?: number;
  boxAvailable?: boolean;
  billAvailable?: boolean;
  accessoriesIncluded?: string[];
  conditionReport?: ConditionReport;
  
  // Warranty & General
  warrantyInfo: string; // e.g. "1 Year Official Apple Warranty" or "6 Months ARONA Care Certified Warranty"
  specifications: SpecificationMap;
  highlights: string[];
}

export interface AccessoryItem {
  id: string;
  name: string;
  category: 'Cases' | 'Chargers' | 'Cables' | 'Earbuds' | 'Headphones' | 'Smartwatches' | 'Power Banks' | 'Screen Protection';
  brand: string;
  price: number;
  originalPrice: number;
  image: string;
  compatibility: string;
  inStock: boolean;
  rating: number;
}

export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  iconName: string;
  startingPrice: string;
  turnaroundTime: string;
  warranty: string;
}

export interface TradeInQuoteRequest {
  currentBrand: string;
  currentModel: string;
  storage: string;
  screenCondition: 'flawless' | 'good' | 'scratched' | 'cracked';
  bodyCondition: 'flawless' | 'good' | 'dented';
  functionalState: 'fully_working' | 'minor_issue' | 'faulty';
  boxBillIncluded: boolean;
  userName: string;
  userPhone: string;
}

export interface Testimonial {
  id: string;
  name: string;
  location: string;
  devicePurchased: string;
  comment: string;
  rating: number;
  date: string;
  verifiedPurchase: boolean;
}

export interface BusinessConfigData {
  name: string;
  tagline: string;
  subtext: string;
  phone: string;
  whatsappNumber: string;
  whatsappDisplay: string;
  email: string;
  address: string;
  landmark: string;
  city: string;
  openingHours: {
    weekdays: string;
    weekends: string;
    openDays: string;
  };
  googleMapsUrl: string;
  storeAnnouncement?: string;
}

export interface PromoOffer {
  id: string;
  title: string;
  subtitle: string;
  badge: string;
  active: boolean;
  discountTag?: string;
  code?: string;
}
