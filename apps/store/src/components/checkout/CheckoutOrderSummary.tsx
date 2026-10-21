import React from 'react';
import Image from 'next/image';
import { Tag, X, Loader2 } from 'lucide-react';
import { useLanguage, getProductTitle } from '@/context/LanguageContext';
import type { CartItem } from '@/context/CartContext';
import type { ApiCoupon } from '@repo/types';

interface CheckoutOrderSummaryProps {
  items: CartItem[];
  cartTotal: number;
  discountAmount: number;
  shippingFee: number;
  isFreeShipping: boolean;
  finalTotal: number;
  appliedCoupon: ApiCoupon | null;
  couponError: string | null;
  isApplyingCoupon: boolean;
  promoCode: string;
  onSetPromoCode: (code: string) => void;
  onApplyPromo: (e: React.FormEvent) => void;
  onRemoveCoupon: () => void;
}

export function CheckoutOrderSummary({
  items,
  cartTotal,
  discountAmount,
  shippingFee,
  isFreeShipping,
  finalTotal,
  appliedCoupon,
  couponError,
  isApplyingCoupon,
  promoCode,
  onSetPromoCode,
  onApplyPromo,
  onRemoveCoupon,
}: CheckoutOrderSummaryProps) {
  const { language, t } = useLanguage();

  return (
    <div className="lg:w-96 bg-brand-warm-cream p-6 h-fit border border-brand-border shadow-xs">
      <h3 className="font-black text-sm uppercase tracking-wider text-brand-brown pb-3 border-b border-gray-300 mb-4">
        {t('checkout.orderSummary')} ({items.length} {t('catalog.items')})
      </h3>

      {/* Item Thumbnails */}
      <div className="space-y-4 mb-6 max-h-72 overflow-y-auto pr-1">
        {items.map((item, index) => {
          const itemTitle = getProductTitle(item, language);
          return (
            <div
              key={`${item.variantId || item.id}-${index}`}
              className="flex gap-4 items-center"
            >
              <div className="w-16 h-20 bg-gray-100 shrink-0 relative border border-gray-200">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                )}
                <span className="absolute -top-1.5 -right-1.5 bg-brand-brown text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs text-brand-brown truncate">
                  {itemTitle}
                </h4>
                <p className="text-[10px] text-gray-500 uppercase font-semibold">
                  {item.selectedColor} • {item.selectedSize}
                </p>
                <p className="text-xs font-black text-brand-brown mt-1 font-mono">
                  ฿{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Promo Code Input or Applied Banner */}
      {appliedCoupon ? (
        <div className="flex items-center justify-between text-xs text-emerald-800 font-bold mb-6 bg-emerald-50 p-3 border border-emerald-300 rounded-xs">
          <div className="flex items-center space-x-2">
            <Tag size={16} className="text-emerald-700 shrink-0" />
            <div>
              <span className="font-mono uppercase tracking-wider">
                {appliedCoupon.code}
              </span>
              <span className="text-[11px] text-emerald-600 block font-normal">
                {appliedCoupon.discountType === 'PERCENTAGE'
                  ? `${appliedCoupon.discountValue}% OFF${
                      appliedCoupon.maxDiscountAmount
                        ? ` (Max ฿${appliedCoupon.maxDiscountAmount})`
                        : ''
                    }`
                  : appliedCoupon.discountType === 'FREE_SHIPPING'
                    ? t('checkout.freeShippingQualified')
                    : `฿${appliedCoupon.discountValue} OFF`}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemoveCoupon}
            className="text-gray-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
            title={t('checkout.removeCoupon')}
            aria-label={t('checkout.removeCoupon')}
          >
            <X size={16} />
          </button>
        </div>
      ) : (
        <div className="mb-6 pb-6 border-b border-gray-300">
          <form onSubmit={onApplyPromo} className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => onSetPromoCode(e.target.value.toUpperCase())}
              placeholder={t('checkout.promoCode')}
              className="flex-1 border border-gray-300 px-3 py-2 text-xs uppercase focus:outline-hidden focus:border-brand-brown bg-white font-mono placeholder:normal-case placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={isApplyingCoupon || !promoCode.trim()}
              className="bg-brand-brown hover:bg-brand-amber disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center shrink-0"
            >
              {isApplyingCoupon ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                t('checkout.apply')
              )}
            </button>
          </form>
          {couponError && (
            <p className="text-[11px] text-rose-600 mt-2 font-medium">
              {couponError}
            </p>
          )}
        </div>
      )}

      {/* Cost Breakdown */}
      <div className="space-y-2.5 text-xs font-semibold text-gray-600 pb-4 border-b border-gray-300">
        <div className="flex justify-between">
          <span>{t('checkout.orderSummary')}</span>
          <span className="text-brand-brown font-bold font-mono">
            ฿{cartTotal.toLocaleString()}
          </span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between text-emerald-700 font-bold">
            <span>{t('checkout.discount')}</span>
            <span className="font-mono">
              -฿{discountAmount.toLocaleString()}
            </span>
          </div>
        )}
        <div className="flex justify-between">
          <span>{t('checkout.shipping')}</span>
          <span className="font-mono">
            {isFreeShipping ? (
              <span className="text-emerald-700 font-bold uppercase font-sans">
                {t('checkout.free')}
              </span>
            ) : (
              `฿${shippingFee.toLocaleString()}`
            )}
          </span>
        </div>
        <div className="text-[10px] text-gray-400 pt-1">
          {t('checkout.taxIncluded')}
        </div>
      </div>

      {/* Total Amount */}
      <div className="flex justify-between items-center pt-4">
        <span className="font-black text-sm uppercase text-brand-brown">
          {t('checkout.total')}
        </span>
        <span className="font-black text-xl text-brand-brown font-mono">
          ฿{finalTotal.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
