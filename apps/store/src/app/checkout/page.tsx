'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useLanguage, getProductTitle } from '@/context/LanguageContext';
import {
  CreditCard,
  ShieldCheck,
  Check,
  QrCode,
  Building2,
  AlertCircle,
  Loader2,
  Lock,
} from 'lucide-react';
import { createCustomerOrder, type CreateCustomerOrderPayload } from '@/lib/customerApi';
import { PaymentMethod } from '@repo/types';

export default function CheckoutPage() {
  const { items, cartTotal, setIsCartOpen, clearCart } = useCart();
  const { user, token, isAuthenticated, isLoading: isAuthLoading } = useAuth();
  const { language, t } = useLanguage();
  const router = useRouter();

  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [promoCode, setPromoCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'promptpay' | 'bank'>('card');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderError, setOrderError] = useState('');

  // Shipping Form State (Autofilled from authenticated User profile)
  const [shippingData, setShippingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
  });

  // Close cart drawer when entering checkout
  useEffect(() => {
    setIsCartOpen(false);
  }, [setIsCartOpen]);

  // Autofill shipping info whenever user logs in or profile loads
  useEffect(() => {
    if (user) {
      setShippingData((prev) => ({
        firstName: prev.firstName || user.firstName || '',
        lastName: prev.lastName || user.lastName || '',
        email: prev.email || user.email || '',
        phone: prev.phone || user.phone || '',
        address: prev.address || user.address || '',
        city: prev.city || user.city || (language === 'th' ? 'กรุงเทพมหานคร' : 'Bangkok'),
        postalCode: prev.postalCode || user.postalCode || '10110',
      }));
    }
  }, [user, language]);

  const discountAmount = discountApplied ? cartTotal * 0.2 : 0;
  const shippingCost = cartTotal >= 100 ? 0 : 9.99;
  const finalTotal = Math.max(
    0,
    cartTotal - discountAmount + (items.length > 0 ? shippingCost : 0),
  );

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 font-sans">
        <h1 className="text-2xl font-black text-brand-brown uppercase tracking-wider mb-4">
          {t('checkout.emptyBag')}
        </h1>
        <button
          onClick={() => router.push('/')}
          className="bg-brand-brown text-white px-6 py-3 font-black text-xs uppercase tracking-widest hover:bg-brand-amber transition-colors cursor-pointer"
        >
          {t('checkout.returnToShop')}
        </button>
      </div>
    );
  }

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (promoCode.trim().toUpperCase() === 'NIDA20') {
      setDiscountApplied(true);
    }
  };

  const handleShippingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStep('payment');
    window.scrollTo(0, 0);
  };

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setOrderError('');

    try {
      let mappedMethod: PaymentMethod = PaymentMethod.CREDIT_CARD;
      if (paymentMethod === 'promptpay') {
        mappedMethod = PaymentMethod.PROMPTPAY;
      } else if (paymentMethod === 'bank') {
        mappedMethod = PaymentMethod.BANK_TRANSFER;
      }

      const recipientName = `${shippingData.firstName} ${shippingData.lastName}`.trim();

      const payload: CreateCustomerOrderPayload = {
        items: items.map((item) => ({
          variantId: item.variantId || item.id,
          quantity: item.quantity,
        })),
        shippingAddress: {
          recipientName: recipientName || user?.fullName || 'Customer',
          phone: shippingData.phone || '0812345678',
          addressLine1: shippingData.address || 'Sukhumvit 24',
          subdistrict: 'Klongtoey',
          district: shippingData.city || 'Klongtoey',
          province: 'Bangkok',
          postalCode: shippingData.postalCode || '10110',
        },
        paymentMethod: mappedMethod,
        customerEmail: shippingData.email || user?.email,
        couponCode: discountApplied ? promoCode.trim().toUpperCase() : undefined,
      };

      const createdOrder = await createCustomerOrder(payload, token);
      clearCart();
      router.push(`/order-success?orderNumber=${encodeURIComponent(createdOrder.orderNumber)}`);
    } catch (err: unknown) {
      setOrderError(
        err instanceof Error
          ? err.message
          : 'เกิดข้อผิดพลาดในการสร้างคำสั่งซื้อ กรุณาลองใหม่อีกครั้ง',
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
      {/* Checkout Member Login Banner */}
      {!isAuthenticated && !isAuthLoading && (
        <div className="mb-8 p-4 bg-brand-warm-cream border border-brand-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <Lock size={18} className="text-brand-amber shrink-0" />
            <div>
              <p className="text-xs font-bold text-brand-brown">
                {language === 'th'
                  ? 'เข้าสู่ระบบด้วย OTP เพื่อผูกประวัติคำสั่งซื้อและสะสมแต้มสมาชิก'
                  : 'Sign in with OTP to link this order to your account and earn rewards'}
              </p>
              <p className="text-[11px] text-gray-500">
                {language === 'th'
                  ? 'หากเป็นลูกค้าใหม่ ระบบจะสร้างบัญชีให้คุณโดยอัตโนมัติ'
                  : 'New customer? We will create your account automatically'}
              </p>
            </div>
          </div>
          <Link
            href="/login?redirect=/checkout"
            className="px-4 py-2 bg-brand-brown hover:bg-brand-amber text-white text-xs font-black uppercase tracking-wider transition-colors shrink-0"
          >
            {t('auth.signInBtn')}
          </Link>
        </div>
      )}

      {orderError && (
        <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 text-xs flex items-start space-x-3">
          <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
          <div>
            <p className="font-bold">เกิดข้อผิดพลาดในการสั่งซื้อ</p>
            <p className="mt-0.5">{orderError}</p>
          </div>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Column - Forms */}
        <div className="flex-1 lg:max-w-2xl">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-3 text-xs font-black uppercase tracking-[0.2em] mb-8 pb-4 border-b border-gray-200">
            <span
              className={
                step === 'shipping' ? 'text-brand-brown' : 'text-gray-400'
              }
            >
              {t('checkout.step1')}
            </span>
            <span className="text-gray-300">/</span>
            <span
              className={
                step === 'payment' ? 'text-brand-brown' : 'text-gray-400'
              }
            >
              {t('checkout.step2')}
            </span>
          </div>

          {step === 'shipping' ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-brand-brown uppercase tracking-tight">
                {t('checkout.shippingAddress')}
              </h2>
              <form onSubmit={handleShippingSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      {t('checkout.firstName')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingData.firstName}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, firstName: e.target.value })
                      }
                      placeholder="Phannida"
                      className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-brown"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      {t('checkout.lastName')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingData.lastName}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, lastName: e.target.value })
                      }
                      placeholder="Wissanu"
                      className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-brown"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      {t('checkout.email')} *
                    </label>
                    <input
                      type="email"
                      required
                      value={shippingData.email}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, email: e.target.value })
                      }
                      placeholder="customer@nida.com"
                      className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-brown"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      {t('checkout.phone')} *
                    </label>
                    <input
                      type="tel"
                      required
                      value={shippingData.phone}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, phone: e.target.value })
                      }
                      placeholder="081-234-5678"
                      className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-brown"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    {t('checkout.address')} *
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingData.address}
                    onChange={(e) =>
                      setShippingData({ ...shippingData, address: e.target.value })
                    }
                    placeholder="108 Sukhumvit Soi 24"
                    className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-brown"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      {t('checkout.city')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingData.city}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, city: e.target.value })
                      }
                      placeholder="Bangkok"
                      className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-brown"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      {t('checkout.postalCode')} *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingData.postalCode}
                      onChange={(e) =>
                        setShippingData({ ...shippingData, postalCode: e.target.value })
                      }
                      placeholder="10110"
                      className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-brand-brown"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-brand-brown hover:bg-brand-amber text-white py-4 text-xs font-black uppercase tracking-[0.2em] transition-colors shadow-lg cursor-pointer"
                  >
                    {t('checkout.continueToPayment')}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-gray-200">
                <h2 className="text-2xl font-black text-brand-brown uppercase tracking-tight">
                  {t('checkout.paymentMethod')}
                </h2>
                <button
                  type="button"
                  onClick={() => setStep('shipping')}
                  className="text-xs font-bold text-brand-brown hover:text-brand-amber underline uppercase tracking-wider"
                >
                  {language === 'th' ? 'แก้ไขที่อยู่' : 'Edit'}
                </button>
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 border text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === 'card'
                      ? 'border-brand-brown bg-brand-brown text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <CreditCard size={18} />
                  <span>{language === 'th' ? 'บัตรเครดิต' : 'Card'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('promptpay')}
                  className={`p-3 border text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === 'promptpay'
                      ? 'border-brand-brown bg-brand-brown text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <QrCode size={18} />
                  <span>PromptPay QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`p-3 border text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                    paymentMethod === 'bank'
                      ? 'border-brand-brown bg-brand-brown text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <Building2 size={18} />
                  <span>{language === 'th' ? 'โอนเงิน' : 'Transfer'}</span>
                </button>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-5">
                {paymentMethod === 'card' && (
                  <div className="border-2 border-brand-brown p-6 bg-white shadow-xs">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                      <span className="text-xs font-black uppercase tracking-wider text-brand-brown">
                        {t('checkout.creditCard')} (Sandbox Test Mode)
                      </span>
                      <CreditCard size={20} className="text-brand-brown" />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                          {language === 'th' ? 'หมายเลขบัตร *' : 'Card Number *'}
                        </label>
                        <input
                          type="text"
                          defaultValue="4242 •••• •••• 4242"
                          required
                          className="w-full border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-brown"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                            {language === 'th' ? 'วันหมดอายุ (MM/YY) *' : 'Exp Date (MM/YY) *'}
                          </label>
                          <input
                            type="text"
                            defaultValue="12/28"
                            required
                            className="w-full border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-brown"
                          />
                        </div>
                        <div>
                          <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                            CVV / CVC *
                          </label>
                          <input
                            type="text"
                            defaultValue="789"
                            required
                            className="w-full border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-brown"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                          {language === 'th' ? 'ชื่อบนบัตร *' : 'Name On Card *'}
                        </label>
                        <input
                          type="text"
                          defaultValue="PHANNIDA W."
                          required
                          className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-brand-brown"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'promptpay' && (
                  <div className="border-2 border-brand-brown p-6 bg-white shadow-xs text-center space-y-4">
                    <div className="inline-block bg-brand-warm-cream p-4 border border-gray-200">
                      <QrCode size={120} className="mx-auto text-brand-brown" />
                    </div>
                    <p className="text-xs font-bold text-brand-brown">
                      {language === 'th'
                        ? 'สแกน QR Code เพื่อชำระเงินจำลอง (ระบบจะตัดสต็อกทันทีเมื่อกดสั่งซื้อ)'
                        : 'Scan QR Code for PromptPay payment (Stock will deduct upon order)'}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      NIDA OFFICIAL STORE • PROMPTPAY ID: 0105567891234
                    </p>
                  </div>
                )}

                {paymentMethod === 'bank' && (
                  <div className="border-2 border-brand-brown p-6 bg-white shadow-xs space-y-3 text-xs">
                    <h4 className="font-bold text-brand-brown">
                      {language === 'th' ? 'รายละเอียดบัญชีธนาคารสำหรับโอนเงิน:' : 'Bank Account Information:'}
                    </h4>
                    <div className="bg-brand-warm-cream p-3 border border-gray-200 space-y-1">
                      <p>
                        <strong>{language === 'th' ? 'ธนาคาร:' : 'Bank:'}</strong> กสิกรไทย (Kasikornbank - KBANK)
                      </p>
                      <p>
                        <strong>{language === 'th' ? 'ชื่อบัญชี:' : 'Account Name:'}</strong> บริษัท นิดา แบรนด์ส จำกัด (Nida Brands Co., Ltd.)
                      </p>
                      <p>
                        <strong>{language === 'th' ? 'เลขที่บัญชี:' : 'Account No:'}</strong>{' '}
                        <span className="font-mono font-bold text-brand-amber">098-1-23456-7</span>
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center space-x-2 text-gray-500 text-xs">
                  <ShieldCheck size={16} className="text-emerald-600" />
                  <span>{t('checkout.secureNotice')}</span>
                </div>

                <div className="pt-4 space-y-3">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-brand-brown hover:bg-brand-amber disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-4 text-xs font-black uppercase tracking-[0.2em] transition-colors shadow-lg flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        <span>กำลังประมวลผลคำสั่งซื้อ...</span>
                      </>
                    ) : (
                      <span>{t('checkout.placeOrder')} (${finalTotal.toFixed(2)})</span>
                    )}
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={() => setStep('shipping')}
                    className="w-full py-2.5 text-center text-xs font-bold text-gray-600 hover:text-brand-brown uppercase tracking-wider cursor-pointer"
                  >
                    {t('checkout.backToShipping')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Column - Order Summary & Promo Code */}
        <div className="lg:w-96 bg-brand-warm-cream p-6 h-fit border border-brand-border shadow-xs">
          <h3 className="font-black text-sm uppercase tracking-wider text-brand-brown pb-3 border-b border-gray-300 mb-4">
            {t('checkout.orderSummary')} ({items.length} {t('catalog.items')})
          </h3>

          {/* Item Thumbnails */}
          <div className="space-y-4 mb-6 max-h-72 overflow-y-auto pr-1">
            {items.map((item, index) => {
              const itemTitle = getProductTitle(item, language);
              return (
                <div key={`${item.variantId || item.id}-${index}`} className="flex gap-4 items-center">
                  <div className="w-16 h-20 bg-gray-100 flex-shrink-0 relative border border-gray-200">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
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
                    <p className="text-xs font-black text-brand-brown mt-1">
                      ${(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Promo Code Input */}
          <form
            onSubmit={handleApplyPromo}
            className="flex gap-2 mb-6 pb-6 border-b border-gray-300"
          >
            <input
              type="text"
              value={promoCode}
              onChange={(e) => setPromoCode(e.target.value)}
              placeholder={t('checkout.promoPlaceholder')}
              className="flex-1 border border-gray-300 px-3 py-2 text-xs uppercase focus:outline-none focus:border-brand-brown bg-white font-mono"
            />
            <button
              type="submit"
              className="bg-brand-brown hover:bg-brand-amber text-white px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors cursor-pointer"
            >
              {t('checkout.apply')}
            </button>
          </form>

          {discountApplied && (
            <div className="flex items-center space-x-1.5 text-xs text-emerald-700 font-bold mb-4 bg-emerald-50 p-2 border border-emerald-200">
              <Check size={14} />
              <span>Promo code NIDA20 applied (20% OFF)</span>
            </div>
          )}

          {/* Cost Breakdown */}
          <div className="space-y-2.5 text-xs font-semibold text-gray-600 pb-4 border-b border-gray-300">
            <div className="flex justify-between">
              <span>{t('checkout.subtotal')}</span>
              <span className="text-brand-brown">${cartTotal.toFixed(2)}</span>
            </div>
            {discountApplied && (
              <div className="flex justify-between text-emerald-700 font-bold">
                <span>{t('checkout.discount')}</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>{t('checkout.shipping')}</span>
              <span>
                {shippingCost === 0 ? (
                  <span className="text-emerald-700 font-bold uppercase">
                    {t('checkout.free')}
                  </span>
                ) : (
                  `$${shippingCost.toFixed(2)}`
                )}
              </span>
            </div>
          </div>

          {/* Total Amount */}
          <div className="flex justify-between items-center pt-4">
            <span className="font-black text-sm uppercase text-brand-brown">
              {t('checkout.total')}
            </span>
            <span className="font-black text-xl text-brand-brown">
              ${finalTotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
