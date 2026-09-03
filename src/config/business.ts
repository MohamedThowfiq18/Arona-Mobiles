import { getStoredBusinessConfig } from '../data/masterStore';
import { BusinessConfigData } from '../types';

export interface SocialLinks {
  instagram: string;
  whatsapp: string;
  facebook?: string;
  youtube?: string;
}

export const DEFAULT_BUSINESS_CONFIG: BusinessConfigData & { promises: Array<{ title: string; desc: string }> } = {
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

  // Store Promises
  promises: [
    { title: "100% Genuine Products", desc: "Official brand warranty on all new smartphones and original accessories." },
    { title: "Certified Pre-Owned", desc: "8-point technical inspection with transparent battery health and condition grading." },
    { title: "Best Exchange Value", desc: "Fair instant valuation for your current device when upgrading to another phone." },
    { title: "Easy EMI Options", desc: "Flexible monthly installment payment options available in-store." }
  ]
};

/**
 * Dynamically retrieve current live business configuration from database with safe fallback defaults
 */
export function getBusinessConfig() {
  try {
    if (typeof window !== 'undefined') {
      const stored = getStoredBusinessConfig();
      return {
        ...DEFAULT_BUSINESS_CONFIG,
        ...(stored || {}),
        openingHours: {
          ...DEFAULT_BUSINESS_CONFIG.openingHours,
          ...(stored?.openingHours || {})
        },
        promises: (stored && Array.isArray(stored.promises) && stored.promises.length > 0)
          ? stored.promises
          : DEFAULT_BUSINESS_CONFIG.promises,
        socials: {
          instagram: "https://www.instagram.com/arona_mobiles_?igsi=MTllanE4emdvanNwdQ==",
          whatsapp: `https://wa.me/${stored?.whatsappNumber || DEFAULT_BUSINESS_CONFIG.whatsappNumber}`
        }
      };
    }
  } catch (err) {
    console.warn('Business config fetch fallback:', err);
  }
  return DEFAULT_BUSINESS_CONFIG;
}

export const BUSINESS_CONFIG = DEFAULT_BUSINESS_CONFIG;

/**
 * Utility to generate WhatsApp click-to-chat links with pre-filled messages dynamically
 */
export function getWhatsAppUrl(customMessage: string): string {
  const current = getBusinessConfig();
  const cleanNumber = (current.whatsappNumber || "919787061617").replace(/\D/g, '');
  const encoded = encodeURIComponent(customMessage);
  return `https://wa.me/${cleanNumber}?text=${encoded}`;
}
