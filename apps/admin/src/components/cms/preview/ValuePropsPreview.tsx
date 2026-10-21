import React from 'react';
import { Truck, RefreshCw, ShieldCheck, Star } from 'lucide-react';
import type { ApiStoreSettings } from '@repo/types';

interface ValuePropsPreviewProps {
  settings: Partial<ApiStoreSettings>;
  lang: 'th' | 'en';
  isMobileView?: boolean;
}

export const ValuePropsPreview: React.FC<ValuePropsPreviewProps> = ({
  settings,
  lang,
  isMobileView = false,
}) => {
  const isTh = lang === 'th';
  const freeShipping = Number(settings.freeShippingThreshold || 1000);
  const returnDays = Number(settings.returnWindowDays || 7);

  const items = [
    {
      icon: Truck,
      title: isTh ? 'จัดส่งฟรีทั่วไทย' : 'FREE SHIPPING',
      subtitle: isTh
        ? `เมื่อช้อปครบ ฿${freeShipping.toLocaleString()}`
        : `Orders over ฿${freeShipping.toLocaleString()}`,
    },
    {
      icon: RefreshCw,
      title: isTh ? 'เปลี่ยน/คืนสินค้า' : 'EASY RETURNS',
      subtitle: isTh
        ? `ภายใน ${returnDays} วันหลังส่งมอบ`
        : `Within ${returnDays} days`,
    },
    {
      icon: ShieldCheck,
      title: isTh ? 'รับประกันของแท้ 100%' : '100% AUTHENTIC',
      subtitle: isTh ? 'งานคราฟต์มาตรฐานสากล' : 'Handcrafted luxury',
    },
    {
      icon: Star,
      title: isTh ? 'สิทธิพิเศษ NIDA CLUB' : 'CLUB PERKS',
      subtitle: isTh ? 'สะสมแต้มทุกออเดอร์' : 'Earn reward points',
    },
  ];

  return (
    <div className="bg-[#FAF7F2] border-y border-stone-200 py-3.5 px-4">
      <div
        className={`grid gap-3 text-left ${
          isMobileView ? 'grid-cols-2' : 'grid-cols-4'
        }`}
      >
        {items.map((item, index) => {
          const Icon = item.icon;
          return (
            <div key={index} className="flex items-center space-x-2">
              <div className="p-1.5 bg-white text-[#2B1810] border border-stone-200 shrink-0">
                <Icon size={14} className="text-[#E6C687]" />
              </div>
              <div className="min-w-0">
                <h5 className="text-[10px] font-black uppercase tracking-wider text-[#2B1810] truncate">
                  {item.title}
                </h5>
                <p className="text-[9px] text-stone-500 truncate">
                  {item.subtitle}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
