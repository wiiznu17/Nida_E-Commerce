'use client';

import React, { useState, useEffect, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { KeyRound, ArrowRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { authRequester, extractApiError } from '@/api';

function VerifyOTPContent() {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [resendTimer, setResendTimer] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);

  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession } = useAuth();
  const { language, t } = useLanguage();

  const email = searchParams.get('email') || '';
  const redirect = searchParams.get('redirect') || '';

  // Retrieve initial dev OTP hint if saved
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedDevCode = sessionStorage.getItem('nida_dev_otp');
      if (savedDevCode) {
        setDevOtpHint(savedDevCode);
      }
    }
  }, []);

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (val: string, index: number) => {
    if (val && !/^\d+$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);
    setErrorMessage('');

    // Focus next input
    if (val !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleAutoFill = () => {
    if (devOtpHint && devOtpHint.length === 6) {
      const digits = devOtpHint.split('');
      setOtp(digits);
      inputRefs.current[5]?.focus();
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0 || isResending || !email) return;

    setIsResending(true);
    setErrorMessage('');
    setInfoMessage('');

    try {
      const res = await authRequester.requestOtp(email);
      setResendTimer(60);
      setInfoMessage('ส่งรหัส OTP ชุดใหม่ไปยังอีเมลเรียบร้อยแล้ว');
      if (res.devOtpCode) {
        setDevOtpHint(res.devOtpCode);
        sessionStorage.setItem('nida_dev_otp', res.devOtpCode);
      }
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } catch (err: unknown) {
      const extracted = extractApiError(
        err,
        language === 'th'
          ? 'ไม่สามารถส่งรหัสใหม่ได้ในขณะนี้'
          : 'Unable to resend OTP at this time.',
      );
      setErrorMessage(extracted.message);
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6 || !email) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const result = await authRequester.verifyOtp(email, code);
      setSession(result.accessToken, result.user);

      // Clean up dev hint
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('nida_dev_otp');
      }

      // Route to destination
      if (redirect) {
        router.push(redirect);
      } else {
        router.push('/profile');
      }
    } catch (err: unknown) {
      const extracted = extractApiError(
        err,
        language === 'th'
          ? 'รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว กรุณาลองใหม่อีกครั้ง'
          : 'Invalid or expired OTP code. Please try again.',
      );
      setErrorMessage(extracted.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white border border-brand-border p-8 sm:p-10 shadow-sm relative">
      {/* Nida Flag Ribbon */}
      <div className="flex w-16 h-2 mx-auto mb-6">
        <div className="w-1/3 bg-brand-brown"></div>
        <div className="w-1/3 bg-white border-y border-gray-200"></div>
        <div className="w-1/3 bg-brand-yellow"></div>
      </div>

      <div className="flex justify-center mb-3 text-brand-amber">
        <KeyRound size={32} />
      </div>

      <h1 className="text-2xl sm:text-3xl font-black uppercase text-center tracking-tight text-brand-brown mb-2">
        {t('auth.verifyOtpTitle')}
      </h1>
      <p className="text-center text-gray-500 font-medium text-xs mb-6 leading-relaxed">
        {t('auth.verifyOtpSubtitle')}
        <br />
        <strong className="text-brand-brown text-sm font-bold">{email || 'customer@nida.com'}</strong>
      </p>

      {/* Dev Sandbox Helper Banner */}
      {devOtpHint && (
        <div className="bg-brand-warm-cream border border-brand-border p-3 mb-6 rounded-xs">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block">
                {language === 'th' ? 'รหัส OTP ในระบบ (Dev / Sandbox)' : 'Dev Sandbox OTP'}
              </span>
              <span className="text-lg font-mono font-black text-brand-brown tracking-widest">
                {devOtpHint}
              </span>
            </div>
            <button
              type="button"
              onClick={handleAutoFill}
              className="bg-brand-brown hover:bg-brand-amber text-white text-[11px] font-bold px-3 py-1.5 rounded-xs transition-colors uppercase cursor-pointer"
            >
              {language === 'th' ? 'กดกรอกอัตโนมัติ' : 'Auto-Fill'}
            </button>
          </div>
        </div>
      )}

      {errorMessage && (
        <div className="mb-6 p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-2.5">
          <AlertCircle size={16} className="shrink-0 mt-0.5 text-red-600" />
          <span className="leading-relaxed">{errorMessage}</span>
        </div>
      )}

      {infoMessage && (
        <div className="mb-6 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs">
          {infoMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-between gap-2 max-w-xs mx-auto">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => {
                inputRefs.current[index] = el;
              }}
              className="w-11 h-14 border-2 border-gray-300 text-center text-xl font-bold font-mono bg-white text-brand-brown focus:outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown transition-colors disabled:bg-gray-100"
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              disabled={isLoading}
              onChange={(e) => handleChange(e.target.value, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              onPaste={handlePaste}
              onFocus={(e) => e.target.select()}
              required
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={otp.join('').length !== 6 || isLoading}
          className="w-full bg-brand-brown hover:bg-brand-amber disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-colors shadow-md flex items-center justify-center space-x-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>กำลังตรวจสอบรหัส...</span>
            </>
          ) : (
            <>
              <span>{t('auth.verifyBtn')}</span>
              <ArrowRight size={16} />
            </>
          )}
        </button>
      </form>

      <div className="mt-8 text-center space-y-3 pt-6 border-t border-gray-200">
        <p className="text-xs text-gray-500 font-medium">
          {language === 'th' ? 'ไม่ได้รับรหัส OTP? ' : "Didn't receive code? "}
          {resendTimer > 0 ? (
            <span className="text-gray-400 font-semibold">
              {language === 'th'
                ? `ส่งใหม่ได้ใน ${resendTimer} วินาที`
                : `Resend in ${resendTimer}s`}
            </span>
          ) : (
            <button
              onClick={handleResend}
              disabled={isResending}
              className="font-bold text-brand-brown hover:text-brand-amber underline ml-1 cursor-pointer disabled:text-gray-400"
            >
              {isResending ? 'กำลังส่ง...' : t('auth.resendBtn')}
            </button>
          )}
        </p>

        <div>
          <Link
            href="/login"
            className="text-xs font-bold text-gray-400 hover:text-brand-brown uppercase tracking-wider inline-block"
          >
            ← {t('auth.backToSignIn')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <div className="min-h-[75vh] flex flex-col justify-center items-center px-4 py-16 bg-brand-warm-cream font-sans">
      <Suspense
        fallback={
          <div className="p-12 text-center">
            <Loader2 size={24} className="animate-spin mx-auto text-brand-brown" />
          </div>
        }
      >
        <VerifyOTPContent />
      </Suspense>
    </div>
  );
}
