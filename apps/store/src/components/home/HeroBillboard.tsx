'use client';

import React from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const HeroBillboard: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="relative w-full min-h-[580px] lg:min-h-[720px] bg-[#2B1810] flex items-center overflow-hidden">
      {/* Background Image with subtle editorial zoom */}
      <div className="absolute inset-0">
        <img
          src="https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2200&q=85"
          alt="Nida Modern Heritage Campaign"
          className="w-full h-full object-cover object-center opacity-65 scale-105 transition-transform duration-1000 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2B1810] via-[#2B1810]/40 to-transparent lg:bg-gradient-to-r lg:from-[#2B1810]/90 lg:via-[#2B1810]/50 lg:to-transparent" />
      </div>

      {/* Content Box */}
      <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-20 w-full">
        <div className="max-w-2xl text-white">
          {/* Campaign Tag */}
          <div className="inline-flex items-center space-x-2 bg-[#F59E0B] text-[#2B1810] px-3 py-1 text-xs font-black uppercase tracking-[0.2em] mb-6">
            <Sparkles size={13} className="text-[#2B1810]" />
            <span>{t('home.heroTag')}</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-[1.05] mb-6">
            {t('home.heroTitle1')}
            <br />
            {t('home.heroTitle2')}
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-gray-200 font-normal leading-relaxed mb-8 max-w-xl">
            {t('home.heroDesc')}
          </p>

          {/* Multi CTA Buttons */}
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href="/collections/women"
              className="bg-white hover:bg-gray-100 text-[#2B1810] px-8 py-4 font-black text-xs tracking-[0.2em] uppercase transition-all shadow-lg hover:shadow-xl hover:translate-y-[-1px] text-center cursor-pointer"
            >
              {t('home.shopWomen')}
            </Link>
            <Link
              href="/collections/men"
              className="bg-[#2B1810] hover:bg-[#D97706] border-2 border-white text-white px-8 py-4 font-black text-xs tracking-[0.2em] uppercase transition-all shadow-lg text-center cursor-pointer"
            >
              {t('home.shopMen')}
            </Link>
            <Link
              href="/collections/sale"
              className="bg-[#F59E0B] hover:bg-[#D97706] text-[#2B1810] px-8 py-4 font-black text-xs tracking-[0.2em] uppercase transition-all shadow-lg text-center cursor-pointer"
            >
              {t('home.shopSale')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};
