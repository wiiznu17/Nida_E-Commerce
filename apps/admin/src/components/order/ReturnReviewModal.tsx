import React, { useState } from 'react';
import { X, CheckCircle2, XCircle, Package } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useToast } from '../../context/ToastContext';
import { orderRequester } from '../../api/requester/orderRequester';
import { formatPrice } from '../../utils';
import type { ApiReturnRequestWithOrder } from '@repo/types';

interface ReturnReviewModalProps {
  isOpen: boolean;
  request: ApiReturnRequestWithOrder | null;
  onClose: () => void;
  onSuccess: () => void;
}

export const ReturnReviewModal: React.FC<ReturnReviewModalProps> = ({
  isOpen,
  request,
  onClose,
  onSuccess,
}) => {
  const { t, isTh } = useLanguage();
  const toast = useToast();
  const [action, setAction] = useState<'APPROVE' | 'REJECT'>('APPROVE');
  const [adminNote, setAdminNote] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !request) return null;

  const handleConfirm = async () => {
    if (action === 'REJECT' && !adminNote.trim()) {
      toast.error(
        isTh
          ? 'กรุณาระบุเหตุผลในการปฏิเสธคำขอคืนสินค้า'
          : 'Please provide a reason for rejecting the return request',
      );
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await orderRequester.reviewReturnRequest(request.id, {
        action,
        adminNote: adminNote.trim() || undefined,
      });
      toast.success(res.message);
      onSuccess();
      onClose();
    } catch (err: unknown) {
      toast.error(
        err instanceof Error
          ? err.message
          : isTh
            ? 'เกิดข้อผิดพลาดในการตรวจสอบคำขอคืนสินค้า'
            : 'Failed to review return request',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-brown/50 backdrop-blur-xs font-sans">
      <div className="bg-white border border-brand-border max-w-lg w-full p-6 shadow-2xl relative rounded-xs space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-start pb-3 border-b border-gray-200">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-brand-amber block">
              {t('orders.return.reviewModalTitle')}
            </span>
            <h3 className="text-lg font-black uppercase text-brand-brown mt-0.5 font-mono">
              {request.requestNumber}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Core Order & Customer Context */}
        <div className="bg-stone-50 p-3 rounded-xs border border-brand-border/60 text-xs space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-stone-500 font-semibold">
              {t('orders.table.orderNumber')}:
            </span>
            <span className="font-mono font-bold text-brand-brown">
              #{request.order?.orderNumber ?? request.orderId}
              {request.order?.totalAmount !== undefined && (
                <span className="text-stone-900 font-mono ml-2">
                  ({formatPrice(request.order.totalAmount)})
                </span>
              )}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-stone-500 font-semibold">
              {t('returnsPage.table.customer')}:
            </span>
            <span className="text-stone-800 font-medium">
              {request.user
                ? `${request.user.firstName ?? ''} ${request.user.lastName ?? ''}`.trim() ||
                  request.user.email
                : '-'}
            </span>
          </div>

          <div className="flex justify-between items-start pt-1 border-t border-stone-200/60">
            <span className="text-stone-500 font-semibold shrink-0 mr-2">
              {t('orders.return.reason')}:
            </span>
            <span className="text-stone-800 font-medium text-right">
              {request.reason}
            </span>
          </div>

          {request.customerNote && (
            <div className="pt-1 text-stone-600 italic border-t border-stone-200/60 text-[11px]">
              "{request.customerNote}"
            </div>
          )}
        </div>

        {/* Return Items List */}
        <div className="space-y-1.5">
          <div className="flex items-center space-x-1.5 text-[11px] font-bold uppercase tracking-wider text-stone-700">
            <Package size={13} className="text-brand-brown" />
            <span>
              {t('orders.return.itemsLabel')} ({request.items.length})
            </span>
          </div>
          <div className="border border-brand-border rounded-xs divide-y divide-brand-border/40 max-h-36 overflow-y-auto bg-white">
            {request.items.map((item) => (
              <div
                key={item.id}
                className="p-2.5 flex items-center justify-between text-xs hover:bg-stone-50/50"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-bold text-stone-900 truncate">
                    <span className="text-brand-brown font-mono mr-1.5">
                      {item.quantity}x
                    </span>
                    {item.productName ?? 'Product'}
                  </div>
                  {item.variantInfo && (
                    <div className="text-[11px] text-stone-500">
                      {item.variantInfo}
                    </div>
                  )}
                </div>
                {item.unitPrice !== undefined && (
                  <div className="font-mono font-bold text-stone-800 shrink-0 text-right">
                    {formatPrice(item.unitPrice * item.quantity)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Action Decision Toggle */}
        <div className="space-y-3 pt-1">
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
              <span>{t('orders.return.approveShipButton')}</span>
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
              <span>{t('orders.return.rejectButton')}</span>
            </button>
          </div>

          {action === 'APPROVE' && (
            <p className="text-[11px] text-stone-500 bg-stone-50 p-2 rounded-xs border border-stone-200">
              {t('orders.return.approveDeadlineHint')}
            </p>
          )}

          {/* Admin Note Input */}
          <div className="space-y-1">
            <label className="text-[11px] font-bold uppercase tracking-wider text-stone-700 block">
              {action === 'APPROVE'
                ? t('orders.cancellation.approveNoteLabel')
                : t('orders.return.rejectNoteLabel')}
            </label>
            <input
              type="text"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              placeholder={t('orders.cancellation.notePlaceholder')}
              className="w-full px-3 py-2 border border-brand-border rounded-xs text-xs text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-brand-dark-brown"
            />
          </div>
        </div>

        {/* Modal Footer Actions */}
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
            className={`px-4 py-2 text-xs font-bold uppercase tracking-wider text-white rounded-xs transition-colors cursor-pointer disabled:opacity-50 ${
              action === 'APPROVE'
                ? 'bg-emerald-700 hover:bg-emerald-800'
                : 'bg-rose-700 hover:bg-rose-800'
            }`}
          >
            {isSubmitting
              ? t('orders.refund.processing')
              : action === 'APPROVE'
                ? t('orders.return.approveShipButton')
                : t('orders.return.rejectButton')}
          </button>
        </div>
      </div>
    </div>
  );
};
