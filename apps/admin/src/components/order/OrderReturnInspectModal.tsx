import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export interface ReturnInspectModalData {
  id: string;
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
  const { t } = useLanguage();

  if (!modalData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-md max-w-md w-full border border-brand-border shadow-2xl p-6 space-y-4">
        <h3 className="text-sm font-bold text-stone-900 tracking-tight">
          {t('orders.return.inspectModalTitle')}
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <label className="block text-stone-700 font-bold uppercase tracking-wider text-[11px] mb-1">
              {t('orders.refund.amountLabel')}
            </label>
            <input
              type="number"
              value={modalData.amount}
              onChange={(e) =>
                onChange({ ...modalData, amount: e.target.value })
              }
              className="w-full px-3 py-2 border border-brand-border rounded-xs font-mono font-bold"
            />
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
              className="w-full px-3 py-2 border border-brand-border rounded-xs"
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

        <div className="flex justify-end space-x-2 pt-2 border-t border-brand-border">
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-stone-600 hover:text-stone-900 cursor-pointer"
          >
            {t('common.cancel')}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isProcessing}
            className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider rounded-xs cursor-pointer disabled:opacity-50"
          >
            {t('orders.return.confirmRefundButton')}
          </button>
        </div>
      </div>
    </div>
  );
};
