'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, ShieldCheck, Mail } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const router = useRouter();
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
    }
  };

  const handleQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center items-center px-4 py-16 bg-[#FAF7F2] font-sans">
      <div className="w-full max-w-md bg-white border border-[#EAE3D9] p-8 sm:p-10 shadow-sm relative">
        {/* Nida Flag Ribbon */}
        <div className="flex w-16 h-2 mx-auto mb-6">
          <div className="w-1/3 bg-[#2B1810]"></div>
          <div className="w-1/3 bg-white border-y border-gray-200"></div>
          <div className="w-1/3 bg-[#F59E0B]"></div>
        </div>

        <h1 className="text-2xl sm:text-3xl font-black uppercase text-center tracking-tight text-[#2B1810] mb-2">
          {t('auth.signInTitle')}
        </h1>
        <p className="text-center text-gray-500 font-medium text-xs mb-8">
          {t('auth.signInSubtitle')}
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
              {t('auth.emailLabel')}
            </label>
            <div className="relative">
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="customer@nida.com"
                className="w-full border border-gray-300 px-3 py-2.5 pl-10 text-sm focus:outline-none focus:border-[#2B1810] focus:ring-1 focus:ring-[#2B1810]"
              />
              <Mail size={18} className="absolute left-3 top-3 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
            <span>{t('auth.otpNotice')}</span>
          </div>

          <button
            type="submit"
            className="w-full bg-[#2B1810] hover:bg-[#D97706] text-white py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-colors shadow-md flex items-center justify-center space-x-2"
          >
            <LogIn size={16} />
            <span>{t('auth.signInBtn')}</span>
          </button>
        </form>

        {/* Demo Fast Fill */}
        <div className="mt-6 pt-5 border-t border-dashed border-gray-200">
          <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
            {t('auth.quickDemo')}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => handleQuickDemo('phannida@nida.com')}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-[#2B1810] font-semibold px-2.5 py-1 rounded-xs transition-colors"
            >
              phannida@nida.com
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('vip_member@nida.com')}
              className="text-xs bg-gray-100 hover:bg-gray-200 text-[#2B1810] font-semibold px-2.5 py-1 rounded-xs transition-colors"
            >
              vip_member@nida.com
            </button>
          </div>
        </div>

        <div className="mt-8 text-center pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            {t('auth.noAccount')}{' '}
            <Link href="/register" className="font-bold text-[#2B1810] hover:text-[#D97706] underline ml-1">
              {t('auth.joinClub')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
