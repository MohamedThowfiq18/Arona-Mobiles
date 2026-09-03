import { Product, BusinessConfigData, PromoOffer, AccessoryItem, ServiceItem } from '../types';
import { SAMPLE_PRODUCTS } from './products';
import { SAMPLE_ACCESSORIES } from './accessories';
import { SAMPLE_SERVICES } from './services';
import { BUSINESS_CONFIG } from '../config/business';
import { fetchCloudMasterData, pushCloudMasterData, MasterDataPayload } from './cloudStore';
import { safeLocalStorage } from '../utils/safeStorage';

const PRODUCTS_STORAGE_KEY = 'arona_mobiles_products_v1';
const BUSINESS_STORAGE_KEY = 'arona_business_config_v1';
const OFFERS_STORAGE_KEY = 'arona_offers_config_v1';
const ACCESSORIES_STORAGE_KEY = 'arona_accessories_v1';
const SERVICES_STORAGE_KEY = 'arona_services_v1';

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

/**
 * 1. Products Management
 */
export function getStoredProducts(): Product[] {
  try {
    const saved = safeLocalStorage.getItem(PRODUCTS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to read products:', error);
  }
  return SAMPLE_PRODUCTS;
}

export function saveProducts(products: Product[], syncToCloud = true): void {
  try {
    safeLocalStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
    notifyUpdate('arona_products_updated');
    if (syncToCloud) {
      pushCurrentMasterDataToCloud().catch(e => console.warn('Cloud sync err:', e));
    }
  } catch (error) {
    console.error('Failed to save products:', error);
  }
}

/**
 * 2. Business Config Management
 */
export function getStoredBusinessConfig(): BusinessConfigData {
  try {
    const saved = safeLocalStorage.getItem(BUSINESS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed && typeof parsed === 'object' && parsed.phone) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to read business config:', error);
  }
  return BUSINESS_CONFIG as BusinessConfigData;
}

export function saveBusinessConfig(config: BusinessConfigData, syncToCloud = true): void {
  try {
    safeLocalStorage.setItem(BUSINESS_STORAGE_KEY, JSON.stringify(config));
    notifyUpdate('arona_business_updated');
    if (syncToCloud) {
      pushCurrentMasterDataToCloud().catch(e => console.warn('Cloud sync err:', e));
    }
  } catch (error) {
    console.error('Failed to save business config:', error);
  }
}

/**
 * 3. Offers Management
 */
export function getStoredOffers(): PromoOffer[] {
  try {
    const saved = safeLocalStorage.getItem(OFFERS_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to read offers:', error);
  }
  return SAMPLE_OFFERS;
}

export function saveOffers(offers: PromoOffer[], syncToCloud = true): void {
  try {
    safeLocalStorage.setItem(OFFERS_STORAGE_KEY, JSON.stringify(offers));
    notifyUpdate('arona_offers_updated');
    if (syncToCloud) {
      pushCurrentMasterDataToCloud().catch(e => console.warn('Cloud sync err:', e));
    }
  } catch (error) {
    console.error('Failed to save offers:', error);
  }
}

/**
 * 4. Accessories Management
 */
export function getStoredAccessories(): AccessoryItem[] {
  try {
    const saved = safeLocalStorage.getItem(ACCESSORIES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to read accessories:', error);
  }
  return SAMPLE_ACCESSORIES;
}

export function saveAccessories(accessories: AccessoryItem[], syncToCloud = true): void {
  try {
    safeLocalStorage.setItem(ACCESSORIES_STORAGE_KEY, JSON.stringify(accessories));
    notifyUpdate('arona_accessories_updated');
    if (syncToCloud) {
      pushCurrentMasterDataToCloud().catch(e => console.warn('Cloud sync err:', e));
    }
  } catch (error) {
    console.error('Failed to save accessories:', error);
  }
}

/**
 * 5. Services Management
 */
export function getStoredServices(): ServiceItem[] {
  try {
    const saved = safeLocalStorage.getItem(SERVICES_STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to read services:', error);
  }
  return SAMPLE_SERVICES;
}

export function saveServices(services: ServiceItem[], syncToCloud = true): void {
  try {
    safeLocalStorage.setItem(SERVICES_STORAGE_KEY, JSON.stringify(services));
    notifyUpdate('arona_services_updated');
    if (syncToCloud) {
      pushCurrentMasterDataToCloud().catch(e => console.warn('Cloud sync err:', e));
    }
  } catch (error) {
    console.error('Failed to save services:', error);
  }
}

/**
 * Dispatch DOM events so components update live without page reload
 */
function notifyUpdate(eventName: string) {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event(eventName));
    window.dispatchEvent(new Event('arona_master_data_updated'));
  }
}

const PASSWORD_STORAGE_KEY = 'arona_owner_created_password';

/**
 * 6. Owner Password Cloud Sync Management
 */
export function getStoredOwnerPassword(): string {
  return safeLocalStorage.getItem(PASSWORD_STORAGE_KEY) || '';
}

export function saveOwnerPassword(password: string, syncToCloud = true): void {
  try {
    safeLocalStorage.setItem(PASSWORD_STORAGE_KEY, password);
    notifyUpdate('arona_auth_updated');
    if (syncToCloud) {
      pushCurrentMasterDataToCloud().catch(e => console.warn('Password cloud sync err:', e));
    }
  } catch (error) {
    console.error('Failed to save owner password:', error);
  }
}

/**
 * Dispatch Active OTP to global cloud database for cross-device notification
 */
export async function pushActiveOtpToCloud(code: string, phone: string): Promise<boolean> {
  const current = await fetchCloudMasterData();
  const updatedPayload: MasterDataPayload = {
    ...(current || {
      products: getStoredProducts(),
      businessConfig: getStoredBusinessConfig(),
      offers: getStoredOffers(),
      accessories: getStoredAccessories(),
      services: getStoredServices()
    }),
    activeOtp: {
      code,
      phone,
      timestamp: Date.now()
    }
  };
  return pushCloudMasterData(updatedPayload);
}

/**
 * Gather current state and push full payload to cloud
 */
export async function pushCurrentMasterDataToCloud(): Promise<boolean> {
  const payload: MasterDataPayload = {
    products: getStoredProducts(),
    businessConfig: getStoredBusinessConfig(),
    offers: getStoredOffers(),
    accessories: getStoredAccessories(),
    services: getStoredServices(),
    ownerPassword: getStoredOwnerPassword()
  };
  return pushCloudMasterData(payload);
}

/**
 * Synchronize local master data with live global cloud database
 */
export async function syncMasterDataWithCloud(): Promise<void> {
  try {
    const cloudPayload = await fetchCloudMasterData();
    if (cloudPayload && typeof cloudPayload === 'object') {
      let updatedAny = false;

      // Sync Cloud Owner Password to Local Device Storage
      if (cloudPayload.ownerPassword && typeof cloudPayload.ownerPassword === 'string') {
        const localPwd = safeLocalStorage.getItem(PASSWORD_STORAGE_KEY);
        if (localPwd !== cloudPayload.ownerPassword) {
          safeLocalStorage.setItem(PASSWORD_STORAGE_KEY, cloudPayload.ownerPassword);
          notifyUpdate('arona_auth_updated');
          updatedAny = true;
        }
      }

      if (cloudPayload.products && Array.isArray(cloudPayload.products) && cloudPayload.products.length > 0) {
        const rawLocal = safeLocalStorage.getItem(PRODUCTS_STORAGE_KEY);
        const rawCloud = JSON.stringify(cloudPayload.products);
        if (rawLocal !== rawCloud) {
          safeLocalStorage.setItem(PRODUCTS_STORAGE_KEY, rawCloud);
          notifyUpdate('arona_products_updated');
          updatedAny = true;
        }
      }

      if (cloudPayload.businessConfig && cloudPayload.businessConfig.phone) {
        const rawLocal = safeLocalStorage.getItem(BUSINESS_STORAGE_KEY);
        const rawCloud = JSON.stringify(cloudPayload.businessConfig);
        if (rawLocal !== rawCloud) {
          safeLocalStorage.setItem(BUSINESS_STORAGE_KEY, rawCloud);
          notifyUpdate('arona_business_updated');
          updatedAny = true;
        }
      }

      if (cloudPayload.offers && Array.isArray(cloudPayload.offers)) {
        const rawLocal = safeLocalStorage.getItem(OFFERS_STORAGE_KEY);
        const rawCloud = JSON.stringify(cloudPayload.offers);
        if (rawLocal !== rawCloud) {
          safeLocalStorage.setItem(OFFERS_STORAGE_KEY, rawCloud);
          notifyUpdate('arona_offers_updated');
          updatedAny = true;
        }
      }

      if (cloudPayload.accessories && Array.isArray(cloudPayload.accessories)) {
        const rawLocal = safeLocalStorage.getItem(ACCESSORIES_STORAGE_KEY);
        const rawCloud = JSON.stringify(cloudPayload.accessories);
        if (rawLocal !== rawCloud) {
          safeLocalStorage.setItem(ACCESSORIES_STORAGE_KEY, rawCloud);
          notifyUpdate('arona_accessories_updated');
          updatedAny = true;
        }
      }

      if (cloudPayload.services && Array.isArray(cloudPayload.services)) {
        const rawLocal = safeLocalStorage.getItem(SERVICES_STORAGE_KEY);
        const rawCloud = JSON.stringify(cloudPayload.services);
        if (rawLocal !== rawCloud) {
          safeLocalStorage.setItem(SERVICES_STORAGE_KEY, rawCloud);
          notifyUpdate('arona_services_updated');
          updatedAny = true;
        }
      }

      if (updatedAny) {
        notifyUpdate('arona_master_data_updated');
      }
    }
  } catch (error) {
    console.warn('Cloud sync error:', error);
  }
}

// Background auto-sync (every 3 seconds for zero-delay live updates)
if (typeof window !== 'undefined') {
  setTimeout(() => syncMasterDataWithCloud(), 100);

  window.addEventListener('focus', () => {
    syncMasterDataWithCloud();
  });

  setInterval(() => {
    syncMasterDataWithCloud();
  }, 3000);
}
