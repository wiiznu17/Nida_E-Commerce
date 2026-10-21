import React from 'react';
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  Loader2,
  ArrowRight,
} from 'lucide-react';
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
          <span>
            {language === 'th' ? 'บัตรเครดิต / เดบิต' : 'Credit / Debit Card'}
          </span>
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
          <div className="border border-brand-border p-6 bg-white shadow-xs space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-brown text-white flex items-center justify-center shrink-0">
                <CreditCard size={20} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-brand-brown">
                  {language === 'th'
                    ? 'ชำระเงินด้วยบัตรเครดิต / เดบิต'
                    : 'Credit / Debit Card Payment'}
                </h4>
                <p className="text-[11px] text-gray-600">
                  {language === 'th'
                    ? 'รองรับ Visa, Mastercard, JCB ผ่านระบบความปลอดภัย Omise 3-D Secure'
                    : 'Supports Visa, Mastercard, JCB with Omise 3-D Secure authentication'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-brand-warm-cream/40 border border-brand-border/60 text-xs text-stone-600 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-brown shrink-0"></span>
                <span>
                  {language === 'th'
                    ? 'เมื่อกดยืนยันสั่งซื้อ ระบบจะสร้างคำสั่งซื้อและนำท่านไปยังหน้าชำระเงินเพื่อกรอกข้อมูลบัตร'
                    : 'Order will be created and you will proceed to the secure payment screen to enter card details'}
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-brown shrink-0"></span>
                <span>
                  {language === 'th'
                    ? 'ข้อมูลบัตรจะถูกเข้ารหัสโดยตรงผ่าน Omise Vault ตามมาตรฐาน PCI-DSS'
                    : 'Card data is encrypted directly via Omise Vault with PCI-DSS compliance'}
                </span>
              </div>
            </div>
          </div>
        )}

        {paymentMethod === 'promptpay' && (
          <div className="border border-brand-border p-6 bg-white shadow-xs space-y-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-brand-brown text-white flex items-center justify-center shrink-0">
                <QrCode size={20} />
              </div>
              <div>
                <h4 className="text-xs font-black uppercase tracking-wider text-brand-brown">
                  {language === 'th'
                    ? 'ชำระเงินด้วย พร้อมเพย์ (PromptPay QR)'
                    : 'PromptPay QR Payment'}
                </h4>
                <p className="text-[11px] text-gray-600">
                  {language === 'th'
                    ? 'สแกน QR Code เพื่อชำระเงินผ่าน Mobile Banking ทุกธนาคาร'
                    : 'Scan QR code to pay using any Thai mobile banking app'}
                </p>
              </div>
            </div>

            <div className="p-4 bg-brand-warm-cream/40 border border-brand-border/60 text-xs text-stone-600 space-y-2">
              <div className="flex items-center space-x-2">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-brown shrink-0"></span>
                <span>
                  {language === 'th'
                    ? 'เมื่อกดยืนยันสั่งซื้อ ระบบจะสร้างคำสั่งซื้อและนำท่านเข้าสู่หน้าสแกน QR Code พร้อมเพย์'
                    : 'Order will be created and you will be redirected to the PromptPay QR scan page'}
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
                    ? 'กำลังสร้างคำสั่งซื้อ...'
                    : 'Creating order...'}
                </span>
              </>
            ) : (
              <>
                <span>
                  {language === 'th'
                    ? `ยืนยันสั่งซื้อและไปที่หน้าชำระเงิน (฿${finalTotal.toLocaleString()})`
                    : `Place Order & Proceed to Payment (฿${finalTotal.toLocaleString()})`}
                </span>
                <ArrowRight size={14} />
              </>
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
