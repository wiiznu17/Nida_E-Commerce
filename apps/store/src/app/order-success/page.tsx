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
      <div className="max-w-xl w-full bg-white border border-brand-border p-12 text-center shadow-xs">
        <LoadingSpinner
          text={
            language === 'th'
              ? 'กำลังโหลดข้อมูลคำสั่งซื้อ...'
              : 'Loading order details...'
          }
        />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-xl w-full bg-white border border-brand-border p-8 text-center shadow-xs space-y-4">
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
        <Link
          href="/profile/orders"
          className="inline-block py-2.5 px-6 bg-brand-brown text-white text-xs font-bold uppercase tracking-wider transition-colors hover:bg-brand-dark-brown"
        >
          {language === 'th'
            ? 'กลับไปยังประวัติคำสั่งซื้อ'
            : 'Back to My Orders'}
        </Link>
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

      <PaymentSuccessReceipt
        order={order}
        displayOrderNumber={displayOrderNumber}
      />
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 bg-brand-warm-cream font-sans">
      <Suspense fallback={<LoadingSpinner className="p-12" />}>
        <OrderSuccessContent />
      </Suspense>
    </div>
  );
}
