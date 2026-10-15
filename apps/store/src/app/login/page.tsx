'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { LogIn, ShieldCheck, Mail, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { requestOtp } from '@/lib/customerApi';

function LoginFormContent() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const { t } = useLanguage();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await requestOtp(email.trim());
      if (res.devOtpCode && typeof window !== 'undefined') {
        sessionStorage.setItem('nida_dev_otp', res.devOtpCode);
      }
      const redirectParam = redirect
        ? `&redirect=${encodeURIComponent(redirect)}`
        : '';
      router.push(
        `/verify-otp?email=${encodeURIComponent(email.trim())}${redirectParam}`,
      );
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error
          ? err.message
          : 'เกิดข้อผิดพลาดในการขอรหัส OTP กรุณาลองใหม่อีกครั้ง',
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setErrorMessage('');
  };

  return (
    <div className="w-full max-w-md bg-white border border-brand-border p-8 sm:p-10 shadow-sm relative">
      {/* Nida Flag Ribbon */}
      <div className="flex w-16 h-2 mx-auto mb-6">
        <div className="w-1/3 bg-brand-brown"></div>
        <div className="w-1/3 bg-white border-y border-gray-200"></div>
        <div className="w-1/3 bg-brand-yellow"></div>
      </div>

      <h1 className="text-2xl sm:text-3xl font-black uppercase text-center tracking-tight text-brand-brown mb-2">
        {t('auth.signInTitle')}
      </h1>
      <p className="text-center text-gray-500 font-medium text-xs mb-8">
        {t('auth.signInSubtitle')}
      </p>

      {errorMessage && (
        <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2.5">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label
            htmlFor="email"
            className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
          >
            {t('auth.emailLabel')}
          </label>
          <div className="relative">
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
              placeholder="customer@nida.com"
              className="w-full border border-gray-300 px-3 py-2.5 pl-10 text-sm focus:outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown disabled:bg-gray-50"
            />
            <Mail
              size={18}
              className="absolute left-3 top-3 text-gray-400 pointer-events-none"
            />
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs text-gray-500">
          <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
          <span>{t('auth.otpNotice')}</span>
        </div>

        <button
          type="submit"
          disabled={isLoading || !email}
          className="w-full bg-brand-brown hover:bg-brand-amber disabled:bg-gray-300 text-white py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-colors shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>กำลังส่งรหัส OTP...</span>
            </>
          ) : (
            <>
              <LogIn size={16} />
              <span>{t('auth.signInBtn')}</span>
            </>
          )}
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
            className="text-xs bg-gray-100 hover:bg-gray-200 text-brand-brown font-semibold px-2.5 py-1 rounded-xs transition-colors"
          >
            phannida@nida.com
          </button>
          <button
            type="button"
            onClick={() => handleQuickDemo('customer@example.com')}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-brand-brown font-semibold px-2.5 py-1 rounded-xs transition-colors"
          >
            customer@example.com
          </button>
        </div>
      </div>

      <div className="mt-8 text-center pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-600">
          {t('auth.noAccount')}{' '}
          <Link
            href="/register"
            className="font-bold text-brand-brown hover:text-brand-amber underline ml-1"
          >
            {t('auth.joinClub')}
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-[75vh] flex flex-col justify-center items-center px-4 py-16 bg-brand-warm-cream font-sans">
      <Suspense
        fallback={
          <div className="p-12 text-center">
            <Loader2 size={24} className="animate-spin mx-auto text-brand-brown" />
          </div>
        }
      >
        <LoginFormContent />
      </Suspense>
    </div>
  );
}
