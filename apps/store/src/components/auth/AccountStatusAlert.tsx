'use client';

import React, { useState, useEffect } from 'react';
import {
  Clock,
  ShieldAlert,
  ShieldX,
  KeyRound,
  UserX,
  Mail,
  RefreshCw,
} from 'lucide-react';
import type { AccountStatusErrorDetails } from '@repo/types';
import { useLanguage } from '@/context/LanguageContext';

export interface AccountStatusAlertProps {
  code: string;
  message?: string;
  details?: AccountStatusErrorDetails;
  onVerifyClick?: () => void;
  onRetryClick?: () => void;
  className?: string;
}

function formatRemainingTime(seconds: number): string {
  if (seconds <= 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins >= 60) {
    const hours = Math.floor(mins / 60);
    const remMins = mins % 60;
    return `${hours}h ${remMins}m`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export const AccountStatusAlert: React.FC<AccountStatusAlertProps> = ({
  code,
  message,
  details,
  onVerifyClick,
  onRetryClick,
  className = '',
}) => {
  const { t, language } = useLanguage();

  // Calculate initial seconds
  const initialSeconds = (() => {
    if (
      typeof details?.retryAfterSeconds === 'number' &&
      details.retryAfterSeconds > 0
    ) {
      return details.retryAfterSeconds;
    }
    if (details?.suspendedUntil) {
      const diff = Math.ceil(
        (new Date(details.suspendedUntil).getTime() - Date.now()) / 1000,
      );
      return Math.max(0, diff);
    }
    return 0;
  })();

  const [remainingSeconds, setRemainingSeconds] =
    useState<number>(initialSeconds);

  // Sync state if props change
  useEffect(() => {
    setRemainingSeconds(initialSeconds);
  }, [initialSeconds]);

  // Live countdown timer
  useEffect(() => {
    if (remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [remainingSeconds]);

  // Format scheduled unlock date
  const formattedUnlockDate = details?.suspendedUntil
    ? new Date(details.suspendedUntil).toLocaleString(
        language === 'th' ? 'th-TH' : 'en-US',
        {
          dateStyle: 'medium',
          timeStyle: 'short',
        },
      )
    : null;

  // 1. ACCOUNT_SUSPENDED
  if (code === 'ACCOUNT_SUSPENDED') {
    const isExpired = remainingSeconds <= 0 && initialSeconds > 0;

    return (
      <div
        className={`border border-amber-200/90 bg-amber-50/70 p-4 text-left transition-all ${className}`}
        role="alert"
      >
        <div className="flex items-start space-x-3">
          <div className="mt-0.5 shrink-0 rounded-xs bg-amber-100 p-1.5 text-amber-800">
            {isExpired ? <ShieldAlert size={16} /> : <Clock size={16} />}
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-amber-950">
                {t('auth.restricted.suspendedTitle')}
              </h4>
              <p className="mt-0.5 text-xs text-amber-900/80 leading-relaxed">
                {isExpired
                  ? t('auth.restricted.suspendedExpired')
                  : t('auth.restricted.suspendedDesc')}
              </p>
            </div>

            {/* Reason block */}
            {details?.reason && (
              <div className="rounded-xs border border-amber-200/50 bg-amber-100/40 px-2.5 py-1.5 text-[11px] text-amber-900">
                <span className="font-semibold text-amber-950">
                  {t('auth.restricted.reasonLabel')}{' '}
                </span>
                <span>{details.reason}</span>
              </div>
            )}

            {/* Live countdown or scheduled date */}
            {!isExpired && remainingSeconds > 0 && (
              <div className="inline-flex items-center space-x-1.5 rounded-full border border-amber-300/80 bg-amber-100/70 px-2.5 py-1 text-[11px] font-bold text-amber-900">
                <Clock size={12} className="animate-pulse text-amber-700" />
                <span>
                  {t('auth.restricted.suspendedCountdown').replace(
                    '{time}',
                    formatRemainingTime(remainingSeconds),
                  )}
                </span>
              </div>
            )}

            {!isExpired && remainingSeconds <= 0 && formattedUnlockDate && (
              <p className="text-[11px] text-amber-800/80">
                <span className="font-medium">
                  {t('auth.restricted.suspendedUntilLabel')}{' '}
                </span>
                <span className="font-semibold">{formattedUnlockDate}</span>
              </p>
            )}

            {/* Action when countdown expired */}
            {isExpired && onRetryClick && (
              <button
                type="button"
                onClick={onRetryClick}
                className="mt-1 inline-flex items-center space-x-1.5 rounded-xs border border-amber-300 bg-white px-3 py-1.5 text-xs font-semibold text-amber-950 hover:bg-amber-100/60 transition-colors cursor-pointer"
              >
                <RefreshCw size={13} />
                <span>{t('auth.signInBtn')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 2. ACCOUNT_BANNED
  if (code === 'ACCOUNT_BANNED') {
    const supportEmail = details?.supportEmail ?? 'support@nida-apparel.com';
    const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(
      'Account Inquiry — NIDA Platform',
    )}`;

    return (
      <div
        className={`border border-red-200/90 bg-red-50/70 p-4 text-left transition-all ${className}`}
        role="alert"
      >
        <div className="flex items-start space-x-3">
          <div className="mt-0.5 shrink-0 rounded-xs bg-red-100 p-1.5 text-red-800">
            <ShieldX size={16} />
          </div>
          <div className="min-w-0 flex-1 space-y-2.5">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-red-950">
                {t('auth.restricted.bannedTitle')}
              </h4>
              <p className="mt-0.5 text-xs text-red-900/80 leading-relaxed">
                {t('auth.restricted.bannedDesc')}
              </p>
            </div>

            {/* Reason block */}
            {details?.reason && (
              <div className="rounded-xs border border-red-200/50 bg-red-100/40 px-2.5 py-1.5 text-[11px] text-red-900">
                <span className="font-semibold text-red-950">
                  {t('auth.restricted.reasonLabel')}{' '}
                </span>
                <span>{details.reason}</span>
              </div>
            )}

            {/* Contact Support CTA */}
            <div>
              <a
                href={mailtoUrl}
                className="inline-flex items-center space-x-1.5 rounded-xs border border-red-300 bg-white px-3 py-1.5 text-xs font-semibold text-red-950 hover:bg-red-100/60 transition-colors shadow-2xs"
              >
                <Mail size={13} className="text-red-700" />
                <span>{t('auth.restricted.contactSupport')}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 3. ACCOUNT_UNVERIFIED
  if (code === 'ACCOUNT_UNVERIFIED') {
    return (
      <div
        className={`border border-sky-200/90 bg-sky-50/70 p-4 text-left transition-all ${className}`}
        role="alert"
      >
        <div className="flex items-start space-x-3">
          <div className="mt-0.5 shrink-0 rounded-xs bg-sky-100 p-1.5 text-sky-800">
            <KeyRound size={16} />
          </div>
          <div className="min-w-0 flex-1 space-y-2">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-sky-950">
                {t('auth.restricted.unverifiedTitle')}
              </h4>
              <p className="mt-0.5 text-xs text-sky-900/80 leading-relaxed">
                {t('auth.restricted.unverifiedDesc')}
              </p>
            </div>

            {onVerifyClick && (
              <button
                type="button"
                onClick={onVerifyClick}
                className="inline-flex items-center space-x-1.5 rounded-xs border border-sky-300 bg-white px-3 py-1.5 text-xs font-semibold text-sky-950 hover:bg-sky-100/60 transition-colors shadow-2xs cursor-pointer"
              >
                <span>{t('auth.restricted.verifyNow')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // 4. ACCOUNT_DEACTIVATED
  if (code === 'ACCOUNT_DEACTIVATED') {
    return (
      <div
        className={`border border-stone-300/80 bg-stone-100/70 p-4 text-left transition-all ${className}`}
        role="alert"
      >
        <div className="flex items-start space-x-3">
          <div className="mt-0.5 shrink-0 rounded-xs bg-stone-200 p-1.5 text-stone-700">
            <UserX size={16} />
          </div>
          <div className="min-w-0 flex-1 space-y-1">
            <h4 className="text-xs font-black uppercase tracking-wider text-stone-900">
              {t('auth.restricted.deactivatedTitle')}
            </h4>
            <p className="text-xs text-stone-700 leading-relaxed">
              {t('auth.restricted.deactivatedDesc')}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Fallback if code is generic
  return (
    <div
      className={`border border-red-200/90 bg-red-50/70 p-4 text-left text-xs text-red-900 ${className}`}
      role="alert"
    >
      {message ?? t('auth.invalidPassword')}
    </div>
  );
};
