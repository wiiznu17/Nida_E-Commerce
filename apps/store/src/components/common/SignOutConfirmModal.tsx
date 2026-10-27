'use client';

import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useLanguage } from '@/context/LanguageContext';
import { AlertModal } from '../ui';

export interface SignOutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  allDevices?: boolean;
  onSuccess?: () => void;
}

export const SignOutConfirmModal: React.FC<SignOutConfirmModalProps> = ({
  isOpen,
  onClose,
  allDevices = false,
  onSuccess,
}) => {
  const { logout, logoutAll } = useAuth();
  const { t } = useLanguage();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirm = async () => {
    setIsLoggingOut(true);
    try {
      if (allDevices) {
        await logoutAll();
        onClose();
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.href = '/login';
        }
      } else {
        await logout();
        onClose();
        if (onSuccess) {
          onSuccess();
        } else {
          window.location.href = '/';
        }
      }
    } catch {
      window.location.href = allDevices ? '/login' : '/';
    } finally {
      setIsLoggingOut(false);
    }
  };

  const title = allDevices
    ? t('auth.signOutAllConfirmTitle')
    : t('auth.sign_out_confirm_title');
  const description = allDevices
    ? t('auth.signOutAllConfirmDesc')
    : t('auth.sign_out_confirm_desc');
  const confirmText = allDevices
    ? t('auth.signOutAllButton')
    : t('auth.sign_out_button');

  return (
    <AlertModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title={title}
      description={description}
      confirmText={confirmText}
      cancelText={t('common.cancel')}
      variant="danger"
      icon={LogOut}
      isLoading={isLoggingOut}
      maxWidth="sm"
    />
  );
};
