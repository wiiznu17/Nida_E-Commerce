'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { orderRequester } from '@/api';
import { PaymentSuccessReceipt } from '@/components/order';
import { OrderStatus, type ApiOrder } from '@repo/types';
import { LoadingSpinner } from '@/components/ui';
import { StandaloneHeader, StandaloneFooter } from '@/components/layout';

function OrderSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawOrderNumber = searchParams.get('orderNumber') ?? '';
  const { token, isLoading: isAuthLoading } = useAuth();
  const { language } = useLanguage();

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const fetchOrder = useCallback(async () => {
    if (!rawOrderNumber) {
      setIsLoading(false);
      return;
    }
    try {
      const data = await orderRequester.getOrderDetail(rawOrderNumber, token);
      setOrder(data);

      // If order is still pending, redirect customer to the payment page
      if (data.status === OrderStatus.PENDING) {
        router.replace(
          `/payment?orderNumber=${encodeURIComponent(rawOrderNumber)}`,
        );
      }
    } catch (err: unknown) {
      console.warn('[OrderSuccess] Fetch order failed:', err);
      setErrorMessage(
        language === 'th'
          ? 'ไม่สามารถดึงข้อมูลคำสั่งซื้อได้'
          : 'Failed to retrieve order details',
      );
    } finally {
      setIsLoading(false);
    }
  }, [rawOrderNumber, token, language, router]);

  useEffect(() => {
    if (isAuthLoading) return;
    fetchOrder();
  }, [isAuthLoading, fetchOrder]);

  const displayOrderNumber = order?.orderNumber ?? rawOrderNumber;

  if (isLoading) {
    return (
      <div className="w-full flex-1 flex flex-col justify-between">
        <StandaloneHeader />
        <div className="max-w-md mx-auto w-full bg-white border border-brand-border p-12 text-center shadow-xs my-auto">
          <LoadingSpinner
            text={
              language === 'th'
                ? 'กำลังโหลดข้อมูลคำสั่งซื้อ...'
                : 'Loading order details...'
            }
          />
        </div>
        <StandaloneFooter />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="w-full flex-1 flex flex-col justify-between">
        <StandaloneHeader />
        <div className="max-w-md mx-auto w-full bg-white border border-brand-border p-8 sm:p-10 text-center shadow-xs space-y-4 my-auto">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-700">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-base font-black uppercase tracking-tight text-brand-brown">
            {language === 'th' ? 'ไม่พบคำสั่งซื้อ' : 'Order Not Found'}
          </h2>
          <p className="text-xs text-rose-700">
            {errorMessage ||
              (language === 'th'
                ? 'หมายเลขคำสั่งซื้อไม่ถูกต้อง'
                : 'Invalid order number')}
          </p>
          <div className="pt-2">
            <Link
              href="/profile/orders"
              className="inline-block py-2.5 px-6 bg-brand-brown text-white text-xs font-bold uppercase tracking-wider transition-colors hover:bg-brand-dark-brown"
            >
              {language === 'th'
                ? 'กลับไปยังประวัติคำสั่งซื้อ'
                : 'Back to My Orders'}
            </Link>
          </div>
        </div>
        <StandaloneFooter />
      </div>
    );
  }

  return (
    <div className="w-full flex-1 flex flex-col justify-between">
      {/* Shared Slim Standalone Brand Header */}
      <StandaloneHeader
        orderNumber={displayOrderNumber}
        backHref={`/profile/orders/${encodeURIComponent(displayOrderNumber)}`}
        backLabel={
          language === 'th' ? 'ดูรายละเอียดคำสั่งซื้อ' : 'Order Details'
        }
      />

      {/* Main Single Centered Interstitial Confirmation Card */}
      <div className="max-w-md mx-auto w-full my-auto px-2 sm:px-0">
        <div className="bg-white border border-brand-border p-6 sm:p-9 shadow-xs">
          <PaymentSuccessReceipt
            order={order}
            displayOrderNumber={displayOrderNumber}
          />
        </div>
      </div>

      {/* Shared Minimal Footer Note */}
      <StandaloneFooter
        note={
          language === 'th'
            ? `© ${new Date().getFullYear()} NIDA. All rights reserved. • เอกสารยืนยันการชำระเงินทางการ NIDA Official`
            : undefined
        }
      />
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-screen bg-stone-50/50 font-sans pt-2 sm:pt-3 pb-8 sm:pb-12 flex flex-col justify-between">
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 w-full flex-1 flex flex-col">
        <Suspense fallback={<LoadingSpinner className="p-16 my-auto" />}>
          <OrderSuccessContent />
        </Suspense>
      </div>
    </div>
  );
}
