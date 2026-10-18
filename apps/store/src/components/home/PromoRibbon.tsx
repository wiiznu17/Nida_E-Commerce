'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useStoreContent } from '@/context/StoreContentContext';

export const PromoRibbon: React.FC = () => {
  const { language, t } = useLanguage();
  const { promoRibbon } = useStoreContent();
  const [copiedCode, setCopiedCode] = useState(false);

  const isTh = language === 'th';

  const couponCode = promoRibbon?.couponCode || 'NIDA20';

  const tag = isTh
    ? promoRibbon?.tagTh || promoRibbon?.tagEn || t('home.promoRibbonTag')
    : promoRibbon?.tagEn || promoRibbon?.tagTh || t('home.promoRibbonTag');

  const title = isTh
    ? promoRibbon?.titleTh || promoRibbon?.titleEn || promoRibbon?.title || t('home.promoRibbonTitle')
    : promoRibbon?.titleEn || promoRibbon?.titleTh || promoRibbon?.title || t('home.promoRibbonTitle');

  const subtitle = isTh
    ? promoRibbon?.subtitleTh || promoRibbon?.subtitleEn || promoRibbon?.subtitle || t('home.promoRibbonDesc')
    : promoRibbon?.subtitleEn || promoRibbon?.subtitleTh || promoRibbon?.subtitle || t('home.promoRibbonDesc');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(couponCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <section className="relative overflow-hidden bg-brand-brown text-white py-8 border-y-4 border-brand-yellow">
      {promoRibbon?.imageDesktopUrl && (
        <img
          src={promoRibbon.imageDesktopUrl}
          alt={title}
          className="absolute inset-0 w-full h-full object-cover opacity-20 pointer-events-none"
        />
      )}
      <div className="relative max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div>
          <div className="inline-block bg-brand-yellow text-brand-brown text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 mb-2">
            {tag}
          </div>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
            {title}
          </h3>
          <p className="text-xs text-gray-300">{subtitle}</p>
        </div>

        <div className="flex items-center space-x-3 bg-white/10 p-2 rounded-xs border border-white/20">
          <span className="font-mono text-lg font-black tracking-widest px-3 text-white">
            {couponCode}
          </span>
          <button
            onClick={handleCopyCode}
            className="bg-white text-brand-brown hover:bg-brand-yellow hover:text-brand-brown font-black text-xs uppercase tracking-wider px-4 py-2 transition-colors flex items-center cursor-pointer"
          >
            {copiedCode ? (
              <>
                <Check size={14} className="mr-1 text-emerald-600" />
                {t('home.copied')}
              </>
            ) : (
              t('home.copyCode')
            )}
          </button>
        </div>
      </div>
    </section>
  );
};
