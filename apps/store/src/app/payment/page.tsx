'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  CreditCard,
  QrCode,
  ChevronLeft,
  AlertCircle,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { orderRequester, extractApiError } from '@/api';
import { createOmiseCardToken } from '@/lib/omise';
import {
  PromptPayAwaitingPayment,
  CreditCardAwaitingPayment,
  ChangePaymentMethodModal,
  type CardSubmitData,
} from '@/components/order';
import { LoadingSpinner } from '@/components/ui';
import { OrderStatus, PaymentMethod, type ApiOrder } from '@repo/types';

function PaymentPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawOrderNumber = searchParams.get('orderNumber') ?? '';
  const initialError = searchParams.get('paymentError');

  const { token, isLoading: isAuthLoading } = useAuth();
  const { language } = useLanguage();

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingCard, setIsSubmittingCard] = useState(false);
  const [isSimulatingPromptPay, setIsSimulatingPromptPay] = useState(false);
  const [isChangeModalOpen, setIsChangeModalOpen] = useState(false);
  const [isUpdatingMethod, setIsUpdatingMethod] = useState(false);
  const [changeMethodError, setChangeMethodError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState<number>(15 * 60);
  const [errorMessage, setErrorMessage] = useState<string | null>(initialError);

  const fetchOrder = useCallback(async () => {
    if (!rawOrderNumber) return;
    try {
      const data = await orderRequester.getOrderDetail(rawOrderNumber, token);
      setOrder(data);

      if (data.status !== OrderStatus.PENDING) {
        router.replace(`/order-success?orderNumber=${encodeURIComponent(rawOrderNumber)}`);
      }
    } catch (err: unknown) {
      const extracted = extractApiError(
        err,
        language === 'th'
          ? 'ไม่สามารถดึงข้อมูลคำสั่งซื้อได้'
          : 'Failed to retrieve order details',
      );
      setErrorMessage(extracted.message);
    } finally {
      setIsLoading(false);
    }
  }, [rawOrderNumber, token, language, router]);

  useEffect(() => {
    if (isAuthLoading) return;
    fetchOrder();
  }, [isAuthLoading, fetchOrder]);

  // Synchronized countdown for PromptPay QR (synced with qrExpiresAt from backend)
  useEffect(() => {
    if (order?.status !== OrderStatus.PENDING) return;

    const calculateRemaining = () => {
      const qrExpiresAt = order.payment?.qrExpiresAt;
      if (qrExpiresAt) {
        const expiryTime = new Date(qrExpiresAt).getTime();
        if (!isNaN(expiryTime)) {
          return Math.max(0, Math.floor((expiryTime - Date.now()) / 1000));
        }
      }
      return null;
    };

    const initial = calculateRemaining();
    if (initial !== null) {
      setCountdown(initial);
    }

    const timer = setInterval(() => {
      const remaining = calculateRemaining();
      if (remaining !== null) {
        setCountdown(remaining);
      } else {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [order?.status, order?.payment?.qrExpiresAt]);

  // Real-time Webhook Polling: poll every 3 seconds while order is PENDING
  useEffect(() => {
    if (!order || order.status !== OrderStatus.PENDING || !rawOrderNumber) return;

    const pollInterval = setInterval(async () => {
      try {
        const statusResult = await orderRequester.syncOmiseStatus(rawOrderNumber, token);
        if (statusResult.order.status !== OrderStatus.PENDING) {
          setOrder(statusResult.order);
          router.replace(`/order-success?orderNumber=${encodeURIComponent(rawOrderNumber)}`);
        }
      } catch {
        // Continue polling silently
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [order, rawOrderNumber, token, router]);

  const activeMethod =
    order?.payment?.paymentMethod === PaymentMethod.CREDIT_CARD
      ? PaymentMethod.CREDIT_CARD
      : PaymentMethod.PROMPTPAY;

  const handleConfirmMethodChange = async (newMethod: PaymentMethod) => {
    if (!order) return;
    setIsUpdatingMethod(true);
    setChangeMethodError(null);
    try {
      const updated = await orderRequester.updatePaymentMethod(
        order.orderNumber,
        newMethod,
        token,
      );
      setOrder(updated);
      setIsChangeModalOpen(false);
    } catch (err: unknown) {
      const extracted = extractApiError(
        err,
        language === 'th'
          ? 'ไม่สามารถเปลี่ยนช่องทางการชำระเงินได้'
          : 'Failed to update payment method',
      );
      setChangeMethodError(extracted.message);
    } finally {
      setIsUpdatingMethod(false);
    }
  };

  const handleSimulatePromptPay = async () => {
    if (!order) return;
    setIsSimulatingPromptPay(true);
    setErrorMessage(null);
    try {
      const updated = await orderRequester.simulateOmisePay(order.orderNumber, token);
      setOrder(updated);
      router.replace(`/order-success?orderNumber=${encodeURIComponent(order.orderNumber)}`);
    } catch (err: unknown) {
      const extracted = extractApiError(
        err,
        language === 'th'
          ? 'จำลองการชำระเงินไม่สำเร็จ'
          : 'Failed to simulate payment',
      );
      setErrorMessage(extracted.message);
    } finally {
      setIsSimulatingPromptPay(false);
    }
  };

  const handleCreditCardSubmit = async (cardData: CardSubmitData) => {
    if (!order) return;
    setIsSubmittingCard(true);
    setErrorMessage(null);

    try {
      const tokenResult = await createOmiseCardToken({
        name: cardData.name,
        number: cardData.number,
        expirationMonth: cardData.expirationMonth,
        expirationYear: cardData.expirationYear,
        securityCode: cardData.securityCode,
      });

      const payResult = await orderRequester.payOrder(
        order.orderNumber,
        {
          paymentMethod: PaymentMethod.CREDIT_CARD,
          omiseToken: tokenResult.id,
          cardLast4: tokenResult.card.last_digits,
          cardBrand: tokenResult.card.brand,
        },
        token,
      );

      if (payResult.authorizeUri) {
        window.location.href = payResult.authorizeUri;
        return;
      }

      router.replace(`/order-success?orderNumber=${encodeURIComponent(order.orderNumber)}`);
    } catch (err: unknown) {
      const extracted = extractApiError(
        err,
        language === 'th'
          ? 'การชำระเงินไม่สำเร็จ กรุณาตรวจสอบข้อมูลบัตรหรือลองใหม่อีกครั้ง'
          : 'Payment failed. Please check your card information and try again.',
      );
      setErrorMessage(extracted.message);
      setIsSubmittingCard(false);
    }
  };

  if (isLoading) {
    return (
      <div className="w-full bg-white border border-brand-border p-16 text-center shadow-xs">
        <LoadingSpinner
          text={language === 'th' ? 'กำลังโหลดข้อมูลการชำระเงิน...' : 'Loading payment details...'}
        />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl mx-auto w-full bg-white border border-brand-border p-10 text-center shadow-xs space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-700">
          <AlertCircle size={24} />
        </div>
        <h2 className="text-base font-black uppercase tracking-tight text-brand-brown">
          {language === 'th' ? 'ไม่พบคำสั่งซื้อ' : 'Order Not Found'}
        </h2>
        <p className="text-xs text-rose-700">
          {errorMessage ?? (language === 'th' ? 'หมายเลขคำสั่งซื้อไม่ถูกต้อง' : 'Invalid order number')}
        </p>
        <Link
          href="/profile/orders"
          className="inline-block py-2.5 px-6 bg-brand-brown text-white text-xs font-bold uppercase tracking-wider transition-colors hover:bg-brand-dark-brown"
        >
          {language === 'th' ? 'กลับไปยังประวัติคำสั่งซื้อ' : 'Back to My Orders'}
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Top Header / Breadcrumb navigation with Brand Identity */}
      <div className="flex items-center justify-between pb-6 mb-8 border-b border-stone-200">
        <Link
          href={`/profile/orders/${encodeURIComponent(order.orderNumber)}`}
          className="inline-flex items-center space-x-1.5 text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-brand-brown transition-colors"
        >
          <ChevronLeft size={16} />
          <span>{language === 'th' ? 'กลับไปยังคำสั่งซื้อ' : 'Back to Order'}</span>
        </Link>

        {/* Center Brand Wordmark */}
        <div className="flex flex-col items-center">
          <span className="font-sans font-black tracking-[0.25em] text-brand-brown uppercase text-xl">
            NIDA
          </span>
          <div className="flex w-10 h-1 mt-0.5 rounded-2xs overflow-hidden">
            <div className="w-1/3 bg-brand-brown"></div>
            <div className="w-1/3 bg-white border-y border-stone-200"></div>
            <div className="w-1/3 bg-brand-amber"></div>
          </div>
        </div>

        <span className="font-mono text-xs font-bold text-stone-500">
          #{order.orderNumber}
        </span>
      </div>

      {/* Main Payment Section: 12-Column Responsive Home-Aligned Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left Column (5 Cols): Order Amount & Payment Method Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-brand-border p-6 sm:p-8 shadow-xs space-y-6">
            {/* Nida Flag Ribbon */}
            <div className="flex w-16 h-1.5">
              <div className="w-1/3 bg-brand-brown"></div>
              <div className="w-1/3 bg-white border-y border-stone-200"></div>
              <div className="w-1/3 bg-brand-amber"></div>
            </div>

            {/* Total Amount to Pay Banner */}
            <div>
              <p className="text-[11px] font-black uppercase tracking-widest text-stone-400 mb-1">
                {language === 'th' ? 'ยอดเงินที่ต้องชำระ' : 'Total Amount to Pay'}
              </p>
              <p className="font-mono text-3xl sm:text-4xl font-black text-brand-dark-brown tracking-tight">
                ฿{Number(order.totalAmount).toLocaleString()}
              </p>
            </div>

            {/* Selected Method & Change Button */}
            <div className="pt-5 border-t border-stone-100 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-full bg-stone-100 border border-stone-200 flex items-center justify-center text-brand-brown shrink-0">
                  {activeMethod === PaymentMethod.CREDIT_CARD ? (
                    <CreditCard size={18} />
                  ) : (
                    <QrCode size={18} />
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-stone-900">
                    {activeMethod === PaymentMethod.CREDIT_CARD
                      ? language === 'th'
                        ? 'บัตรเครดิต / เดบิต'
                        : 'Credit / Debit Card'
                      : 'PromptPay QR Code'}
                  </p>
                  <p className="text-[11px] text-stone-400 font-medium">
                    {activeMethod === PaymentMethod.CREDIT_CARD
                      ? 'Visa, Mastercard, JCB'
                      : 'Thai QR Payment'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setChangeMethodError(null);
                  setIsChangeModalOpen(true);
                }}
                className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-stone-600 hover:text-brand-brown py-1.5 px-3 rounded-xs border border-stone-200 hover:border-brand-brown bg-stone-50 hover:bg-white transition-all cursor-pointer shadow-2xs"
              >
                <span>{language === 'th' ? 'เปลี่ยนช่องทาง' : 'Change'}</span>
              </button>
            </div>

            {/* Minimal Security Notice */}
            <div className="pt-5 border-t border-stone-100 flex items-center space-x-2 text-[11px] text-stone-500">
              <ShieldCheck size={16} className="text-emerald-700 shrink-0" />
              <span>
                {language === 'th'
                  ? 'ชำระปลอดภัย มาตรฐาน PCI-DSS Level 1'
                  : 'PCI-DSS Level 1 Encrypted Payment'}
              </span>
            </div>
          </div>
        </div>

        {/* Right Column (7 Cols): Payment Widget (Card Form or PromptPay QR) */}
        <div className="lg:col-span-7">
          <div className="bg-white border border-brand-border p-6 sm:p-8 shadow-xs">
            {activeMethod === PaymentMethod.CREDIT_CARD ? (
              <CreditCardAwaitingPayment
                order={order}
                displayOrderNumber={order.orderNumber}
                isSubmitting={isSubmittingCard}
                onSubmitPayment={handleCreditCardSubmit}
                error={errorMessage}
              />
            ) : (
              <PromptPayAwaitingPayment
                order={order}
                displayOrderNumber={order.orderNumber}
                countdown={countdown}
                isSimulating={isSimulatingPromptPay}
                onSimulatePayment={handleSimulatePromptPay}
              />
            )}
          </div>
        </div>
      </div>

      {/* Change Payment Method Modal */}
      <ChangePaymentMethodModal
        isOpen={isChangeModalOpen}
        onClose={() => setIsChangeModalOpen(false)}
        currentMethod={activeMethod}
        orderNumber={order.orderNumber}
        totalAmount={Number(order.totalAmount)}
        onConfirmChange={handleConfirmMethodChange}
        isUpdating={isUpdatingMethod}
        error={changeMethodError}
      />
    </div>
  );
}

export default function PaymentPage() {
  return (
    <div className="min-h-screen bg-stone-50/50 font-sans py-8 sm:py-12 flex flex-col justify-between">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full">
        <Suspense fallback={<LoadingSpinner className="p-16" />}>
          <PaymentPageContent />
        </Suspense>
      </div>

      {/* Minimal Enclosed Footer Note */}
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full pt-12 pb-4 text-center">
        <p className="text-[11px] text-stone-400 font-medium">
          © {new Date().getFullYear()} NIDA. All rights reserved. • Secured by Omise Payment Gateway (PCI-DSS Level 1)
        </p>
      </div>
    </div>
  );
}
