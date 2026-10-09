'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';
import { useLanguage, getProductTitle } from '@/context/LanguageContext';
import { CreditCard, ShieldCheck, Check, QrCode, Building2 } from 'lucide-react';

export default function CheckoutPage() {
  const { items, cartTotal, setIsCartOpen } = useCart();
  const { language, t } = useLanguage();
  const router = useRouter();
  const [step, setStep] = useState<'shipping' | 'payment'>('shipping');
  const [promoCode, setPromoCode] = useState('');
  const [discountApplied, setDiscountApplied] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'promptpay' | 'bank'>('card');

  // Close cart drawer when entering checkout
  React.useEffect(() => {
    setIsCartOpen(false);
  }, [setIsCartOpen]);

  const discountAmount = discountApplied ? cartTotal * 0.2 : 0;
  const shippingCost = cartTotal >= 100 ? 0 : 9.99;
  const finalTotal = Math.max(0, cartTotal - discountAmount + (items.length > 0 ? shippingCost : 0));

  if (items.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center px-4 font-sans">
        <h1 className="text-2xl font-black text-[#2B1810] uppercase tracking-wider mb-4">
          {t('checkout.emptyBag')}
        </h1>
        <button
          onClick={() => router.push('/')}
          className="bg-[#2B1810] text-white px-6 py-3 font-black text-xs uppercase tracking-widest hover:bg-[#D97706] transition-colors"
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

  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/order-success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
      <div className="flex flex-col lg:flex-row gap-12">
        {/* Left Column - Forms */}
        <div className="flex-1 lg:max-w-2xl">
          {/* Breadcrumbs */}
          <div className="flex items-center space-x-3 text-xs font-black uppercase tracking-[0.2em] mb-8 pb-4 border-b border-gray-200">
            <span className={step === 'shipping' ? 'text-[#2B1810]' : 'text-gray-400'}>
              {t('checkout.step1')}
            </span>
            <span className="text-gray-300">/</span>
            <span className={step === 'payment' ? 'text-[#2B1810]' : 'text-gray-400'}>
              {t('checkout.step2')}
            </span>
          </div>

          {step === 'shipping' ? (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-[#2B1810] uppercase tracking-tight">
                {t('checkout.shippingAddress')}
              </h2>
              <form onSubmit={handleShippingSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      {t('checkout.firstName')}
                    </label>
                    <input
                      type="text"
                      required
                      defaultValue="Phannida"
                      className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#2B1810]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      {t('checkout.lastName')}
                    </label>
                    <input
                      type="text"
                      required
                      defaultValue="Wissanu"
                      className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#2B1810]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      {t('checkout.email')}
                    </label>
                    <input
                      type="email"
                      required
                      defaultValue="customer@nida.com"
                      className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#2B1810]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      {t('checkout.phone')}
                    </label>
                    <input
                      type="tel"
                      required
                      defaultValue="081-234-5678"
                      className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#2B1810]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    {t('checkout.address')}
                  </label>
                  <input
                    type="text"
                    required
                    defaultValue="108 Sukhumvit Soi 24"
                    className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#2B1810]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      {t('checkout.city')}
                    </label>
                    <input
                      type="text"
                      required
                      defaultValue={language === 'th' ? 'กรุงเทพมหานคร' : 'Bangkok'}
                      className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#2B1810]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                      {t('checkout.postalCode')}
                    </label>
                    <input
                      type="text"
                      required
                      defaultValue="10110"
                      className="w-full border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:border-[#2B1810]"
                    />
                  </div>
                </div>

                <div className="pt-4">
                  <button
                    type="submit"
                    className="w-full bg-[#2B1810] hover:bg-[#D97706] text-white py-4 text-xs font-black uppercase tracking-[0.2em] transition-colors shadow-md"
                  >
                    {t('checkout.continueToPayment')}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="space-y-6">
              <h2 className="text-2xl font-black text-[#2B1810] uppercase tracking-tight">
                {t('checkout.paymentMethod')}
              </h2>

              <div className="border border-gray-200 bg-gray-50 p-4 flex justify-between items-center text-xs">
                <div>
                  <span className="text-gray-500 font-bold uppercase block mb-0.5">
                    {language === 'th' ? 'จัดส่งไปยัง:' : 'Ship To:'}
                  </span>
                  <span className="font-semibold text-gray-800">
                    108 Sukhumvit Soi 24, {language === 'th' ? 'กรุงเทพมหานคร' : 'Bangkok'} 10110
                  </span>
                </div>
                <button onClick={() => setStep('shipping')} className="font-black text-[#D97706] underline uppercase">
                  {language === 'th' ? 'แก้ไขที่อยู่' : 'Edit'}
                </button>
              </div>

              {/* Payment Method Selector Tabs */}
              <div className="grid grid-cols-3 gap-3">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('card')}
                  className={`p-3 border text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'card'
                      ? 'border-[#2B1810] bg-[#2B1810] text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <CreditCard size={18} />
                  <span>{language === 'th' ? 'บัตรเครดิต' : 'Card'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('promptpay')}
                  className={`p-3 border text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'promptpay'
                      ? 'border-[#2B1810] bg-[#2B1810] text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <QrCode size={18} />
                  <span>PromptPay QR</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPaymentMethod('bank')}
                  className={`p-3 border text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all ${
                    paymentMethod === 'bank'
                      ? 'border-[#2B1810] bg-[#2B1810] text-white'
                      : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
                  }`}
                >
                  <Building2 size={18} />
                  <span>{language === 'th' ? 'โอนเงิน' : 'Transfer'}</span>
                </button>
              </div>

              <form onSubmit={handlePaymentSubmit} className="space-y-5">
                {paymentMethod === 'card' && (
                  <div className="border-2 border-[#2B1810] p-6 bg-white shadow-xs">
                    <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
                      <span className="text-xs font-black uppercase tracking-wider text-[#2B1810]">
                        {t('checkout.creditCard')}
                      </span>
                      <CreditCard size={20} className="text-[#2B1810]" />
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
                          className="w-full border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2B1810]"
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
                            className="w-full border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2B1810]"
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
                            className="w-full border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:border-[#2B1810]"
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
                          className="w-full border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:border-[#2B1810]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'promptpay' && (
                  <div className="border-2 border-[#2B1810] p-6 bg-white shadow-xs text-center space-y-4">
                    <div className="inline-block bg-[#FAF7F2] p-4 border border-gray-200">
                      <QrCode size={120} className="mx-auto text-[#2B1810]" />
                    </div>
                    <p className="text-xs font-bold text-[#2B1810]">
                      {language === 'th'
                        ? 'สแกน QR Code ผ่านแอปพลิเคชันธนาคารเพื่อชำระเงินทันที'
                        : 'Scan the QR Code with any Thai mobile banking app for instant payment'}
                    </p>
                    <p className="text-[11px] text-gray-500">
                      NIDA OFFICIAL STORE • PROMPTPAY ID: 0105567891234
                    </p>
                  </div>
                )}

                {paymentMethod === 'bank' && (
                  <div className="border-2 border-[#2B1810] p-6 bg-white shadow-xs space-y-3 text-xs">
                    <h4 className="font-bold text-[#2B1810]">
                      {language === 'th' ? 'รายละเอียดบัญชีธนาคารสำหรับโอนเงิน:' : 'Bank Account Information:'}
                    </h4>
                    <div className="bg-[#FAF7F2] p-3 border border-gray-200 space-y-1">
                      <p>
                        <strong>{language === 'th' ? 'ธนาคาร:' : 'Bank:'}</strong> กสิกรไทย (Kasikornbank - KBANK)
                      </p>
                      <p>
                        <strong>{language === 'th' ? 'ชื่อบัญชี:' : 'Account Name:'}</strong> บริษัท นิดา แบรนด์ส จำกัด (Nida Brands Co., Ltd.)
                      </p>
                      <p>
                        <strong>{language === 'th' ? 'เลขที่บัญชี:' : 'Account No:'}</strong>{' '}
                        <span className="font-mono font-bold text-[#D97706]">098-1-23456-7</span>
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
                    className="w-full bg-[#2B1810] hover:bg-[#D97706] text-white py-4 text-xs font-black uppercase tracking-[0.2em] transition-colors shadow-lg"
                  >
                    {t('checkout.placeOrder')} (${finalTotal.toFixed(2)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('shipping')}
                    className="w-full py-2.5 text-center text-xs font-bold text-gray-600 hover:text-[#2B1810] uppercase tracking-wider"
                  >
                    {t('checkout.backToShipping')}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

        {/* Right Column - Order Summary & Promo Code */}
        <div className="lg:w-96 bg-[#FAF7F2] p-6 h-fit border border-[#EAE3D9] shadow-xs">
          <h3 className="font-black text-sm uppercase tracking-wider text-[#2B1810] pb-3 border-b border-gray-300 mb-4">
            {t('checkout.orderSummary')} ({items.length} {t('catalog.items')})
          </h3>

          {/* Item Thumbnails */}
          <div className="space-y-4 mb-6 max-h-72 overflow-y-auto pr-1">
            {items.map((item, index) => {
              const itemTitle = getProductTitle(item, language);
              return (
                <div key={`${item.id}-${index}`} className="flex gap-3 pb-3 border-b border-gray-200">
                  <div className="w-16 h-20 bg-gray-100 relative flex-shrink-0">
                    <img src={item.image} alt={itemTitle} className="w-full h-full object-cover" />
                    <span className="absolute -top-1.5 -right-1.5 bg-[#2B1810] text-white text-[10px] w-5 h-5 rounded-full flex items-center justify-center font-bold">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1 flex flex-col justify-center text-xs">
                    <h4 className="font-bold text-[#2B1810] line-clamp-1">{itemTitle}</h4>
                    <p className="text-gray-500 uppercase font-semibold mt-0.5">
                      {item.selectedColor} • {item.selectedSize}
                    </p>
                    <span className="font-black text-[#2B1810] mt-1">
                      ${(item.price * item.quantity).toFixed(2)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Promo Code Box */}
          <div className="border-t border-gray-300 pt-4 mb-4">
            {discountApplied ? (
              <div className="bg-emerald-50 border border-emerald-300 p-3 rounded-xs text-xs flex items-center justify-between text-emerald-800 font-bold">
                <span className="flex items-center">
                  <Check size={14} className="mr-1" /> {language === 'th' ? 'ใช้งานโค้ด NIDA20 (-20%)' : 'NIDA20 Applied (-20%)'}
                </span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            ) : (
              <form onSubmit={handleApplyPromo} className="flex gap-2">
                <input
                  type="text"
                  placeholder={t('checkout.promoCode')}
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="flex-1 bg-white border border-gray-300 px-3 py-2 text-xs uppercase font-bold focus:outline-none focus:border-[#2B1810]"
                />
                <button
                  type="submit"
                  className="bg-[#2B1810] text-white text-xs font-black uppercase tracking-wider px-4 py-2 hover:bg-[#D97706] transition-colors"
                >
                  {t('checkout.apply')}
                </button>
              </form>
            )}
          </div>

          {/* Cost Line Items */}
          <div className="border-t border-gray-300 py-3 space-y-2 text-xs font-semibold text-gray-700">
            <div className="flex justify-between">
              <span>{t('cart.subtotal')}</span>
              <span className="font-bold text-[#2B1810]">${cartTotal.toFixed(2)}</span>
            </div>
            {discountApplied && (
              <div className="flex justify-between text-emerald-700">
                <span>{t('checkout.discount')}</span>
                <span>-${discountAmount.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>{t('checkout.shipping')}</span>
              <span>
                {shippingCost === 0 ? (
                  <strong className="text-emerald-700">{t('checkout.free')}</strong>
                ) : (
                  `$${shippingCost.toFixed(2)}`
                )}
              </span>
            </div>
          </div>

          {/* Final Total */}
          <div className="border-t-2 border-[#2B1810] pt-4 flex justify-between items-baseline">
            <span className="text-xs font-black uppercase tracking-widest text-[#2B1810]">
              {t('checkout.total')} (USD)
            </span>
            <span className="text-2xl font-black text-[#2B1810]">${finalTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
