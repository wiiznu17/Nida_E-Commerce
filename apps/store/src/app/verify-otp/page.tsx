'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { KeyRound, ArrowRight } from 'lucide-react';

function VerifyOTPContent() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(30);
  const [sampleCodeNotification, setSampleCodeNotification] = useState('829410');
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  const { language, t } = useLanguage();

  const email = searchParams.get('email') || 'customer@nida.com';
  const initialData = {
    firstName: searchParams.get('firstName') || undefined,
    lastName: searchParams.get('lastName') || undefined,
    phone: searchParams.get('phone') || undefined,
  };

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (element: HTMLInputElement, index: number) => {
    const val = element.value;
    if (isNaN(Number(val))) return;

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    // Focus next input
    if (val !== '' && element.nextElementSibling) {
      (element.nextElementSibling as HTMLInputElement).focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
    if (e.key === 'Backspace' && !otp[index] && e.currentTarget.previousElementSibling) {
      (e.currentTarget.previousElementSibling as HTMLInputElement).focus();
    }
  };

  const handleAutoFill = () => {
    const digits = sampleCodeNotification.split('');
    setOtp(digits);
  };

  const handleResend = () => {
    setResendTimer(30);
    const newCode = Math.floor(100000 + Math.random() * 900000).toString();
    setSampleCodeNotification(newCode);
    setOtp(['', '', '', '', '', '']);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length === 6) {
      login(email, initialData);
      router.push('/profile');
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-[#EAE3D9] p-8 sm:p-10 shadow-sm relative">
      {/* Nida Flag Ribbon */}
      <div className="flex w-16 h-2 mx-auto mb-6">
        <div className="w-1/3 bg-[#2B1810]"></div>
        <div className="w-1/3 bg-white border-y border-gray-200"></div>
        <div className="w-1/3 bg-[#F59E0B]"></div>
      </div>

      <div className="flex justify-center mb-3 text-[#D97706]">
        <KeyRound size={32} />
      </div>

      <h1 className="text-2xl sm:text-3xl font-black uppercase text-center tracking-tight text-[#2B1810] mb-2">
        {t('auth.verifyOtpTitle')}
      </h1>
      <p className="text-center text-gray-500 font-medium text-xs mb-6 leading-relaxed">
        {t('auth.verifyOtpSubtitle')}
        <br />
        <strong className="text-[#2B1810] text-sm">{email}</strong>
      </p>

      {/* Instant Sandbox Helper Banner */}
      <div className="bg-[#FAF7F2] border border-[#EAE3D9] p-3 mb-6 rounded-xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">
              {language === 'th' ? 'รหัส OTP จำลอง (Demo)' : 'Simulated Test Code'}
            </span>
            <span className="text-lg font-mono font-black text-[#2B1810] tracking-widest">
              {sampleCodeNotification}
            </span>
          </div>
          <button
            type="button"
            onClick={handleAutoFill}
            className="bg-[#2B1810] hover:bg-[#D97706] text-white text-[11px] font-bold px-3 py-1.5 rounded-xs transition-colors uppercase"
          >
            {language === 'th' ? 'กดกรอกอัตโนมัติ' : 'Auto-Fill'}
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between gap-2 max-w-xs mx-auto">
          {otp.map((digit, index) => (
            <input
              key={index}
              className="w-11 h-14 border-2 border-gray-300 text-center text-xl font-bold font-mono bg-white text-[#2B1810] focus:outline-none focus:border-[#2B1810] focus:ring-1 focus:ring-[#2B1810] transition-colors"
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(e.target, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onFocus={(e) => e.target.select()}
              required
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={otp.join('').length !== 6}
          className="w-full bg-[#2B1810] hover:bg-[#D97706] disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-colors shadow-md flex items-center justify-center space-x-2"
        >
          <span>{t('auth.verifyBtn')}</span>
          <ArrowRight size={16} />
        </button>
      </form>

      <div className="mt-8 text-center space-y-3 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 font-medium">
          {language === 'th' ? 'ไม่ได้รับรหัส OTP? ' : "Didn't receive code? "}
          {resendTimer > 0 ? (
            <span className="text-gray-400 font-semibold">
              {language === 'th' ? `ขอรหัสใหม่ได้ใน (${resendTimer}s)` : `Resend in (${resendTimer}s)`}
            </span>
          ) : (
            <button onClick={handleResend} className="font-bold text-[#D97706] hover:underline">
              {t('auth.resendCode')}
            </button>
          )}
        </p>
        <div>
          <Link href="/login" className="text-xs font-bold uppercase tracking-wider text-gray-600 hover:text-[#2B1810]">
            {language === 'th' ? '← ใช้อีเมลอื่น' : '← Change Email'}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <div className="min-h-[75vh] flex flex-col justify-center items-center px-4 py-16 bg-[#FAF7F2] font-sans">
      <Suspense fallback={<div className="text-xs uppercase font-bold text-gray-500">Loading verification...</div>}>
        <VerifyOTPContent />
      </Suspense>
    </div>
  );
}
