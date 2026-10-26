'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, X, Check, Minus, Plus, Tag, Loader2, AlertTriangle } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage, getProductTitle } from '@/context/LanguageContext';
import { formatPrice } from '@/utils';

export function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    items,
    cartTotal,
    removeFromCart,
    updateQuantity,
    hasUnavailableItems,
    unavailableItemsCount,
    removeUnavailableItems,
    appliedCoupon,
    discountAmount,
    shippingFee,
    isFreeShipping,
    freeShippingRemaining,
    freeShippingProgress,
    finalTotal,
    couponError,
    isApplyingCoupon,
    applyCoupon,
    removeCoupon,
    isSyncingCart,
    cartSyncNotice,
    clearCartSyncNotice,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const router = useRouter();
  const [promoInput, setPromoInput] = useState('');

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoInput.trim()) return;
    const res = await applyCoupon(promoInput);
    if (res.success) {
      setPromoInput('');
    }
  };

  if (!isCartOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end font-sans">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-brand-brown/40 backdrop-blur-xs transition-opacity"
        onClick={() => setIsCartOpen(false)}
      />

      {/* Drawer */}
      <div className="relative w-full max-w-md bg-white text-brand-brown h-full shadow-2xl flex flex-col transform transition-transform duration-300 ease-in-out border-l-4 border-brand-brown">
        {/* Header */}
        <div className="p-6 border-b border-gray-200 bg-brand-brown text-white flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <ShoppingBag size={20} />
            <h2 className="font-black text-sm tracking-widest uppercase">
              {t('cart.title')} ({items.length})
            </h2>
          </div>
          <button
            onClick={() => setIsCartOpen(false)}
            className="hover:text-brand-yellow p-1 transition-colors cursor-pointer"
            aria-label={t('common.close')}
          >
            <X size={22} />
          </button>
        </div>

        {/* Live Catalog Price Sync Notice */}
        {cartSyncNotice && (
          <div className="bg-amber-50/95 border-b border-amber-200/80 px-4 py-2.5 flex items-center justify-between text-xs text-amber-900 transition-all">
            <div className="flex items-center gap-2 pr-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
              <span className="text-[11px] font-medium leading-tight">{cartSyncNotice}</span>
            </div>
            <button
              type="button"
              onClick={clearCartSyncNotice}
              className="text-amber-700 hover:text-amber-950 p-1 rounded-sm hover:bg-amber-100/60 transition-colors cursor-pointer shrink-0"
              aria-label="Dismiss notice"
            >
              <X size={12} />
            </button>
          </div>
        )}

        {/* Free Shipping Progress Meter */}
        <div className="bg-brand-warm-cream p-4 border-b border-brand-border text-xs">
          {isFreeShipping ? (
            <div className="text-emerald-700 font-bold flex items-center">
              <Check size={16} className="mr-1.5 shrink-0" />{' '}
              {t('cart.freeShippingQualified')}
            </div>
          ) : (
            <div>
              <div className="flex justify-between font-semibold mb-1 text-gray-700">
                <span>
                  {t('cart.freeShippingAddMore')}{' '}
                  {formatPrice(freeShippingRemaining)}{' '}
                  {t('cart.forFreeShipping')}
                </span>
                <span className="font-mono">{freeShippingProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brand-yellow h-full transition-all duration-500"
                  style={{
                    width: `${freeShippingProgress}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {items.length === 0 ? (
            <div className="text-center py-16 space-y-4">
              <ShoppingBag
                size={48}
                strokeWidth={1}
                className="mx-auto text-gray-300"
              />
              <p className="text-base font-bold text-brand-brown">
                {t('cart.emptyTitle')}
              </p>
              <p className="text-xs text-gray-500 max-w-xs mx-auto">
                {t('cart.emptyDesc')}
              </p>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  router.push('/search');
                }}
                className="inline-block bg-brand-brown hover:bg-brand-amber text-white px-6 py-3 font-black text-xs uppercase tracking-widest transition-colors cursor-pointer"
              >
                {t('cart.startShopping')}
              </button>
            </div>
          ) : (
            items.map((item) => {
              const isOutOfStock = item.maxStock <= 0 && !item.isPreorder;
              const isUnavailable =
                item.isAvailable === false ||
                item.isActive === false ||
                isOutOfStock;

              return (
                <div
                  key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                  className={`flex space-x-4 border-b border-gray-100 pb-6 transition-all ${
                    isUnavailable
                      ? 'bg-stone-50/80 p-3 rounded-xs border-stone-200 opacity-80'
                      : ''
                  }`}
                >
                  <div className="w-20 h-24 bg-gray-100 relative shrink-0 overflow-hidden">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-xs uppercase text-brand-brown line-clamp-1">
                        {getProductTitle(item, language)}
                      </h3>
                      <p className="text-[11px] text-gray-500 mt-1">
                        {t('cart.size')}: {item.selectedSize || 'Standard'} •{' '}
                        {item.selectedColor || 'Classic'}
                      </p>
                      {isOutOfStock ? (
                        <div className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-xs text-[10px] font-bold tracking-wider uppercase bg-rose-50 text-rose-700 border border-rose-200">
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                          <span>{t('cart.outOfStock')}</span>
                        </div>
                      ) : isUnavailable ? (
                        <div className="inline-flex items-center gap-1.5 mt-1.5 px-2 py-0.5 rounded-xs text-[10px] font-bold tracking-wider uppercase bg-stone-100 text-stone-600 border border-stone-300">
                          <span className="w-1.5 h-1.5 rounded-full bg-stone-400" />
                          <span>{t('cart.itemUnavailable')}</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      {/* Quantity Stepper */}
                      <div
                        className={`flex items-center border border-gray-300 rounded-xs ${
                          isUnavailable
                            ? 'opacity-40 pointer-events-none select-none'
                            : ''
                        }`}
                      >
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.variantId || item.id,
                              item.quantity - 1,
                            )
                          }
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                          aria-label={t('cart.decreaseQty')}
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2.5 py-1 text-xs font-bold font-mono">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() =>
                            updateQuantity(
                              item.variantId || item.id,
                              item.quantity + 1,
                            )
                          }
                          className="px-2 py-1 text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
                          aria-label={t('cart.increaseQty')}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span className="font-black text-sm text-brand-brown">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          onClick={() =>
                            removeFromCart(item.variantId || item.id)
                          }
                          className="text-xs uppercase font-bold text-gray-400 hover:text-brand-amber transition-colors underline cursor-pointer"
                        >
                          {t('cart.remove')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Checkout Footer */}
        {items.length > 0 && (
          <div className="p-5 border-t border-gray-200 bg-brand-warm-cream space-y-4">
            {/* Promo Code Input or Applied Badge */}
            {appliedCoupon ? (
              <div className="p-2.5 bg-emerald-50 border border-emerald-300 rounded-xs flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Tag size={14} className="text-emerald-700 shrink-0" />
                  <div>
                    <span className="text-xs font-black tracking-wider uppercase text-emerald-900 font-mono">
                      {appliedCoupon.code}
                    </span>
                    <span className="text-[11px] text-emerald-700 ml-2">
                      (
                      {appliedCoupon.discountType === 'PERCENTAGE'
                        ? `${appliedCoupon.discountValue}% OFF`
                        : appliedCoupon.discountType === 'FREE_SHIPPING'
                          ? t('cart.freeShippingEligible')
                          : `$${appliedCoupon.discountValue} OFF`}
                      )
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeCoupon}
                  className="text-gray-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                  title={t('cart.removePromo')}
                  aria-label={t('cart.removePromo')}
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div>
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={promoInput}
                      onChange={(e) =>
                        setPromoInput(e.target.value.toUpperCase())
                      }
                      placeholder={t('cart.promoCodePlaceholder')}
                      className="w-full text-xs font-mono px-3 py-2 bg-white border border-brand-border focus:border-brand-brown focus:outline-hidden uppercase placeholder:normal-case placeholder:text-gray-400"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isApplyingCoupon || !promoInput.trim()}
                    className="px-4 py-2 bg-brand-brown text-white text-xs font-black uppercase tracking-wider hover:bg-brand-amber transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center shrink-0"
                  >
                    {isApplyingCoupon ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      t('cart.applyPromo')
                    )}
                  </button>
                </form>
                {couponError && (
                  <p className="text-[11px] text-rose-600 mt-1.5 font-medium">
                    {couponError}
                  </p>
                )}
              </div>
            )}

            {/* Price Breakdown */}
            <div className="space-y-1.5 text-xs border-t border-brand-border pt-3">
              <div className="flex justify-between items-center text-gray-600">
                <span>{t('cart.subtotal')}</span>
                <span className="font-bold text-brand-brown">
                  {formatPrice(cartTotal)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between items-center text-emerald-700 font-medium">
                  <span>{t('cart.discountLabel')}</span>
                  <span className="font-bold">
                    -{formatPrice(discountAmount)}
                  </span>
                </div>
              )}

              <div className="flex justify-between items-center text-gray-600">
                <span>{t('cart.shippingEst')}</span>
                <span className="font-bold text-brand-brown">
                  {isFreeShipping ? (
                    <span className="text-emerald-700 font-black">
                      {t('cart.freeShipping')}
                    </span>
                  ) : (
                    formatPrice(shippingFee)
                  )}
                </span>
              </div>

              <div className="flex justify-between items-center pt-2 border-t border-brand-border/60 text-sm font-black text-brand-brown">
                <span className="uppercase tracking-wider">
                  {t('cart.total')}
                </span>
                <span className="text-base">{formatPrice(finalTotal)}</span>
              </div>
            </div>

            {hasUnavailableItems && (
              <div className="p-3 bg-amber-50/90 border border-amber-200 rounded-xs space-y-2">
                <div className="flex items-start space-x-2">
                  <AlertTriangle
                    size={15}
                    className="text-amber-700 shrink-0 mt-0.5"
                  />
                  <p className="text-[11px] text-amber-900 leading-snug font-medium">
                    {t('cart.hasUnavailableNotice')}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={removeUnavailableItems}
                  className="w-full py-1.5 bg-white border border-amber-300 hover:bg-amber-100/50 text-amber-900 text-[11px] font-bold rounded-xs transition-colors cursor-pointer"
                >
                  {t(
                    'cart.removeUnavailableCount',
                    `Remove unavailable items (${unavailableItemsCount})`,
                  ).replace('{count}', String(unavailableItemsCount))}
                </button>
              </div>
            )}

            <p className="text-[10px] text-gray-400">{t('cart.disclaimer')}</p>

            <div className="space-y-2 pt-1">
              {hasUnavailableItems ? (
                <div
                  className="w-full py-3.5 bg-stone-300 text-stone-500 font-black uppercase tracking-[0.2em] text-xs text-center block cursor-not-allowed select-none"
                  title={t('cart.hasUnavailableNotice')}
                >
                  {t('cart.checkoutBtn')}
                </div>
              ) : (
                <Link
                  href={
                    isAuthenticated ? '/checkout' : '/login?redirect=/checkout'
                  }
                  onClick={() => setIsCartOpen(false)}
                  className="w-full py-3.5 bg-brand-brown hover:bg-brand-amber text-white font-black transition-colors uppercase tracking-[0.2em] text-xs text-center block shadow-md cursor-pointer"
                >
                  {t('cart.checkoutBtn')}
                </Link>
              )}
              <button
                type="button"
                onClick={() => {
                  setIsCartOpen(false);
                  router.push('/search');
                }}
                className="w-full py-2 text-center text-xs font-bold text-gray-500 hover:text-brand-brown transition-colors uppercase tracking-wider cursor-pointer"
              >
                {t('cart.continueShopping')}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
