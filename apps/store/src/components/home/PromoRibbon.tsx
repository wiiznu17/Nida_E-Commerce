'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export const PromoRibbon: React.FC = () => {
  const { t } = useLanguage();
  const [copiedCode, setCopiedCode] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText('NIDA20');
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <section className="bg-brand-brown text-white py-8 border-y-4 border-brand-yellow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
        <div>
          <div className="inline-block bg-brand-yellow text-brand-brown text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 mb-2">
            {t('home.promoRibbonTag')}
          </div>
          <h3 className="text-xl sm:text-2xl font-black uppercase tracking-tight">
            {t('home.promoRibbonTitle')}
          </h3>
          <p className="text-xs text-gray-300">{t('home.promoRibbonDesc')}</p>
        </div>

        <div className="flex items-center space-x-3 bg-white/10 p-2 rounded-xs border border-white/20">
          <span className="font-mono text-lg font-black tracking-widest px-3 text-white">
            NIDA20
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
