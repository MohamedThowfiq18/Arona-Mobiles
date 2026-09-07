import type { Metadata } from 'next';
import Navbar from '@/components/customer/Navbar/Navbar';
import Footer from '@/components/customer/Footer/Footer';
import RealtimeProvider from '@/components/customer/RealtimeProvider/RealtimeProvider';
import ToastContainer from '@/components/customer/Toast/Toast';

import FloatingWhatsApp from '@/components/customer/FloatingWhatsApp/FloatingWhatsApp';

export const metadata: Metadata = {
  title: {
    default: 'Arona Mobiles — Smartphones, Accessories & In-Store Pickup',
    template: '%s | Arona Mobiles',
  },
  description:
    'Buy new & certified pre-owned smartphones, book repairs, or trade in your phone. Visit ARONA MOBILES store or contact via Call & WhatsApp.',
};

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="site-wrapper" style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer />
      {/* Persistent floating WhatsApp button */}
      <FloatingWhatsApp />
      {/* Supabase Realtime product-change toasts */}
      <RealtimeProvider />
      {/* Global toast container */}
      <ToastContainer />
    </div>
  );
}
