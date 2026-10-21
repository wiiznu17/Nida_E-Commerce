'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useStoreContent } from '@/context/StoreContentContext';

export const SplitEditorialBento: React.FC = () => {
  const { t, language } = useLanguage();
  const { seasonalSpotlights } = useStoreContent();

  const defaultStories = [
    {
      id: 'default-women',
      image:
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      tag: t('home.storyWomenTag'),
      title: t('home.storyWomenTitle'),
      desc: t('home.storyWomenDesc'),
      link: '/collections/women',
      ctaText: t('home.discoverWomen'),
    },
    {
      id: 'default-men',
      image:
        'https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      tag: t('home.storyMenTag'),
      title: t('home.storyMenTitle'),
      desc: t('home.storyMenDesc'),
      link: '/collections/men',
      ctaText: t('home.discoverMen'),
    },
  ];

  const cards = defaultStories.map((defaultCard, idx) => {
    const dynamicBanner = seasonalSpotlights[idx];
    if (!dynamicBanner) return defaultCard;

    const tag =
      language === 'en'
        ? (dynamicBanner.tagEn ?? dynamicBanner.tagTh ?? defaultCard.tag)
        : (dynamicBanner.tagTh ?? dynamicBanner.tagEn ?? defaultCard.tag);

    const title =
      language === 'en'
        ? (dynamicBanner.titleEn ??
          dynamicBanner.titleTh ??
          dynamicBanner.title ??
          defaultCard.title)
        : (dynamicBanner.titleTh ??
          dynamicBanner.titleEn ??
          dynamicBanner.title ??
          defaultCard.title);

    const desc =
      language === 'en'
        ? (dynamicBanner.subtitleEn ??
          dynamicBanner.subtitleTh ??
          defaultCard.desc)
        : (dynamicBanner.subtitleTh ??
          dynamicBanner.subtitleEn ??
          defaultCard.desc);

    const link =
      dynamicBanner.ctaPrimaryLink ??
      dynamicBanner.targetUrl ??
      defaultCard.link;

    const ctaText =
      language === 'en'
        ? (dynamicBanner.ctaPrimaryTextEn ??
          dynamicBanner.ctaPrimaryTextTh ??
          defaultCard.ctaText)
        : (dynamicBanner.ctaPrimaryTextTh ??
          dynamicBanner.ctaPrimaryTextEn ??
          defaultCard.ctaText);

    return {
      id: dynamicBanner.id,
      image: dynamicBanner.imageDesktopUrl ?? defaultCard.image,
      tag,
      title,
      desc,
      link,
      ctaText,
    };
  });

  return (
    <section className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-16 sm:py-20">
      <div className="text-center max-w-xl mx-auto mb-12">
        <span className="text-xs font-black tracking-[0.25em] text-brand-amber uppercase block mb-2">
          {t('home.curatedStories')}
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-brand-brown uppercase tracking-tight">
          {t('home.seasonalSpotlight')}
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {cards.map((card) => (
          <div
            key={card.id}
            className="relative group overflow-hidden bg-gray-100 aspect-[4/5] sm:aspect-[16/12]"
          >
            <img
              src={card.image}
              alt={card.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-brand-brown/90 via-brand-brown/30 to-transparent flex flex-col justify-end p-8 sm:p-10">
              <span className="text-[11px] font-black tracking-[0.25em] text-white/80 uppercase mb-2">
                {card.tag}
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-white uppercase tracking-tight mb-3">
                {card.title}
              </h3>
              <p className="text-xs sm:text-sm text-gray-200 mb-6 max-w-md line-clamp-2">
                {card.desc}
              </p>
              <div>
                <Link
                  href={card.link}
                  className="inline-flex items-center bg-white text-brand-brown hover:bg-brand-yellow hover:text-brand-brown px-6 py-3 font-black text-xs tracking-widest uppercase transition-all shadow-md cursor-pointer"
                >
                  {card.ctaText}
                  <ArrowRight size={14} className="ml-2" />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
