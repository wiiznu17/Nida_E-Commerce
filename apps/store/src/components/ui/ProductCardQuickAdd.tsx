'use client';

import React, { useState } from 'react';
import { ShoppingBag, Check, X } from 'lucide-react';
import type { ApiProduct } from '@repo/types';
import { useLanguage } from '@/context/LanguageContext';
import { isOneSizeProduct, getProductSizes } from '@/utils';

export interface ProductCardQuickAddProps {
  product: ApiProduct;
  onAddToCart: (product: ApiProduct, size?: string, color?: string) => void;
  className?: string;
  buttonClassName?: string;
}

export const ProductCardQuickAdd: React.FC<ProductCardQuickAddProps> = ({
  product,
  onAddToCart,
  className = '',
  buttonClassName = '',
}) => {
  const { t } = useLanguage();
  const [isSelectingSize, setIsSelectingSize] = useState(false);
  const [isJustAdded, setIsJustAdded] = useState(false);

  const isOneSize = isOneSizeProduct(product);
  const availableSizes = getProductSizes(product);

  const defaultColor =
    product.colors && product.colors.length > 0
      ? (product.colors[0]?.name ?? 'Standard')
      : 'Standard';

  const handleInitialClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isJustAdded) return;

    if (isOneSize || availableSizes.length <= 1) {
      const chosenSize = availableSizes[0] ?? 'One Size';
      onAddToCart(product, chosenSize, defaultColor);
      setIsJustAdded(true);
      setTimeout(() => setIsJustAdded(false), 1500);
    } else {
      setIsSelectingSize(true);
    }
  };

  const handleSelectSize = (e: React.MouseEvent, size: string) => {
    e.preventDefault();
    e.stopPropagation();

    onAddToCart(product, size, defaultColor);
    setIsSelectingSize(false);
    setIsJustAdded(true);
    setTimeout(() => setIsJustAdded(false), 1500);
  };

  const handleClose = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsSelectingSize(false);
  };

  return (
    <div className={`relative w-full ${className}`}>
      {isSelectingSize ? (
        <div
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="w-full bg-white/95 backdrop-blur-xs border border-brand-warm-cream/40 shadow-xl p-2.5 rounded-xs transition-all duration-200 animate-in fade-in zoom-in-95"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-brand-brown">
              {t('product.selectSize')}
            </span>
            <button
              type="button"
              onClick={handleClose}
              className="p-1 text-gray-400 hover:text-brand-brown transition-colors cursor-pointer rounded-xs"
              aria-label="Close size selector"
            >
              <X size={12} />
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
            {availableSizes.map((size) => (
              <button
                key={size}
                type="button"
                onClick={(e) => handleSelectSize(e, size)}
                className="px-2.5 py-1 min-w-[32px] text-[11px] font-bold text-brand-brown bg-white border border-gray-200 hover:border-brand-brown hover:bg-brand-brown hover:text-white transition-colors rounded-xs shadow-2xs active:scale-95 cursor-pointer"
              >
                {size}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleInitialClick}
          disabled={isJustAdded}
          className={`w-full py-2.5 font-black text-[11px] uppercase tracking-widest transition-colors shadow-md flex items-center justify-center space-x-1.5 rounded-xs cursor-pointer ${
            isJustAdded
              ? 'bg-emerald-600 text-white'
              : 'bg-brand-brown hover:bg-brand-amber text-white'
          } ${buttonClassName}`}
        >
          {isJustAdded ? (
            <>
              <Check size={14} />
              <span>{t('home.addedToBag')}</span>
            </>
          ) : (
            <>
              <ShoppingBag size={14} />
              <span>{t('home.quickAdd')}</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
