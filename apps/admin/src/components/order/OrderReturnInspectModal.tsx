import React from 'react';
import { Truck, Receipt, ExternalLink, PackageCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { formatPrice } from '../../utils';

export interface ReturnInspectModalData {
  id: string;
  requestNumber?: string;
  carrier?: string;
  trackingNumber?: string;
  shippingFee?: number;
  receiptUrl?: string;
  maxAmount: number;
  amount: string;
  adminNote: string;
  restock: boolean;
}

interface OrderReturnInspectModalProps {
  modalData: ReturnInspectModalData | null;
  isProcessing: boolean;
  onClose: () => void;
  onChange: (updated: ReturnInspectModalData) => void;
  onConfirm: () => void;
}

export const OrderReturnInspectModal: React.FC<OrderReturnInspectModalProps> = ({
  modalData,
  isProcessing,
  onClose,
  onChange,
  onConfirm,
}) => {
  const { t, isTh } = useLanguage();

  if (!modalData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-md max-w-md w-full border border-brand-border shadow-2xl p-6 space-y-4">
        <div>
          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-800 block">
            {t('orders.return.inspectModalTitle')}
          </span>
          <h3 className="text-base font-bold text-stone-900 tracking-tight font-mono mt-0.5">
            {modalData.requestNumber ?? modalData.id}
          </h3>
        </div>

        {/* Return Tracking & Reimbursement Info */}
        {(modalData.trackingNumber || modalData.shippingFee !== undefined) && (
          <div className="p-3 bg-purple-50/70 border border-purple-200/80 rounded-xs space-y-2 text-xs">
            <div className="flex items-center space-x-1.5 font-bold uppercase tracking-wider text-[10px] text-purple-950">
              <Truck size={13} className="text-purple-700" />
              <span>{t('orders.return.inspectCarrierLabel')}</span>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-1.5 font-mono text-xs font-bold text-purple-900">
                <span>{modalData.carrier ?? 'Courier'}:</span>
                <span className="bg-white px-2 py-0.5 rounded-xs border border-purple-200">
                  {modalData.trackingNumber ?? '-'}
                </span>
              </div>

              {modalData.shippingFee !== undefined && modalData.shippingFee > 0 && (
                <div className="flex items-center space-x-1 text-[11px] font-bold text-stone-800 bg-white px-2 py-0.5 rounded-xs border border-purple-200">
                  <Receipt size={12} className="text-emerald-700" />
                  <span>{t('orders.return.inspectShippingFeeClaim')}:</span>
                  <span className="font-mono text-emerald-800">
                    {formatPrice(modalData.shippingFee)}
                  </span>
                </div>
              )}
            </div>

            {modalData.receiptUrl && (
              <div className="pt-1 border-t border-purple-200/50">
                <a
                  href={modalData.receiptUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-[11px] font-bold text-purple-800 hover:text-purple-950 hover:underline"
                >
                  <span>{t('orders.return.inspectReceiptSlip')}</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            )}
          </div>
        )}

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-stone-700 font-bold uppercase tracking-wider text-[11px] mb-1">
              {t('orders.refund.amountLabel')} (THB)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={modalData.amount}
              onChange={(e) =>
                onChange({ ...modalData, amount: e.target.value })
              }
              className="w-full px-3 py-2 border border-brand-border rounded-xs font-mono font-bold text-sm text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-brand-dark-brown"
            />
            {modalData.shippingFee !== undefined && modalData.shippingFee > 0 && (
              <span className="text-[10px] text-stone-500 mt-1 block">
                {isTh
                  ? `(ยอดรวมสินค้า + ค่าส่งคืน ${formatPrice(modalData.shippingFee)})`
                  : `(Includes returned items + shipping reimbursement ${formatPrice(modalData.shippingFee)})`}
              </span>
            )}
          </div>

          <div>
            <label className="block text-stone-700 font-bold uppercase tracking-wider text-[11px] mb-1">
              {t('orders.cancellation.adminNote')}
            </label>
            <input
              type="text"
              value={modalData.adminNote}
              onChange={(e) =>
                onChange({ ...modalData, adminNote: e.target.value })
              }
              placeholder={t('orders.return.inspectNotePlaceholder')}
              className="w-full px-3 py-2 border border-brand-border rounded-xs text-xs text-stone-900 focus:outline-hidden focus:ring-1 focus:ring-brand-dark-brown"
            />
          </div>

          <label className="flex items-center space-x-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={modalData.restock}
              onChange={(e) =>
                onChange({ ...modalData, restock: e.target.checked })
              }
              className="w-4 h-4 text-brand-dark-brown border-brand-border rounded-xs"
            />
            <span className="font-medium text-stone-800">
              {t('orders.refund.restockCheckbox')}
            </span>
          </label>
        </div>

        <div className="flex justify-end space-x-2 pt-3 border-t border-brand-border">
          <button
            type="button"
            onClick={onClose}
            disabled={isProcessing}
            className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider rounded-xs cursor-pointer disabled:opacity-50 flex items-center space-x-1.5 shadow-2xs"
          >
            <PackageCheck size={14} />
            <span>{t('orders.return.confirmRefundButton')}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
