'use client';

import React, { useState } from 'react';
import { CreditCard, ShieldCheck, Loader2, Lock, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiOrder } from '@repo/types';

export interface CardSubmitData {
  name: string;
  number: string;
  expirationMonth: number;
  expirationYear: number;
  securityCode: string;
}

interface CreditCardAwaitingPaymentProps {
  order: ApiOrder | null;
  displayOrderNumber: string;
  isSubmitting: boolean;
  onSubmitPayment: (card: CardSubmitData) => Promise<void>;
  error?: string | null;
}

export function CreditCardAwaitingPayment({
  order,
  displayOrderNumber,
  isSubmitting,
  onSubmitPayment,
  error,
}: CreditCardAwaitingPaymentProps) {
  const { language, t } = useLanguage();

  const [cardName, setCardName] = useState('PHANNIDA W.');
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('123');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleCardNumberChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    const parts = digits.match(/.{1,4}/g);
    setCardNumber(parts ? parts.join(' ') : digits);
  };

  const handleExpiryChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '').slice(0, 4);
    if (cleaned.length >= 3) {
      setCardExpiry(`${cleaned.slice(0, 2)}/${cleaned.slice(2)}`);
    } else {
      setCardExpiry(cleaned);
    }
  };

  const handleCvcChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    setCardCvc(digits);
  };

  const handleFillTestCard = () => {
    setCardName('PHANNIDA W.');
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvc('123');
    setLocalError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const rawNumber = cardNumber.replace(/\s+/g, '');
    if (rawNumber.length < 15) {
      setLocalError(
        language === 'th'
          ? 'กรุณากรอกหมายเลขบัตรเครดิตให้ถูกต้อง (15-16 หลัก)'
          : 'Please enter a valid credit card number (15-16 digits)',
      );
      return;
    }

    const [monthStr, yearStr] = cardExpiry.split('/');
    const expMonth = parseInt(monthStr?.trim() ?? '', 10);
    let expYear = parseInt(yearStr?.trim() ?? '', 10);

    if (isNaN(expMonth) || expMonth < 1 || expMonth > 12) {
      setLocalError(
        language === 'th'
          ? 'กรุณากรอกเดือนหมดอายุให้ถูกต้อง (01-12)'
          : 'Please enter a valid expiry month (01-12)',
      );
      return;
    }

    if (isNaN(expYear)) {
      setLocalError(
        language === 'th'
          ? 'กรุณากรอกปีที่หมดอายุให้ถูกต้อง'
          : 'Please enter a valid expiry year',
      );
      return;
    }

    if (expYear < 100) {
      expYear += 2000;
    }

    if (cardCvc.trim().length < 3) {
      setLocalError(
        language === 'th'
          ? 'กรุณากรอกรหัส CVV / CVC 3 หรือ 4 หลัก'
          : 'Please enter a valid CVV / CVC code',
      );
      return;
    }

    await onSubmitPayment({
      name: cardName.trim() || 'CARDHOLDER',
      number: rawNumber,
      expirationMonth: expMonth,
      expirationYear: expYear,
      securityCode: cardCvc.trim(),
    });
  };

  const activeError = error || localError;

  return (
    <div className="relative text-left">
      {/* Loading Overlay during Payment Processing */}
      {isSubmitting && (
        <div className="absolute inset-0 bg-white/95 z-20 backdrop-blur-xs flex flex-col items-center justify-center p-6 text-center space-y-4 rounded-xs">
          <div className="w-14 h-14 rounded-full bg-brand-warm-cream border border-brand-border flex items-center justify-center text-brand-brown">
            <Loader2 size={28} className="animate-spin text-brand-amber" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h3 className="text-sm font-black uppercase tracking-wider text-brand-brown">
              {language === 'th'
                ? 'กำลังประมวลผลการชำระเงิน...'
                : 'Processing Payment...'}
            </h3>
            <p className="text-xs text-stone-600 leading-relaxed font-medium">
              {language === 'th'
                ? 'กำลังเชื่อมต่อระบบ Omise Vault และตรวจสอบความปลอดภัยกับธนาคารผู้ออกบัตร กรุณาอย่าปิดหรือรีเฟรชหน้าจอนี้'
                : 'Securing transaction with Omise Vault and verifying with your bank. Please do not close or refresh this page.'}
            </p>
          </div>
          <div className="inline-flex items-center space-x-1.5 text-[11px] text-stone-400 font-medium">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Omise 3-D Secure 256-Bit SSL Encryption</span>
          </div>
        </div>
      )}


      {activeError && (
        <div className="mb-5 p-3.5 bg-rose-50 border border-rose-200 flex items-start space-x-2.5 text-xs text-rose-800">
          <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
          <span>{activeError}</span>
        </div>
      )}

      {/* Card Detail Container */}
      <form onSubmit={handleSubmit} className="border border-brand-border bg-white p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-gray-200">
          <div>
            <span className="text-xs font-black uppercase tracking-wider text-brand-brown block">
              {t('checkout.creditCard')}
            </span>
            <span className="text-[10px] text-gray-500 font-medium">
              {language === 'th'
                ? 'รองรับ Visa, Mastercard, JCB (ระบบ Omise Secure Gateway)'
                : 'Supports Visa, Mastercard, JCB (Omise Secure Gateway)'}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handleFillTestCard}
              className="text-[10px] font-bold text-brand-brown hover:text-brand-amber border border-brand-border px-2 py-0.5 uppercase tracking-wider bg-brand-warm-cream/50 transition-colors cursor-pointer"
            >
              {language === 'th' ? 'เติมข้อมูลบัตรทดสอบ' : 'Fill Test Card'}
            </button>
            <CreditCard size={20} className="text-brand-brown shrink-0" />
          </div>
        </div>


        <div className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
              {language === 'th' ? 'หมายเลขบัตร *' : 'Card Number *'}
            </label>
            <input
              type="text"
              required
              value={cardNumber}
              onChange={(e) => handleCardNumberChange(e.target.value)}
              placeholder="4242 •••• •••• 4242"
              maxLength={19}
              className="w-full border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-brown"
            />
          </div>

          <div className="grid grid-cols-2 gap-3.5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                {language === 'th' ? 'วันหมดอายุ (MM/YY) *' : 'Exp Date (MM/YY) *'}
              </label>
              <input
                type="text"
                required
                value={cardExpiry}
                onChange={(e) => handleExpiryChange(e.target.value)}
                placeholder="12/28"
                maxLength={5}
                className="w-full border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-brown text-center"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
                CVV / CVC *
              </label>
              <input
                type="password"
                required
                value={cardCvc}
                onChange={(e) => handleCvcChange(e.target.value)}
                placeholder="123"
                maxLength={4}
                className="w-full border border-gray-300 px-3 py-2 text-sm font-mono focus:outline-none focus:border-brand-brown text-center"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1">
              {language === 'th' ? 'ชื่อบนบัตร *' : 'Name On Card *'}
            </label>
            <input
              type="text"
              required
              value={cardName}
              onChange={(e) => setCardName(e.target.value)}
              placeholder="PHANNIDA W."
              className="w-full border border-gray-300 px-3 py-2 text-sm uppercase focus:outline-none focus:border-brand-brown"
            />
          </div>
        </div>

        <div className="flex items-center space-x-1.5 text-[11px] text-stone-500 pt-1">
          <Lock size={13} className="text-stone-400 shrink-0" />
          <span>
            {language === 'th'
              ? 'ข้อมูลบัตรส่งตรงไปยัง Omise Vault ปลอดภัยด้วย SSL 256-bit'
              : 'Card information is sent directly to Omise Vault via 256-bit SSL'}
          </span>
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-brand-brown hover:bg-brand-amber disabled:bg-gray-400 disabled:cursor-not-allowed text-white py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-colors shadow-2xs flex items-center justify-center space-x-2 cursor-pointer mt-4"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>
                {language === 'th'
                  ? 'กำลังประมวลผลการชำระเงิน...'
                  : 'Processing payment...'}
              </span>
            </>
          ) : (
            <span>
              {language === 'th'
                ? `ชำระเงิน ฿${Number(order?.totalAmount ?? 0).toLocaleString()}`
                : `Pay ฿${Number(order?.totalAmount ?? 0).toLocaleString()}`}
            </span>
          )}
        </button>

        <p className="text-[10px] text-stone-400 text-center font-mono">
          Ref: #{displayOrderNumber}
        </p>
      </form>
    </div>
  );
}
