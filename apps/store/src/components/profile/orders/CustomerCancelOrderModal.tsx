'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { orderRequester } from '@/api/requester/orderRequester';
import { useAuth } from '@/context/AuthContext';
import type { ApiOrder } from '@repo/types';

interface CustomerCancelOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderNumber: string;
  onSuccess: (updatedOrder: ApiOrder) => void;
}

export function CustomerCancelOrderModal({
  isOpen,
  onClose,
  orderNumber,
  onSuccess,
}: CustomerCancelOrderModalProps) {
  const { t, isTh } = useLanguage();
  const { token } = useAuth();

  const [reason, setReason] = useState('');
  const [customerNote, setCustomerNote] = useState('');
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

  const reasonPresets = isTh
    ? [
        'สั่งซื้อผิดขนาด / ไซส์',
        'สั่งซื้อผิดสี / รุ่นสินค้า',
        'ต้องการเปลี่ยนที่อยู่จัดส่ง',
        'เปลี่ยนใจ ไม่ต้องการสินค้านี้แล้ว',
        'พบสินค้าอื่นที่ต้องการแทน',
      ]
    : [
        'Ordered wrong size',
        'Ordered wrong color or item',
        'Need to change shipping address',
        'Changed mind / no longer needed',
        'Found an alternative item',
      ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!reason.trim()) {
      setError(
        isTh
          ? 'กรุณาเลือกหรือระบุเหตุผลในการขอยกเลิก'
          : 'Please specify a reason for cancellation',
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await orderRequester.requestCancellation(
        orderNumber,
        {
          reason: reason.trim(),
          customerNote: customerNote.trim() || undefined,
        },
        token,
      );
      onSuccess(updated);
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : isTh
            ? 'เกิดข้อผิดพลาดในการส่งคำขอยกเลิก'
            : 'Failed to submit cancellation request',
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
              {t('orderDetail.cancelModal.title')}
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xs text-xs text-rose-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="p-3 bg-stone-50/70 border border-brand-border/60 rounded-xs text-xs text-stone-600 space-y-1">
            <p className="font-semibold text-stone-800">
              {t('orderDetail.cancelModal.reviewNoticeTitle')}
            </p>
            <p className="text-[11px] text-stone-500 leading-relaxed">
              {t('orderDetail.cancelModal.reviewNoticeDesc')}
            </p>
          </div>

          {/* Quick Presets */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider">
              {t('orderDetail.cancelModal.selectReasonLabel')}
            </label>
            <div className="flex flex-wrap gap-1.5">
              {reasonPresets.map((preset) => (
                <button
                  type="button"
                  key={preset}
                  onClick={() => setReason(preset)}
                  className={`text-xs px-2.5 py-1 rounded-xs border transition-colors cursor-pointer ${
                    reason === preset
                      ? 'bg-brand-brown text-white border-brand-brown font-bold shadow-2xs'
                      : 'bg-white text-stone-700 border-stone-200 hover:border-brand-brown hover:bg-stone-50'
                  }`}
                >
                  {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-1">
            <input
              type="text"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('orderDetail.cancelModal.reasonPlaceholder')}
              required
              className="w-full px-3 py-2 border border-stone-200 rounded-xs text-xs text-stone-900 focus:outline-hidden focus:border-brand-brown focus:ring-1 focus:ring-brand-brown"
            />
          </div>

          {/* Customer Note */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider">
              {t('orderDetail.cancelModal.noteLabel')}
            </label>
            <textarea
              rows={3}
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder={t('orderDetail.cancelModal.notePlaceholder')}
              className="w-full px-3 py-2 border border-stone-200 rounded-xs text-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-brand-brown focus:ring-1 focus:ring-brand-brown resize-none"
            />
          </div>

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
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-rose-700 hover:bg-rose-800 text-white rounded-xs shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting
                ? t('common.submitting')
                : t('orderDetail.cancelModal.submitButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
