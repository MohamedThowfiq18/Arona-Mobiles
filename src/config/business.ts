/**
 * ARONA MOBILES — Central Business Configuration
 * Central source of truth for contact details, address, opening hours, and WhatsApp integration.
 */
export interface SocialLinks {
  instagram: string;
  whatsapp: string;
  facebook?: string;
  youtube?: string;
}

export const BUSINESS_CONFIG = {
  name: "ARONA MOBILES",
  tagline: "SMARTER. BOLDER. CONNECTED.",
  subtext: "Your trusted destination for brand-new smartphones, certified pre-owned devices, original accessories, trade-in upgrades, and mobile care services.",
  
  // Contact & Socials
  phone: "+91 96594 58606",
  whatsappNumber: "919787061617", // Clean numerical format for API URLs
  whatsappDisplay: "+91 97870 61617",
  email: "support@aronamobiles.com",
  
  // Store Location & Hours
  address: "ARONA Mobiles, Bank Road",
  landmark: "Near by Urankapatti Tea Stall",
  city: "Tech City",
  openingHours: {
    weekdays: "10:00 AM – 9:30 PM",
    weekends: "10:00 AM – 10:00 PM",
    openDays: "Open 7 Days a Week"
  },
  googleMapsUrl: "https://maps.app.goo.gl/1uEeFDuCz4ArsGx46",
  
  socials: {
    instagram: "https://www.instagram.com/arona_mobiles_?igsi=MTllanE4emdvanNwdQ==",
    whatsapp: "https://wa.me/919787061617"
  } as SocialLinks,

  // Store Promises
  promises: [
    { title: "100% Genuine Products", desc: "Official brand warranty on all new smartphones and original accessories." },
    { title: "Certified Pre-Owned", desc: "8-point technical inspection with transparent battery health and condition grading." },
    { title: "Best Exchange Value", desc: "Fair instant valuation for your current device when upgrading to another phone." },
    { title: "Easy EMI Options", desc: "Flexible monthly installment payment options available in-store." }
  ]
};

/**
 * Utility to generate WhatsApp click-to-chat links with pre-filled messages
 */
export function getWhatsAppUrl(customMessage: string): string {
  const encoded = encodeURIComponent(customMessage);
  return `https://wa.me/${BUSINESS_CONFIG.whatsappNumber}?text=${encoded}`;
}
