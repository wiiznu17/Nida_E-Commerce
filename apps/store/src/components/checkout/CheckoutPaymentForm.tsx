import React from 'react';
import { CreditCard, QrCode, ShieldCheck, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { PaymentMethodOption } from './checkoutTypes';

interface CheckoutPaymentFormProps {
  paymentMethod: PaymentMethodOption;
  isSubmitting: boolean;
  finalTotal: number;
  onSelectPaymentMethod: (method: PaymentMethodOption) => void;
  onBackToShipping: () => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CheckoutPaymentForm({
  paymentMethod,
  isSubmitting,
  finalTotal,
  onSelectPaymentMethod,
  onBackToShipping,
  onSubmit,
}: CheckoutPaymentFormProps) {
  const { language, t } = useLanguage();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center pb-4 border-b border-gray-200">
        <h2 className="text-2xl font-black text-brand-brown uppercase tracking-tight">
          {t('checkout.paymentMethod')}
        </h2>
        <button
          type="button"
          onClick={onBackToShipping}
          className="text-xs font-bold text-brand-brown hover:text-brand-amber underline uppercase tracking-wider cursor-pointer"
        >
          {language === 'th' ? 'แก้ไขที่อยู่' : 'Edit'}
        </button>
      </div>

      {/* Payment Method Selector Tabs */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => onSelectPaymentMethod('card')}
          className={`p-4 border text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
            paymentMethod === 'card'
              ? 'border-brand-brown bg-brand-brown text-white shadow-xs'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
          }`}
        >
          <CreditCard size={20} />
          <span>{language === 'th' ? 'บัตรเครดิต / เดบิต' : 'Credit / Debit Card'}</span>
        </button>
        <button
          type="button"
          onClick={() => onSelectPaymentMethod('promptpay')}
          className={`p-4 border text-xs font-bold flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
            paymentMethod === 'promptpay'
              ? 'border-brand-brown bg-brand-brown text-white shadow-xs'
              : 'border-gray-200 bg-white text-gray-700 hover:border-gray-400'
          }`}
        >
          <QrCode size={20} />
          <span>PromptPay QR</span>
        </button>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        {paymentMethod === 'card' && (
          <div className="border border-brand-border p-6 bg-white shadow-xs">
            <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
              <div>
                <span className="text-xs font-black uppercase tracking-wider text-brand-brown block">
                  {t('checkout.creditCard')}
                </span>
                <span className="text-[10px] text-gray-500 font-medium">
                  {language === 'th'
                    ? 'รองรับ Visa, Mastercard, JCB (ระบบ Omise Secure Payment Gateway)'
                    : 'Supports Visa, Mastercard, JCB (Omise Secure Payment Gateway)'}
                </span>
              </div>
              <CreditCard size={22} className="text-brand-brown shrink-0" />
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
          <div className="border border-brand-border p-6 bg-brand-warm-cream/50 shadow-xs space-y-3">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-brown text-white flex items-center justify-center shrink-0">
                <QrCode size={20} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-brand-brown">
                  {language === 'th' ? 'ชำระเงินด้วย พร้อมเพย์ (PromptPay QR)' : 'PromptPay QR Payment'}
                </h4>
                <p className="text-[11px] text-gray-600">
                  {language === 'th'
                    ? 'เมื่อกดสั่งซื้อ ระบบจะสร้างคำสั่งซื้อและนำท่านเข้าสู่หน้าสแกน QR Code พร้อมเพย์'
                    : 'Order will be created and you will be redirected to the PromptPay QR scan page'}
                </p>
              </div>
            </div>

            <div className="p-3 bg-white border border-brand-border text-xs text-gray-600 space-y-1.5">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-brown shrink-0"></span>
                <span>
                  {language === 'th'
                    ? 'รองรับ Mobile Banking ทุกธนาคารในประเทศไทย'
                    : 'Supports all Thai Mobile Banking apps'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-brown shrink-0"></span>
                <span>
                  {language === 'th'
                    ? 'ระบบตรวจรับยอดเงินอัตโนมัติผ่าน Omise Webhook ทันที'
                    : 'Automatic instant verification via Omise Webhook'}
                </span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center space-x-2 text-gray-500 text-xs">
          <ShieldCheck size={16} className="text-emerald-600 shrink-0" />
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
                <span>
                  {language === 'th'
                    ? 'กำลังประมวลผลคำสั่งซื้อ...'
                    : 'Processing order...'}
                </span>
              </>
            ) : (
              <span>
                {t('checkout.placeOrder')} (฿{finalTotal.toLocaleString()})
              </span>
            )}
          </button>
          <button
            type="button"
            disabled={isSubmitting}
            onClick={onBackToShipping}
            className="w-full py-2.5 text-center text-xs font-bold text-gray-600 hover:text-brand-brown uppercase tracking-wider cursor-pointer"
          >
            {t('checkout.backToShipping')}
          </button>
        </div>
      </form>
    </div>
  );
}
