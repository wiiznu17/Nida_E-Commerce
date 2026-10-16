import React from 'react';
import { useLanguage } from '@/context/LanguageContext';

interface DevOtpHintBannerProps {
  devOtpHint: string | null;
  onAutoFill: () => void;
}

export function DevOtpHintBanner({
  devOtpHint,
  onAutoFill,
}: DevOtpHintBannerProps) {
  const { language } = useLanguage();

  if (!devOtpHint) return null;

  return (
    <div className="mb-6 p-4 bg-amber-50/80 border border-amber-200 rounded-xs text-left">
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-amber-900 block">
            Sandbox Dev OTP Hint
          </span>
          <p className="font-mono text-base font-bold text-amber-950 mt-0.5">
            {devOtpHint}
          </p>
        </div>
        <button
          type="button"
          onClick={onAutoFill}
          className="bg-brand-brown hover:bg-brand-amber text-white text-[11px] font-bold px-3 py-1.5 rounded-xs transition-colors uppercase cursor-pointer"
        >
          {language === 'th' ? 'กดกรอกอัตโนมัติ' : 'Auto-Fill'}
        </button>
      </div>
    </div>
  );
}
