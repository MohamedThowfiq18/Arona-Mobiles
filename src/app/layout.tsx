'use client';

import React from 'react';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { CompareModal } from '@/components/CompareModal';
import { ToastContainer } from '@/components/ToastContainer';
import { useRealtimeProducts } from '@/hooks/useRealtimeProducts';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Initialize Supabase Realtime product sync hook
  useRealtimeProducts();

  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <title>ARONA MOBILES — Smarter. Bolder. Connected.</title>
        <meta 
          name="description" 
          content="Buy new smartphones, certified pre-owned phones with 8-point inspection reports, mobile care repairs, and instant upgrade trade-ins." 
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className="min-h-screen bg-background text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
        <Header />
        
        <main className="flex-1 w-full">
          {children}
        </main>

        <CartDrawer />
        <CompareModal />
        <ToastContainer />

        <Footer />
      </body>
    </html>
  );
}
