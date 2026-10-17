'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalonePayment = pathname?.startsWith('/payment');

  if (isStandalonePayment) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50/60 text-brand-brown selection:bg-brand-yellow selection:text-brand-brown font-sans">
        <main className="flex-1 w-full">{children}</main>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-warm-cream text-brand-brown selection:bg-brand-yellow selection:text-brand-brown">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </div>
  );
}
