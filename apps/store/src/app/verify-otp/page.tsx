'use client';

import React, { Suspense } from 'react';
import Link from 'next/link';
import { KeyRound, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import {
  OtpInputGrid,
  DevOtpHintBanner,
  useVerifyOtp,
} from '@/components/auth';
import { Alert, LoadingSpinner } from '@/components/ui';

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

      <DevOtpHintBanner devOtpHint={devOtpHint} onAutoFill={handleAutoFill} />

      {errorMessage && (
        <Alert variant="error" className="mb-6">
          {errorMessage}
        </Alert>
      )}

      {infoMessage && (
        <Alert variant="success" className="mb-6">
          {infoMessage}
        </Alert>
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
              <span>{t('auth.verifying')}</span>
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
          {t('auth.didNotReceive')}{' '}
          {resendTimer > 0 ? (
            <span className="text-gray-400 font-semibold">
              {t('auth.resendCountdown').replace('{seconds}', String(resendTimer))}
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
                  {t('auth.sending')}
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
    <div className="w-full flex items-center justify-center font-sans">
      <Suspense fallback={<LoadingSpinner className="p-12" />}>
        <VerifyOTPContent />
      </Suspense>
    </div>
  );
}
