'use client';

import React, { useState, useEffect } from 'react';
import { QrCode, CreditCard, X, AlertCircle, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { orderRequester } from '@/api/requester/orderRequester';
import { PromptPayView } from './PromptPayView';
import { CreditCardForm } from './CreditCardForm';
import { PaymentMethod, type ApiOrder } from '@repo/types';

interface CustomerPayOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  order: ApiOrder;
  onSuccess: (updatedOrder: ApiOrder) => void;
}

export function CustomerPayOrderModal({
  isOpen,
  onClose,
  order,
  onSuccess,
}: CustomerPayOrderModalProps) {
  const { t, isTh } = useLanguage();
  const { token } = useAuth();

  const [activeMethod, setActiveMethod] = useState<PaymentMethod>(
    order.payment?.paymentMethod === PaymentMethod.CREDIT_CARD
      ? PaymentMethod.CREDIT_CARD
      : PaymentMethod.PROMPTPAY,
  );

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvc, setCardCvc] = useState('');
  const [countdown, setCountdown] = useState<number>(15 * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen || activeMethod !== PaymentMethod.PROMPTPAY) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isOpen, activeMethod]);

  if (!isOpen) return null;

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (activeMethod === PaymentMethod.CREDIT_CARD) {
      const cleanNum = cardNumber.replace(/\s/g, '');
      if (cleanNum.length < 15) {
        setError(isTh ? 'กรุณากรอกหมายเลขบัตรให้ครบถ้วน' : 'Please enter a valid card number');
        return;
      }
      if (cardExpiry.length < 5) {
        setError(isTh ? 'กรุณากรอกวันหมดอายุให้ถูกต้อง (MM/YY)' : 'Please enter a valid expiry date');
        return;
      }
      if (cardCvc.length < 3) {
        setError(isTh ? 'กรุณากรอกรหัส CVC ให้ถูกต้อง' : 'Please enter a valid CVC');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const updated = await orderRequester.payOrder(
        order.orderNumber,
        {
          paymentMethod: activeMethod,
          cardLast4:
            activeMethod === PaymentMethod.CREDIT_CARD
              ? cardNumber.replace(/\s/g, '').slice(-4)
              : undefined,
          cardBrand:
            activeMethod === PaymentMethod.CREDIT_CARD ? 'Visa' : undefined,
        },
        token,
      );
      onSuccess(updated);
      onClose();
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : t('orderDetail.payModal.paymentFailedToast'),
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCardNumberChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(formatted);
  };

  const handleExpiryChange = (val: string) => {
    const raw = val.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 3) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs font-sans">
      <div className="bg-white rounded-md max-w-lg w-full border border-brand-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-brand-border flex items-center justify-between bg-stone-50/50 shrink-0">
          <div>
            <h2 className="text-sm font-bold text-stone-900 tracking-tight">
              {t('orderDetail.payModal.title')}
            </h2>
            <p className="text-[11px] text-stone-500 font-mono">
              #{order.orderNumber} • ฿{Number(order.totalAmount).toLocaleString()}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-stone-400 hover:text-stone-700 p-1 cursor-pointer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <form onSubmit={handlePay} className="p-6 space-y-5 overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xs text-xs text-rose-800 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Payment Method Selector Tabs */}
          <div className="space-y-1.5">
            <label className="block text-[11px] font-bold text-stone-700 uppercase tracking-wider">
              {t('orderDetail.payModal.methodTitle')}
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveMethod(PaymentMethod.PROMPTPAY);
                  setError(null);
                }}
                className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xs border text-xs font-bold transition-all cursor-pointer ${
                  activeMethod === PaymentMethod.PROMPTPAY
                    ? 'border-brand-brown bg-brand-warm-cream/50 text-brand-dark-brown shadow-2xs'
                    : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                <QrCode className="w-4 h-4 text-brand-brown" />
                <span>{t('orderDetail.payModal.promptpayTab')}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setActiveMethod(PaymentMethod.CREDIT_CARD);
                  setError(null);
                }}
                className={`flex items-center justify-center space-x-2 py-2.5 px-3 rounded-xs border text-xs font-bold transition-all cursor-pointer ${
                  activeMethod === PaymentMethod.CREDIT_CARD
                    ? 'border-brand-brown bg-brand-warm-cream/50 text-brand-dark-brown shadow-2xs'
                    : 'border-stone-200 bg-white text-stone-600 hover:bg-stone-50'
                }`}
              >
                <CreditCard className="w-4 h-4 text-brand-brown" />
                <span>{t('orderDetail.payModal.creditCardTab')}</span>
              </button>
            </div>
          </div>

          {/* PromptPay View */}
          {activeMethod === PaymentMethod.PROMPTPAY && (
            <PromptPayView
              totalAmount={order.totalAmount}
              countdown={countdown}
            />
          )}

          {/* Credit Card Inputs View */}
          {activeMethod === PaymentMethod.CREDIT_CARD && (
            <CreditCardForm
              cardName={cardName}
              setCardName={setCardName}
              cardNumber={cardNumber}
              onCardNumberChange={handleCardNumberChange}
              cardExpiry={cardExpiry}
              onExpiryChange={handleExpiryChange}
              cardCvc={cardCvc}
              setCardCvc={setCardCvc}
            />
          )}

          {/* Action Button */}
          <div className="pt-2 border-t border-brand-border">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-brand-brown hover:bg-brand-dark-brown text-white text-xs font-bold uppercase tracking-wider rounded-xs transition-colors flex items-center justify-center space-x-1.5 cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <span>
                  {activeMethod === PaymentMethod.PROMPTPAY
                    ? t('orderDetail.payModal.confirmPromptPayBtn')
                    : `${t('orderDetail.payModal.payWithCardBtn')} ฿${Number(order.totalAmount).toLocaleString()}`}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
