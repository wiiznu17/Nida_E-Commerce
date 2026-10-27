'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { X, Check, User, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';

export interface GuestCheckoutDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedAsGuest: () => void;
  guestEmail?: string;
  isSubmitting?: boolean;
}

export function GuestCheckoutDrawer({
  isOpen,
  onClose,
  onProceedAsGuest,
  guestEmail = '',
  isSubmitting = false,
}: GuestCheckoutDrawerProps) {
  const { t } = useLanguage();
  const { openAuthDrawer } = useAuth();
  const router = useRouter();

  if (!isOpen) return null;

  const handleOpenSignIn = () => {
    onClose();
    openAuthDrawer('signin');
    if (guestEmail.trim()) {
      router.replace(
        `/checkout?auth=signin&email=${encodeURIComponent(guestEmail.trim())}`,
        { scroll: false },
      );
    }
  };

  const handleOpenSignUp = () => {
    onClose();
    openAuthDrawer('signup');
    if (guestEmail.trim()) {
      router.replace(
        `/checkout?auth=signup&email=${encodeURIComponent(guestEmail.trim())}`,
        { scroll: false },
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-brown/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel - slides in from right */}
      <div className="relative w-full max-w-md sm:max-w-lg bg-white text-brand-brown h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l-4 border-brand-brown animate-in slide-in-from-right">
        {/* Deep Espresso Header (matches AuthDrawer theme) */}
        <div className="p-6 bg-brand-brown text-white relative overflow-hidden shrink-0">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] tracking-[0.25em] uppercase font-bold text-brand-yellow block mb-0.5">
                {t('guestCheckoutModal.title')}
              </span>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white uppercase">
                {t('guestCheckoutModal.brandTitle')}
              </h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-white/80 hover:text-brand-yellow p-1 transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={22} />
            </button>
          </div>

          <p className="mt-3 text-xs text-white/80 leading-relaxed">
            {t('guestCheckoutModal.subtitle')}
          </p>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Member Option (Recommended) */}
          <div className="p-5 bg-brand-warm-cream border border-brand-border rounded-xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 bg-brand-brown text-white rounded-xs">
                {t('guestCheckoutModal.recommendedBadge')}
              </span>
            </div>

            <h3 className="text-sm font-black uppercase tracking-wider text-brand-brown">
              {t('guestCheckoutModal.memberOptionTitle')}
            </h3>

            <p className="text-xs text-stone-600 leading-relaxed">
              {t('guestCheckoutModal.memberOptionDesc')}
            </p>

            <ul className="space-y-2 pt-2 border-t border-brand-border/60">
              <li className="flex items-start gap-2 text-xs text-brand-brown font-medium">
                <Check size={14} className="text-brand-amber shrink-0 mt-0.5" />
                <span>{t('guestCheckoutModal.benefitPoints')}</span>
              </li>
              <li className="flex items-start gap-2 text-xs text-brand-brown font-medium">
                <Check size={14} className="text-brand-amber shrink-0 mt-0.5" />
                <span>{t('guestCheckoutModal.benefitCoupons')}</span>
              </li>
              <li className="flex items-start gap-2 text-xs text-brand-brown font-medium">
                <Check size={14} className="text-brand-amber shrink-0 mt-0.5" />
                <span>{t('guestCheckoutModal.benefitTracking')}</span>
              </li>
            </ul>

            <div className="pt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleOpenSignIn}
                className="py-3 bg-brand-brown hover:bg-brand-amber text-white text-xs font-black uppercase tracking-wider transition-colors text-center block shadow-xs cursor-pointer"
              >
                {t('guestCheckoutModal.signInBtn')}
              </button>
              <button
                type="button"
                onClick={handleOpenSignUp}
                className="py-3 bg-white hover:bg-stone-50 border border-brand-brown text-brand-brown text-xs font-black uppercase tracking-wider transition-colors text-center block shadow-xs cursor-pointer"
              >
                {t('guestCheckoutModal.registerBtn')}
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center justify-center">
            <div className="w-full border-t border-gray-200" />
            <span className="absolute bg-white px-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
              OR
            </span>
          </div>

          {/* Guest Option */}
          <div className="p-5 bg-white border border-stone-200 rounded-xs space-y-3">
            <div className="flex items-center gap-2">
              <User size={15} className="text-stone-400 shrink-0" />
              <h3 className="text-xs font-black uppercase tracking-wider text-stone-800">
                {t('guestCheckoutModal.guestOptionTitle')}
              </h3>
            </div>

            <p className="text-xs text-stone-500 leading-relaxed">
              {t('guestCheckoutModal.guestOptionDesc')}
            </p>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={onProceedAsGuest}
              className="w-full py-3.5 bg-stone-900 hover:bg-brand-brown text-white text-xs font-black uppercase tracking-[0.2em] transition-colors cursor-pointer text-center block shadow-md disabled:opacity-50 mt-2 flex items-center justify-center gap-2"
            >
              <span>{t('guestCheckoutModal.guestOptionBtn')}</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-stone-50 flex justify-between items-center shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="text-xs font-bold text-stone-500 hover:text-brand-brown uppercase tracking-wider cursor-pointer"
          >
            {t('guestCheckoutModal.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
