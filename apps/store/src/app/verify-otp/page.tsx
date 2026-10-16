'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { KeyRound, ArrowRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import { OtpInputGrid, DevOtpHintBanner, useVerifyOtp } from '@/components/auth';

function VerifyOTPContent() {
  const {
    otp,
    email,
    resendTimer,
    isLoading,
    isResending,
    errorMessage,
    infoMessage,
    devOtpHint,
    inputRefs,
    handleChange,
    handleKeyDown,
    handlePaste,
    handleAutoFill,
    handleResend,
    handleSubmit,
    language,
    t,
  } = useVerifyOtp();

  return (
    <div className="max-w-md w-full bg-white border border-brand-border p-8 sm:p-10 shadow-xs text-center font-sans">
      <div className="w-12 h-12 bg-brand-warm-cream border border-brand-border text-brand-brown mx-auto flex items-center justify-center rounded-full mb-6 shadow-2xs">
        <KeyRound size={22} className="text-brand-amber" />
      </div>

      <h1 className="text-2xl font-black uppercase tracking-tight text-brand-brown mb-2">
        {t('auth.verifyOtpTitle')}
      </h1>
      <p className="text-xs text-gray-500 mb-6 leading-relaxed">
        {t('auth.enterOtpDesc')} <br />
        <strong className="text-brand-brown font-mono">{email}</strong>
      </p>

      <DevOtpHintBanner
        devOtpHint={devOtpHint}
        onAutoFill={handleAutoFill}
      />

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
        <OtpInputGrid
          otp={otp}
          isLoading={isLoading}
          inputRefs={inputRefs}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
        />

        <button
          type="submit"
          disabled={otp.join('').length !== 6 || isLoading}
          className="w-full bg-brand-brown hover:bg-brand-amber disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-colors shadow-2xs flex items-center justify-center space-x-2 cursor-pointer"
        >
          {isLoading ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>
                {language === 'th' ? 'กำลังตรวจสอบรหัส...' : 'Verifying...'}
              </span>
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
              className="text-brand-brown hover:text-brand-amber font-bold underline cursor-pointer disabled:opacity-50"
            >
              {isResending ? (
                <span className="inline-flex items-center">
                  <RefreshCw size={12} className="animate-spin mr-1" />
                  {language === 'th' ? 'กำลังส่ง...' : 'Sending...'}
                </span>
              ) : (
                t('auth.resendOtp')
              )}
            </button>
          )}
        </p>

        <div>
          <Link
            href="/login"
            className="text-[11px] font-bold text-gray-400 hover:text-brand-brown uppercase tracking-wider"
          >
            {t('auth.backToLogin')}
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerifyOTPPage() {
  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-16 bg-brand-warm-cream">
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
