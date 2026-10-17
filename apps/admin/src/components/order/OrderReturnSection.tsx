import React, { useState } from 'react';
import { RotateCw, CheckCircle2, XCircle, Clock, PackageCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { orderRequester } from '../../api/requester/orderRequester';
import {
  OrderReturnInspectModal,
  type ReturnInspectModalData,
} from './OrderReturnInspectModal';
import type { ApiOrder } from '@repo/types';

interface OrderReturnSectionProps {
  order: ApiOrder;
  onReviewed: () => void;
  onShowToast: (msg: string) => void;
}

export const OrderReturnSection: React.FC<OrderReturnSectionProps> = ({
  order,
  onReviewed,
  onShowToast,
}) => {
  const { t, isTh } = useLanguage();
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [inspectModal, setInspectModal] =
    useState<ReturnInspectModalData | null>(null);

  const returnRequests = order.returnRequests ?? [];
  if (returnRequests.length === 0) return null;

  const handleSimpleReview = async (
    requestId: string,
    action: 'APPROVE' | 'REJECT',
  ) => {
    setProcessingId(requestId);
    try {
      const res = await orderRequester.reviewReturnRequest(requestId, {
        action,
      });
      onShowToast(res.message);
      onReviewed();
    } catch (err: unknown) {
      onShowToast(
        err instanceof Error
          ? err.message
          : isTh
            ? 'เกิดข้อผิดพลาดในการตรวจสอบคำขอคืนสินค้า'
            : 'Failed to review return request',
      );
    } finally {
      setProcessingId(null);
    }
  };

  const handleInspectRefund = async () => {
    if (!inspectModal) return;
    setProcessingId(inspectModal.id);
    try {
      const parsedAmount = parseFloat(inspectModal.amount);
      const res = await orderRequester.reviewReturnRequest(inspectModal.id, {
        action: 'COMPLETE',
        refundAmount: isNaN(parsedAmount) ? undefined : parsedAmount,
        adminNote: inspectModal.adminNote.trim() || undefined,
        restockInventory: inspectModal.restock,
      });
      onShowToast(res.message);
      setInspectModal(null);
      onReviewed();
    } catch (err: unknown) {
      onShowToast(
        err instanceof Error
          ? err.message
          : isTh
            ? 'เกิดข้อผิดพลาดในการคืนเงิน'
            : 'Failed to process refund',
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="bg-white border border-brand-border rounded-md shadow-2xs overflow-hidden">
      <div className="px-5 py-3.5 border-b border-brand-border bg-stone-50/50 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <RotateCw className="w-4 h-4 text-brand-dark-brown" />
          <h3 className="text-xs font-bold text-stone-900 tracking-wider uppercase">
            {t('orders.return.sectionTitle')}
          </h3>
        </div>
      </div>

      <div className="p-5 space-y-4">
        {returnRequests.map((req) => (
          <div
            key={req.id}
            className="p-4 border border-brand-border rounded-xs bg-stone-50/30 space-y-3"
          >
            <div className="flex items-center justify-between">
              <span className="font-mono text-xs font-bold text-stone-800">
                {req.requestNumber}
              </span>
              <span
                className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full inline-flex items-center space-x-1 ${
                  req.status === 'REQUESTED'
                    ? 'bg-amber-100 text-amber-800 border border-amber-300'
                    : req.status === 'APPROVED'
                      ? 'bg-blue-100 text-blue-800 border border-blue-300'
                      : req.status === 'COMPLETED'
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                        : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {req.status === 'REQUESTED' ? (
                  <Clock className="w-3 h-3 mr-1" />
                ) : req.status === 'APPROVED' ? (
                  <PackageCheck className="w-3 h-3 mr-1" />
                ) : req.status === 'COMPLETED' ? (
                  <CheckCircle2 className="w-3 h-3 mr-1" />
                ) : (
                  <XCircle className="w-3 h-3 mr-1" />
                )}
                {t(`orders.return.status.${req.status}`)}
              </span>
            </div>

            <div className="text-xs space-y-1">
              <div className="flex items-baseline space-x-2">
                <span className="text-stone-500 font-semibold">
                  {t('orders.return.reason')}:
                </span>
                <span className="text-stone-800 font-medium">{req.reason}</span>
              </div>
              {req.customerNote && (
                <div className="flex items-baseline space-x-2">
                  <span className="text-stone-500 font-semibold">
                    {t('orders.return.customerNote')}:
                  </span>
                  <span className="text-stone-700 italic">
                    {req.customerNote}
                  </span>
                </div>
              )}
            </div>

            {/* Returned Items List */}
            {req.items && req.items.length > 0 && (
              <div className="pt-2 border-t border-brand-border/40 text-xs">
                <span className="text-stone-500 font-bold uppercase tracking-wider text-[10px] block mb-1">
                  {t('orders.return.itemsLabel')}
                </span>
                <div className="space-y-1">
                  {req.items.map((item) => {
                    const matched = order.items.find((i) => i.id === item.orderItemId);
                    return (
                      <div
                        key={item.id}
                        className="flex justify-between items-center text-stone-700 bg-white px-2.5 py-1.5 border border-brand-border/60 rounded-xs"
                      >
                        <span className="font-medium truncate max-w-xs">
                          {matched?.productName ?? item.orderItemId}
                        </span>
                        <span className="font-mono text-stone-500 text-[11px]">
                          x{item.quantity}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Action Bar based on state */}
            {req.status === 'REQUESTED' && (
              <div className="pt-2 border-t border-brand-border/60 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => handleSimpleReview(req.id, 'REJECT')}
                  disabled={processingId === req.id}
                  className="px-3 py-1.5 border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
                >
                  {t('orders.return.rejectButton')}
                </button>
                <button
                  type="button"
                  onClick={() => handleSimpleReview(req.id, 'APPROVE')}
                  disabled={processingId === req.id}
                  className="px-3 py-1.5 bg-blue-700 text-white hover:bg-blue-800 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
                >
                  {t('orders.return.approveShipButton')}
                </button>
              </div>
            )}

            {req.status === 'APPROVED' && (
              <div className="pt-2 border-t border-brand-border/60 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() =>
                    setInspectModal({
                      id: req.id,
                      maxAmount: order.totalAmount,
                      amount: order.totalAmount.toString(),
                      adminNote: '',
                      restock: true,
                    })
                  }
                  className="px-3 py-1.5 bg-emerald-700 text-white hover:bg-emerald-800 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center space-x-1 cursor-pointer"
                >
                  <PackageCheck className="w-3.5 h-3.5" />
                  <span>{t('orders.return.inspectAndRefundButton')}</span>
                </button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Inspect & Refund Input Modal */}
      <OrderReturnInspectModal
        modalData={inspectModal}
        isProcessing={processingId === inspectModal?.id}
        onClose={() => setInspectModal(null)}
        onChange={setInspectModal}
        onConfirm={handleInspectRefund}
      />
    </div>
  );
};
