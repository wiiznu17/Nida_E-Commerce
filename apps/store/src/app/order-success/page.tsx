'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import {
  CheckCircle2,
  ArrowRight,
  Package,
  ShoppingBag,
  Loader2,
  QrCode,
  Clock,
  Sparkles,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { orderRequester } from '@/api';
import { OrderStatus, PaymentMethod, type ApiOrder } from '@repo/types';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const rawOrderNumber = searchParams.get('orderNumber') ?? '';
  const { token } = useAuth();
  const { language, t } = useLanguage();

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSimulating, setIsSimulating] = useState(false);
  const [countdown, setCountdown] = useState<number>(15 * 60);

  const fetchOrder = useCallback(async () => {
    if (!rawOrderNumber) return;
    try {
      const data = await orderRequester.getOrderDetail(rawOrderNumber, token);
      setOrder(data);
    } catch (err: unknown) {
      console.warn('[OrderSuccess] Fetch order failed:', err);
    } finally {
      setIsLoading(false);
    }
  }, [rawOrderNumber, token]);

  // Initial fetch
  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // 15-minute countdown for PromptPay QR
  useEffect(() => {
    if (order?.status !== OrderStatus.PENDING) return;
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [order?.status]);

  // Real-time Webhook Polling: poll every 3 seconds while order is PENDING
  useEffect(() => {
    if (!order || order.status !== OrderStatus.PENDING || !rawOrderNumber) return;

    const pollInterval = setInterval(async () => {
      try {
        const latest = await orderRequester.getOrderDetail(rawOrderNumber, token);
        if (latest.status !== OrderStatus.PENDING) {
          setOrder(latest);
        }
      } catch {
        // Continue polling silently
      }
    }, 3000);

    return () => clearInterval(pollInterval);
  }, [order, rawOrderNumber, token]);

  const handleSimulatePayment = async () => {
    if (!order) return;
    setIsSimulating(true);
    try {
      const updated = await orderRequester.payOrder(order.orderNumber, token);
      setOrder(updated);
    } catch (err: unknown) {
      console.warn('[OrderSuccess] Simulate payment error:', err);
    } finally {
      setIsSimulating(false);
    }
  };

  const displayOrderNumber = order?.orderNumber ?? rawOrderNumber;
  const isPending = order?.status === OrderStatus.PENDING;
  const isPromptPay =
    order?.payment?.paymentMethod === PaymentMethod.PROMPTPAY || !order?.payment;

  const minutes = Math.floor(countdown / 60);
  const seconds = countdown % 60;
  const formattedCountdown = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  if (isLoading) {
    return (
      <div className="max-w-xl w-full bg-white border border-brand-border p-12 text-center shadow-xs">
        <Loader2 size={24} className="animate-spin mx-auto text-brand-brown mb-3" />
        <p className="text-xs uppercase font-bold tracking-widest text-gray-500">
          {language === 'th' ? 'กำลังโหลดข้อมูลคำสั่งซื้อ...' : 'Loading order details...'}
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl w-full bg-white border border-brand-border p-6 sm:p-10 text-center shadow-xs">
      {/* Nida Flag Ribbon */}
      <div className="flex w-16 h-1.5 mx-auto mb-6">
        <div className="w-1/3 bg-brand-brown"></div>
        <div className="w-1/3 bg-white border-y border-gray-200"></div>
        <div className="w-1/3 bg-brand-amber"></div>
      </div>

      {isPending && isPromptPay ? (
        /* PROMPTPAY PAYMENT AWAITING SCREEN */
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-50 border border-amber-200 text-amber-900 rounded-full mb-4">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            <span className="text-[11px] font-bold uppercase tracking-wider">
              {t('orderSuccess.orderPendingStatus')}
            </span>
          </div>

          <h1 className="text-2xl font-black uppercase tracking-tight text-brand-brown mb-1.5">
            {t('orderSuccess.awaitingPromptPay')}
          </h1>
          <p className="text-xs text-gray-600 leading-relaxed mb-6 font-medium">
            {t('orderSuccess.promptPayDesc')}
          </p>

          {/* QR Code Card */}
          <div className="border border-brand-border bg-brand-warm-cream/40 p-6 mb-6 text-center">
            {/* Thai QR Header Banner */}
            <div className="bg-[#113566] text-white py-2 px-4 rounded-t-sm mb-4 inline-block shadow-xs">
              <span className="text-[11px] font-black uppercase tracking-widest">
                Thai QR Payment • PromptPay
              </span>
            </div>

            {/* Generated QR Code */}
            <div className="w-56 h-56 mx-auto bg-white p-3 border border-gray-300 shadow-xs mb-3 flex items-center justify-center relative">
              {order?.totalAmount ? (
                <Image
                  src={`https://promptpay.io/0105567891234/${Number(order.totalAmount).toFixed(2)}.png`}
                  alt="PromptPay QR Code"
                  width={200}
                  height={200}
                  unoptimized
                  className="w-full h-full object-contain"
                />
              ) : (
                <QrCode size={160} className="text-brand-brown" />
              )}
            </div>

            {/* QR Meta Details */}
            <div className="space-y-1 text-xs">
              <p className="font-mono text-xl font-black text-brand-brown tracking-tight">
                ฿{Number(order?.totalAmount ?? 0).toLocaleString()}
              </p>
              <p className="text-[11px] font-bold text-gray-700">
                {t('orderSuccess.accountName')}
              </p>
              <p className="text-[10px] text-gray-500 font-mono">
                {t('orderSuccess.promptPayId')} • Ref: #{displayOrderNumber}
              </p>
            </div>

            {/* Countdown Badge */}
            <div className="mt-4 pt-3 border-t border-brand-border/60 flex items-center justify-center space-x-2 text-xs text-amber-900 font-bold">
              <Clock size={14} className="text-amber-700" />
              <span>
                {language === 'th'
                  ? `กรุณาชำระเงินภายใน ${formattedCountdown} นาที`
                  : `Please pay within ${formattedCountdown} mins`}
              </span>
            </div>
          </div>

          {/* Listening to Webhook Banner */}
          <div className="mb-6 p-3 bg-brand-warm-cream border border-brand-border flex items-center justify-center space-x-2 text-xs text-gray-700">
            <Loader2 size={14} className="animate-spin text-brand-amber shrink-0" />
            <span className="text-[11px] font-medium">
              {t('orderSuccess.listeningWebhook')}
            </span>
          </div>

          {/* Test Sandbox Simulate Payment Button */}
          <div className="mb-6">
            <button
              type="button"
              onClick={handleSimulatePayment}
              disabled={isSimulating}
              className="w-full bg-brand-brown hover:bg-brand-amber disabled:bg-gray-400 text-white py-3 text-xs font-black uppercase tracking-[0.2em] transition-colors shadow-sm flex items-center justify-center space-x-2 cursor-pointer"
            >
              {isSimulating ? (
                <>
                  <Loader2 size={14} className="animate-spin" />
                  <span>{t('orderSuccess.simulating')}</span>
                </>
              ) : (
                <>
                  <Sparkles size={14} />
                  <span>{t('orderSuccess.simulatePayment')}</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-gray-500 mt-1.5">
              {language === 'th'
                ? '* ปุ่มจำลองสำหรับทดสอบระบบในขั้นตอนพัฒนา โดยจะปรับสถานะเป็น PAID และตัดยอดทันที'
                : '* Sandbox test button to immediately trigger PAID state and verify real-time polling'}
            </p>
          </div>
        </div>
      ) : (
        /* PAYMENT COMPLETE / PAID SCREEN */
        <div>
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shadow-xs">
              <CheckCircle2 size={36} strokeWidth={2.2} />
            </div>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-brand-brown mb-2">
            {t('orderSuccess.paymentSuccessTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed mb-6 font-medium">
            {t('orderSuccess.paymentSuccessDesc')}
          </p>

          {/* Order Number & Status Box */}
          <div className="border border-brand-border bg-brand-warm-cream p-5 mb-6 text-left sm:text-center">
            <p className="text-[10px] uppercase font-bold tracking-widest text-gray-500 mb-1">
              {t('orderSuccess.orderNumberLabel')}
            </p>
            <p className="text-2xl font-black font-mono text-brand-brown tracking-wider">
              #{displayOrderNumber}
            </p>
            <div className="mt-2 flex items-center justify-start sm:justify-center space-x-2 text-xs text-emerald-800 font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
              <span>{t('orderSuccess.orderPaidStatus')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Real Items Summary */}
      {order && order.items && order.items.length > 0 && (
        <div className="mb-6 border border-gray-200 p-4 text-left">
          <p className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-3">
            {t('orderSuccess.itemsOrdered')} ({order.items.length})
          </p>
          <div className="space-y-3 max-h-48 overflow-y-auto pr-1">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="truncate mr-2">
                  <p className="font-bold text-brand-brown truncate">{item.productName}</p>
                  <p className="text-[10px] text-gray-500">
                    {item.variantInfo} • จำนวน: {item.quantity}
                  </p>
                </div>
                <span className="font-bold text-brand-brown shrink-0 font-mono">
                  ฿{(Number(item.unitPrice) * item.quantity).toLocaleString()}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200 flex justify-between font-black text-sm text-brand-brown">
            <span>{t('orderSuccess.totalAmount')}</span>
            <span className="font-mono text-base">
              ฿{Number(order.totalAmount).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Bottom Actions */}
      <div className="flex flex-col space-y-3">
        <Link
          href={`/track-order/${encodeURIComponent(displayOrderNumber)}`}
          className="w-full bg-brand-brown hover:bg-brand-amber text-white py-3.5 text-xs font-black uppercase tracking-[0.2em] transition-colors shadow-md flex items-center justify-center space-x-2 cursor-pointer"
        >
          <Package size={16} />
          <span>{t('orderSuccess.trackOrder')}</span>
          <ArrowRight size={14} />
        </Link>
        <Link
          href="/"
          className="w-full py-3.5 text-xs font-black uppercase tracking-[0.2em] text-brand-brown hover:text-brand-amber border border-gray-300 hover:border-brand-brown transition-colors flex items-center justify-center space-x-2 cursor-pointer"
        >
          <ShoppingBag size={16} />
          <span>{t('orderSuccess.continueShopping')}</span>
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 bg-brand-warm-cream font-sans">
      <Suspense
        fallback={
          <div className="p-12 text-center">
            <Loader2 size={24} className="animate-spin mx-auto text-brand-brown" />
          </div>
        }
      >
        <OrderSuccessContent />
      </Suspense>
    </div>
  );
}
