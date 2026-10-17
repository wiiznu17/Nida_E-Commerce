import React, { useState } from 'react';
import { RotateCcw, AlertTriangle, X, Check } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { orderRequester } from '../../api/requester/orderRequester';
import type { ApiOrder } from '@repo/types';

interface OrderRefundModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: ApiOrder;
  onSuccess: (updatedOrder: ApiOrder) => void;
}

export const OrderRefundModal: React.FC<OrderRefundModalProps> = ({
  isOpen,
  onClose,
  order,
  onSuccess,
}) => {
  const { t, isTh } = useLanguage();

  const totalPaid = Number(order.totalAmount);
  const alreadyRefunded = (order.refunds ?? [])
    .filter((r) => r.status === 'SUCCEEDED')
    .reduce((sum, r) => sum + Number(r.amount), 0);
  const maxRefundable = Math.max(0, totalPaid - alreadyRefunded);

  const [refundAmount, setRefundAmount] = useState<string>(
    maxRefundable.toString(),
  );
  const [reason, setReason] = useState<string>('');
  const [restockInventory, setRestockInventory] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const amountNum = parseFloat(refundAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError(
        isTh
          ? 'กรุณาระบุจำนวนเงินที่ต้องการคืนให้ถูกต้อง'
          : 'Please enter a valid refund amount',
      );
      return;
    }

    if (amountNum > maxRefundable) {
      setError(
        isTh
          ? `ยอดเงินคืนเกินจำนวนที่สามารถคืนได้สูงสุด (฿${maxRefundable.toLocaleString()})`
          : `Amount exceeds maximum refundable balance (฿${maxRefundable.toLocaleString()})`,
      );
      return;
    }

    if (!reason.trim()) {
      setError(
        isTh
          ? 'กรุณาระบุเหตุผลการคืนเงิน'
          : 'Please provide a reason for the refund',
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const updated = await orderRequester.refundOrder(order.id, {
        amount: amountNum,
        reason: reason.trim(),
        restockInventory,
      });
      onSuccess(updated);
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : 'Failed to process refund',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white rounded-md max-w-lg w-full border border-brand-border shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-full bg-rose-50 text-rose-700 flex items-center justify-center border border-rose-200">
              <RotateCcw className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900 tracking-tight">
                {t('orders.refund.modalTitle')}
              </h2>
              <p className="text-[11px] text-stone-500 font-mono tracking-wider uppercase">
                {order.orderNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 transition-colors p-1"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-sm text-xs text-rose-800 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Refund Balance Summary Box */}
          <div className="p-3.5 bg-stone-50 border border-brand-border/60 rounded-xs space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-stone-500">
                {t('orders.refund.totalPaid')}
              </span>
              <span className="font-semibold text-stone-800">
                ฿{totalPaid.toLocaleString()}
              </span>
            </div>
            {alreadyRefunded > 0 && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-rose-600">
                  {t('orders.refund.alreadyRefunded')}
                </span>
                <span className="font-semibold text-rose-600">
                  -฿{alreadyRefunded.toLocaleString()}
                </span>
              </div>
            )}
            <div className="pt-2 border-t border-brand-border/40 flex justify-between items-center text-xs">
              <span className="font-bold text-stone-800 uppercase tracking-wider text-[11px]">
                {t('orders.refund.maxRefundable')}
              </span>
              <span className="font-bold text-brand-dark-brown text-sm">
                ฿{maxRefundable.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Refund Amount Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              {t('orders.refund.amountLabel')}
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2.5 text-xs text-stone-400 font-mono">
                ฿
              </span>
              <input
                type="number"
                step="0.01"
                min="1"
                max={maxRefundable}
                value={refundAmount}
                onChange={(e) => setRefundAmount(e.target.value)}
                required
                className="w-full pl-8 pr-4 py-2 border border-brand-border rounded-xs text-sm font-semibold text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-brand-dark-brown"
              />
            </div>
          </div>

          {/* Reason Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700 uppercase tracking-wider">
              {t('orders.refund.reasonLabel')}
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('orders.refund.reasonPlaceholder')}
              required
              className="w-full px-3 py-2 border border-brand-border rounded-xs text-xs text-stone-900 placeholder:text-stone-400 focus:outline-hidden focus:ring-1 focus:ring-brand-dark-brown resize-none"
            />
          </div>

          {/* Restock Inventory Checkbox */}
          <label className="flex items-start space-x-2.5 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={restockInventory}
              onChange={(e) => setRestockInventory(e.target.checked)}
              className="mt-0.5 w-4 h-4 text-brand-dark-brown border-brand-border rounded-xs focus:ring-brand-dark-brown cursor-pointer"
            />
            <div className="text-xs">
              <span className="font-semibold text-stone-800 block">
                {t('orders.refund.restockCheckbox')}
              </span>
              <span className="text-[11px] text-stone-500 block">
                {t('orders.refund.restockHint')}
              </span>
            </div>
          </label>

          {/* Modal Actions */}
          <div className="pt-3 border-t border-brand-border flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 border border-brand-border text-stone-700 text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-stone-50 transition-colors cursor-pointer"
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || maxRefundable <= 0}
              className="px-4 py-2 bg-rose-700 text-white text-xs font-bold uppercase tracking-wider rounded-xs hover:bg-rose-800 transition-colors flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              <Check className="w-3.5 h-3.5" />
              <span>
                {isSubmitting
                  ? t('orders.refund.processing')
                  : t('orders.refund.confirmButton')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
