'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { orderRequester } from '@/api';
import { PromptPayAwaitingPayment, PaymentSuccessReceipt } from '@/components/order';
import { OrderStatus, PaymentMethod, type ApiOrder } from '@repo/types';
import { LoadingSpinner } from '@/components/ui';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const rawOrderNumber = searchParams.get('orderNumber') ?? '';
  const { token } = useAuth();
  const { language } = useLanguage();

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

  if (isLoading) {
    return (
      <div className="max-w-xl w-full bg-white border border-brand-border p-12 text-center shadow-xs">
        <LoadingSpinner
          text={language === 'th' ? 'กำลังโหลดข้อมูลคำสั่งซื้อ...' : 'Loading order details...'}
        />
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
        <PromptPayAwaitingPayment
          order={order}
          displayOrderNumber={displayOrderNumber}
          countdown={countdown}
          isSimulating={isSimulating}
          onSimulatePayment={handleSimulatePayment}
        />
      ) : (
        <PaymentSuccessReceipt
          order={order}
          displayOrderNumber={displayOrderNumber}
        />
      )}
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 bg-brand-warm-cream font-sans">
      <Suspense
        fallback={<LoadingSpinner className="p-12" />}
      >
        <OrderSuccessContent />
      </Suspense>
    </div>
  );
}
