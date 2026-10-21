import React from 'react';
import { ArrowRight } from 'lucide-react';
import type { ApiCmsBanner } from '@repo/types';

interface SplitEditorialPreviewProps {
  spotlights: Partial<ApiCmsBanner>[];
  lang: 'th' | 'en';
  isMobileView?: boolean;
}

export const SplitEditorialPreview: React.FC<SplitEditorialPreviewProps> = ({
  spotlights,
  lang,
  isMobileView = false,
}) => {
  const isTh = lang === 'th';

  const defaultStories = [
    {
      id: 'default-women',
      image:
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      tag: isTh ? 'คอลเลกชันใหม่ / สุภาพสตรี' : "WOMEN'S / NEW SEASON",
      title: isTh ? 'เสื้อคลุมสไตล์โมเดิร์น' : 'MODERN TAILORED OUTERWEAR',
      desc: isTh
        ? 'สัมผัสโครงสร้างอันประณีตผสานความเรียบหรูเหนือกาลเวลา'
        : 'Sculpted silhouettes handcrafted with timeless bespoke textures.',
      ctaText: isTh ? 'ดูคอลเลกชันสตรี' : 'DISCOVER WOMEN',
    },
    {
      id: 'default-men',
      image:
        'https://images.unsplash.com/photo-1544441893-675973e31985?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=80',
      tag: isTh ? 'คอลเลกชันใหม่ / สุภาพบุรุษ' : "MEN'S / COLLEGIATE",
      title: isTh ? 'โปโลและสเวตเตอร์พรีเมียม' : 'HERITAGE POLOS & KNITWEAR',
      desc: isTh
        ? 'ความคลาสสิกที่สวมใส่สบายในทุกวันด้วยเส้นใยธรรมชาติระดับลักชัวรี'
        : 'Refined casual essentials elevated with fine combed natural fibers.',
      ctaText: isTh ? 'ดูคอลเลกชันบุรุษ' : 'DISCOVER MEN',
    },
  ];

  const cards = defaultStories.map((defaultCard, idx) => {
    const dynamicBanner = spotlights[idx];
    if (!dynamicBanner) return defaultCard;

    const tag = isTh
      ? (dynamicBanner.tagTh ?? dynamicBanner.tagEn ?? defaultCard.tag)
      : (dynamicBanner.tagEn ?? dynamicBanner.tagTh ?? defaultCard.tag);

    const title = isTh
      ? (dynamicBanner.titleTh ??
        dynamicBanner.titleEn ??
        dynamicBanner.title ??
        defaultCard.title)
      : (dynamicBanner.titleEn ??
        dynamicBanner.titleTh ??
        dynamicBanner.title ??
        defaultCard.title);

    const desc = isTh
      ? (dynamicBanner.subtitleTh ??
        dynamicBanner.subtitleEn ??
        defaultCard.desc)
      : (dynamicBanner.subtitleEn ??
        dynamicBanner.subtitleTh ??
        defaultCard.desc);

    const ctaText = isTh
      ? (dynamicBanner.ctaPrimaryTextTh ??
        dynamicBanner.ctaPrimaryTextEn ??
        defaultCard.ctaText)
      : (dynamicBanner.ctaPrimaryTextEn ??
        dynamicBanner.ctaPrimaryTextTh ??
        defaultCard.ctaText);

    return {
      id: dynamicBanner.id ?? defaultCard.id,
      image: dynamicBanner.imageDesktopUrl ?? defaultCard.image,
      tag,
      title,
      desc,
      ctaText,
    };
  });

  return (
    <div className="bg-white py-6 px-4 border-b border-stone-200">
      <div className="text-center max-w-sm mx-auto mb-4">
        <span className="text-[9px] font-black tracking-[0.25em] text-[#C5A880] uppercase block mb-0.5">
          {isTh ? 'เรื่องราวที่คัดสรร' : 'CURATED STORIES'}
        </span>
        <h4 className="text-sm font-black text-[#2B1810] uppercase tracking-tight">
          {isTh ? 'ไฮไลต์ประจำฤดูกาล' : 'THE SEASONAL SPOTLIGHT'}
        </h4>
      </div>

      <div
        className={`grid gap-3 ${isMobileView ? 'grid-cols-1' : 'grid-cols-2'}`}
      >
        {cards.map((card) => (
          <div
            key={card.id}
            className="relative overflow-hidden bg-stone-100 aspect-[16/11] rounded-xs group"
          >
            <img
              src={card.image}
              alt={card.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#2B1810]/90 via-[#2B1810]/30 to-transparent flex flex-col justify-end p-3.5">
              <span className="text-[8px] font-black tracking-[0.2em] text-white/80 uppercase mb-0.5">
                {card.tag}
              </span>
              <h5 className="text-xs font-black text-white uppercase tracking-tight mb-1 line-clamp-1">
                {card.title}
              </h5>
              <p className="text-[9px] text-stone-200 mb-2 line-clamp-1">
                {card.desc}
              </p>
              <div>
                <span className="inline-flex items-center bg-white text-[#2B1810] px-2.5 py-1 font-black text-[8px] tracking-wider uppercase shadow-xs">
                  {card.ctaText}
                  <ArrowRight size={10} className="ml-1" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
