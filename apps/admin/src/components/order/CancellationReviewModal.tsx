import React, { useState } from 'react';
import { X, CheckCircle2, XCircle } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { orderRequester } from '../../api/requester/orderRequester';
import type { ApiOrderCancellationWithOrder } from '@repo/types';

interface CancellationReviewModalProps {
  isOpen: boolean;
  request: ApiOrderCancellationWithOrder | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const CancellationReviewModal: React.FC<CancellationReviewModalProps> = ({
  isOpen,
  request,
  onClose,
  onSuccess,
}) => {
  const { t, isTh } = useLanguage();
  const toast = useToast();
  const [action, setAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [adminNote, setAdminNote] = useState('');
  const [restockInventory, setRestockInventory] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !request) return null;

  const handleConfirm = async () => {
    setIsSubmitting(true);
    try {
      const res = await orderRequester.reviewCancellationRequest(request.id, {
        action,
        adminNote: adminNote.trim() || undefined,
        restockInventory,
      });
      toast.success(res.message);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : isTh
            ? 'เกิดข้อผิดพลาดในการตรวจสอบ'
            : 'Review failed',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-brown/50 backdrop-blur-xs">
      <div className="bg-white border border-brand-border max-w-lg w-full p-6 shadow-2xl relative rounded-xs space-y-4">
        <div className="flex justify-between items-start pb-3 border-b border-gray-200">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-amber block">
              {t('orders.cancellation.sectionTitle')}
            </span>
            <h3 className="text-lg font-black uppercase text-brand-brown mt-0.5">
              {request.requestNumber}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        <div className="bg-stone-50 p-3 rounded-xs border border-brand-border/60 text-xs space-y-1">
          <div className="flex justify-between">
            <span className="text-stone-500 font-semibold">{t('orders.table.orderNumber')}:</span>
            <span className="font-mono font-bold text-brand-brown">{request.order?.orderNumber ?? request.orderId}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-stone-500 font-semibold">{t('orders.cancellation.reason')}:</span>
            <span className="text-stone-800 font-medium">{request.reason}</span>
          </div>
          {request.customerNote && (
            <div className="pt-1 text-stone-600 italic">
              "{request.customerNote}"
            </div>
          )}
        </div>

        <div className="space-y-3">
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block">
            {t('orders.cancellation.confirmAction')}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAction('APPROVE')}
              className={`p-2.5 rounded-xs border text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer transition-colors ${
                action === 'APPROVE'
                  ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{t('orders.cancellation.approveButton')}</span>
            </button>
            <button
              type="button"
              onClick={() => setAction('REJECT')}
              className={`p-2.5 rounded-xs border text-xs font-bold flex items-center justify-center space-x-1.5 cursor-pointer transition-colors ${
                action === 'REJECT'
                  ? 'border-rose-600 bg-rose-50 text-rose-800'
                  : 'border-stone-200 text-stone-600 hover:bg-stone-50'
              }`}
            >
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>{t('orders.cancellation.rejectButton')}</span>
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block">
              {action === 'APPROVE'
                ? t('orders.cancellation.approveNoteLabel')
                : t('orders.cancellation.rejectNoteLabel')}
            </label>
            <input
              type="text"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder={t('orders.cancellation.notePlaceholder')}
              className="w-full px-3 py-2 border border-brand-border rounded-xs text-xs text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-brand-dark-brown"
            />
          </div>

          {action === 'APPROVE' && (
            <label className="flex items-center space-x-2 cursor-pointer text-xs">
              <input
                type="checkbox"
                checked={restockInventory}
                onChange={(e) => setRestockInventory(e.target.checked)}
                className="w-3.5 h-3.5 text-brand-dark-brown border-brand-border rounded-xs focus:ring-brand-dark-brown"
              />
              <span className="text-stone-700 font-medium">
                {t('orders.refund.restockCheckbox')}
              </span>
            </label>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting}
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider text-white rounded-xs transition-colors cursor-pointer ${
              action === 'APPROVE'
                ? 'bg-emerald-700 hover:bg-emerald-800'
                : 'bg-rose-700 hover:bg-rose-800'
            }`}
          >
            {isSubmitting
              ? t('orders.refund.processing')
              : t('orders.cancellation.confirmAction')}
          </button>
        </div>
      </div>
    </div>
  );
};
