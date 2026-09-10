'use client';

import { useStoreSettings } from '@/components/customer/StoreSettingsProvider/StoreSettingsProvider';
import styles from './FloatingWhatsApp.module.css';

export default function FloatingWhatsApp() {
  const { getWhatsAppSupportUrl, settings } = useStoreSettings();
  const whatsappUrl = getWhatsAppSupportUrl();

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.floatingBtn}
      aria-label={`Chat with ${settings.store_name || 'ARONA MOBILES'} on WhatsApp`}
      title={`Chat with ${settings.store_name || 'ARONA MOBILES'} on WhatsApp`}
      id="floating-whatsapp-btn"
    >
      <span className={styles.icon}>💬</span>
      <span className={styles.label}>Chat with Store</span>
    </a>
  );
}

