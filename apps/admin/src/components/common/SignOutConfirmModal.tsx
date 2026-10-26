import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { AlertModal } from '../ui';

export interface SignOutConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignOutConfirmModal: React.FC<SignOutConfirmModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { logout } = useAuth();
  const { t } = useLanguage();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleConfirm = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      onClose();
      window.location.href = '/admin/login';
    } catch {
      window.location.href = '/admin/login';
    } finally {
      setIsLoggingOut(false);
    }
  };

  return (
    <AlertModal
      isOpen={isOpen}
      onClose={onClose}
      onConfirm={handleConfirm}
      title={t('auth.sign_out_confirm_title')}
      description={t('auth.sign_out_confirm_desc')}
      confirmText={t('auth.sign_out_button')}
      cancelText={t('auth.cancel')}
      variant="danger"
      icon={LogOut}
      isLoading={isLoggingOut}
      maxWidth="sm"
    />
  );
};
