import React from 'react';
import Link from 'next/link';
import { MapPin, User } from 'lucide-react';
import type { Language } from '@/context/LanguageContext';
import { useStoreContent } from '@/context/StoreContentContext';

interface TopPromoBannerProps {
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  isAuthenticated: boolean;
  onOpenAuth?: (tab?: 'signin' | 'signup') => void;
  t: (key: string, fallback?: string) => string;
}

export function TopPromoBanner({
  language,
  onSelectLanguage,
  isAuthenticated,
  onOpenAuth,
  t,
}: TopPromoBannerProps) {
  const { storeSettings } = useStoreContent();

  if (storeSettings && storeSettings.announcementActive === false) {
    return null;
  }

  const isTh = language === 'th';
  const badge = isTh
    ? storeSettings?.announcementBadgeTh ||
      storeSettings?.announcementBadgeEn ||
      t('promo.limited')
    : storeSettings?.announcementBadgeEn ||
      storeSettings?.announcementBadgeTh ||
      t('promo.limited');

  const text = isTh
    ? storeSettings?.announcementTextTh ||
      storeSettings?.announcementTextEn ||
      t('promo.saleTitle')
    : storeSettings?.announcementTextEn ||
      storeSettings?.announcementTextTh ||
      t('promo.saleTitle');

  const link = storeSettings?.announcementLink || '/collections';

  return (
    <div className="bg-brand-brown text-white text-[11px] font-semibold tracking-wider uppercase py-2 border-b border-brand-dark-brown overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 flex justify-between items-center gap-3">
        {/* Left Links */}
        <div className="hidden lg:flex items-center space-x-6 text-white/80 shrink-0">
          <span className="flex items-center hover:text-white transition-colors cursor-pointer">
            <MapPin size={12} className="mr-1.5 text-brand-yellow" />{' '}
            {t('nav.storeLocator')}
          </span>
          <Link href="/about" className="hover:text-white transition-colors">
            {t('nav.about')}
          </Link>
        </div>

        {/* Center Banner */}
        <div className="min-w-0 flex-1 text-center font-bold tracking-widest text-xs flex items-center justify-center space-x-2 px-2">
          <span className="shrink-0 bg-brand-yellow text-brand-brown text-[10px] px-2 py-0.5 font-black uppercase rounded-xs">
            {badge}
          </span>
          <Link
            href={link}
            className="truncate hover:text-brand-yellow transition-colors"
          >
            {text}
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-4 text-white/80 shrink-0">
          {/* Language Switcher */}
          <div className="flex items-center space-x-0.5 bg-white/10 p-0.5 rounded-xs border border-white/20">
            <button
              type="button"
              onClick={() => onSelectLanguage('th')}
              className={`px-1.5 py-0.5 text-[10px] font-black rounded-xs transition-colors cursor-pointer ${
                language === 'th'
                  ? 'bg-brand-yellow text-brand-brown'
                  : 'text-white/80 hover:text-white'
              }`}
              title={t('common.switchLangTh')}
            >
              TH
            </button>
            <button
              type="button"
              onClick={() => onSelectLanguage('en')}
              className={`px-1.5 py-0.5 text-[10px] font-black rounded-xs transition-colors cursor-pointer ${
                language === 'en'
                  ? 'bg-brand-yellow text-brand-brown'
                  : 'text-white/80 hover:text-white'
              }`}
              title={t('common.switchLangEn')}
            >
              EN
            </button>
          </div>

          <span className="text-white/30 hidden lg:inline">|</span>

          {isAuthenticated ? (
            <Link
              href="/profile"
              className="hover:text-white transition-colors flex items-center text-xs"
            >
              <User size={12} className="mr-1" />
              <span className="hidden lg:inline">{t('nav.account')}</span>
            </Link>
          ) : (
            <button
              type="button"
              onClick={() => onOpenAuth?.('signin')}
              className="hover:text-white transition-colors flex items-center text-xs cursor-pointer"
            >
              <User size={12} className="mr-1" />
              <span className="hidden lg:inline">{t('nav.signIn')}</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
