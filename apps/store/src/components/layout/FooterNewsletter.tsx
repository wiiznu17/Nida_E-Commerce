'use client';

import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface FooterNewsletterProps {
  t: (key: string, fallback?: string) => string;
}

export function FooterNewsletter({ t }: FooterNewsletterProps) {
  const [emailSubscribed, setEmailSubscribed] = useState(false);
  const [email, setEmail] = useState('');

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setEmailSubscribed(true);
      setEmail('');
    }
  };

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 pb-14 border-b border-white/10">
      <div className="bg-brand-dark-brown border border-white/10 p-8 md:p-12 rounded-xs flex flex-col lg:flex-row items-center justify-between gap-8">
        <div className="max-w-xl text-center lg:text-left">
          <span className="bg-brand-yellow text-brand-brown text-[10px] font-black uppercase tracking-widest px-2.5 py-1 inline-block mb-3">
            {t('footer.joinClub')}
          </span>
          <h3 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">
            {t('footer.getDiscount')}
          </h3>
          <p className="text-sm text-gray-300">{t('footer.discountDesc')}</p>
        </div>

        <div className="w-full lg:w-auto flex-1 max-w-md">
          {emailSubscribed ? (
            <div className="bg-emerald-500/20 border border-emerald-500 p-4 rounded-xs text-white text-sm flex items-center justify-center space-x-2">
              <Check size={18} className="text-emerald-400" />
              <span className="font-bold">{t('footer.welcomeClub')}</span>
            </div>
          ) : (
            <form
              onSubmit={handleSubscribe}
              className="flex flex-col sm:flex-row gap-2"
            >
              <input
                type="email"
                placeholder={t('footer.emailPlaceholder')}
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white text-brand-brown px-4 py-3.5 text-sm font-medium placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-yellow"
              />
              <button
                type="submit"
                className="bg-brand-yellow hover:bg-brand-amber text-brand-brown font-black text-xs tracking-widest uppercase px-6 py-3.5 transition-colors whitespace-nowrap cursor-pointer"
              >
                {t('footer.joinBtn')}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
