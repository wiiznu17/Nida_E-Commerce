'use client';

import React from 'react';
import { Truck, RefreshCw, ShieldCheck, Star } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useStoreContent } from '@/context/StoreContentContext';

export const ValuePropsStrip: React.FC = () => {
  const { language, t } = useLanguage();
  const { storeSettings } = useStoreContent();

  const isTh = language === 'th';
  const freeShipping = Number(storeSettings?.freeShippingThreshold ?? 1000);
  const returnDays = Number(storeSettings?.returnWindowDays ?? 7);

  const valueProps = [
    {
      icon: Truck,
      title: t('home.freeShippingTitle'),
      subtitle: isTh
        ? `เมื่อช้อปครบ ฿${freeShipping.toLocaleString()}`
        : `Orders over ฿${freeShipping.toLocaleString()}`,
    },
    {
      icon: RefreshCw,
      title: t('home.returnsTitle'),
      subtitle: isTh
        ? `ภายใน ${returnDays} วันหลังส่งมอบ`
        : `Within ${returnDays} days of delivery`,
    },
    {
      icon: ShieldCheck,
      title: t('home.guaranteeTitle'),
      subtitle: t('home.guaranteeSub'),
    },
    {
      icon: Star,
      title: t('home.perksTitle'),
      subtitle: t('home.perksSub'),
    },
  ];

  return (
    <section className="bg-brand-warm-cream border-y border-brand-border py-6">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 grid grid-cols-2 md:grid-cols-4 gap-6 text-center md:text-left">
        {valueProps.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex flex-col md:flex-row items-center md:items-start space-y-2 md:space-y-0 md:space-x-3"
            >
              <div className="p-2.5 bg-white text-brand-brown rounded-xs border border-gray-200 shrink-0">
                <Icon size={20} className="text-brand-yellow" />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-brand-brown">
                  {item.title}
                </h4>
                <p className="text-[11px] text-gray-500">{item.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
