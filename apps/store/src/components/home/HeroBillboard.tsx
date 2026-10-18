'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useStoreContent } from '@/context/StoreContentContext';

export const HeroBillboard: React.FC = () => {
  const { language, t } = useLanguage();
  const { heroBanners } = useStoreContent();
  const [currentIndex, setCurrentIndex] = useState(0);

  const isTh = language === 'th';

  useEffect(() => {
    if (heroBanners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % heroBanners.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [heroBanners.length]);

  const activeBanner = heroBanners[currentIndex] ?? null;

  const defaultImage =
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2200&q=85';

  const desktopImage = activeBanner?.imageDesktopUrl || defaultImage;
  const mobileImage = activeBanner?.imageMobileUrl || desktopImage;

  const tag = isTh
    ? activeBanner?.tagTh || activeBanner?.tagEn || t('home.heroTag')
    : activeBanner?.tagEn || activeBanner?.tagTh || t('home.heroTag');

  const title = isTh
    ? activeBanner?.titleTh ||
      activeBanner?.titleEn ||
      activeBanner?.title ||
      `${t('home.heroTitle1')}\n${t('home.heroTitle2')}`
    : activeBanner?.titleEn ||
      activeBanner?.titleTh ||
      activeBanner?.title ||
      `${t('home.heroTitle1')}\n${t('home.heroTitle2')}`;

  const subtitle = isTh
    ? activeBanner?.subtitleTh ||
      activeBanner?.subtitleEn ||
      activeBanner?.subtitle ||
      t('home.heroDesc')
    : activeBanner?.subtitleEn ||
      activeBanner?.subtitleTh ||
      activeBanner?.subtitle ||
      t('home.heroDesc');

  const primaryCtaText = isTh
    ? activeBanner?.ctaPrimaryTextTh ||
      activeBanner?.ctaPrimaryTextEn ||
      t('home.shopWomen')
    : activeBanner?.ctaPrimaryTextEn ||
      activeBanner?.ctaPrimaryTextTh ||
      t('home.shopWomen');
  const primaryCtaLink = activeBanner?.ctaPrimaryLink || '/collections/women';

  const secondaryCtaText = isTh
    ? activeBanner?.ctaSecondaryTextTh ||
      activeBanner?.ctaSecondaryTextEn ||
      (activeBanner ? null : t('home.shopMen'))
    : activeBanner?.ctaSecondaryTextEn ||
      activeBanner?.ctaSecondaryTextTh ||
      (activeBanner ? null : t('home.shopMen'));
  const secondaryCtaLink = activeBanner?.ctaSecondaryLink || '/collections/men';

  return (
    <section className="relative w-full min-h-[580px] lg:min-h-[720px] bg-brand-brown flex items-center overflow-hidden">
      {/* Background Image with subtle zoom and mobile adaptation */}
      <picture className="absolute inset-0">
        <source media="(max-width: 640px)" srcSet={mobileImage} />
        <img
          src={desktopImage}
          alt={activeBanner?.title || 'Nida Campaign'}
          className="w-full h-full object-cover object-center opacity-65 scale-105 transition-transform duration-1000 ease-out"
        />
      </picture>
      <div className="absolute inset-0 bg-gradient-to-t from-brand-brown via-brand-brown/40 to-transparent lg:bg-gradient-to-r lg:from-brand-brown/90 lg:via-brand-brown/50 lg:to-transparent" />

      {/* Content Box */}
      <div className="relative z-10 max-w-8xl mx-auto px-6 sm:px-8 lg:px-12 py-20 w-full">
        <div className="max-w-2xl text-white">
          {/* Campaign Tag */}
          <div className="inline-flex items-center space-x-2 bg-brand-yellow text-brand-brown px-3 py-1 text-xs font-black uppercase tracking-[0.2em] mb-6">
            <Sparkles size={13} className="text-brand-brown" />
            <span>{tag}</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black uppercase tracking-tight text-white leading-[1.05] mb-6 whitespace-pre-line">
            {title}
          </h1>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-gray-200 font-normal leading-relaxed mb-8 max-w-xl">
            {subtitle}
          </p>

          {/* Multi CTA Buttons */}
          <div className="flex flex-wrap gap-4 pt-2">
            <Link
              href={primaryCtaLink}
              className="bg-white hover:bg-gray-100 text-brand-brown px-8 py-4 font-black text-xs tracking-[0.2em] uppercase transition-all shadow-lg hover:shadow-xl hover:translate-y-[-1px] text-center cursor-pointer"
            >
              {primaryCtaText}
            </Link>

            {secondaryCtaText && (
              <Link
                href={secondaryCtaLink}
                className="bg-brand-brown hover:bg-brand-amber border-2 border-white text-white px-8 py-4 font-black text-xs tracking-[0.2em] uppercase transition-all shadow-lg text-center cursor-pointer"
              >
                {secondaryCtaText}
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Multi-Slide Controls (Only rendered if > 1 banner) */}
      {heroBanners.length > 1 && (
        <>
          <button
            type="button"
            onClick={() =>
              setCurrentIndex(
                (prev) => (prev - 1 + heroBanners.length) % heroBanners.length,
              )
            }
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-xs transition-colors z-20 cursor-pointer"
            aria-label="Previous Slide"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            type="button"
            onClick={() =>
              setCurrentIndex((prev) => (prev + 1) % heroBanners.length)
            }
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-black/30 hover:bg-black/50 text-white backdrop-blur-xs transition-colors z-20 cursor-pointer"
            aria-label="Next Slide"
          >
            <ChevronRight size={20} />
          </button>

          {/* Slide Indicator Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center space-x-2 z-20">
            {heroBanners.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setCurrentIndex(i)}
                className={`h-1.5 transition-all rounded-full cursor-pointer ${
                  currentIndex === i
                    ? 'w-6 bg-brand-yellow'
                    : 'w-2 bg-white/40 hover:bg-white/70'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
};
