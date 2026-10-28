'use client';

import React, { useState, useEffect } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { orderRequester } from '@/api/requester/orderRequester';
import { useAuth } from '@/context/AuthContext';
import {
  ReturnItemsSelector,
  type ReturnItemSelection,
} from './ReturnItemsSelector';
import type { ApiOrder } from '@repo/types';

interface CustomerReturnRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: ApiOrder;
  onSuccess: (updatedOrder: ApiOrder) => void;
}

export function CustomerReturnRequestModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: CustomerReturnRequestModalProps) {
  const { t, isTh } = useLanguage();
  const { token } = useAuth();

  const [selectedItems, setSelectedItems] = useState<
    Record<string, ReturnItemSelection>
  >(() => {
    const init: Record<string, ReturnItemSelection> = {};
    for (const item of order.items) {
      init[item.id] = { selected: true, quantity: item.quantity };
    }
    return init;
  });

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
        'สินค้าชำรุด หรือมีตำหนิจากการผลิต',
        'ได้รับสินค้าไม่ตรงกับที่สั่งซื้อ (ผิดสี/ไซส์)',
        'ขนาดไม่พอดีกับรูปร่าง',
        'สินค้าไม่ตรงตามภาพโฆษณา',
      ]
    : [
        'Defective or damaged on arrival',
        'Received incorrect item or variant',
        'Size does not fit',
        'Item differs from description',
      ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const itemsToReturn = Object.entries(selectedItems)
      .filter(([_, val]) => val.selected && val.quantity > 0)
      .map(([orderItemId, val]) => ({
        orderItemId,
        quantity: val.quantity,
      }));

    if (itemsToReturn.length === 0) {
      setError(
        isTh
          ? 'กรุณาเลือกรายการสินค้าที่ต้องการส่งคืนอย่างน้อย 1 รายการ'
          : 'Please select at least one item to return',
      );
      return;
    }

    if (!reason.trim()) {
      setError(
        isTh
          ? 'กรุณาระบุเหตุผลในการขอคืนสินค้า'
          : 'Please specify a return reason',
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await orderRequester.requestReturn(
        order.orderNumber,
        {
          reason: reason.trim(),
          customerNote: customerNote.trim() || undefined,
          items: itemsToReturn,
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
            ? 'เกิดข้อผิดพลาดในการส่งคำขอคืนสินค้า'
            : 'Failed to submit return request',
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
        className="bg-white rounded-md max-w-lg w-full border border-brand-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between bg-stone-50/80 shrink-0">
          <div>
            <h3 className="text-sm font-bold text-stone-900 tracking-tight">
              {t('orderDetail.returnModal.title')}
            </h3>
            <p className="text-[11px] text-stone-500 font-mono tracking-wider uppercase mt-0.5">
              #{order.orderNumber}
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

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xs text-xs text-rose-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Select Items to Return */}
          <ReturnItemsSelector
            items={order.items}
            selectedItems={selectedItems}
            onChange={setSelectedItems}
          />

          {/* Presets */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider">
              {t('orderDetail.returnModal.reasonLabel')}
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
          <input
            type="text"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder={t('orderDetail.returnModal.reasonPlaceholder')}
            required
            className="w-full px-3 py-2 border border-stone-200 rounded-xs text-xs text-stone-900 focus:outline-hidden focus:border-brand-brown focus:ring-1 focus:ring-brand-brown"
          />

          {/* Customer Note */}
          <div className="space-y-1">
            <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider">
              {t('orderDetail.cancelModal.noteLabel')}
            </label>
            <textarea
              rows={3}
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              placeholder={t('orderDetail.returnModal.notePlaceholder')}
              className="w-full px-3 py-2 border border-stone-200 rounded-xs text-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:border-brand-brown focus:ring-1 focus:ring-brand-brown resize-none"
            />
          </div>

          {/* Action buttons */}
          <div className="pt-4 border-t border-brand-border/40 flex justify-end space-x-2 shrink-0">
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
              className="px-4 py-2 text-xs font-bold uppercase tracking-wider bg-brand-brown hover:bg-brand-dark-brown text-white rounded-xs shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              {isSubmitting
                ? t('common.submitting')
                : t('orderDetail.returnModal.submitButton')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
