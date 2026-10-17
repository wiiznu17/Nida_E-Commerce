'use client';

import React from 'react';
import Image from 'next/image';
import { useLanguage } from '@/context/LanguageContext';

interface PromptPayViewProps {
  totalAmount: number | string;
  countdown: number;
  qrDownloadUri?: string;
  onSimulatePay?: () => void;
  isSimulating?: boolean;
}

export function PromptPayView({
  totalAmount,
  countdown,
  qrDownloadUri,
  onSimulatePay,
  isSimulating,
}: PromptPayViewProps) {
  const { t, isTh } = useLanguage();

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const formattedCountdown = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const imageSrc =
    qrDownloadUri ||
    `https://promptpay.io/0105567891234/${Number(totalAmount).toFixed(2)}.png`;

  return (
    <div className="border border-brand-border bg-stone-50/40 p-4 rounded-xs text-center space-y-3 font-sans">
      <div className="bg-[#113566] text-white py-1.5 px-3 rounded-xs inline-block shadow-2xs">
        <span className="text-[10px] font-black uppercase tracking-widest">
          Thai QR Payment • PromptPay
        </span>
      </div>

      <div className="w-44 h-44 mx-auto bg-white p-2 border border-gray-300 shadow-2xs flex items-center justify-center relative">
        <Image
          src={imageSrc}
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

      {onSimulatePay && (
        <div className="pt-2 border-t border-stone-200">
          <button
            type="button"
            onClick={onSimulatePay}
            disabled={isSimulating}
            className="w-full py-1.5 px-3 bg-stone-200 hover:bg-stone-300 text-stone-800 text-[11px] font-bold rounded-xs transition-colors cursor-pointer disabled:opacity-50"
          >
            {isSimulating
              ? (isTh ? 'กำลังจำลองการโอนเงิน...' : 'Simulating payment...')
              : (isTh ? 'โหมดทดสอบ: จำลองการชำระเงินสำเร็จ (Omise Sandbox)' : 'Sandbox: Simulate Payment Success')}
          </button>
        </div>
      )}
    </div>
  );
}
