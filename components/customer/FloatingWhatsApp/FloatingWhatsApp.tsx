'use client';

import { getWhatsAppSupportUrl } from '@/lib/constants';
import styles from './FloatingWhatsApp.module.css';

export default function FloatingWhatsApp() {
  const whatsappUrl = getWhatsAppSupportUrl();

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      className={styles.floatingBtn}
      aria-label="Chat with ARONA MOBILES on WhatsApp"
      title="Chat with ARONA MOBILES on WhatsApp"
      id="floating-whatsapp-btn"
    >
      <span className={styles.icon}>💬</span>
      <span className={styles.label}>Chat with Store</span>
    </a>
  );
}
