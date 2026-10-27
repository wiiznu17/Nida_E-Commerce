import React from 'react';
import Image from 'next/image';
import { Tag, X, Loader2, Lock, Info } from 'lucide-react';
import { useLanguage, getProductTitle } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
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
  const { isAuthenticated } = useAuth();

  return (
    <div className="w-full lg:w-[460px] xl:w-[500px] shrink-0 bg-brand-warm-cream p-6 sm:p-8 h-fit border border-brand-border shadow-xs">
      <h3 className="font-black text-sm sm:text-base uppercase tracking-wider text-brand-brown pb-3.5 border-b border-stone-300 mb-5">
        {t('checkout.orderSummary')} ({items.length} {t('catalog.items')})
      </h3>

      {/* Item Thumbnails */}
      <div className="space-y-4 mb-6 max-h-88 overflow-y-auto pt-2.5 pr-2.5 -mr-1.5">
        {items.map((item, index) => {
          const itemTitle = getProductTitle(item, language);
          return (
            <div
              key={`${item.variantId || item.id}-${index}`}
              className="flex gap-4 sm:gap-5 items-center"
            >
              <div className="w-20 h-24 sm:w-22 sm:h-26 bg-stone-100 shrink-0 relative border border-stone-200">
                {item.image && (
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                )}
                <span className="absolute -top-2 -right-2 bg-brand-brown text-white text-[11px] font-bold min-w-5.5 h-5.5 px-1.5 rounded-full flex items-center justify-center shadow-xs z-10 font-mono leading-none border border-white">
                  {item.quantity}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-sm text-brand-brown truncate">
                  {itemTitle}
                </h4>
                <p className="text-xs text-stone-500 uppercase font-medium mt-0.5">
                  {item.selectedColor} • {item.selectedSize} • {language === 'th' ? `จำนวน: ${item.quantity}` : `Qty: ${item.quantity}`}
                </p>
                <p className="text-sm font-black text-brand-brown mt-1.5 font-mono">
                  ฿{(item.price * item.quantity).toLocaleString()}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Promo Code Input or Applied Banner */}
      {!isAuthenticated ? (
        <div className="mb-6 pb-6 border-b border-stone-300">
          <div
            className="relative group"
            title={t('checkout.couponReasonAccountRequired')}
          >
            <div className="flex gap-2">
              <input
                type="text"
                disabled
                placeholder={t('checkout.promoCode')}
                className="flex-1 border border-stone-200 px-3.5 py-2.5 text-xs sm:text-sm uppercase bg-stone-100 text-stone-400 font-mono cursor-not-allowed select-none placeholder:text-stone-400"
              />
              <button
                type="button"
                disabled
                className="bg-stone-200 text-stone-400 px-5 py-2.5 text-xs sm:text-sm font-bold uppercase tracking-wider cursor-not-allowed select-none shrink-0"
              >
                {t('checkout.apply')}
              </button>
            </div>
            {/* Info tooltip on hover */}
            <div className="pointer-events-none absolute left-0 -top-8 hidden group-hover:flex items-center gap-1.5 bg-stone-900 text-white text-[11px] px-2.5 py-1 rounded-xs shadow-lg whitespace-nowrap z-20">
              <Info size={12} className="text-brand-amber shrink-0" />
              <span>{t('checkout.couponReasonAccountRequired')}</span>
            </div>
          </div>
        </div>
      ) : appliedCoupon ? (
        <div className="flex items-center justify-between text-xs sm:text-sm text-emerald-800 font-bold mb-6 bg-emerald-50 p-3.5 border border-emerald-300 rounded-xs">
          <div className="flex items-center space-x-2.5">
            <Tag size={16} className="text-emerald-700 shrink-0" />
            <div>
              <span className="font-mono uppercase tracking-wider">
                {appliedCoupon.code}
              </span>
              <span className="text-xs text-emerald-600 block font-normal">
                {appliedCoupon.discountType === 'PERCENTAGE'
                  ? `${appliedCoupon.discountValue}% OFF${
                      appliedCoupon.maxDiscountAmount
                        ? ` (${t('checkout.maxDiscountBadge', 'สูงสุด ฿{max}').replace(
                            '{max}',
                            appliedCoupon.maxDiscountAmount.toLocaleString(),
                          )})`
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
        <div className="mb-6 pb-6 border-b border-stone-300">
          <form onSubmit={onApplyPromo} className="flex gap-2">
            <input
              type="text"
              value={promoCode}
              onChange={(e) => onSetPromoCode(e.target.value.toUpperCase())}
              placeholder={t('checkout.promoCode')}
              className="flex-1 border border-stone-300 px-3.5 py-2.5 text-xs sm:text-sm uppercase focus:outline-hidden focus:border-brand-brown bg-white font-mono placeholder:normal-case placeholder:text-gray-400"
            />
            <button
              type="submit"
              disabled={isApplyingCoupon || !promoCode.trim()}
              className="bg-brand-brown hover:bg-brand-amber disabled:opacity-50 disabled:cursor-not-allowed text-white px-5 py-2.5 text-xs sm:text-sm font-black uppercase tracking-wider transition-colors cursor-pointer flex items-center justify-center shrink-0"
            >
              {isApplyingCoupon ? (
                <Loader2 size={14} className="animate-spin" />
              ) : (
                t('checkout.apply')
              )}
            </button>
          </form>
          {couponError && promoCode.trim().length > 0 && (
            <p className="text-xs text-rose-600 mt-2 font-medium">
              {couponError}
            </p>
          )}
        </div>
      )}

      {/* Cost Breakdown */}
      <div className="space-y-3 text-xs sm:text-sm font-semibold text-stone-600 pb-5 border-b border-stone-300">
        <div className="flex justify-between items-center">
          <span>{t('checkout.orderSummary')}</span>
          <span className="text-brand-brown font-bold font-mono shrink-0 ml-4">
            ฿{cartTotal.toLocaleString()}
          </span>
        </div>
        {discountAmount > 0 && (
          <div className="flex justify-between items-center text-emerald-700 font-bold">
            <span>{t('checkout.discount')}</span>
            <span className="font-mono shrink-0 ml-4">
              -฿{discountAmount.toLocaleString()}
            </span>
          </div>
        )}
        <div className="flex justify-between items-center">
          <span>{t('checkout.shipping')}</span>
          <span className="font-mono shrink-0 ml-4">
            {isFreeShipping ? (
              <span className="text-emerald-700 font-bold uppercase font-sans">
                {t('checkout.free')}
              </span>
            ) : (
              `฿${shippingFee.toLocaleString()}`
            )}
          </span>
        </div>
        <div className="text-[11px] text-stone-400 pt-0.5">
          {t('checkout.taxIncluded')}
        </div>
      </div>

      {/* Total Amount */}
      <div className="flex justify-between items-center pt-5">
        <span className="font-black text-sm sm:text-base uppercase text-brand-brown">
          {t('checkout.total')}
        </span>
        <span className="font-black text-2xl sm:text-3xl text-brand-brown font-mono shrink-0 ml-4">
          ฿{finalTotal.toLocaleString()}
        </span>
      </div>
    </div>
  );
}
