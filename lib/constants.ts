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
