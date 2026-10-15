'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const SplitEditorialBento: React.FC = () => {
  const { t } = useLanguage();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-xs font-black tracking-[0.25em] text-brand-amber uppercase block mb-2">
          {t('home.curatedStories')}
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-brand-brown uppercase tracking-tight">
          {t('home.seasonalSpotlight')}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Story Card 1: Women's Outerwear */}
        <div className="relative group overflow-hidden bg-gray-100 aspect-[4/5] sm:aspect-[16/12]">
          <img
            src="https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
            alt="Women's New Season"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-brown/90 via-brand-brown/30 to-transparent flex flex-col justify-end p-8 sm:p-10">
            <span className="text-[11px] font-black tracking-[0.25em] text-white/80 uppercase mb-2">
              {t('home.storyWomenTag')}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-3">
              {t('home.storyWomenTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-gray-200 mb-6 max-w-md line-clamp-2">
              {t('home.storyWomenDesc')}
            </p>
            <div>
              <Link
                href="/collections/women"
                className="inline-flex items-center bg-white text-brand-brown hover:bg-brand-yellow hover:text-brand-brown px-6 py-3 font-black text-xs tracking-widest uppercase transition-all shadow-md cursor-pointer"
              >
                {t('home.discoverWomen')}
                <ArrowRight size={14} className="ml-2" />
              </Link>
            </div>
          </div>
        </div>

        {/* Story Card 2: Men's Collegiate & Polos */}
        <div className="relative group overflow-hidden bg-gray-100 aspect-[4/5] sm:aspect-[16/12]">
          <img
            src="https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80"
            alt="Men's New Season"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brand-brown/90 via-brand-brown/30 to-transparent flex flex-col justify-end p-8 sm:p-10">
            <span className="text-[11px] font-black tracking-[0.25em] text-white/80 uppercase mb-2">
              {t('home.storyMenTag')}
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-3">
              {t('home.storyMenTitle')}
            </h3>
            <p className="text-xs sm:text-sm text-gray-200 mb-6 max-w-md line-clamp-2">
              {t('home.storyMenDesc')}
            </p>
            <div>
              <Link
                href="/collections/men"
                className="inline-flex items-center bg-white text-brand-brown hover:bg-brand-yellow hover:text-brand-brown px-6 py-3 font-black text-xs tracking-widest uppercase transition-all shadow-md cursor-pointer"
              >
                {t('home.discoverMen')}
                <ArrowRight size={14} className="ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
