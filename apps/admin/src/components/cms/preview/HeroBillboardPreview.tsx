import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import type { ApiCmsBanner } from '@repo/types';

interface HeroBillboardPreviewProps {
  banner: Partial<ApiCmsBanner> | null;
  lang: 'th' | 'en';
  isMobileView?: boolean;
}

export const HeroBillboardPreview: React.FC<HeroBillboardPreviewProps> = ({
  banner,
  lang,
  isMobileView = false,
}) => {
  const isTh = lang === 'th';

  const defaultImage =
    'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?ixlib=rb-4.0.3&auto=format&fit=crop&w=2200&q=85';

  const bgImage = isMobileView
    ? banner?.imageMobileUrl || banner?.imageDesktopUrl || defaultImage
    : banner?.imageDesktopUrl || defaultImage;

  const tag = isTh
    ? banner?.tagTh || banner?.tagEn || 'คอลเลกชันใหม่'
    : banner?.tagEn || banner?.tagTh || 'NEW COLLECTION';

  const title = isTh
    ? banner?.titleTh || banner?.titleEn || 'ความสง่างามร่วมสมัย'
    : banner?.titleEn || banner?.titleTh || 'MODERN HERITAGE';

  const subtitle = isTh
    ? banner?.subtitleTh ||
      banner?.subtitleEn ||
      'สัมผัสความประณีตระดับงานคราฟต์ที่ผสมผสานความคลาสสิกเหนือกาลเวลา'
    : banner?.subtitleEn ||
      banner?.subtitleTh ||
      'Experience authentic craftsmanship where timeless luxury meets modern silhouettes.';

  const primaryCta = isTh
    ? banner?.ctaPrimaryTextTh || banner?.ctaPrimaryTextEn || 'เลือกซื้อสินค้า'
    : banner?.ctaPrimaryTextEn || banner?.ctaPrimaryTextTh || 'SHOP WOMEN';

  const secondaryCta = isTh
    ? banner?.ctaSecondaryTextTh || banner?.ctaSecondaryTextEn || 'ดูลุคบุ๊ก'
    : banner?.ctaSecondaryTextEn || banner?.ctaSecondaryTextTh || 'EXPLORE LOOKBOOK';

  return (
    <div
      className={`relative w-full overflow-hidden bg-[#2B1810] text-white flex items-center transition-all ${
        isMobileView ? 'min-h-[380px] p-6' : 'min-h-[440px] p-10 lg:p-14'
      }`}
    >
      {/* Background Image & Editorial Overlay */}
      <div className="absolute inset-0">
        <img
          src={bgImage}
          alt="Hero Banner Preview"
          className="w-full h-full object-cover object-center opacity-65 scale-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#2B1810] via-[#2B1810]/40 to-transparent lg:bg-gradient-to-r lg:from-[#2B1810]/90 lg:via-[#2B1810]/50 lg:to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-xl w-full">
        {/* Campaign Tag */}
        <div className="inline-flex items-center space-x-1.5 bg-[#E6C687] text-[#2B1810] px-2.5 py-0.5 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
          <Sparkles size={11} className="text-[#2B1810]" />
          <span>{tag}</span>
        </div>

        {/* Headline */}
        <h2
          className={`font-black uppercase tracking-tight leading-[1.05] text-white mb-3 ${
            isMobileView ? 'text-2xl sm:text-3xl' : 'text-3xl lg:text-5xl'
          }`}
        >
          {title}
        </h2>

        {/* Subtitle */}
        <p
          className={`text-gray-200 font-normal leading-relaxed mb-6 line-clamp-3 ${
            isMobileView ? 'text-xs' : 'text-sm'
          }`}
        >
          {subtitle}
        </p>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2.5 pt-1">
          <div className="bg-white text-[#2B1810] px-4 py-2 font-black text-[10px] tracking-[0.2em] uppercase shadow-md flex items-center cursor-default">
            {primaryCta}
            <ArrowRight size={12} className="ml-1.5" />
          </div>
          {secondaryCta && (
            <div className="bg-[#2B1810] border border-white text-white px-4 py-2 font-black text-[10px] tracking-[0.2em] uppercase shadow-md cursor-default">
              {secondaryCta}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
