import React, { useState } from 'react';
import {
  RotateCw,
  CheckCircle2,
  XCircle,
  Clock,
  PackageCheck,
  Truck,
  ExternalLink,
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { orderRequester } from '../../api/requester/orderRequester';
import { formatOrderDateTime, formatPrice } from '../../utils';
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
  const { t, isTh, language } = useLanguage();
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
                      : req.status === 'SHIPPED'
                        ? 'bg-purple-100 text-purple-800 border border-purple-300'
                        : req.status === 'COMPLETED'
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-rose-100 text-rose-800 border border-rose-300'
                }`}
              >
                {req.status === 'REQUESTED' ? (
                  <Clock className="w-3 h-3 mr-1" />
                ) : req.status === 'APPROVED' ? (
                  <PackageCheck className="w-3 h-3 mr-1" />
                ) : req.status === 'SHIPPED' ? (
                  <Truck className="w-3 h-3 mr-1" />
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
                    "{req.customerNote}"
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

            {/* Return Shipment Details Card (if submitted by customer) */}
            {req.returnTrackingNumber && (
              <div className="pt-2 border-t border-brand-border/40 text-xs space-y-2">
                <span className="text-[10px] font-black uppercase tracking-wider text-purple-900 flex items-center space-x-1.5">
                  <Truck size={13} className="text-purple-700" />
                  <span>{t('orders.return.shipmentDetailsTitle')}</span>
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 bg-white p-3 border border-brand-border/60 rounded-xs">
                  <div>
                    <span className="block text-[10px] text-stone-400 font-bold uppercase">
                      {t('orders.return.carrierLabel')}
                    </span>
                    <span className="font-semibold text-stone-800 text-xs">
                      {req.returnCarrier || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="block text-[10px] text-stone-400 font-bold uppercase">
                      {t('orders.return.trackingLabel')}
                    </span>
                    <span className="font-mono font-bold text-stone-900 text-xs">
                      {req.returnTrackingNumber}
                    </span>
                  </div>
                  {req.shippedAt && (
                    <div>
                      <span className="block text-[10px] text-stone-400 font-bold uppercase">
                        {t('orders.return.shippedDateLabel')}
                      </span>
                      <span className="font-mono text-stone-700 text-[11px]">
                        {formatOrderDateTime(req.shippedAt, language)}
                      </span>
                    </div>
                  )}
                  {req.returnShippingFee !== undefined && req.returnShippingFee > 0 && (
                    <div>
                      <span className="block text-[10px] text-stone-400 font-bold uppercase">
                        {t('orders.return.shippingFeeLabel')}
                      </span>
                      <span className="font-mono font-bold text-emerald-700 text-xs">
                        {formatPrice(req.returnShippingFee)}
                      </span>
                    </div>
                  )}
                  {req.returnShippingReceiptUrl && (
                    <div className="col-span-2">
                      <span className="block text-[10px] text-stone-400 font-bold uppercase mb-0.5">
                        {t('orders.return.receiptSlipLabel')}
                      </span>
                      <a
                        href={req.returnShippingReceiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-brand-brown hover:underline inline-flex items-center space-x-1"
                      >
                        <ExternalLink size={12} />
                        <span>{t('orders.return.viewReceiptSlip')}</span>
                      </a>
                    </div>
                  )}
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

            {(req.status === 'APPROVED' || req.status === 'SHIPPED') && (
              <div className="pt-2 border-t border-brand-border/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                {req.status === 'APPROVED' && !req.returnTrackingNumber ? (
                  <div className="flex items-center space-x-1.5 text-[11px] text-amber-800 bg-amber-50 px-2.5 py-1.5 rounded-xs border border-amber-200">
                    <Clock className="w-3.5 h-3.5 shrink-0 text-amber-600" />
                    <span>{t('orders.return.waitingForCustomerShipment')}</span>
                  </div>
                ) : (
                  <div className="flex items-center space-x-1.5 text-[11px] text-purple-900 bg-purple-50 px-2.5 py-1.5 rounded-xs border border-purple-200">
                    <Truck className="w-3.5 h-3.5 shrink-0 text-purple-700" />
                    <span>{t('orders.return.parcelDeliveredForInspection')}</span>
                  </div>
                )}

                <button
                  type="button"
                  disabled={req.status !== 'SHIPPED' || !req.returnTrackingNumber}
                  onClick={() =>
                    setInspectModal({
                      id: req.id,
                      maxAmount: order.totalAmount,
                      amount: (
                        order.totalAmount +
                        (req.returnShippingFee ? Number(req.returnShippingFee) : 0)
                      ).toString(),
                      adminNote: '',
                      restock: true,
                      shippingFee:
                        req.returnShippingFee !== undefined
                          ? Number(req.returnShippingFee)
                          : undefined,
                      receiptUrl: req.returnShippingReceiptUrl,
                      carrier: req.returnCarrier,
                      trackingNumber: req.returnTrackingNumber,
                    })
                  }
                  className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center space-x-1 shadow-2xs whitespace-nowrap ${
                    req.status === 'SHIPPED' && req.returnTrackingNumber
                      ? 'bg-emerald-700 text-white hover:bg-emerald-800 cursor-pointer'
                      : 'bg-stone-100 text-stone-400 border border-stone-200 cursor-not-allowed'
                  }`}
                  title={
                    req.status !== 'SHIPPED' || !req.returnTrackingNumber
                      ? t('orders.return.waitingForCustomerShipment')
                      : undefined
                  }
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
