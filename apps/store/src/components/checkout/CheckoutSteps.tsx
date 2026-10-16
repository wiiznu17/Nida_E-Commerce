import React from 'react';
import { useLanguage } from '@/context/LanguageContext';
import type { CheckoutStep } from './checkoutTypes';

interface CheckoutStepsProps {
  currentStep: CheckoutStep;
}

export function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  const { t } = useLanguage();

  return (
    <div className="flex items-center space-x-3 text-xs font-black uppercase tracking-[0.2em] mb-8 pb-4 border-b border-gray-200">
      <span
        className={
          currentStep === 'shipping' ? 'text-brand-brown' : 'text-gray-400'
        }
      >
        {t('checkout.step1')}
      </span>
      <span className="text-gray-300">/</span>
      <span
        className={
          currentStep === 'payment' ? 'text-brand-brown' : 'text-gray-400'
        }
      >
        {t('checkout.step2')}
      </span>
    </div>
  );
}
