import React from 'react';
import { ShoppingBag, Check, Heart } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface ProductActionsProps {
  isAdded: boolean;
  isWish: boolean;
  hasSelectedSize?: boolean;
  isUnavailable?: boolean;
  isOutOfStock?: boolean;
  onAddToCart: () => void;
  onToggleWishlist: () => void;
}

export function ProductActions({
  isAdded,
  isWish,
  hasSelectedSize = true,
  isUnavailable = false,
  isOutOfStock = false,
  onAddToCart,
  onToggleWishlist,
}: ProductActionsProps) {
  const { language, t } = useLanguage();
  const isTh = language === 'th';

  return (
    <div className="space-y-6 pt-2">
      {/* CTA Buttons */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={onAddToCart}
          disabled={!hasSelectedSize || isAdded || isUnavailable}
          className={`w-full py-4 text-xs uppercase tracking-[0.2em] font-black transition-all flex justify-center items-center space-x-2 shadow-md ${
            isAdded
              ? 'bg-emerald-600 text-white cursor-default'
              : !hasSelectedSize
                ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300 shadow-none'
                : isOutOfStock
                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300 shadow-none'
                  : isUnavailable
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed border border-stone-300 shadow-none'
                    : 'bg-brand-brown hover:bg-brand-amber text-white hover:shadow-lg cursor-pointer'
          }`}
        >
          {isAdded ? (
            <>
              <Check size={18} /> <span>{t('product.added')}</span>
            </>
          ) : !hasSelectedSize ? (
            <span>{isTh ? 'กรุณาเลือกขนาดไซส์' : 'SELECT A SIZE'}</span>
          ) : isOutOfStock ? (
            <span>{isTh ? 'สินค้าหมด' : 'OUT OF STOCK'}</span>
          ) : isUnavailable ? (
            <span>{isTh ? 'ปิดการขายชั่วคราว' : 'CURRENTLY UNAVAILABLE'}</span>
          ) : (
            <>
              <ShoppingBag size={18} /> <span>{t('product.addToBag')}</span>
            </>
          )}
        </button>

        <button
          type="button"
          onClick={onToggleWishlist}
          className="w-full py-3 text-xs uppercase tracking-widest font-black border border-gray-300 text-brand-brown hover:bg-gray-50 flex items-center justify-center space-x-2 transition-colors cursor-pointer"
        >
          <Heart
            size={16}
            className={isWish ? 'fill-brand-amber text-brand-amber' : ''}
          />
          <span>
            {isWish
              ? isTh
                ? 'บันทึกในรายการที่ถูกใจแล้ว'
                : 'SAVED TO WISHLIST'
              : isTh
                ? 'เพิ่มลงรายการที่ถูกใจ'
                : 'ADD TO WISHLIST'}
          </span>
        </button>
      </div>
    </div>
  );
}
