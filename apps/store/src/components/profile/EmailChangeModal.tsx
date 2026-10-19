'use client';

import React, { useState } from 'react';
import { X, Mail, ShieldCheck, KeyRound } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { authRequester } from '@/api';
import { Alert } from '@/components/ui';

interface EmailChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmail: string;
}

export function EmailChangeModal({
  isOpen,
  onClose,
  currentEmail,
}: EmailChangeModalProps) {
  const { token, setSession } = useAuth();
  const { language, t } = useLanguage();

  const [step, setStep] = useState<'REQUEST' | 'VERIFY'>('REQUEST');
  const [newEmail, setNewEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newEmail.trim()) return;

    if (newEmail.trim().toLowerCase() === currentEmail.toLowerCase()) {
      setErrorMessage(
        language === 'th'
          ? 'อีเมลใหม่ต้องไม่ซ้ำกับอีเมลเดิม'
          : 'New email cannot be the same as current email',
      );
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const res = await authRequester.requestEmailChange(
        token,
        newEmail.trim().toLowerCase(),
      );
      if (res.devOtpCode) {
        setDevOtp(res.devOtpCode);
      }
      setStep('VERIFY');
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to send OTP code';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newEmail.trim() || !otpCode.trim()) return;

    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await authRequester.verifyEmailChange(
        token,
        newEmail.trim().toLowerCase(),
        otpCode.trim(),
      );
      setSession(res.accessToken, res.refreshToken, res.user);
      setSuccessMessage(t('auth.emailChangeSuccess'));

      setTimeout(() => {
        onClose();
        setStep('REQUEST');
        setNewEmail('');
        setOtpCode('');
        setDevOtp(null);
        setSuccessMessage('');
      }, 1500);
    } catch (err: unknown) {
      const msg =
        err instanceof Error
          ? err.message
          : language === 'th'
            ? 'รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว'
            : 'Invalid or expired OTP code';
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    onClose();
    setStep('REQUEST');
    setErrorMessage('');
    setSuccessMessage('');
    setDevOtp(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white border border-gray-200 shadow-2xl p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-150">
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-700 transition-colors cursor-pointer"
          aria-label="Close modal"
        >
          <X size={20} />
        </button>

        <div className="flex items-center space-x-3 mb-5 pb-4 border-b border-gray-100">
          <div className="w-10 h-10 rounded-full bg-brand-warm-cream flex items-center justify-center text-brand-brown">
            <Mail size={18} />
          </div>
          <div>
            <h3 className="text-base font-black text-brand-brown uppercase tracking-tight">
              {t('auth.changeEmailTitle')}
            </h3>
            <p className="text-[11px] text-gray-500">
              {t('auth.changeEmailSubtitle')}
            </p>
          </div>
        </div>

        {errorMessage && (
          <Alert variant="error" className="mb-4">
            {errorMessage}
          </Alert>
        )}

        {successMessage && (
          <Alert variant="success" className="mb-4">
            {successMessage}
          </Alert>
        )}

        {step === 'REQUEST' ? (
          <form onSubmit={handleRequestOtp} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                {language === 'th' ? 'อีเมลปัจจุบัน' : 'Current Email'}
              </label>
              <input
                type="text"
                value={currentEmail}
                disabled
                className="w-full border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-500 cursor-not-allowed"
              />
            </div>

            <div>
              <label
                htmlFor="newEmail"
                className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                {t('auth.newEmailLabel')}
              </label>
              <input
                type="email"
                id="newEmail"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                required
                placeholder="name@example.com"
                className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-brown"
              />
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-brand-brown hover:bg-brand-amber text-white py-2.5 text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? '...' : t('auth.sendOtp')}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div>
              <p className="text-xs text-gray-600 mb-2">
                {language === 'th'
                  ? `ระบบส่งรหัส 6 หลักไปยัง ${newEmail} เรียบร้อยแล้ว`
                  : `A 6-digit verification code was sent to ${newEmail}`}
              </p>

              {devOtp && (
                <div
                  onClick={() => setOtpCode(devOtp)}
                  className="mb-3 p-2 bg-amber-50 border border-amber-200 text-xs text-amber-900 cursor-pointer"
                >
                  <p className="font-bold text-[10px] uppercase tracking-wider text-amber-700">
                    {t('auth.demoTip')}
                  </p>
                  <p className="font-mono text-sm font-black mt-0.5">
                    {devOtp}
                  </p>
                </div>
              )}

              <label
                htmlFor="otpCode"
                className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                {language === 'th' ? 'รหัส OTP 6 หลัก *' : '6-Digit OTP Code *'}
              </label>
              <div className="relative">
                <input
                  type="text"
                  id="otpCode"
                  maxLength={6}
                  value={otpCode}
                  onChange={(e) =>
                    setOtpCode(e.target.value.replace(/\D/g, ''))
                  }
                  required
                  placeholder="000000"
                  className="w-full border border-gray-300 px-3 py-2 text-center text-lg font-mono tracking-widest focus:outline-none focus:border-brand-brown"
                />
                <KeyRound
                  size={16}
                  className="absolute right-3 top-3 text-gray-400"
                />
              </div>
            </div>

            <div className="flex space-x-3 pt-2">
              <button
                type="button"
                onClick={() => setStep('REQUEST')}
                className="w-1/3 py-2.5 text-xs font-bold uppercase tracking-wider border border-gray-300 hover:bg-gray-100 transition-colors cursor-pointer text-center"
              >
                {language === 'th' ? 'ย้อนกลับ' : 'Back'}
              </button>
              <button
                type="submit"
                disabled={isLoading || otpCode.length !== 6}
                className="w-2/3 bg-brand-brown hover:bg-brand-amber text-white py-2.5 text-xs font-black uppercase tracking-wider transition-colors disabled:opacity-50 cursor-pointer"
              >
                {isLoading ? '...' : t('auth.verifyAndChange')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
