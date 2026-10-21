import React, { useState, useEffect } from 'react';
import { X, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { orderRequester } from '../../api/requester/orderRequester';
import { formatCurrency } from '../../utils/currency';

export interface OrderPaymentOverrideModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  orderNumber: string;
  totalAmount?: number;
  paymentMethod?: string;
  onSuccess: () => void;
}

export const OrderPaymentOverrideModal: React.FC<
  OrderPaymentOverrideModalProps
> = ({
  isOpen,
  onClose,
  orderId,
  orderNumber,
  totalAmount,
  paymentMethod = 'OMISE_GATEWAY',
  onSuccess,
}) => {
  const { t } = useLanguage();
  const [chargeId, setChargeId] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setChargeId('');
      setReason('');
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const presets = [
    t('orders.paymentOverride.presetVerifiedDashboard'),
    t('orders.paymentOverride.presetWebhookTimeout'),
    t('orders.paymentOverride.presetCustomerConfirmed'),
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) {
      setError(t('orders.paymentOverride.reasonLabel'));
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await orderRequester.updateStatus(
        orderId,
        'PAID',
        undefined,
        undefined,
        chargeId.trim() || undefined,
        reason.trim(),
      );
      onSuccess();
      onClose();
    } catch (err: unknown) {
      const msg =
        err instanceof Error ? err.message : 'Failed to update order status';
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl border border-stone-200 w-full max-w-lg overflow-hidden flex flex-col">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-700 flex items-center justify-center">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-900">
                {t('orders.paymentOverride.modalTitle')}
              </h3>
              <p className="text-xs text-stone-500">
                {t('orders.paymentOverride.modalSubtitle')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Warning Banner */}
          <div className="p-3.5 bg-amber-50/80 border border-amber-200/80 rounded-xl flex items-start space-x-3">
            <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-900 leading-relaxed">
              <span className="font-bold block mb-0.5">
                {t('orders.paymentOverride.warningTitle')}
              </span>
              {t('orders.paymentOverride.warningNotice')}
            </div>
          </div>

          {/* Order Details Strip */}
          <div className="bg-stone-50 rounded-xl p-3.5 border border-stone-200/60 text-xs space-y-1.5">
            <div className="flex justify-between items-center text-stone-600">
              <span className="font-medium text-stone-500">
                {t('orders.paymentOverride.orderPrefix')}
              </span>
              <span className="font-mono font-bold text-stone-900">
                {orderNumber}
              </span>
            </div>
            {totalAmount !== undefined && (
              <div className="flex justify-between items-center text-stone-600">
                <span className="font-medium text-stone-500">
                  {t('orders.paymentOverride.amount')}
                </span>
                <span className="font-bold text-stone-900">
                  {formatCurrency(totalAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-between items-center text-stone-600">
              <span className="font-medium text-stone-500">
                {t('orders.paymentOverride.paymentMethod')}
              </span>
              <span className="font-mono text-stone-700 text-[11px] uppercase tracking-wider">
                {paymentMethod}
              </span>
            </div>
            <div className="flex justify-between items-center text-stone-600">
              <span className="font-medium text-stone-500">
                {t('orders.paymentOverride.currentStatus')}
              </span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                PENDING
              </span>
            </div>
          </div>

          {/* Omise Charge ID Input */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-stone-700 tracking-wide">
              {t('orders.paymentOverride.chargeIdLabel')}
            </label>
            <input
              type="text"
              value={chargeId}
              onChange={(e) => setChargeId(e.target.value)}
              placeholder={t('orders.paymentOverride.chargeIdPlaceholder')}
              className="w-full px-3.5 py-2 text-xs font-mono rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all bg-white"
            />
          </div>

          {/* Reason Input & Presets */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-stone-700 tracking-wide">
                {t('orders.paymentOverride.reasonLabel')}
              </label>
              <span className="text-[10px] text-stone-400 font-medium">
                {t('orders.paymentOverride.presetLabel')}
              </span>
            </div>

            {/* Presets Chips */}
            <div className="flex flex-wrap gap-1.5">
              {presets.map((preset, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setReason(preset)}
                  className="px-2.5 py-1 text-[11px] rounded-lg border border-stone-200 bg-stone-50 hover:bg-stone-100 text-stone-600 transition-colors text-left"
                >
                  {preset}
                </button>
              ))}
            </div>

            <textarea
              rows={2}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={t('orders.paymentOverride.reasonPlaceholder')}
              className="w-full px-3.5 py-2 text-xs rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-900/10 focus:border-stone-900 transition-all bg-white"
            />
          </div>

          {error && (
            <div className="text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-xl font-medium">
              {error}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-2 flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl transition-colors"
            >
              {t('orders.paymentOverride.cancel')}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center space-x-1.5 px-5 py-2 text-xs font-semibold rounded-xl bg-stone-900 hover:bg-stone-800 text-white shadow-sm transition-all disabled:opacity-50"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>
                {isSubmitting
                  ? t('orders.paymentOverride.submitting')
                  : t('orders.paymentOverride.confirm')}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
