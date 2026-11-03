'use client';

import React from 'react';
import { ShieldAlert, ShieldX, UserX, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { AlertModal } from '@/components/ui';

export const AccountRestrictedModal: React.FC = () => {
  const { restrictedAccount, clearRestrictedAccount } = useAuth();
  const { t } = useLanguage();

  if (!restrictedAccount) {
    return null;
  }

  const { code, details } = restrictedAccount;
  const isBanned = code === 'ACCOUNT_BANNED';
  const isSuspended = code === 'ACCOUNT_SUSPENDED';

  const supportEmail = details?.supportEmail ?? 'support@nida-apparel.com';
  const mailtoUrl = `mailto:${supportEmail}?subject=${encodeURIComponent(
    'Account Inquiry — NIDA Platform',
  )}`;

  const title = isBanned
    ? t('auth.restricted.bannedTitle')
    : isSuspended
      ? t('auth.restricted.suspendedTitle')
      : t('auth.restricted.sessionRevokedTitle');

  const description = isBanned
    ? t('auth.restricted.bannedDesc')
    : t('auth.restricted.sessionRevokedDesc');

  const variant = isBanned ? 'danger' : isSuspended ? 'warning' : 'info';
  const IconComponent = isBanned ? ShieldX : isSuspended ? ShieldAlert : UserX;

  return (
    <AlertModal
      isOpen={Boolean(restrictedAccount)}
      onClose={clearRestrictedAccount}
      onConfirm={clearRestrictedAccount}
      title={title}
      description={description}
      variant={variant}
      icon={IconComponent}
      confirmText={t('auth.restricted.acknowledged')}
      showCancel={false}
      maxWidth="md"
    >
      <div className="space-y-3">
        {details?.reason && (
          <div className="rounded-xl border border-stone-200/80 bg-stone-50 p-3 text-xs text-stone-700">
            <span className="font-bold text-brand-brown">
              {t('auth.restricted.reasonLabel')}{' '}
            </span>
            <span>{details.reason}</span>
          </div>
        )}

        {isBanned && (
          <div className="pt-1 text-center">
            <a
              href={mailtoUrl}
              className="inline-flex items-center justify-center space-x-1.5 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-xs font-bold text-brand-brown hover:bg-stone-50 transition-colors shadow-2xs"
            >
              <Mail size={14} className="text-red-600" />
              <span>{t('auth.restricted.contactSupport')}</span>
            </a>
          </div>
        )}
      </div>
    </AlertModal>
  );
};
