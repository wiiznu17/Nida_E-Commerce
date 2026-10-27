'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';

const COOKIE_CONSENT_KEY = 'nida_cookie_consent';

export function CookieConsentBanner() {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        setIsVisible(true);
      }
    } catch {
      // Storage unavailable fallback
    }
  }, []);

  const handleConsent = (mode: 'all' | 'essential') => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, mode);
    } catch {
      // Ignore storage errors
    }
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <aside
      role="region"
      aria-label={t('cookie.title')}
      className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-6 sm:bottom-6 sm:max-w-md z-40 bg-white/95 backdrop-blur-md border border-brand-border p-5 sm:p-6 shadow-2xl text-brand-brown rounded-xs animate-in fade-in slide-in-from-bottom-3 duration-300 font-sans"
    >
      <div>
        <span className="text-[10px] font-black uppercase tracking-widest text-brand-amber block mb-1">
          PRIVACY &amp; SECURITY
        </span>
          <h3 className="text-sm font-black uppercase tracking-tight text-brand-brown">
            {t('cookie.title')}
          </h3>
          <p className="text-xs text-gray-600 leading-relaxed mt-1.5">
            {t('cookie.description')}
          </p>
          <div className="mt-2">
            <Link
              href="/about"
              className="text-[11px] font-bold text-gray-500 hover:text-brand-brown underline transition-colors"
            >
              {t('cookie.learnMore')} &rarr;
            </Link>
          </div>

          <div className="mt-4 flex flex-col xs:flex-row gap-2 sm:gap-2.5">
            <button
              type="button"
              onClick={() => handleConsent('all')}
              className="flex-1 bg-brand-brown hover:bg-brand-amber text-white text-xs font-bold uppercase tracking-wider py-2.5 px-4 rounded-xs transition-colors cursor-pointer shadow-xs text-center"
            >
              {t('cookie.acceptAll')}
            </button>
            <button
              type="button"
              onClick={() => handleConsent('essential')}
              className="border border-gray-300 hover:border-brand-brown text-gray-700 hover:text-brand-brown text-xs font-bold uppercase tracking-wider py-2.5 px-3.5 rounded-xs transition-colors cursor-pointer bg-white text-center"
            >
              {t('cookie.essentialOnly')}
            </button>
          </div>
        </div>
      </aside>
  );
}
