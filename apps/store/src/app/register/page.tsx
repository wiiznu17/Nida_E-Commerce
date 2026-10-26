'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ShieldCheck, Sparkles, UserPlus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { NidaLogo } from '@/components/layout/NidaLogo';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    agreeTerms: true,
  });
  const router = useRouter();
  const { t } = useLanguage();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.email) {
      router.push(
        `/verify-otp?email=${encodeURIComponent(formData.email)}&firstName=${encodeURIComponent(formData.firstName)}&lastName=${encodeURIComponent(formData.lastName)}&phone=${encodeURIComponent(formData.phone)}`,
      );
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.id]: value });
  };

  return (
    <div className="min-h-[75vh] flex flex-col justify-center items-center px-4 py-16 bg-brand-warm-cream font-sans">
      <div className="w-full max-w-md bg-white border border-brand-border p-8 sm:p-10 shadow-sm relative">
        <div className="flex justify-center mb-6">
          <NidaLogo size="lg" />
        </div>

        <h1 className="text-2xl sm:text-3xl font-black uppercase text-center tracking-tight text-brand-brown mb-2">
          {t('auth.registerTitle')}
        </h1>
        <p className="text-center text-gray-500 font-medium text-xs mb-8">
          {t('auth.registerSubtitle')}
        </p>

        {/* Perk Callout */}
        <div className="bg-brand-warm-cream border border-brand-border p-3 rounded-xs flex items-center space-x-2 text-xs text-brand-brown mb-6">
          <Sparkles size={16} className="text-brand-amber flex-shrink-0" />
          <span className="font-semibold">{t('auth.registerPerk')}</span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label
                htmlFor="firstName"
                className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                {t('auth.firstName')}
              </label>
              <input
                type="text"
                id="firstName"
                value={formData.firstName}
                onChange={handleChange}
                required
                placeholder="Phannida"
                className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown"
              />
            </div>
            <div>
              <label
                htmlFor="lastName"
                className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
              >
                {t('auth.lastName')}
              </label>
              <input
                type="text"
                id="lastName"
                value={formData.lastName}
                onChange={handleChange}
                required
                placeholder="Wissanu"
                className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
            >
              {t('auth.emailLabel')}
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              required
              placeholder="customer@nida.com"
              className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1"
            >
              {t('auth.phone')}
            </label>
            <input
              type="tel"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              required
              placeholder="081-234-5678"
              className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-brown focus:ring-1 focus:ring-brand-brown"
            />
          </div>

          <div className="flex items-start space-x-2 pt-2">
            <input
              type="checkbox"
              id="agreeTerms"
              checked={formData.agreeTerms}
              onChange={handleChange}
              required
              className="mt-1 accent-brand-brown"
            />
            <label
              htmlFor="agreeTerms"
              className="text-xs text-gray-600 leading-snug"
            >
              {t('auth.agreeTerms')}
            </label>
          </div>

          <div className="flex items-center space-x-2 text-xs text-gray-500 pt-2">
            <ShieldCheck size={16} className="text-emerald-600 flex-shrink-0" />
            <span>{t('auth.otpNotice')}</span>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-brown hover:bg-brand-amber text-white py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-colors shadow-md mt-4 flex items-center justify-center space-x-2"
          >
            <UserPlus size={16} />
            <span>{t('auth.createAccountBtn')}</span>
          </button>
        </form>

        <div className="mt-8 text-center pt-6 border-t border-gray-200">
          <p className="text-xs text-gray-600">
            {t('auth.alreadyMember')}{' '}
            <Link
              href="/login"
              className="font-bold text-brand-brown hover:text-brand-amber underline ml-1"
            >
              {t('nav.signIn')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
