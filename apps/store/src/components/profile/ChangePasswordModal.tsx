'use client';

import React, { useState } from 'react';
import { X, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Alert } from '@/components/ui';
import { authRequester, extractApiError } from '@/api';

export interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { language, t } = useLanguage();

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  if (!isOpen) return null;

  const handleResetForm = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowCurrent(false);
    setShowNew(false);
    setShowConfirm(false);
    setErrorMessage('');
    setSuccessMessage('');
  };

  const handleClose = () => {
    if (isSubmitting) return;
    handleResetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMessage(
        language === 'th'
          ? 'กรุณากรอกข้อมูลให้ครบทุกช่อง'
          : 'Please fill in all required fields.',
      );
      return;
    }

    if (newPassword.length < 8) {
      setErrorMessage(t('auth.passwordRequirements'));
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage(t('auth.passwordsDoNotMatch'));
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMessage(
        language === 'th'
          ? 'รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านปัจจุบัน'
          : 'New password cannot be the same as your current password.',
      );
      return;
    }

    setIsSubmitting(true);
    try {
      await authRequester.changePassword({
        currentPassword,
        newPassword,
      });

      setSuccessMessage(t('auth.changePasswordSuccess'));
      handleResetForm();

      if (onSuccess) {
        onSuccess();
      }

      setTimeout(() => {
        onClose();
      }, 1200);
    } catch (err: unknown) {
      const fallback =
        language === 'th'
          ? 'รหัสผ่านปัจจุบันไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง'
          : 'Current password is incorrect. Please verify and try again.';
      const extracted = extractApiError(err, fallback);
      setErrorMessage(extracted.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white border border-brand-border w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-brand-border bg-brand-warm-cream shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-brand-brown">
              {t('auth.changePasswordTitle')}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {t('auth.changePasswordSubtitle')}
            </p>
          </div>
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="w-8 h-8 rounded-full hover:bg-black/5 text-stone-400 hover:text-brand-brown flex items-center justify-center transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <form
          onSubmit={handleSubmit}
          className="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1"
        >
          {errorMessage && <Alert variant="error">{errorMessage}</Alert>}
          {successMessage && <Alert variant="success">{successMessage}</Alert>}

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              {t('auth.currentPassword')}
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder={t('auth.currentPasswordPlaceholder')}
                className="w-full border border-stone-300 px-3.5 py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:border-brand-brown bg-white transition-colors placeholder:text-stone-400 text-stone-800"
              />
              <Lock
                size={16}
                className="absolute left-3.5 top-3 text-stone-400 pointer-events-none"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-brand-brown cursor-pointer p-1"
                aria-label={
                  showCurrent
                    ? t('auth.hidePassword')
                    : t('auth.showPassword')
                }
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              {t('auth.newPassword')}
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder={t('auth.newPasswordPlaceholder')}
                className="w-full border border-stone-300 px-3.5 py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:border-brand-brown bg-white transition-colors placeholder:text-stone-400 text-stone-800"
              />
              <Lock
                size={16}
                className="absolute left-3.5 top-3 text-stone-400 pointer-events-none"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-brand-brown cursor-pointer p-1"
                aria-label={
                  showNew ? t('auth.hidePassword') : t('auth.showPassword')
                }
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-[11px] text-stone-400 mt-1">
              {t('auth.passwordRequirements')}
            </p>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              {t('auth.confirmNewPassword')}
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                minLength={8}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder={t('auth.confirmNewPasswordPlaceholder')}
                className="w-full border border-stone-300 px-3.5 py-2.5 pl-10 pr-10 text-sm focus:outline-none focus:border-brand-brown bg-white transition-colors placeholder:text-stone-400 text-stone-800"
              />
              <Lock
                size={16}
                className="absolute left-3.5 top-3 text-stone-400 pointer-events-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-stone-400 hover:text-brand-brown cursor-pointer p-1"
                aria-label={
                  showConfirm
                    ? t('auth.hidePassword')
                    : t('auth.showPassword')
                }
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end space-x-3 pt-5 border-t border-brand-border">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 text-xs font-bold uppercase tracking-wider text-stone-600 hover:text-brand-brown border border-stone-300 hover:bg-stone-50 transition-colors cursor-pointer"
            >
              {t('auth.cancel')}
            </button>
            <button
              type="submit"
              disabled={
                isSubmitting ||
                !currentPassword ||
                !newPassword ||
                !confirmPassword
              }
              className="bg-brand-brown hover:bg-brand-amber disabled:opacity-50 text-white px-7 py-2.5 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer shadow-md inline-flex items-center space-x-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{t('auth.sending')}</span>
                </>
              ) : (
                <span>{t('auth.savePassword')}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
