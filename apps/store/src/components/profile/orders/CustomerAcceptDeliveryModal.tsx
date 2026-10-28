'use client';

import React, { useState, useEffect } from 'react';
import { CheckCircle2, X, AlertCircle, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { orderRequester } from '@/api/requester/orderRequester';
import { useAuth } from '@/context/AuthContext';
import type { ApiOrder } from '@repo/types';

interface CustomerAcceptDeliveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  onSuccess: (updatedOrder: ApiOrder) => void;
}

export function CustomerAcceptDeliveryModal({
  isOpen,
  onClose,
  orderNumber,
  onSuccess,
}: CustomerAcceptDeliveryModalProps) {
  const { t, isTh } = useLanguage();
  const { token } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleConfirm = async () => {
    setError(null);
    setIsSubmitting(true);
    try {
      const updated = await orderRequester.acceptOrder(orderNumber, token);
      onSuccess(updated);
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : isTh
            ? 'เกิดข้อผิดพลาดในการยืนยันการรับสินค้า'
            : 'Failed to confirm order receipt',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-md max-w-lg w-full border border-brand-border shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between bg-stone-50/80 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-stone-900 tracking-tight">
              {t('orderDetail.acceptModal.title')}
            </h3>
            <p className="text-[11px] text-stone-500 font-mono tracking-wider uppercase mt-0.5">
              #{orderNumber}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-xs text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors cursor-pointer"
            aria-label={t('common.close')}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xs text-xs text-rose-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-4 bg-stone-50/70 border border-brand-border/60 rounded-xs text-xs space-y-1.5">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-brand-amber shrink-0" />
              <p className="font-bold text-stone-900">
                {t('orderDetail.acceptModal.reviewNoticeTitle')}
              </p>
            </div>
            <p className="text-[12px] text-stone-600 leading-relaxed pt-0.5">
              {t('orderDetail.acceptModal.reviewNoticeDesc')}
            </p>
          </div>

          <p className="text-xs text-stone-500 leading-relaxed">
            {isTh
              ? 'กรุณาตรวจสอบว่าท่านได้รับสินค้าครบถ้วน ถูกต้องตามคำสั่งซื้อ และอยู่ในสภาพสมบูรณ์เรียบร้อยแล้ว'
              : 'Please confirm that you have received all ordered items intact and in satisfactory condition.'}
          </p>

          {/* Action buttons */}
          <div className="pt-4 border-t border-brand-border/40 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-stone-300 text-stone-700 rounded-xs hover:bg-stone-50 transition-colors cursor-pointer"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-brand-brown hover:bg-brand-dark-brown text-white rounded-xs shadow-2xs transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center space-x-1.5"
            >
              {isSubmitting ? (
                <span>{t('common.submitting')}</span>
              ) : (
                <>
                  <CheckCircle2 size={13} />
                  <span>{t('orderDetail.acceptModal.confirmButton')}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
