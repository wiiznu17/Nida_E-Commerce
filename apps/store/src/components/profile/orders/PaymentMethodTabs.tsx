'use client';

import React from 'react';
import { QrCode, CreditCard } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { PaymentMethod } from '@repo/types';

interface PaymentMethodTabsProps {
  activeMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
}

export function PaymentMethodTabs({
  activeMethod,
  onSelectMethod,
}: PaymentMethodTabsProps) {
  const { t } = useLanguage();

  return (
    <div>
      <label className="block text-[11px] font-bold uppercase tracking-wider text-stone-500 mb-2">
        {t('orderDetail.payModal.methodTitle')}
      </label>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onSelectMethod(PaymentMethod.PROMPTPAY)}
          className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xs border text-xs font-bold transition-all cursor-pointer ${
            activeMethod === PaymentMethod.PROMPTPAY
              ? 'border-brand-brown bg-brand-warm-cream/50 text-brand-dark-brown shadow-2xs'
              : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
          }`}
        >
          <QrCode className="w-4 h-4 text-brand-brown" />
          <span>{t('orderDetail.payModal.promptpayTab')}</span>
        </button>

        <button
          type="button"
          onClick={() => onSelectMethod(PaymentMethod.CREDIT_CARD)}
          className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xs border text-xs font-bold transition-all cursor-pointer ${
            activeMethod === PaymentMethod.CREDIT_CARD
              ? 'border-brand-brown bg-brand-warm-cream/50 text-brand-dark-brown shadow-2xs'
              : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
          }`}
        >
          <CreditCard className="w-4 h-4 text-brand-brown" />
          <span>{t('orderDetail.payModal.creditCardTab')}</span>
        </button>
      </div>
    </div>
  );
}
