'use client';

import React, { useEffect } from 'react';
import Image from 'next/image';
import { Package, X, ShieldCheck } from 'lucide-react';
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
        className="bg-white border border-brand-border w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 sm:px-8 py-5 border-b border-brand-border bg-brand-warm-cream shrink-0">
          <div>
            <h3 className="text-base sm:text-lg font-black uppercase tracking-wider text-brand-brown">
              {t('orderDetail.snapshotModalTitle')}
            </h3>
            <p className="text-xs text-stone-500 mt-0.5">
              {t('orderDetail.snapshotModalSubtitle')} •{' '}
              <span className="font-mono text-stone-600 font-bold">{skuCode}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-black/5 text-stone-400 hover:text-brand-brown flex items-center justify-center transition-colors cursor-pointer"
            aria-label={t('orderDetail.close')}
          >
            <X size={20} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 sm:p-8 space-y-5 overflow-y-auto flex-1">
          {/* Transparency / Integrity Notice */}
          <div className="p-4 bg-[#FAF7F2] border border-brand-border/80 flex items-start space-x-3 text-xs text-stone-700">
            <ShieldCheck size={18} className="text-brand-brown shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-brown block">
                {isTh ? 'บันทึกข้อมูลถาวร (Immutable Purchase Snapshot)' : 'Immutable Purchase Snapshot'}
              </span>
              <p className="leading-relaxed text-[11px] text-stone-600">
                {t('orderDetail.snapshotNotice')}
              </p>
            </div>
          </div>

          {/* Product Overview Box */}
          <div className="flex flex-col sm:flex-row gap-5 p-5 border border-brand-border bg-brand-warm-cream/30">
            <div className="w-24 h-28 bg-white border border-brand-border overflow-hidden shrink-0 relative flex items-center justify-center shadow-2xs">
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

            <div className="space-y-3 flex-1 min-w-0">
              <div>
                <h4 className="font-bold text-base text-brand-brown truncate">
                  {productName}
                </h4>
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-mono font-bold bg-white border border-stone-200 text-stone-700">
                    {t('orderDetail.skuLabel')}: {skuCode}
                  </span>
                  {snapshot?.department && (
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-brand-cream border border-brand-border text-brand-brown">
                      {snapshot.department}
                    </span>
                  )}
                  {snapshot?.categoryName && (
                    <span className="inline-flex items-center px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-600 border border-stone-200">
                      {snapshot.categoryName}
                    </span>
                  )}
                </div>
              </div>

              {/* Price & Variant Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-brand-border/60 text-xs">
                <div>
                  <span className="text-[10px] text-stone-500 font-black uppercase tracking-wider block">
                    {t('orderDetail.colorLabel')}
                  </span>
                  <div className="flex items-center space-x-1.5 mt-1">
                    {snapshot?.colorHex && (
                      <span
                        className="w-3 h-3 rounded-full border border-black/20 shrink-0 shadow-2xs"
                        style={{ backgroundColor: snapshot.colorHex }}
                      />
                    )}
                    <span className="font-bold text-stone-800 text-xs truncate">
                      {colorName ?? item.variantInfo}
                    </span>
                  </div>
                </div>

                <div>
                  <span className="text-[10px] text-stone-500 font-black uppercase tracking-wider block">
                    {t('orderDetail.sizeLabel')}
                  </span>
                  <span className="font-mono font-bold text-stone-800 text-xs mt-1 block">
                    {snapshot?.size ?? '-'}
                  </span>
                </div>

                <div>
                  <span className="text-[10px] text-stone-500 font-black uppercase tracking-wider block">
                    {t('orderDetail.basePriceLabel')}
                  </span>
                  <span className="font-mono font-bold text-brand-brown text-xs mt-1 block">
                    ฿{Number(item.unitPrice).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Materials & Care */}
          {materialsCare && (
            <div className="border border-brand-border p-5 space-y-1.5 bg-white">
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
            <div className="border border-brand-border p-5 space-y-1.5 bg-white">
              <span className="text-[10px] font-black uppercase tracking-wider text-brand-brown block">
                {t('orderDetail.descriptionLabel')}
              </span>
              <p className="text-xs text-stone-600 whitespace-pre-line leading-relaxed">
                {description}
              </p>
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end px-6 sm:px-8 py-4 bg-brand-warm-cream/50 border-t border-brand-border shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="bg-brand-brown hover:bg-brand-amber text-white px-7 py-2.5 text-xs font-black uppercase tracking-widest transition-colors cursor-pointer shadow-md inline-flex items-center space-x-2"
          >
            <span>{t('orderDetail.close')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
