import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';
import { authRequester } from '../api/requester/authRequester';
import { useLanguage } from '../context/LanguageContext';
import { AuthSplitLayout } from '../components/layout';

export const AdminForgotPassword: React.FC = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setIsLoading(true);
    try {
      await authRequester.forgotPassword(email.trim());
      setIsSubmitted(true);
    } catch {
      // For security & enumeration protection, always show success UI
      setIsSubmitted(true);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthSplitLayout>
      <div className="mb-8">
        <p className="text-xs text-stone-400 font-normal mb-1">
          {t('auth.welcome_back')} !!!
        </p>
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          {t('auth.forgot_password_title')}
        </h1>
      </div>

      {isSubmitted ? (
        <div className="text-center py-4">
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-stone-800 mb-2">
            {t('auth.reset_link_sent_title')}
          </h3>
          <p className="text-xs text-stone-500 leading-relaxed mb-6">
            {t('auth.reset_link_sent_desc')}
          </p>
          <Link
            to="/admin/login"
            className="inline-flex items-center justify-center px-6 py-2.5 bg-[#FFF5F2] hover:bg-[#FFEAE3] text-[#EE593B] text-xs font-bold uppercase tracking-wider rounded-full transition-all space-x-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{t('auth.back_to_login')}</span>
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          <p className="text-xs text-stone-500 leading-relaxed">
            {t('auth.forgot_password_instructions')}
          </p>

          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1.5">
              {t('auth.work_email_label')}
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@nida-apparel.com"
              disabled={isLoading}
              required
              className="w-full px-4 py-3 bg-[#FFF5F2] border-0 rounded-lg text-sm text-stone-900 placeholder:text-stone-300 focus:outline-none focus:ring-2 focus:ring-[#EE593B]/30 transition-all"
            />
          </div>

          <div className="pt-2 flex justify-center">
            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className="px-8 py-2.5 bg-[#EE593B] hover:bg-[#d8482c] active:scale-[0.98] text-white text-xs font-bold uppercase tracking-wider rounded-full shadow-md shadow-[#EE593B]/25 flex items-center justify-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <span>{t('auth.send_reset_link_button')}</span>
                  <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
                </>
              )}
            </button>
          </div>

          <div className="text-center pt-4">
            <Link
              to="/admin/login"
              className="inline-flex items-center space-x-1 text-xs text-stone-400 hover:text-[#EE593B] transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>{t('auth.back_to_login')}</span>
            </Link>
          </div>
        </form>
      )}
    </AuthSplitLayout>
  );
};
