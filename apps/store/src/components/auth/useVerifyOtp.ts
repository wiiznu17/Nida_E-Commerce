'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { authRequester, extractApiError } from '@/api';

export function useVerifyOtp() {
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
      const timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  const handleChange = (val: string, index: number) => {
    if (val && !/^\d+$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);
    setErrorMessage('');

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
      setInfoMessage(
        language === 'th'
          ? 'ส่งรหัส OTP ชุดใหม่ไปยังอีเมลเรียบร้อยแล้ว'
          : 'A new OTP has been sent to your email',
      );
      if (res.devOtpCode) {
        setDevOtpHint(res.devOtpCode);
        sessionStorage.setItem('nida_dev_otp', res.devOtpCode);
      }
    } catch (err: unknown) {
      const extracted = extractApiError(err, 'Failed to resend OTP');
      setErrorMessage(extracted.message);
    } finally {
      setIsResending(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const otpCode = otp.join('');
    if (otpCode.length !== 6) return;

    setIsLoading(true);
    setErrorMessage('');
    setInfoMessage('');

    try {
      const res = await authRequester.verifyOtp(email, otpCode);
      sessionStorage.removeItem('nida_dev_otp');
      setSession(res.accessToken, res.refreshToken, res.user);

      if (redirect && redirect.startsWith('/')) {
        router.push(redirect);
      } else {
        router.push('/profile');
      }
    } catch (err: unknown) {
      const extracted = extractApiError(
        err,
        language === 'th'
          ? 'รหัส OTP ไม่ถูกต้องหรือหมดอายุแล้ว กรุณาลองใหม่อีกครั้ง'
          : 'Invalid or expired OTP. Please try again.',
      );
      setErrorMessage(extracted.message);
    } finally {
      setIsLoading(false);
    }
  };

  return {
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
  };
}
