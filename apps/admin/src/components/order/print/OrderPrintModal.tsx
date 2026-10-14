import React, { useState } from 'react';
import { Printer, X, Tag, FileText } from 'lucide-react';
import type { OrderPrintModalProps, PrintDocumentType } from './printTypes';
import { OrderShippingLabel } from './OrderShippingLabel';
import { OrderPackingSlip } from './OrderPackingSlip';
import { useLanguage } from '../../../context/LanguageContext';
import { Button } from '../../ui';

export const OrderPrintModal: React.FC<OrderPrintModalProps> = ({
  isOpen,
  onClose,
  orders,
  initialDocType = 'LABEL',
}) => {
  const { t } = useLanguage();
  const [docType, setDocType] = useState<PrintDocumentType>(initialDocType);

  if (!isOpen || orders.length === 0) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      {/* Print CSS rules injected specifically for clean printing */}
      <style>{`
        @media print {
          body * {
            visibility: hidden !important;
          }
          #print-document-container,
          #print-document-container * {
            visibility: visible !important;
          }
          #print-document-container {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          .page-break {
            page-break-after: always !important;
            break-after: page !important;
          }
        }
      `}</style>

      <div className="bg-[#FAF7F2] border border-[#EAE3D9] w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl relative my-auto">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between p-4 border-b border-[#EAE3D9] bg-white no-print">
          <div className="flex items-center space-x-3">
            <div className="flex items-center bg-[#2B1810]/5 p-0.5 border border-[#2B1810]/20 rounded-xs">
              <button
                type="button"
                onClick={() => setDocType('LABEL')}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer rounded-xs ${
                  docType === 'LABEL'
                    ? 'bg-[#2B1810] text-[#FAF7F2]'
                    : 'text-[#2B1810]/70 hover:text-[#2B1810]'
                }`}
              >
                <Tag size={13} />
                <span>{t('orders.print.shippingLabelTab')}</span>
              </button>

              <button
                type="button"
                onClick={() => setDocType('PACKING_SLIP')}
                className={`inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer rounded-xs ${
                  docType === 'PACKING_SLIP'
                    ? 'bg-[#2B1810] text-[#FAF7F2]'
                    : 'text-[#2B1810]/70 hover:text-[#2B1810]'
                }`}
              >
                <FileText size={13} />
                <span>{t('orders.print.packingSlipTab')}</span>
              </button>
            </div>

            <span className="text-[11px] font-mono font-bold text-[#2B1810]/60 hidden sm:inline-block">
              {orders.length === 1
                ? `#${orders[0].orderNumber}`
                : `${orders.length} ${t('orders.print.selectedOrders')}`}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="default"
              size="sm"
              onClick={handlePrint}
              className="bg-[#2B1810] hover:bg-[#3D2217] text-[#FAF7F2] text-xs font-bold uppercase tracking-wider"
            >
              <Printer size={14} className="mr-1.5" />
              {t('orders.print.printAction')}
            </Button>

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-[#2B1810]/60 hover:text-[#2B1810] transition-colors cursor-pointer"
              aria-label="Close"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Scrollable Document Preview Area */}
        <div className="flex-1 overflow-y-auto p-6 bg-zinc-100/80">
          <div id="print-document-container" className="space-y-6">
            {orders.map((order, index) => (
              <div
                key={order.id || index}
                className={index < orders.length - 1 ? 'page-break mb-8' : ''}
              >
                {docType === 'LABEL' ? (
                  <OrderShippingLabel order={order} />
                ) : (
                  <OrderPackingSlip order={order} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Footer Guidance */}
        <div className="p-3 bg-white border-t border-[#EAE3D9] flex justify-between items-center text-[10px] text-[#2B1810]/60 no-print">
          <span className="font-mono">
            {docType === 'LABEL'
              ? t('orders.print.labelHint')
              : t('orders.print.slipHint')}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={onClose}
            className="text-xs uppercase tracking-wider font-bold"
          >
            {t('common.close')}
          </Button>
        </div>
      </div>
    </div>
  );
};
