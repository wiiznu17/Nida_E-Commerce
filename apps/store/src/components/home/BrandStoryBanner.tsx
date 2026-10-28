'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { NidaLogo } from '@/components/layout';

export const BrandStoryBanner: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="relative bg-brand-brown text-white py-24 overflow-hidden">
      <div className="max-w-5xl mx-auto px-6 text-center relative z-10">
        <div className="flex justify-center mb-6">
          <NidaLogo size="lg" dark className="drop-shadow-md" />
        </div>
        <span className="text-xs font-black tracking-[0.3em] uppercase text-brand-yellow block mb-4">
          {t('home.heritageTag')}
        </span>
        <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mb-6">
          {t('home.heritageTitle1')}
          <br />
          {t('home.heritageTitle2')}
        </h2>
        <p className="text-base sm:text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed mb-8">
          {t('home.heritageDesc')}
        </p>
        <div className="flex justify-center gap-4">
          <Link
            href="/about"
            className="bg-white hover:bg-gray-100 text-brand-brown px-8 py-4 font-black text-xs uppercase tracking-[0.2em] transition-colors cursor-pointer"
          >
            {t('home.readOurStory')}
          </Link>
        </div>
      </div>
    </section>
  );
};
