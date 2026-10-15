import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
} from 'lucide-react';
import { authRequester } from '../api/requester/authRequester';
import { useLanguage } from '../context/LanguageContext';

import { AuthSplitLayout } from '../components/layout';

export const AdminResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token') ?? '';
  const navigate = useNavigate();
  const { t } = useLanguage();

  const [isVerifying, setIsVerifying] = useState(true);
  const [isValidToken, setIsValidToken] = useState(false);
  const [targetEmail, setTargetEmail] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setIsVerifying(false);
      setIsValidToken(false);
      return;
    }

    authRequester
      .verifyToken(token, 'reset')
      .then((res) => {
        if (res.valid) {
          setIsValidToken(true);
          setTargetEmail(res.email ?? null);
        } else {
          setIsValidToken(false);
        }
      })
      .catch(() => {
        setIsValidToken(false);
      })
      .finally(() => {
        setIsVerifying(false);
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setErrorMessage(t('auth.password_min_length'));
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage(t('auth.password_mismatch'));
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      await authRequester.resetPassword({ token, password });
      setIsSuccess(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('auth.reset_error');
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AuthSplitLayout>
      <div className="mb-8">
        <p className="text-xs text-stone-400 font-normal mb-1">
          {t('auth.welcome_back')} !!!
        </p>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          {t('auth.reset_password_title')}
        </h1>
      </div>

      {isVerifying ? (
        <div className="py-12 flex flex-col items-center justify-center space-y-3">
          <div className="w-8 h-8 border-2 border-[#EE593B]/20 border-t-[#EE593B] rounded-full animate-spin" />
          <span className="text-xs font-medium text-stone-400">
            {t('auth.verifying_reset_token')}
          </span>
        </div>
      ) : !isValidToken ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-red-50 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-stone-800 mb-2">
            {t('auth.invalid_reset_title')}
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed mb-6">
            {t('auth.invalid_reset_desc')}
          </p>
          <Link
            to="/admin/login"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-[#FFF5F2] hover:bg-[#FFEAE3] text-[#EE593B] text-xs font-bold uppercase tracking-wider rounded-full transition-all"
          >
            {t('auth.back_to_login')}
          </Link>
        </div>
      ) : isSuccess ? (
        <div className="text-center py-6">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-stone-800 mb-2">
            {t('auth.reset_success_title')}
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed mb-6">
            {t('auth.reset_success_desc')}
          </p>
          <div className="flex justify-center">
            <button
              onClick={() => navigate('/admin/login')}
              className="px-8 py-2.5 bg-[#EE593B] hover:bg-[#d8482c] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow-md shadow-[#EE593B]/25 cursor-pointer flex items-center justify-center space-x-2"
            >
              <span>{t('auth.sign_in_now')}</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {targetEmail && (
            <div className="p-3 bg-[#FFF5F2] rounded-xl text-xs text-stone-700">
              <span className="block text-[10px] font-bold uppercase tracking-wider text-stone-400">
                {t('auth.account_label')}
              </span>
              <span className="font-bold text-stone-900">{targetEmail}</span>
            </div>
          )}

          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start space-x-3 text-red-900 text-xs">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">
              {t('auth.new_password_label')}
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={isSubmitting}
                required
                className="w-full pl-4 pr-10 py-3 bg-[#FFF5F2] border-0 rounded-lg text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#EE593B]/30 transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3.5 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">
              {t('auth.confirm_password_label')}
            </label>
            <input
              type={showPassword ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isSubmitting}
              required
              className="w-full px-4 py-3 bg-[#FFF5F2] border-0 rounded-lg text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#EE593B]/30 transition-all"
            />
          </div>

          <div className="pt-2 flex justify-center">
            <button
              type="submit"
              disabled={isSubmitting || !password || !confirmPassword}
              className="px-8 py-2.5 bg-[#EE593B] hover:bg-[#d8482c] active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider rounded-full transition-all shadow-md shadow-[#EE593B]/25 flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t('auth.save_new_password_button')}</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>
        </form>
      )}
    </AuthSplitLayout>
  );
};
