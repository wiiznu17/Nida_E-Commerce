'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

interface PromptPayViewProps {
  totalAmount: number | string;
  countdown: number;
}

export function PromptPayView({ totalAmount, countdown }: PromptPayViewProps) {
  const { t } = useLanguage();

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const formattedCountdown = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  return (
    <div className="border border-brand-border bg-stone-50/40 p-4 rounded-xs text-center space-y-3 font-sans">
      <div className="bg-[#113566] text-white py-1.5 px-3 rounded-xs inline-block shadow-2xs">
        <span className="text-[10px] font-black uppercase tracking-widest">
          Thai QR Payment • PromptPay
        </span>
      </div>

      <div className="w-44 h-44 mx-auto bg-white p-2 border border-gray-300 shadow-2xs flex items-center justify-center relative">
        <Image
          src={`https://promptpay.io/0105567891234/${Number(totalAmount).toFixed(2)}.png`}
          alt="PromptPay QR Code"
          width={160}
          height={160}
          unoptimized
          className="object-contain"
        />
      </div>

      <p className="text-xs text-stone-600">
        {t('orderDetail.payModal.promptpayScanNotice')}
      </p>

      <div className="inline-flex items-center space-x-1.5 text-xs text-amber-800 bg-amber-50 px-2.5 py-1 rounded-xs border border-amber-200">
        <span className="font-medium">
          {t('orderDetail.payModal.expiresIn')}:
        </span>
        <span className="font-mono font-bold text-amber-900">
          {formattedCountdown}
        </span>
      </div>
    </div>
  );
}
