import React, { useState } from 'react';
import { LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

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

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white border border-[#EAE3D9] rounded-2xl shadow-2xl max-w-sm w-full p-6 text-center relative overflow-hidden">
        <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4">
          <LogOut className="w-6 h-6 stroke-[2]" />
        </div>

        <h3 className="font-serif font-bold text-base text-[#2B1810] mb-2">
          {t('auth.sign_out_confirm_title')}
        </h3>

        <p className="text-xs text-stone-500 leading-relaxed mb-6">
          {t('auth.sign_out_confirm_desc')}
        </p>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoggingOut}
            className="flex-1 py-2.5 px-4 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-bold text-stone-700 transition-colors cursor-pointer"
          >
            {t('auth.cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoggingOut}
            className="flex-1 py-2.5 px-4 bg-[#2B1810] hover:bg-red-700 text-white rounded-xl text-xs font-black uppercase tracking-wider transition-colors shadow-sm cursor-pointer flex items-center justify-center space-x-1.5"
          >
            {isLoggingOut ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <span>{t('auth.sign_out_button')}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
