'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ShoppingBag, X, Check, Minus, Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage, getProductTitle } from '@/context/LanguageContext';

export function CartDrawer() {
  const {
    isCartOpen,
    setIsCartOpen,
    items,
    cartTotal,
    removeFromCart,
    updateQuantity,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const { language, t } = useLanguage();
  const router = useRouter();

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

        {/* Free Shipping Progress Meter */}
        <div className="bg-brand-warm-cream p-4 border-b border-brand-border text-xs">
          {cartTotal >= 100 ? (
            <div className="text-emerald-700 font-bold flex items-center">
              <Check size={16} className="mr-1.5" />{' '}
              {t('cart.freeShippingQualified')}
            </div>
          ) : (
            <div>
              <div className="flex justify-between font-semibold mb-1 text-gray-700">
                <span>
                  {t('cart.freeShippingAddMore')}
                  {(100 - cartTotal).toFixed(2)}
                  {t('cart.forFreeShipping')}
                </span>
                <span>
                  {Math.min(100, Math.round((cartTotal / 100) * 100))}%
                </span>
              </div>
              <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-brand-yellow h-full transition-all duration-500"
                  style={{
                    width: `${Math.min(100, (cartTotal / 100) * 100)}%`,
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
                  router.push('/collections/all');
                }}
                className="inline-block bg-brand-brown hover:bg-brand-amber text-white px-6 py-3 font-black text-xs uppercase tracking-widest transition-colors cursor-pointer"
              >
                {t('cart.startShopping')}
              </button>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                className="flex space-x-4 border-b border-gray-100 pb-6"
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
                  </div>

                  <div className="flex justify-between items-center mt-3">
                    {/* Quantity Stepper */}
                    <div className="flex items-center border border-gray-300 rounded-xs">
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
                        ${(item.price * item.quantity).toFixed(2)}
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
            ))
          )}
        </div>

        {/* Checkout Footer */}
        {items.length > 0 && (
          <div className="p-6 border-t border-gray-200 bg-brand-warm-cream">
            <div className="flex justify-between items-center mb-2 text-xs font-semibold text-gray-600 uppercase">
              <span>{t('cart.subtotal')}</span>
              <span className="text-base font-black text-brand-brown">
                ${cartTotal.toFixed(2)}
              </span>
            </div>
            <p className="text-[11px] text-gray-500 mb-4">
              {t('cart.disclaimer')}
            </p>
            <div className="space-y-2">
              <Link
                href={isAuthenticated ? '/checkout' : '/login?redirect=/checkout'}
                onClick={() => setIsCartOpen(false)}
                className="w-full py-4 bg-brand-brown hover:bg-brand-amber text-white font-black transition-colors uppercase tracking-[0.2em] text-xs text-center block shadow-md cursor-pointer"
              >
                {t('cart.checkoutBtn')}
              </Link>
              <button
                onClick={() => {
                  setIsCartOpen(false);
                  router.push('/collections/all');
                }}
                className="w-full py-2.5 text-center text-xs font-bold text-gray-600 hover:text-brand-brown transition-colors uppercase tracking-wider cursor-pointer"
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
