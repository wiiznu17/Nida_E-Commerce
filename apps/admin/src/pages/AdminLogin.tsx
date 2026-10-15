import React, { useState } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Eye, EyeOff, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

import { AuthSplitLayout } from '../components/layout';

export const AdminLogin: React.FC = () => {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;

    setIsLoading(true);
    setErrorMessage(null);

    try {
      await login(identifier, password);
      const redirectUrl = searchParams.get('redirect');
      if (redirectUrl && redirectUrl.startsWith('/admin')) {
        navigate(redirectUrl, { replace: true });
      } else {
        navigate('/admin', { replace: true });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : t('auth.login_error');
      setErrorMessage(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoFill = () => {
    setIdentifier('superadmin');
    setPassword('admin123');
    setErrorMessage(null);
  };

  return (
    <AuthSplitLayout>
      {/* Form Card Header */}
      <div className="mb-8">
        <p className="text-xs text-stone-400 font-normal mb-1">
          {t('auth.welcome_back')} !!!
        </p>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          {t('auth.sign_in_heading')}
        </h1>
      </div>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 p-3.5 bg-red-50/80 border border-red-200/80 rounded-xl flex items-start space-x-3 text-red-900 text-xs">
          <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 shrink-0" />
          <div className="flex-1 font-medium leading-relaxed">
            {errorMessage}
          </div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Username / Email */}
        <div>
          <label className="block text-xs font-medium text-stone-600 mb-1.5">
            {t('auth.identifier_label')}
          </label>
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="superadmin"
            disabled={isLoading}
            required
            className="w-full px-4 py-3 bg-[#FFF5F2] border-0 rounded-lg text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#EE593B]/30 transition-all"
          />
        </div>

        {/* Password */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-xs font-medium text-stone-600">
              {t('auth.password_label')}
            </label>
            <Link
              to="/admin/forgot-password"
              className="text-xs text-stone-400 hover:text-[#EE593B] transition-colors"
            >
              {t('auth.forgot_password_link')}
            </Link>
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              disabled={isLoading}
              required
              className="w-full pl-4 pr-10 py-3 bg-[#FFF5F2] border-0 rounded-lg text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#EE593B]/30 transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-stone-400 hover:text-stone-600 focus:outline-none cursor-pointer"
              tabIndex={-1}
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        {/* Submit Button - Coral Pill Button centered */}
        <div className="pt-2 flex justify-center">
          <button
            type="submit"
            disabled={isLoading || !identifier.trim() || !password}
            className="px-8 py-2.5 bg-[#EE593B] hover:bg-[#d8482c] active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md shadow-[#EE593B]/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>{t('auth.sign_in_button')}</span>
                <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
              </>
            )}
          </button>
        </div>
      </form>

      {/* 1-Click Demo Fill Assistant - Minimal text link */}
      <div className="mt-8 text-center">
        <button
          type="button"
          onClick={handleDemoFill}
          className="text-xs text-stone-400 hover:text-[#EE593B] transition-colors cursor-pointer"
        >
          {t('auth.demo_fill_button')} (superadmin)
        </button>
      </div>
    </AuthSplitLayout>
  );
};
