'use client';

import React from 'react';
import { AlertTriangle, X, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { PriceMismatchItem } from '@repo/types';

export interface PriceMismatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  mismatches: PriceMismatchItem[];
  onAcceptAndProceed: () => void;
  isSubmitting?: boolean;
}

export function PriceMismatchModal({
  isOpen,
  onClose,
  mismatches,
  onAcceptAndProceed,
  isSubmitting = false,
}: PriceMismatchModalProps) {
  const { t } = useLanguage();

  if (!isOpen || mismatches.length === 0) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-xl max-w-lg w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col font-sans">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-stone-200 bg-stone-50/70 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200 shrink-0 shadow-2xs">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-stone-900 tracking-tight">
                {t('checkout.priceMismatchTitle')}
              </h2>
              <p className="text-[11px] text-stone-500 font-medium">
                {mismatches.length} {mismatches.length === 1 ? 'item updated' : 'items updated'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="text-stone-400 hover:text-stone-700 transition-colors p-1.5 rounded-md hover:bg-stone-100 cursor-pointer disabled:opacity-50"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <p className="text-xs text-stone-600 leading-relaxed">
            {t('checkout.priceMismatchDesc')}
          </p>

          {/* Mismatch Items Table */}
          <div className="border border-stone-200 rounded-lg overflow-hidden bg-stone-50/40">
            <div className="grid grid-cols-12 px-4 py-2 bg-stone-100/70 border-b border-stone-200 text-[10px] uppercase font-bold tracking-wider text-stone-500">
              <div className="col-span-6">{t('checkout.colProduct')}</div>
              <div className="col-span-3 text-right">{t('checkout.colPreviousPrice')}</div>
              <div className="col-span-3 text-right">{t('checkout.colCurrentPrice')}</div>
            </div>

            <div className="divide-y divide-stone-100 max-h-56 overflow-y-auto bg-white">
              {mismatches.map((item) => {
                const isPriceIncrease = item.currentPrice > item.expectedPrice;
                return (
                  <div
                    key={item.variantId}
                    className="grid grid-cols-12 px-4 py-3 text-xs items-center gap-2"
                  >
                    <div className="col-span-6 min-w-0 pr-2">
                      <p className="font-semibold text-stone-900 truncate text-[11px]">
                        {item.productName}
                      </p>
                    </div>
                    <div className="col-span-3 text-right font-mono text-[11px] text-stone-400 line-through">
                      ฿{item.expectedPrice.toLocaleString()}
                    </div>
                    <div className="col-span-3 text-right flex items-center justify-end gap-1">
                      <ArrowRight className="w-2.5 h-2.5 text-stone-300 shrink-0" />
                      <span
                        className={`font-mono text-[11px] font-bold ${
                          isPriceIncrease ? 'text-amber-700' : 'text-emerald-700'
                        }`}
                      >
                        ฿{item.currentPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <button
              type="button"
              onClick={onAcceptAndProceed}
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs transition-colors shadow-xs cursor-pointer disabled:opacity-50 text-center"
            >
              {isSubmitting ? t('common.loading') : t('checkout.acceptNewPrices')}
            </button>
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="py-2.5 px-4 rounded-lg border border-stone-200 hover:bg-stone-50 text-stone-700 font-medium text-xs transition-colors cursor-pointer disabled:opacity-50 text-center"
            >
              {t('checkout.returnToCart')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
