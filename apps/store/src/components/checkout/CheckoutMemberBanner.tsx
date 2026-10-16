import React from 'react';
import Link from 'next/link';
import { Lock } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface CheckoutMemberBannerProps {
  isAuthenticated: boolean;
  isLoading: boolean;
}

export function CheckoutMemberBanner({
  isAuthenticated,
  isLoading,
}: CheckoutMemberBannerProps) {
  const { language, t } = useLanguage();

  if (isAuthenticated || isLoading) {
    return null;
  }

  return (
    <div className="mb-8 p-4 bg-brand-warm-cream border border-brand-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
      <div className="flex items-center space-x-3">
        <Lock size={18} className="text-brand-amber shrink-0" />
        <div>
          <p className="text-xs font-bold text-brand-brown">
            {language === 'th'
              ? 'เข้าสู่ระบบด้วย OTP เพื่อผูกประวัติคำสั่งซื้อและสะสมแต้มสมาชิก'
              : 'Sign in with OTP to link this order to your account and earn rewards'}
          </p>
          <p className="text-[11px] text-gray-500">
            {language === 'th'
              ? 'หากเป็นลูกค้าใหม่ ระบบจะสร้างบัญชีให้คุณโดยอัตโนมัติ'
              : 'New customer? We will create your account automatically'}
          </p>
        </div>
      </div>
      <Link
        href="/login?redirect=/checkout"
        className="px-4 py-2 bg-brand-brown hover:bg-brand-amber text-white text-xs font-black uppercase tracking-wider transition-colors shrink-0"
      >
        {t('auth.signInBtn')}
      </Link>
    </div>
  );
}
