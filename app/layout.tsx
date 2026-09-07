import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Arona Mobiles — Smartphones, Accessories & Repair',
    template: '%s | Arona Mobiles',
  },
  description:
    'Your trusted local smartphone store. Buy new & certified pre-owned phones, accessories, instant trade-in and repairs with fast in-store pickup.',
  keywords: ['smartphones', 'mobile phones', 'certified pre-owned phones', 'phone repair', 'trade-in', 'phone store'],
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
