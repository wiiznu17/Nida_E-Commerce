'use client';

import React from 'react';
import { AlertTriangle, AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

export type AlertModalVariant = 'danger' | 'warning' | 'info' | 'success';

export interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm?: () => void;
  title: string;
  description?: string | React.ReactNode;
  children?: React.ReactNode;
  variant?: AlertModalVariant;
  icon?: React.ComponentType<{ size?: number; className?: string }>;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
  showCancel?: boolean;
  maxWidth?: 'sm' | 'md' | 'lg';
}

const variantStyles: Record<
  AlertModalVariant,
  {
    iconBadge: string;
    defaultIcon: React.ComponentType<{ size?: number; className?: string }>;
    confirmBtn: string;
  }
> = {
  danger: {
    iconBadge:
      'bg-red-50 text-red-600 ring-8 ring-red-50/70 border border-red-200 shadow-2xs',
    defaultIcon: AlertCircle,
    confirmBtn:
      'bg-red-600 hover:bg-red-700 text-white shadow-xs font-black uppercase tracking-wider',
  },
  warning: {
    iconBadge:
      'bg-amber-50 text-amber-600 ring-8 ring-amber-50/70 border border-amber-200 shadow-2xs',
    defaultIcon: AlertTriangle,
    confirmBtn:
      'bg-brand-yellow hover:bg-brand-amber text-brand-dark-brown shadow-xs font-black uppercase tracking-wider',
  },
  info: {
    iconBadge:
      'bg-brand-warm-cream text-brand-brown ring-8 ring-brand-warm-cream/70 border border-brand-border shadow-2xs',
    defaultIcon: Info,
    confirmBtn:
      'bg-brand-brown hover:bg-brand-amber text-white shadow-xs font-black uppercase tracking-wider',
  },
  success: {
    iconBadge:
      'bg-emerald-50 text-emerald-600 ring-8 ring-emerald-50/70 border border-emerald-200 shadow-2xs',
    defaultIcon: CheckCircle,
    confirmBtn:
      'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs font-black uppercase tracking-wider',
  },
};

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

export function AlertModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  children,
  variant = 'danger',
  icon,
  confirmText,
  cancelText,
  isLoading = false,
  showCancel = true,
  maxWidth = 'sm',
}: AlertModalProps) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  const config = variantStyles[variant];
  const IconComponent = icon ?? config.defaultIcon;
  const resolvedConfirmText = confirmText ?? t('common.confirm');
  const resolvedCancelText = cancelText ?? t('common.cancel');

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget && !isLoading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-brown/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200 font-sans"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`relative w-full ${maxWidthClasses[maxWidth]} bg-white rounded-2xl shadow-2xl border border-brand-border p-6 sm:p-7 text-center overflow-hidden z-10 animate-in zoom-in-95 duration-200 flex flex-col items-center`}
      >
        {/* Top-Right Dismiss Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-3.5 right-3.5 text-stone-400 hover:text-stone-600 p-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer shrink-0 disabled:opacity-40"
          aria-label={t('common.close')}
        >
          <X size={16} />
        </button>

        {/* SweetAlert Style Large Icon Badge */}
        <div
          className={`w-14 h-14 rounded-full flex items-center justify-center shrink-0 mb-4 transition-transform ${config.iconBadge}`}
        >
          <IconComponent size={28} className="stroke-[2.2]" />
        </div>

        {/* Title */}
        <h3 className="text-base sm:text-lg font-black text-brand-brown tracking-tight leading-snug mb-2">
          {title}
        </h3>

        {/* Description */}
        {description && (
          <div className="text-xs text-stone-500 leading-relaxed max-w-xs mx-auto mb-5">
            {description}
          </div>
        )}

        {/* Optional Custom Content */}
        {children && <div className="w-full mb-5 text-left">{children}</div>}

        {/* Action Buttons */}
        <div className="flex items-center space-x-3 w-full pt-1">
          {showCancel && (
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1 py-2.5 px-4 border border-stone-200 hover:bg-stone-50 rounded-xl text-xs font-bold text-stone-700 transition-colors cursor-pointer disabled:opacity-50 text-center"
            >
              {resolvedCancelText}
            </button>
          )}

          {onConfirm && (
            <button
              type="button"
              onClick={onConfirm}
              disabled={isLoading}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs transition-colors cursor-pointer flex items-center justify-center space-x-1.5 disabled:opacity-60 text-center ${config.confirmBtn}`}
            >
              {isLoading ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  <span>{resolvedConfirmText}</span>
                </>
              ) : (
                <span>{resolvedConfirmText}</span>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
