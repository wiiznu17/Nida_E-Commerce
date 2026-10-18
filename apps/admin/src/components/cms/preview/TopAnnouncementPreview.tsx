import React from 'react';
import type { ApiStoreSettings } from '@repo/types';

interface TopAnnouncementPreviewProps {
  settings: Partial<ApiStoreSettings>;
  lang: 'th' | 'en';
  isMobileView?: boolean;
}

export const TopAnnouncementPreview: React.FC<TopAnnouncementPreviewProps> = ({
  settings,
  lang,
  isMobileView = false,
}) => {
  if (settings.announcementActive === false) {
    return (
      <div className="bg-stone-100 text-stone-400 py-1.5 px-4 text-center text-[10px] uppercase font-bold tracking-wider border-b border-stone-200">
        [Top Announcement Bar: Disabled / ปิดการแสดงผล]
      </div>
    );
  }

  const isTh = lang === 'th';
  const badge = isTh
    ? settings.announcementBadgeTh || settings.announcementBadgeEn || 'ข้อเสนอพิเศษ'
    : settings.announcementBadgeEn || settings.announcementBadgeTh || 'LIMITED OFFER';

  const text = isTh
    ? settings.announcementTextTh ||
      settings.announcementTextEn ||
      'FALL SALE: รับส่วนลดสูงสุด 50% | ส่งฟรีเมื่อช้อปครบ ฿1,000'
    : settings.announcementTextEn ||
      settings.announcementTextTh ||
      'FALL SALE: UP TO 50% OFF | FREE SHIPPING OVER ฿1,000';

  return (
    <div className="bg-[#2B1810] text-white text-[10px] font-semibold tracking-wider uppercase py-2 px-3 border-b border-stone-800 flex items-center justify-center space-x-2 overflow-hidden">
      <span className="shrink-0 bg-[#E6C687] text-[#2B1810] text-[9px] px-1.5 py-0.5 font-black uppercase rounded-xs">
        {badge}
      </span>
      <span
        className={`truncate ${
          isMobileView ? 'max-w-[240px]' : 'max-w-[480px]'
        }`}
      >
        {text}
      </span>
    </div>
  );
};
