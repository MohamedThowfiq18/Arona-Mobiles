import type { StoreSettings } from '@/lib/types';

// Store Contact & Information Constants for ARONA MOBILES

export const STORE_CONFIG = {
  name: 'ARONA MOBILES',
  tagline: 'Your Trusted Mobile Phone Store',
  // Primary and secondary store call numbers
  phonePrimary: '+91 97870 61617',
  phonePrimaryRaw: '+919787061617',
  phoneSecondary: '+91 96594 58606',
  phoneSecondaryRaw: '+919659458606',
  phone: '+91 97870 61617 / +91 96594 58606',
  phoneRaw: '+919787061617',
  callNumbers: [
    { label: 'Primary Call', display: '+91 97870 61617', raw: '+919787061617' },
    { label: 'Alternative Call', display: '+91 96594 58606', raw: '+919659458606' },
  ],
  // WhatsApp support number
  whatsappNumber: '919787061617',
  whatsappDisplay: '+91 97870 61617',
  // Authorized Owner Portal Login Phone Numbers
  authorizedOwnerPhones: [
    '9787061617',
    '9659458606',
    '9994235672',
  ],
  email: 'contact@aronamobiles.com',
  address: {
    line1: 'ARONA MOBILES, Opp. Town Hall',
    line2: 'Main Commercial Road',
    city: 'Bangalore',
    state: 'Karnataka',
    pincode: '560001',
    landmark: 'Opposite Town Hall, near Central Junction',
  },
  hours: {
    weekdays: 'Mon–Sat: 10:00 AM – 8:30 PM',
    sunday: 'Sunday: 11:00 AM – 6:00 PM',
    shortHours: 'Mon–Sat, 10 AM – 8 PM',
  },
  googleMapsUrl: 'https://maps.app.goo.gl/BREhQPtfQ333NG248?g_st=ac',
};

export const DEFAULT_STORE_SETTINGS: StoreSettings = {
  id: 'default',
  store_name: STORE_CONFIG.name,
  tagline: STORE_CONFIG.tagline,
  phone_primary: STORE_CONFIG.phonePrimary,
  phone_primary_raw: STORE_CONFIG.phonePrimaryRaw,
  phone_secondary: STORE_CONFIG.phoneSecondary,
  phone_secondary_raw: STORE_CONFIG.phoneSecondaryRaw,
  whatsapp_number: STORE_CONFIG.whatsappNumber,
  whatsapp_display: STORE_CONFIG.whatsappDisplay,
  authorized_owner_phones: STORE_CONFIG.authorizedOwnerPhones,
  email: STORE_CONFIG.email,
  address_line1: STORE_CONFIG.address.line1,
  address_line2: STORE_CONFIG.address.line2,
  city: STORE_CONFIG.address.city,
  state: STORE_CONFIG.address.state,
  pincode: STORE_CONFIG.address.pincode,
  landmark: STORE_CONFIG.address.landmark,
  hours_weekdays: STORE_CONFIG.hours.weekdays,
  hours_sunday: STORE_CONFIG.hours.sunday,
  google_maps_url: STORE_CONFIG.googleMapsUrl,
  announcement_bar: '🎉 Big Exchange Offers & Same-Day In-Store Pickup Available!',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

/**
 * Clean phone numbers to standard formats (+91 XXXXX XXXXX and raw +91XXXXXXXXXX)
 */
export function normalizePhoneNumber(input: string): { display: string; raw: string; whatsapp: string } {
  const digits = input.replace(/\D/g, '');
  let tenDigit = digits;
  if (digits.length > 10 && digits.startsWith('91')) {
    tenDigit = digits.slice(-10);
  } else if (digits.length > 10) {
    tenDigit = digits.slice(-10);
  }
  
  if (tenDigit.length === 10) {
    const display = `+91 ${tenDigit.slice(0, 5)} ${tenDigit.slice(5)}`;
    const raw = `+91${tenDigit}`;
    const whatsapp = `91${tenDigit}`;
    return { display, raw, whatsapp };
  }

  const trimmed = input.trim();
  return {
    display: trimmed,
    raw: trimmed.startsWith('+') ? trimmed : `+91${trimmed.replace(/\s+/g, '')}`,
    whatsapp: digits.length >= 10 ? digits : `91${digits}`,
  };
}

/**
 * Generates a direct WhatsApp link with pre-filled inquiry text
 */
export function getWhatsAppInquiryUrl(productName?: string, price?: number, variant?: string): string {
  let message = `Hi ARONA MOBILES! I'm interested in buying a phone from your store.`;
  if (productName) {
    const formattedPrice = price
      ? ` (₹${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 0 }).format(price)})`
      : '';
    const variantInfo = variant ? ` [${variant}]` : '';
    message = `Hi ARONA MOBILES! I'm interested in ${productName}${variantInfo}${formattedPrice}. Is it currently available for store pickup?`;
  }
  return `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(message)}`;
}

/**
 * Direct WhatsApp link for general customer support
 */
export function getWhatsAppSupportUrl(): string {
  return `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    'Hi ARONA MOBILES! I have a query regarding store inventory / in-store pickup / repair.'
  )}`;
}

