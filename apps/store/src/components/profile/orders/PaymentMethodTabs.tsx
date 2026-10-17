'use client';

import React from 'react';
import { QrCode, CreditCard } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { PaymentMethod } from '@repo/types';

interface PaymentMethodTabsProps {
  selectedMethod: PaymentMethod;
  onSelectMethod: (method: PaymentMethod) => void;
  disabled?: boolean;
}

export function PaymentMethodTabs({
  selectedMethod,
  onSelectMethod,
  disabled = false,
}: PaymentMethodTabsProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2.5">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectMethod(PaymentMethod.PROMPTPAY)}
          className={`flex items-center justify-between p-3.5 rounded-xs border text-left transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            selectedMethod === PaymentMethod.PROMPTPAY
              ? 'border-brand-brown bg-brand-warm-cream/40 text-brand-dark-brown shadow-2xs ring-1 ring-brand-brown'
              : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <QrCode className="w-4 h-4 text-brand-brown shrink-0" />
            <span className="text-xs font-bold">{t('orderDetail.payModal.promptpayTab')}</span>
          </div>
          <div
            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
              selectedMethod === PaymentMethod.PROMPTPAY
                ? 'border-brand-brown bg-brand-brown'
                : 'border-stone-300'
            }`}
          >
            {selectedMethod === PaymentMethod.PROMPTPAY && (
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </div>
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectMethod(PaymentMethod.CREDIT_CARD)}
          className={`flex items-center justify-between p-3.5 rounded-xs border text-left transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${
            selectedMethod === PaymentMethod.CREDIT_CARD
              ? 'border-brand-brown bg-brand-warm-cream/40 text-brand-dark-brown shadow-2xs ring-1 ring-brand-brown'
              : 'border-stone-200 bg-white text-stone-600 hover:border-stone-300 hover:bg-stone-50'
          }`}
        >
          <div className="flex items-center space-x-2.5">
            <CreditCard className="w-4 h-4 text-brand-brown shrink-0" />
            <span className="text-xs font-bold">{t('orderDetail.payModal.creditCardTab')}</span>
          </div>
          <div
            className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
              selectedMethod === PaymentMethod.CREDIT_CARD
                ? 'border-brand-brown bg-brand-brown'
                : 'border-stone-300'
            }`}
          >
            {selectedMethod === PaymentMethod.CREDIT_CARD && (
              <span className="w-1.5 h-1.5 rounded-full bg-white" />
            )}
          </div>
        </button>
      </div>
    </div>
  );
}
