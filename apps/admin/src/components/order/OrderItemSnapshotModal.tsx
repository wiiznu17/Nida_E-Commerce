import React from 'react';
import { Package, X, FileText, ShieldCheck } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { formatPrice } from '../../utils';
import type { ApiOrderItem } from '@repo/types';

export interface OrderItemSnapshotModalProps {
  item: ApiOrderItem | null;
  onClose: () => void;
}

export const OrderItemSnapshotModal: React.FC<OrderItemSnapshotModalProps> = ({
  item,
  onClose,
}) => {
  const { t, isTh } = useLanguage();

  if (!item) return null;

  const snapshot = item.productSnapshot;
  const imageUrl = item.imageUrlSnapshot ?? item.imageUrl;
  const skuCode = item.skuCodeSnapshot ?? item.skuCode ?? '-';

  const productName = isTh
    ? snapshot?.nameTh || item.productName
    : item.productName;

  const colorName = isTh
    ? snapshot?.colorNameTh || snapshot?.colorName
    : snapshot?.colorName;

  const materialsCare = isTh
    ? snapshot?.materialsCareTh || snapshot?.materialsCare
    : snapshot?.materialsCare;

  const description = isTh
    ? snapshot?.descriptionTh || snapshot?.description
    : snapshot?.description;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-md max-w-2xl w-full border border-brand-border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-4 bg-brand-cream border-b border-brand-border flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xs bg-brand-brown text-white flex items-center justify-center shrink-0">
              <FileText size={16} />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-brown block">
                {t('orders.detail.snapshotModalTitle')}
              </span>
              <p className="text-xs text-gray-500 font-mono">
                {skuCode}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-xs text-gray-400 hover:text-gray-700 hover:bg-gray-200/50 transition-colors cursor-pointer"
            aria-label={t('orders.detail.close')}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Historical Integrity Notice Banner */}
          <div className="p-3 bg-amber-50/70 border border-amber-200/70 rounded-xs flex items-start space-x-2.5 text-xs text-amber-900">
            <ShieldCheck size={16} className="text-amber-700 shrink-0 mt-0.5" />
            <p className="leading-relaxed text-[11px]">
              {t('orders.detail.snapshotNotice')}
            </p>
          </div>

          {/* Product Overview Card */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 border border-brand-border/60 rounded-xs bg-stone-50/40">
            <div className="w-24 h-28 bg-stone-100 border border-brand-border rounded-xs overflow-hidden shrink-0 flex items-center justify-center">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={productName}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package size={24} className="text-stone-400" />
              )}
            </div>

            <div className="space-y-2 flex-1 min-w-0">
              <div>
                <h4 className="font-bold text-sm text-stone-900 truncate">
                  {productName}
                </h4>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold bg-white border border-stone-200 text-stone-700">
                    {t('orders.detail.skuLabel')}: {skuCode}
                  </span>
                  {snapshot?.department && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider bg-brand-cream border border-brand-border text-brand-brown">
                      {snapshot.department}
                    </span>
                  )}
                  {snapshot?.categoryName && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-xs text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 border border-stone-200">
                      {snapshot.categoryName}
                    </span>
                  )}
                </div>
              </div>

              {/* Price & Variant Row */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-stone-200/60 text-xs">
                <div>
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                    {t('orders.detail.colorLabel')}
                  </span>
                  <div className="flex items-center space-x-1.5 mt-0.5">
                    {snapshot?.colorHex && (
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                        style={{ backgroundColor: snapshot.colorHex }}
                      />
                    )}
                    <span className="font-bold text-stone-800 text-xs">
                      {colorName ?? item.variantInfo}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                    {t('orders.detail.sizeLabel')}
                  </span>
                  <span className="font-mono font-bold text-stone-800 text-xs mt-0.5 block">
                    {snapshot?.size ?? '-'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                    {t('orders.detail.basePriceLabel')}
                  </span>
                  <span className="font-mono font-bold text-stone-900 text-xs mt-0.5 block">
                    {formatPrice(item.unitPrice)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Materials & Care */}
          {materialsCare && (
            <div className="border border-brand-border/60 rounded-xs p-3.5 space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-brown block">
                {t('orders.detail.materialsCareLabel')}
              </span>
              <p className="text-xs text-stone-700 whitespace-pre-line leading-relaxed">
                {materialsCare}
              </p>
            </div>
          )}

          {/* Description */}
          {description && (
            <div className="border border-brand-border/60 rounded-xs p-3.5 space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-brown block">
                {t('orders.detail.descriptionLabel')}
              </span>
              <p className="text-xs text-stone-600 whitespace-pre-line leading-relaxed">
                {description}
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-stone-50 border-t border-brand-border flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 bg-brand-brown text-white text-xs font-bold rounded-xs hover:bg-brand-brown/90 transition-colors cursor-pointer"
          >
            {t('orders.detail.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
