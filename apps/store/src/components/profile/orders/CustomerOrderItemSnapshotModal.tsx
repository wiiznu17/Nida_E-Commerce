'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { Package, X } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiOrderItem } from '@repo/types';

export interface CustomerOrderItemSnapshotModalProps {
  item: ApiOrderItem | null;
  onClose: () => void;
}

export function CustomerOrderItemSnapshotModal({
  item,
  onClose,
}: CustomerOrderItemSnapshotModalProps) {
  const { t, isTh } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

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
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-md max-w-2xl w-full border border-brand-border shadow-2xl flex flex-col max-h-[90vh] overflow-hidden animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="p-4 bg-brand-cream border-b border-brand-border flex items-center justify-between shrink-0">
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-brand-brown">
              {t('orderDetail.snapshotModalTitle')}
            </h3>
            <p className="text-xs text-stone-500 font-mono mt-0.5">
              {skuCode}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-xs text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors cursor-pointer"
            aria-label={t('orderDetail.close')}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 overflow-y-auto space-y-4">
          {/* Product Overview Card */}
          <div className="flex flex-col sm:flex-row gap-4 p-4 border border-brand-border/60 rounded-xs bg-stone-50/40">
            <div className="w-24 h-28 bg-stone-100 border border-brand-border rounded-xs overflow-hidden shrink-0 relative flex items-center justify-center">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={productName}
                  fill
                  sizes="96px"
                  className="object-cover"
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
                    {t('orderDetail.skuLabel')}: {skuCode}
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
                    {t('orderDetail.colorLabel')}
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
                    {t('orderDetail.sizeLabel')}
                  </span>
                  <span className="font-mono font-bold text-stone-800 text-xs mt-0.5 block">
                    {snapshot?.size ?? '-'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                    {t('orderDetail.basePriceLabel')}
                  </span>
                  <span className="font-mono font-bold text-stone-900 text-xs mt-0.5 block">
                    ฿{Number(item.unitPrice).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Materials & Care */}
          {materialsCare && (
            <div className="border border-brand-border/60 rounded-xs p-3.5 space-y-1.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-brown block">
                {t('orderDetail.materialsCareLabel')}
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
                {t('orderDetail.descriptionLabel')}
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
            {t('orderDetail.close')}
          </button>
        </div>
      </div>
    </div>
  );
}
