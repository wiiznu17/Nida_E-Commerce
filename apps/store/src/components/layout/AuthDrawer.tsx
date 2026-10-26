'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  X,
  Mail,
  ShieldCheck,
  Tag,
  Loader2,
  KeyRound,
  ArrowRight,
  RefreshCw,
  ArrowLeft,
  Check,
  Lock,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { authRequester, extractApiError } from '@/api';
import { OtpInputGrid, DevOtpHintBanner } from '@/components/auth';
import { Alert } from '@/components/ui';

function AuthDrawerContent() {
  const {
    isAuthDrawerOpen,
    authDrawerTab,
    closeAuthDrawer,
    openAuthDrawer,
    setSession,
  } = useAuth();
  const { language, t } = useLanguage();
  const searchParams = useSearchParams();

  // Auto-open if URL has ?auth=signin or ?auth=signup
  useEffect(() => {
    const authQuery = searchParams?.get('auth');
    if (authQuery === 'signin' || authQuery === 'signup') {
      openAuthDrawer(authQuery);
    }
  }, [searchParams, openAuthDrawer]);

  // Mode: 'form' | 'otp' | 'forgot' | 'reset'
  const [step, setStep] = useState<'form' | 'otp' | 'forgot' | 'reset'>('form');
  const [otpFlow, setOtpFlow] = useState<'login' | 'register' | 'reset'>('login');

  // Form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Forgot / Reset password states
  const [forgotEmail, setForgotEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);

  // OTP states
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [activeEmail, setActiveEmail] = useState('');
  const [resendTimer, setResendTimer] = useState(60);
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null);
  const inputRefs = useRef<Array<HTMLInputElement | null>>([]);

  // Async & feedback
  const [isLoading, setIsLoading] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorAction, setErrorAction] = useState<
    'switchToSignUp' | 'switchToSignIn' | null
  >(null);
  const [loginEmailHint, setLoginEmailHint] = useState<string | null>(null);
  const [registerEmailHint, setRegisterEmailHint] = useState<string | null>(
    null,
  );

  // Countdown timer for OTP
  useEffect(() => {
    if ((step === 'otp' || step === 'reset') && resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [step, resendTimer]);

  // Lock body scroll when open
  useEffect(() => {
    if (isAuthDrawerOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isAuthDrawerOpen]);

  // Reset internal states when drawer closes
  const handleClose = () => {
    closeAuthDrawer();
    setTimeout(() => {
      setStep('form');
      setOtpFlow('login');
      setErrorMessage('');
      setInfoMessage('');
      setErrorAction(null);
      setLoginEmailHint(null);
      setRegisterEmailHint(null);
      setIsSuccess(false);
      setLoginPassword('');
      setRegisterPassword('');
      setNewPassword('');
      setOtp(['', '', '', '', '', '']);
    }, 300);
  };

  const switchTab = (tab: 'signin' | 'signup') => {
    openAuthDrawer(tab);
    setStep('form');
    setErrorMessage('');
    setInfoMessage('');
    setErrorAction(null);
    setLoginEmailHint(null);
    setRegisterEmailHint(null);
  };

  // Real-time email validation on blur
  const handleLoginEmailBlur = async () => {
    const email = loginEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setLoginEmailHint(null);
      return;
    }
    try {
      const res = await authRequester.checkEmail(email);
      if (!res.exists) {
        setLoginEmailHint('notRegistered');
      } else {
        setLoginEmailHint(null);
      }
    } catch {
      // Ignore background check failure
    }
  };

  const handleRegisterEmailBlur = async () => {
    const email = registerEmail.trim().toLowerCase();
    if (!email || !email.includes('@')) {
      setRegisterEmailHint(null);
      return;
    }
    try {
      const res = await authRequester.checkEmail(email);
      if (res.exists) {
        setRegisterEmailHint('alreadyRegistered');
      } else {
        setRegisterEmailHint(null);
      }
    } catch {
      // Ignore background check failure
    }
  };

  // 1. Submit Sign In Form (Login with Password -> OTP Challenge)
  const handleSignInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) return;

    if (loginPassword.length < 8) {
      setErrorMessage(t('auth.passwordMinLength'));
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setErrorAction(null);
    try {
      const cleanEmail = loginEmail.trim().toLowerCase();
      const res = await authRequester.login({
        email: cleanEmail,
        password: loginPassword,
      });
      setActiveEmail(cleanEmail);
      setOtpFlow('login');
      if (res.devOtpCode) {
        setDevOtpHint(res.devOtpCode);
        sessionStorage.setItem('nida_dev_otp', res.devOtpCode);
      }
      setResendTimer(60);
      setStep('otp');
    } catch (err: unknown) {
      const extracted = extractApiError(
        err,
        language === 'th'
          ? 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง'
          : 'Invalid email or password. Please try again.',
      );
      setErrorMessage(extracted.message);
      if (
        extracted.status === 404 ||
        extracted.message.includes('ไม่พบบัญชี') ||
        extracted.message.toLowerCase().includes('not found')
      ) {
        setErrorAction('switchToSignUp');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 2. Submit Sign Up Form (Register with Details + Password -> OTP Challenge)
  const handleSignUpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!registerEmail.trim() || !registerPassword || !agreeTerms) return;

    if (registerPassword.length < 8) {
      setErrorMessage(t('auth.passwordMinLength'));
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setErrorAction(null);
    try {
      const cleanEmail = registerEmail.trim().toLowerCase();
      const res = await authRequester.register({
        email: cleanEmail,
        password: registerPassword,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim(),
      });
      setActiveEmail(cleanEmail);
      setOtpFlow('register');
      if (res.devOtpCode) {
        setDevOtpHint(res.devOtpCode);
        sessionStorage.setItem('nida_dev_otp', res.devOtpCode);
      }
      setResendTimer(60);
      setStep('otp');
    } catch (err: unknown) {
      const extracted = extractApiError(
        err,
        language === 'th'
          ? 'เกิดข้อผิดพลาดในการลงทะเบียน กรุณาลองใหม่อีกครั้ง'
          : 'Failed to register. Please try again.',
      );
      setErrorMessage(extracted.message);
      if (
        extracted.status === 409 ||
        extracted.status === 400 ||
        extracted.message.includes('มีบัญชีผู้ใช้') ||
        extracted.message.toLowerCase().includes('already registered')
      ) {
        setErrorAction('switchToSignIn');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 3. Submit Forgot Password Form (Send OTP to reset password)
  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotEmail.trim()) return;

    setIsLoading(true);
    setErrorMessage('');
    try {
      const cleanEmail = forgotEmail.trim().toLowerCase();
      const res = await authRequester.forgotPassword({ email: cleanEmail });
      setActiveEmail(cleanEmail);
      setOtpFlow('reset');
      if (res.devOtpCode) {
        setDevOtpHint(res.devOtpCode);
        sessionStorage.setItem('nida_dev_otp', res.devOtpCode);
      }
      setResendTimer(60);
      setStep('reset');
    } catch (err: unknown) {
      const extracted = extractApiError(
        err,
        language === 'th'
          ? 'ไม่พบอีเมลนี้ในระบบ กรุณาตรวจสอบอีกครั้ง'
          : 'Email not found. Please verify and try again.',
      );
      setErrorMessage(extracted.message);
    } finally {
      setIsLoading(false);
    }
  };

  // 4. Submit Reset Password Form (OTP + New Password)
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6 || !activeEmail || !newPassword) return;

    if (newPassword.length < 8) {
      setErrorMessage(t('auth.passwordMinLength'));
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setInfoMessage('');
    try {
      await authRequester.resetPassword({
        email: activeEmail,
        otpCode: code,
        newPassword,
      });
      sessionStorage.removeItem('nida_dev_otp');
      setLoginEmail(activeEmail);
      setLoginPassword('');
      setStep('form');
      switchTab('signin');
      setInfoMessage(t('auth.resetPasswordSuccess'));
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

  // 5. Verify OTP for Sign In or Sign Up
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const code = otp.join('');
    if (code.length !== 6 || !activeEmail) return;

    setIsLoading(true);
    setErrorMessage('');
    setInfoMessage('');
    try {
      let res;
      if (otpFlow === 'register') {
        res = await authRequester.verifyRegisterOtp({
          email: activeEmail,
          otpCode: code,
        });
      } else {
        res = await authRequester.verifyLoginOtp({
          email: activeEmail,
          otpCode: code,
        });
      }
      sessionStorage.removeItem('nida_dev_otp');

      setSession(res.accessToken, res.refreshToken, res.user);
      setIsSuccess(true);
      setTimeout(() => {
        handleClose();
      }, 700);
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

  // Resend OTP inside drawer
  const handleResend = async () => {
    if (resendTimer > 0 || isResending || !activeEmail) return;

    setIsResending(true);
    setErrorMessage('');
    setInfoMessage('');
    try {
      const res = await authRequester.resendOtp({ email: activeEmail });
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

  const handleOtpChange = (val: string, index: number) => {
    if (val && !/^\d+$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);
    setErrorMessage('');
    if (val !== '' && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number,
  ) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      setOtp(pasted.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  const handleAutoFillOtp = () => {
    if (devOtpHint && devOtpHint.length === 6) {
      setOtp(devOtpHint.split(''));
      inputRefs.current[5]?.focus();
    }
  };

  if (!isAuthDrawerOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-brown/40 backdrop-blur-xs transition-opacity"
        onClick={handleClose}
      />

      {/* Drawer Panel */}
      <div className="relative w-full max-w-md sm:max-w-lg bg-white text-brand-brown h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l-4 border-brand-brown">
        {/* Deep Espresso VIP Header */}
        <div className="p-6 bg-brand-brown text-white relative overflow-hidden shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-brand-yellow block mb-0.5">
                {t('auth.clubDrawerTitle')}
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                {t('auth.clubDrawerBrand')}
              </h2>
            </div>
            <button
              onClick={handleClose}
              className="text-white/80 hover:text-brand-yellow p-1 transition-colors cursor-pointer"
              aria-label={t('common.close')}
            >
              <X size={22} />
            </button>
          </div>

          {/* Slogan & VIP Perks */}
          <div className="mt-4 pt-3.5 border-t border-white/15 text-xs text-white/90 space-y-1">
            <p className="text-[11px] font-bold text-white mb-1.5 uppercase tracking-wider">
              {t('auth.clubPerksTitle')}
            </p>
            <p className="text-[11px] text-white/80 leading-relaxed">
              {t('auth.clubPerkDiscount')}
            </p>
            <p className="text-[11px] text-white/80 leading-relaxed">
              {t('auth.clubPerkPoints')}
            </p>
            <p className="text-[11px] text-white/80 leading-relaxed">
              {t('auth.clubPerkShipping')}
            </p>
          </div>
        </div>

        {/* Navigation Tabs (Only in Form Step) */}
        {step === 'form' && (
          <div className="grid grid-cols-2 border-b border-gray-200 bg-white shrink-0">
            <button
              type="button"
              onClick={() => switchTab('signin')}
              className={`py-3.5 text-xs font-black uppercase tracking-wider transition-colors relative cursor-pointer ${
                authDrawerTab === 'signin'
                  ? 'text-brand-brown border-b-2 border-brand-brown bg-stone-50/60'
                  : 'text-gray-400 hover:text-brand-brown'
              }`}
            >
              {t('auth.tabSignIn')}
              {authDrawerTab === 'signin' && (
                <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-brand-brown rotate-45" />
              )}
            </button>

            <button
              type="button"
              onClick={() => switchTab('signup')}
              className={`py-3.5 text-xs font-black uppercase tracking-wider transition-colors relative cursor-pointer ${
                authDrawerTab === 'signup'
                  ? 'text-brand-brown border-b-2 border-brand-brown bg-stone-50/60'
                  : 'text-gray-400 hover:text-brand-brown'
              }`}
            >
              {t('auth.tabSignUp')}
              {authDrawerTab === 'signup' && (
                <div className="absolute -bottom-[5px] left-1/2 -translate-x-1/2 w-2 h-2 bg-brand-brown rotate-45" />
              )}
            </button>
          </div>
        )}

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {errorMessage && (
            <div className="mb-2">
              <Alert variant="error">
                <p>{errorMessage}</p>
                {errorAction === 'switchToSignUp' && (
                  <button
                    type="button"
                    onClick={() => {
                      setRegisterEmail(loginEmail);
                      switchTab('signup');
                    }}
                    className="mt-2 text-xs font-bold underline text-brand-brown hover:text-brand-amber cursor-pointer block"
                  >
                    {t('auth.switchToSignUp')} &rarr;
                  </button>
                )}
                {errorAction === 'switchToSignIn' && (
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail(registerEmail);
                      switchTab('signin');
                    }}
                    className="mt-2 text-xs font-bold underline text-brand-brown hover:text-brand-amber cursor-pointer block"
                  >
                    {t('auth.switchToSignIn')} &rarr;
                  </button>
                )}
              </Alert>
            </div>
          )}

          {infoMessage && (
            <Alert variant="success" className="mb-2">
              {infoMessage}
            </Alert>
          )}

          {isSuccess && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xs flex items-center space-x-2 text-emerald-800 text-xs font-bold">
              <Check size={18} className="text-emerald-600" />
              <span>
                {language === 'th'
                  ? 'เข้าสู่ระบบสำเร็จ ยินดีต้อนรับสู่ NIDA CLUB'
                  : 'Successfully signed in. Welcome to NIDA CLUB!'}
              </span>
            </div>
          )}

          {/* STEP 1A: Sign In Form */}
          {step === 'form' && authDrawerTab === 'signin' && (
            <form onSubmit={handleSignInSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="drawer-login-email"
                  className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
                >
                  {t('auth.emailLabel')}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="drawer-login-email"
                    value={loginEmail}
                    onChange={(e) => {
                      setLoginEmail(e.target.value);
                      if (loginEmailHint) setLoginEmailHint(null);
                    }}
                    onBlur={handleLoginEmailBlur}
                    required
                    disabled={isLoading}
                    placeholder="customer@nida.com"
                    className="w-full border border-gray-300 px-3 py-2.5 pl-10 text-xs focus:outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown disabled:bg-gray-50"
                  />
                  <Mail
                    size={16}
                    className="absolute left-3 top-3 text-gray-400 pointer-events-none"
                  />
                </div>
                {loginEmailHint === 'notRegistered' && (
                  <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-xs flex items-center justify-between text-[11px] text-amber-900">
                    <span>{t('auth.emailNotRegistered')}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setRegisterEmail(loginEmail);
                        switchTab('signup');
                      }}
                      className="font-bold underline text-brand-brown hover:text-brand-amber ml-2 shrink-0 cursor-pointer"
                    >
                      {t('auth.switchToSignUp')}
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="drawer-login-password"
                  className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
                >
                  {t('auth.passwordLabel')}
                </label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    id="drawer-login-password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    minLength={8}
                    disabled={isLoading}
                    placeholder={t('auth.passwordPlaceholder')}
                    className="w-full border border-gray-300 px-3 py-2.5 pl-10 pr-10 text-xs focus:outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown disabled:bg-gray-50"
                  />
                  <Lock
                    size={16}
                    className="absolute left-3 top-3 text-gray-400 pointer-events-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-brand-brown cursor-pointer p-0.5"
                    aria-label={showLoginPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  >
                    {showLoginPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setForgotEmail(loginEmail);
                      setStep('forgot');
                      setErrorMessage('');
                      setInfoMessage('');
                    }}
                    className="text-[11px] text-gray-500 hover:text-brand-brown underline cursor-pointer"
                  >
                    {t('auth.forgotPassword')}
                  </button>
                </div>
              </div>

              <div className="flex items-center space-x-2 text-[11px] text-gray-500">
                <ShieldCheck
                  size={15}
                  className="text-emerald-600 flex-shrink-0"
                />
                <span>{t('auth.otpNotice')}</span>
              </div>

              <button
                type="submit"
                disabled={isLoading || !loginEmail.trim() || !loginPassword}
                className="w-full bg-brand-brown hover:bg-brand-amber disabled:bg-gray-300 text-white py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-colors shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{t('auth.sending')}</span>
                  </>
                ) : (
                  <span>{t('auth.signInBtn')}</span>
                )}
              </button>

              {/* Quick Demo Accounts */}
              <div className="mt-5 pt-4 border-t border-gray-100">
                <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-2">
                  {t('auth.quickDemo')}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('phannida@nida.com');
                      setLoginPassword('Password123!');
                    }}
                    className="text-[11px] bg-stone-100 hover:bg-stone-200 text-brand-brown font-semibold px-2.5 py-1 rounded-2xs transition-colors cursor-pointer"
                  >
                    phannida@nida.com
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('customer@example.com');
                      setLoginPassword('Password123!');
                    }}
                    className="text-[11px] bg-stone-100 hover:bg-stone-200 text-brand-brown font-semibold px-2.5 py-1 rounded-2xs transition-colors cursor-pointer"
                  >
                    customer@example.com
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* STEP 1B: Sign Up Form */}
          {step === 'form' && authDrawerTab === 'signup' && (
            <form onSubmit={handleSignUpSubmit} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label
                    htmlFor="drawer-first-name"
                    className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
                  >
                    {t('auth.firstName')}
                  </label>
                  <input
                    type="text"
                    id="drawer-first-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown"
                  />
                </div>
                <div>
                  <label
                    htmlFor="drawer-last-name"
                    className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
                  >
                    {t('auth.lastName')}
                  </label>
                  <input
                    type="text"
                    id="drawer-last-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="drawer-register-email"
                  className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
                >
                  {t('auth.emailLabel')}
                </label>
                <div className="relative">
                  <input
                    type="email"
                    id="drawer-register-email"
                    value={registerEmail}
                    onChange={(e) => {
                      setRegisterEmail(e.target.value);
                      if (registerEmailHint) setRegisterEmailHint(null);
                    }}
                    onBlur={handleRegisterEmailBlur}
                    required
                    placeholder="name@example.com"
                    className="w-full border border-gray-300 px-3 py-2 pl-10 text-xs focus:outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown"
                  />
                  <Mail
                    size={16}
                    className="absolute left-3 top-2.5 text-gray-400 pointer-events-none"
                  />
                </div>
                {registerEmailHint === 'alreadyRegistered' && (
                  <div className="mt-1.5 p-2 bg-amber-50 border border-amber-200 rounded-xs flex items-center justify-between text-[11px] text-amber-900">
                    <span>{t('auth.emailAlreadyRegistered')}</span>
                    <button
                      type="button"
                      onClick={() => {
                        setLoginEmail(registerEmail);
                        switchTab('signin');
                      }}
                      className="font-bold underline text-brand-brown hover:text-brand-amber ml-2 shrink-0 cursor-pointer"
                    >
                      {t('auth.switchToSignIn')}
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label
                  htmlFor="drawer-register-phone"
                  className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
                >
                  {t('auth.phone')}
                </label>
                <input
                  type="tel"
                  id="drawer-register-phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                  placeholder="0812345678"
                  className="w-full border border-gray-300 px-3 py-2 text-xs focus:outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown"
                />
              </div>

              <div>
                <label
                  htmlFor="drawer-register-password"
                  className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
                >
                  {t('auth.passwordLabel')}
                </label>
                <div className="relative">
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    id="drawer-register-password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                    minLength={8}
                    placeholder={t('auth.passwordPlaceholder')}
                    className="w-full border border-gray-300 px-3 py-2 pl-10 pr-10 text-xs focus:outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown"
                  />
                  <Lock
                    size={16}
                    className="absolute left-3 top-2.5 text-gray-400 pointer-events-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-brand-brown cursor-pointer p-0.5"
                    aria-label={showRegisterPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                  >
                    {showRegisterPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {/* Perk Callout */}
              <div className="bg-brand-warm-cream border border-brand-border p-3 rounded-xs flex items-center space-x-2.5 text-xs text-brand-brown">
                <Tag size={15} className="text-brand-brown/70 shrink-0" />
                <span className="font-semibold text-[11px]">{t('auth.registerPerk')}</span>
              </div>

              {/* Agreement checkbox */}
              <div className="flex items-start space-x-2 pt-1">
                <input
                  type="checkbox"
                  id="drawer-agree-terms"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  required
                  className="mt-0.5 h-3.5 w-3.5 text-brand-brown rounded-xs border-gray-300 focus:ring-brand-brown cursor-pointer"
                />
                <label
                  htmlFor="drawer-agree-terms"
                  className="text-[11px] text-gray-600 leading-snug cursor-pointer"
                >
                  {t('auth.agreeTerms')}
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading || !registerEmail.trim() || !registerPassword || !agreeTerms}
                className="w-full bg-brand-brown hover:bg-brand-amber disabled:bg-gray-300 text-white py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-colors shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:cursor-not-allowed mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    <span>{t('auth.sending')}</span>
                  </>
                ) : (
                  <span>{t('auth.createAccountBtn')}</span>
                )}
              </button>

              <p className="text-[10px] text-gray-400 text-center leading-relaxed pt-1">
                {t('auth.termsNotice')}
              </p>
            </form>
          )}

          {/* STEP 1C: Forgot Password Form */}
          {step === 'forgot' && (
            <div className="space-y-4">
              <button
                type="button"
                onClick={() => {
                  setStep('form');
                  setErrorMessage('');
                  setInfoMessage('');
                }}
                className="inline-flex items-center text-[11px] font-bold text-gray-500 hover:text-brand-brown transition-colors cursor-pointer"
              >
                <ArrowLeft size={13} className="mr-1" />
                {t('auth.backToLogin')}
              </button>

              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-brand-brown">
                  {t('auth.forgotPasswordTitle')}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {t('auth.forgotPasswordSubtitle')}
                </p>
              </div>

              <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 pt-2">
                <div>
                  <label
                    htmlFor="drawer-forgot-email"
                    className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
                  >
                    {t('auth.emailLabel')}
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="drawer-forgot-email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      placeholder="customer@nida.com"
                      className="w-full border border-gray-300 px-3 py-2.5 pl-10 text-xs focus:outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown disabled:bg-gray-50"
                    />
                    <Mail
                      size={16}
                      className="absolute left-3 top-3 text-gray-400 pointer-events-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !forgotEmail.trim()}
                  className="w-full bg-brand-brown hover:bg-brand-amber disabled:bg-gray-300 text-white py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-colors shadow-md flex items-center justify-center space-x-2 cursor-pointer disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{t('auth.sending')}</span>
                    </>
                  ) : (
                    <span>{t('auth.sendResetOtpBtn')}</span>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* STEP 2B: Reset Password View (OTP + New Password) */}
          {step === 'reset' && (
            <div className="space-y-5 text-center">
              <div className="w-11 h-11 bg-brand-warm-cream border border-brand-border text-brand-brown mx-auto flex items-center justify-center rounded-full shadow-2xs">
                <Lock size={20} className="text-brand-amber" />
              </div>

              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-brand-brown">
                  {t('auth.forgotPasswordTitle')}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {t('auth.enterOtpDesc')} <br />
                  <strong className="text-brand-brown font-mono text-[13px]">{activeEmail}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStep('forgot');
                    setErrorMessage('');
                    setInfoMessage('');
                  }}
                  className="inline-flex items-center text-[11px] font-bold text-gray-400 hover:text-brand-brown transition-colors mt-2 cursor-pointer"
                >
                  <ArrowLeft size={12} className="mr-1" />
                  {t('auth.backToInput')}
                </button>
              </div>

              <DevOtpHintBanner
                devOtpHint={devOtpHint}
                onAutoFill={handleAutoFillOtp}
              />

              <form onSubmit={handleResetPasswordSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-2 text-center">
                    {t('auth.verifyOtpTitle')}
                  </label>
                  <OtpInputGrid
                    otp={otp}
                    isLoading={isLoading}
                    inputRefs={inputRefs}
                    onChange={handleOtpChange}
                    onKeyDown={handleOtpKeyDown}
                    onPaste={handleOtpPaste}
                  />
                </div>

                <div>
                  <label
                    htmlFor="drawer-reset-new-password"
                    className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
                  >
                    {t('auth.newPasswordLabel')}
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      id="drawer-reset-new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={8}
                      placeholder={t('auth.newPasswordPlaceholder')}
                      className="w-full border border-gray-300 px-3 py-2 pl-10 pr-10 text-xs focus:outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown"
                    />
                    <Lock
                      size={16}
                      className="absolute left-3 top-2.5 text-gray-400 pointer-events-none"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-brand-brown cursor-pointer p-0.5"
                      aria-label={showNewPassword ? t('auth.hidePassword') : t('auth.showPassword')}
                    >
                      {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={otp.join('').length !== 6 || !newPassword || isLoading}
                  className="w-full bg-brand-brown hover:bg-brand-amber disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-colors shadow-2xs flex items-center justify-center space-x-2 cursor-pointer mt-4"
                >
                  {isLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      <span>{t('auth.verifying')}</span>
                    </>
                  ) : (
                    <span>{t('auth.resetPasswordBtn')}</span>
                  )}
                </button>
              </form>

              {/* Resend OTP */}
              <div className="pt-3 border-t border-gray-100 text-xs text-gray-500">
                <span>{t('auth.didNotReceive')}{' '}</span>
                {resendTimer > 0 ? (
                  <span className="text-gray-400 font-semibold">
                    {t('auth.resendCountdown').replace('{seconds}', String(resendTimer))}
                  </span>
                ) : (
                  <button
                    type="button"
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
              </div>
            </div>
          )}

          {/* STEP 2A: Verify OTP View (Sign In / Sign Up) */}
          {step === 'otp' && (
            <div className="space-y-5 text-center">
              <div className="w-11 h-11 bg-brand-warm-cream border border-brand-border text-brand-brown mx-auto flex items-center justify-center rounded-full shadow-2xs">
                <KeyRound size={20} className="text-brand-amber" />
              </div>

              <div>
                <h3 className="text-lg font-black uppercase tracking-tight text-brand-brown">
                  {t('auth.verifyOtpTitle')}
                </h3>
                <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                  {t('auth.enterOtpDesc')} <br />
                  <strong className="text-brand-brown font-mono text-[13px]">{activeEmail}</strong>
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setStep('form');
                    setErrorMessage('');
                    setInfoMessage('');
                  }}
                  className="inline-flex items-center text-[11px] font-bold text-gray-400 hover:text-brand-brown transition-colors mt-2 cursor-pointer"
                >
                  <ArrowLeft size={12} className="mr-1" />
                  {t('auth.backToInput')}
                </button>
              </div>

              <DevOtpHintBanner
                devOtpHint={devOtpHint}
                onAutoFill={handleAutoFillOtp}
              />

              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <OtpInputGrid
                  otp={otp}
                  isLoading={isLoading}
                  inputRefs={inputRefs}
                  onChange={handleOtpChange}
                  onKeyDown={handleOtpKeyDown}
                  onPaste={handleOtpPaste}
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
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              {/* Resend OTP */}
              <div className="pt-3 border-t border-gray-100 text-xs text-gray-500">
                <span>{t('auth.didNotReceive')}{' '}</span>
                {resendTimer > 0 ? (
                  <span className="text-gray-400 font-semibold">
                    {t('auth.resendCountdown').replace('{seconds}', String(resendTimer))}
                  </span>
                ) : (
                  <button
                    type="button"
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
              </div>
            </div>
          )}
        </div>

        {/* Quiet Minimal Drawer Footer */}
        <div className="p-4 border-t border-gray-100 bg-stone-50/70 text-center text-[10px] text-gray-400 font-semibold uppercase tracking-wider shrink-0">
          {t('footer.copyright')}
        </div>
      </div>
    </div>
  );
}

export function AuthDrawer() {
  return (
    <Suspense fallback={null}>
      <AuthDrawerContent />
    </Suspense>
  );
}
