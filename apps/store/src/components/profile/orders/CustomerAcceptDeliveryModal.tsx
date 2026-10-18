'use client';

import React, { useState } from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-md max-w-lg w-full border border-gray-200 shadow-2xl overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center border border-emerald-200">
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900 tracking-tight">
                {t('orderDetail.acceptModal.title')}
              </h2>
              <p className="text-[11px] text-stone-500 font-mono tracking-wider uppercase">
                #{orderNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 transition-colors p-1 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
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

          <div className="p-4 bg-emerald-50/50 border border-emerald-200/80 rounded-xs text-xs text-emerald-900 space-y-1.5">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <p className="font-bold text-emerald-900">
                {t('orderDetail.acceptModal.reviewNoticeTitle')}
              </p>
            </div>
            <p className="text-[12px] text-stone-600 leading-relaxed pt-1">
              {t('orderDetail.acceptModal.reviewNoticeDesc')}
            </p>
          </div>

          <p className="text-xs text-stone-500 leading-relaxed">
            {isTh
              ? 'กรุณาตรวจสอบว่าท่านได้รับสินค้าครบถ้วน ถูกต้องตามคำสั่งซื้อ และอยู่ในสภาพสมบูรณ์เรียบร้อยแล้ว'
              : 'Please confirm that you have received all ordered items intact and in satisfactory condition.'}
          </p>

          {/* Action buttons */}
          <div className="pt-4 border-t border-gray-200 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider border border-gray-300 text-stone-700 rounded-xs hover:bg-stone-50 transition-colors cursor-pointer"
            >
              {t('common.cancel')}
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-emerald-700 hover:bg-emerald-800 text-white rounded-xs transition-colors cursor-pointer disabled:opacity-50 inline-flex items-center space-x-1.5"
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
