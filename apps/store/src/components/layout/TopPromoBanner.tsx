import React from 'react';
import Link from 'next/link';
import { MapPin, User } from 'lucide-react';
import type { Language } from '@/context/LanguageContext';

interface TopPromoBannerProps {
  language: Language;
  onSelectLanguage: (lang: Language) => void;
  isAuthenticated: boolean;
  t: (key: string, fallback?: string) => string;
}

export function TopPromoBanner({
  language,
  onSelectLanguage,
  isAuthenticated,
  t,
}: TopPromoBannerProps) {
  return (
    <div className="bg-[#2B1810] text-white text-[11px] font-semibold tracking-wider uppercase py-2 border-b border-[#1E110A]">
      <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 flex justify-between items-center">
        {/* Left Links */}
        <div className="hidden lg:flex items-center space-x-6 text-white/80">
          <span className="flex items-center hover:text-white transition-colors cursor-pointer">
            <MapPin size={12} className="mr-1.5 text-[#F59E0B]" />{' '}
            {t('nav.storeLocator')}
          </span>
          <Link href="/about" className="hover:text-white transition-colors">
            {t('nav.about')}
          </Link>
        </div>

        {/* Center Banner */}
        <div className="flex-1 text-center font-bold tracking-widest text-xs flex items-center justify-center space-x-2 px-2">
          <span className="bg-[#F59E0B] text-[#2B1810] text-[10px] px-2 py-0.5 font-black uppercase rounded-xs">
            {t('promo.limited')}
          </span>
          <span className="truncate">
            {t('promo.saleTitle')}
            <strong className="underline decoration-[#F59E0B] underline-offset-2">
              NIDA20
            </strong>
          </span>
          <span className="hidden sm:inline text-white/60">
            {t('promo.freeShipping')}
          </span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center space-x-4 text-white/80">
          {/* Language Switcher */}
          <div className="flex items-center space-x-0.5 bg-white/10 p-0.5 rounded-xs border border-white/20">
            <button
              type="button"
              onClick={() => onSelectLanguage('th')}
              className={`px-1.5 py-0.5 text-[10px] font-black rounded-xs transition-colors cursor-pointer ${
                language === 'th'
                  ? 'bg-[#F59E0B] text-[#2B1810]'
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
                  ? 'bg-[#F59E0B] text-[#2B1810]'
                  : 'text-white/80 hover:text-white'
              }`}
              title={t('common.switchLangEn')}
            >
              EN
            </button>
          </div>

          <span className="text-white/30 hidden lg:inline">|</span>

          <Link
            href={isAuthenticated ? '/profile' : '/login'}
            className="hover:text-white transition-colors flex items-center text-xs"
          >
            <User size={12} className="mr-1" />
            <span className="hidden lg:inline">
              {isAuthenticated ? t('nav.account') : t('nav.signIn')}
            </span>
          </Link>
        </div>
      </div>
    </div>
  );
}
