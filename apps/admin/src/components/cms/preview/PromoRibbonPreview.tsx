import React from 'react';
import type { ApiCmsBanner } from '@repo/types';

interface PromoRibbonPreviewProps {
  banner: Partial<ApiCmsBanner> | null;
  lang: 'th' | 'en';
  isMobileView?: boolean;
}

export const PromoRibbonPreview: React.FC<PromoRibbonPreviewProps> = ({
  banner,
  lang,
  isMobileView = false,
}) => {
  const isTh = lang === 'th';

  const tag = isTh
    ? banner?.tagTh || banner?.tagEn || 'สิทธิพิเศษ'
    : banner?.tagEn || banner?.tagTh || 'EXCLUSIVE PRIVILEGE';

  const title = isTh
    ? banner?.titleTh || banner?.titleEn || 'รับส่วนลด 20% สำหรับคำสั่งซื้อแรก'
    : banner?.titleEn || banner?.titleTh || 'ENJOY 20% OFF YOUR FIRST ORDER';

  const subtitle = isTh
    ? banner?.subtitleTh ||
      banner?.subtitleEn ||
      'เมื่อช้อปสินค้าคอลเลกชันใหม่ครบ ฿2,500'
    : banner?.subtitleEn ||
      banner?.subtitleTh ||
      'When shopping new arrivals over ฿2,500';

  const couponCode = banner?.couponCode || 'NIDA20';
  const bgImage =
    isMobileView && banner?.imageMobileUrl
      ? banner.imageMobileUrl
      : banner?.imageDesktopUrl || '';

  return (
    <div
      className={`relative overflow-hidden bg-[#2B1810] text-white py-5 px-6 border-y-2 border-[#E6C687] flex ${
        isMobileView
          ? 'flex-col items-center text-center space-y-3'
          : 'flex-row items-center justify-between'
      }`}
    >
      {bgImage && (
        <img
          src={bgImage}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        />
      )}
      <div className="relative z-10">
        <div className="inline-block bg-[#E6C687] text-[#2B1810] text-[9px] font-black uppercase tracking-widest px-2 py-0.5 mb-1.5">
          {tag}
        </div>
        <h4 className="text-sm sm:text-base font-black uppercase tracking-tight">
          {title}
        </h4>
        <p className="text-[11px] text-gray-300">{subtitle}</p>
      </div>

      <div className="relative z-10 flex items-center space-x-2 bg-white/10 p-1.5 rounded-xs border border-white/20">
        <span className="font-mono text-xs font-black tracking-widest px-2 text-white">
          {couponCode}
        </span>
        <span className="bg-white text-[#2B1810] font-black text-[9px] uppercase tracking-wider px-2.5 py-1">
          {isTh ? 'คัดลอก' : 'COPY'}
        </span>
      </div>
    </div>
  );
};
