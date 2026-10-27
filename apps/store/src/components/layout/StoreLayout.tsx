'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { Header } from './Header';
import { Footer } from './Footer';
import { CartDrawer } from './CartDrawer';
import { AuthDrawer } from './AuthDrawer';
import { CookieConsentBanner } from '@/components/common';

export function Layout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isStandalone =
    pathname?.startsWith('/payment') || pathname?.startsWith('/order-success');

  if (isStandalone) {
    return (
      <div className="min-h-screen flex flex-col bg-stone-50/60 text-brand-brown selection:bg-brand-yellow selection:text-brand-brown font-sans">
        <main className="flex-1 w-full">{children}</main>
        <CookieConsentBanner />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-brand-warm-cream text-brand-brown selection:bg-brand-yellow selection:text-brand-brown">
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
      <AuthDrawer />
      <CookieConsentBanner />
    </div>
  );
}
