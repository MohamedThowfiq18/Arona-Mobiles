import { Product, BusinessConfigData, PromoOffer, AccessoryItem, ServiceItem } from '../types';
import { SAMPLE_PRODUCTS } from './products';
import { SAMPLE_ACCESSORIES } from './accessories';
import { SAMPLE_SERVICES } from './services';
import { BUSINESS_CONFIG } from '../config/business';
import { fetchCloudMasterData, pushCloudMasterData, MasterDataPayload } from './cloudStore';
import { OwnerSession } from '../utils/ownerAuth';

export const SAMPLE_OFFERS: PromoOffer[] = [
  {
    id: 'offer-1',
    title: 'Festival Mobile Exchange Bonus',
    subtitle: 'Get up to ₹5,000 extra trade-in value on upgrading your current smartphone.',
    badge: 'LIMITED TIME OFFER',
    active: true,
    discountTag: 'EXTRA ₹5000 OFF',
    code: 'FESTIVAL5K'
  },
  {
    id: 'offer-2',
    title: 'Free Screen Guard + Premium Cover Package',
    subtitle: 'Complementary 9H tempered glass and protective case with every mobile purchase.',
    badge: 'STORE EXCLUSIVE',
    active: true,
    discountTag: '100% FREE GIFT'
  }
];

// In-memory master state mirror (hydrated from live Cloud DB)
let masterMemoryCache: MasterDataPayload = {
  products: SAMPLE_PRODUCTS,
  businessConfig: BUSINESS_CONFIG as BusinessConfigData,
  offers: SAMPLE_OFFERS,
  accessories: SAMPLE_ACCESSORIES,
  services: SAMPLE_SERVICES,
  sessions: []
};

// Initial Cloud Hydration
if (typeof window !== 'undefined') {
  fetchCloudMasterData().then(cloudData => {
    if (cloudData) {
      if (Array.isArray(cloudData.products) && cloudData.products.length > 0) {
        masterMemoryCache.products = cloudData.products;
      }
      if (cloudData.businessConfig && cloudData.businessConfig.phone) {
        masterMemoryCache.businessConfig = cloudData.businessConfig;
      }
      if (Array.isArray(cloudData.offers)) {
        masterMemoryCache.offers = cloudData.offers;
      }
      if (Array.isArray(cloudData.accessories)) {
        masterMemoryCache.accessories = cloudData.accessories;
      }
      if (Array.isArray(cloudData.services)) {
        masterMemoryCache.services = cloudData.services;
      }
      if (Array.isArray(cloudData.sessions)) {
        masterMemoryCache.sessions = cloudData.sessions;
      }
      notifyUpdate('arona_master_data_updated');
    }
  });

  window.addEventListener('arona_master_data_updated', () => {
    fetchCloudMasterData().then(data => {
      if (data) {
        if (data.products) masterMemoryCache.products = data.products;
        if (data.businessConfig) masterMemoryCache.businessConfig = data.businessConfig;
        if (data.offers) masterMemoryCache.offers = data.offers;
        if (data.accessories) masterMemoryCache.accessories = data.accessories;
        if (data.services) masterMemoryCache.services = data.services;
        if (data.sessions) masterMemoryCache.sessions = data.sessions;
      }
    });
  });
}

function notifyUpdate(eventName: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(eventName));
    window.dispatchEvent(new Event('arona_master_data_updated'));
  }
}

/**
 * 1. Products Management (Single Source of Truth: Cloud DB)
 */
export function getStoredProducts(): Product[] {
  return masterMemoryCache.products && masterMemoryCache.products.length > 0
    ? masterMemoryCache.products
    : SAMPLE_PRODUCTS;
}

export function saveProducts(products: Product[], syncToCloud = true): void {
  masterMemoryCache.products = products;
  notifyUpdate('arona_products_updated');
  if (syncToCloud) {
    pushCurrentMasterDataToCloud().catch(e => console.warn('Cloud sync err:', e));
  }
}

/**
 * 2. Business Config Management (Single Source of Truth: Cloud DB)
 */
export function getStoredBusinessConfig(): BusinessConfigData {
  return masterMemoryCache.businessConfig && masterMemoryCache.businessConfig.phone
    ? masterMemoryCache.businessConfig
    : (BUSINESS_CONFIG as BusinessConfigData);
}

export function saveBusinessConfig(config: BusinessConfigData, syncToCloud = true): void {
  masterMemoryCache.businessConfig = config;
  notifyUpdate('arona_business_updated');
  if (syncToCloud) {
    pushCurrentMasterDataToCloud().catch(e => console.warn('Cloud sync err:', e));
  }
}

/**
 * 3. Offers Management (Single Source of Truth: Cloud DB)
 */
export function getStoredOffers(): PromoOffer[] {
  return masterMemoryCache.offers || SAMPLE_OFFERS;
}

export function saveOffers(offers: PromoOffer[], syncToCloud = true): void {
  masterMemoryCache.offers = offers;
  notifyUpdate('arona_offers_updated');
  if (syncToCloud) {
    pushCurrentMasterDataToCloud().catch(e => console.warn('Cloud sync err:', e));
  }
}

/**
 * 4. Accessories Management
 */
export function getStoredAccessories(): AccessoryItem[] {
  return masterMemoryCache.accessories || SAMPLE_ACCESSORIES;
}

export function saveAccessories(accessories: AccessoryItem[], syncToCloud = true): void {
  masterMemoryCache.accessories = accessories;
  notifyUpdate('arona_accessories_updated');
  if (syncToCloud) {
    pushCurrentMasterDataToCloud().catch(e => console.warn('Cloud sync err:', e));
  }
}

/**
 * 5. Services Management
 */
export function getStoredServices(): ServiceItem[] {
  return masterMemoryCache.services || SAMPLE_SERVICES;
}

export function saveServices(services: ServiceItem[], syncToCloud = true): void {
  masterMemoryCache.services = services;
  notifyUpdate('arona_services_updated');
  if (syncToCloud) {
    pushCurrentMasterDataToCloud().catch(e => console.warn('Cloud sync err:', e));
  }
}

/**
 * 6. Owner Password Management
 */
export function getStoredOwnerPassword(): string {
  return masterMemoryCache.ownerPassword || '';
}

export function saveOwnerPassword(password: string, syncToCloud = true): void {
  masterMemoryCache.ownerPassword = password;
  notifyUpdate('arona_auth_updated');
  if (syncToCloud) {
    pushCurrentMasterDataToCloud().catch(e => console.warn('Password sync err:', e));
  }
}

/**
 * 7. Owner Sessions Management (Multi-device authorization)
 */
export function getStoredSessions(): OwnerSession[] {
  return masterMemoryCache.sessions || [];
}

export function saveSessions(sessions: OwnerSession[], syncToCloud = true): void {
  masterMemoryCache.sessions = sessions;
  notifyUpdate('arona_sessions_updated');
  if (syncToCloud) {
    pushCurrentMasterDataToCloud().catch(e => console.warn('Sessions sync err:', e));
  }
}

/**
 * Active OTP Dispatch to Cloud DB
 */
export async function pushActiveOtpToCloud(code: string, phone: string): Promise<boolean> {
  masterMemoryCache.activeOtp = {
    code,
    phone,
    timestamp: Date.now()
  };
  return pushCurrentMasterDataToCloud();
}

/**
 * Push full current master data payload to Cloud DB
 */
export async function pushCurrentMasterDataToCloud(): Promise<boolean> {
  const payload: MasterDataPayload = {
    products: masterMemoryCache.products,
    businessConfig: masterMemoryCache.businessConfig,
    offers: masterMemoryCache.offers,
    accessories: masterMemoryCache.accessories,
    services: masterMemoryCache.services,
    ownerPassword: masterMemoryCache.ownerPassword,
    sessions: masterMemoryCache.sessions,
    activeOtp: masterMemoryCache.activeOtp
  };
  return pushCloudMasterData(payload);
}

/**
 * Synchronize local master data with live Cloud DB
 */
export async function syncMasterDataWithCloud(): Promise<void> {
  const cloudPayload = await fetchCloudMasterData();
  if (cloudPayload && typeof cloudPayload === 'object') {
    let updated = false;
    if (cloudPayload.products) { masterMemoryCache.products = cloudPayload.products; updated = true; }
    if (cloudPayload.businessConfig) { masterMemoryCache.businessConfig = cloudPayload.businessConfig; updated = true; }
    if (cloudPayload.offers) { masterMemoryCache.offers = cloudPayload.offers; updated = true; }
    if (cloudPayload.accessories) { masterMemoryCache.accessories = cloudPayload.accessories; updated = true; }
    if (cloudPayload.services) { masterMemoryCache.services = cloudPayload.services; updated = true; }
    if (cloudPayload.sessions) { masterMemoryCache.sessions = cloudPayload.sessions; updated = true; }
    if (updated) {
      notifyUpdate('arona_master_data_updated');
    }
  }
}
