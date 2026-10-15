'use client';

import React from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import type { CollectionBannerProps } from './collectionTypes';

export function CollectionBanner({
  title,
  subtitle,
  bannerTag,
  bgImage,
}: CollectionBannerProps) {
  const { language } = useLanguage();

  return (
    <div className="bg-brand-brown text-white py-12 sm:py-16 px-4 relative overflow-hidden">
      {bgImage && (
        <div className="absolute inset-0 opacity-20">
          <img
            src={bgImage}
            alt={title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
        {/* Breadcrumb Navigation */}
        <div className="flex justify-center items-center space-x-2 text-[11px] font-black uppercase tracking-[0.25em] text-gray-300 mb-3">
          <Link href="/" className="hover:text-white transition-colors">
            {language === 'th' ? 'หน้าแรก' : 'HOME'}
          </Link>
          <span>/</span>
          <span>{language === 'th' ? 'คอลเลกชัน' : 'COLLECTIONS'}</span>
          <span>/</span>
          <span className="text-brand-yellow">{title}</span>
        </div>

        {bannerTag && (
          <span className="inline-block bg-brand-yellow text-brand-brown text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 mb-3">
            {bannerTag}
          </span>
        )}

        <h1 className="text-3xl sm:text-5xl font-black uppercase tracking-tight text-white mb-3">
          {title}
        </h1>
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-gray-300 font-normal leading-relaxed">
          {subtitle}
        </p>
      </div>
    </div>
  );
}
