'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { orderRequester } from '@/api/requester/orderRequester';
import { OrderStatus } from '@repo/types';

function OmiseCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderNumber = searchParams.get('orderNumber');
  const { isTh } = useLanguage();
  const { token, isLoading: isAuthLoading } = useAuth();

  const [statusMessage, setStatusMessage] = useState(
    isTh
      ? 'กำลังตรวจสอบผลการชำระเงินกับธนาคารและ Omise...'
      : 'Verifying payment result with the bank and Omise...',
  );
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const targetOrderNumber = orderNumber;
    if (isAuthLoading || !targetOrderNumber) return;

    let isMounted = true;

    async function checkStatus(safeNum: string) {
      try {
        const result = await orderRequester.syncOmiseStatus(safeNum, token);

        if (!isMounted) return;

        if (result.order.status !== OrderStatus.PENDING) {
          setStatusMessage(
            isTh
              ? 'การชำระเงินสำเร็จแล้ว กำลังนำท่านไปยังใบเสร็จ...'
              : 'Payment confirmed! Redirecting to receipt...',
          );
          setTimeout(() => {
            router.replace(`/order-success?orderNumber=${encodeURIComponent(safeNum)}`);
          }, 800);
        } else if (result.chargeStatus === 'failed') {
          const failMsg =
            result.failureMessage ||
            (isTh
              ? 'การชำระเงินด้วยบัตรไม่สำเร็จ (เช่น รหัส OTP ไม่ถูกต้องหรือวงเงินไม่พอ)'
              : 'Card payment was unsuccessful (e.g. invalid OTP or insufficient funds)');
          router.replace(
            `/profile/orders/${encodeURIComponent(safeNum)}?paymentError=${encodeURIComponent(failMsg)}`,
          );
        } else {
          // If still pending after 3DS redirect, take customer to order details to inspect or retry
          router.replace(`/profile/orders/${encodeURIComponent(safeNum)}`);
        }
      } catch (err: unknown) {
        if (!isMounted) return;
        const msg =
          err instanceof Error
            ? err.message
            : isTh
              ? 'ไม่สามารถตรวจสอบสถานะการชำระเงินได้'
              : 'Unable to verify payment status';
        setError(msg);
      }
    }

    void checkStatus(targetOrderNumber);

    return () => {
      isMounted = false;
    };
  }, [orderNumber, token, isAuthLoading, router, isTh]);

  return (
    <div className="max-w-md w-full bg-white border border-brand-border p-8 text-center shadow-xs font-sans">
      <div className="flex w-16 h-1.5 mx-auto mb-6">
        <div className="w-1/3 bg-brand-brown"></div>
        <div className="w-1/3 bg-white border-y border-gray-200"></div>
        <div className="w-1/3 bg-brand-amber"></div>
      </div>

      {error ? (
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-700">
            <AlertCircle size={24} />
          </div>
          <h2 className="text-base font-black uppercase tracking-tight text-brand-brown">
            {isTh ? 'เกิดข้อผิดพลาดในการตรวจสอบ' : 'Verification Issue'}
          </h2>
          <p className="text-xs text-rose-700">{error}</p>
          <button
            type="button"
            onClick={() => {
              if (orderNumber) {
                router.replace(`/profile/orders/${encodeURIComponent(orderNumber)}`);
              } else {
                router.replace('/profile/orders');
              }
            }}
            className="w-full py-2.5 bg-brand-brown text-white text-xs font-bold uppercase tracking-wider transition-colors hover:bg-brand-dark-brown cursor-pointer"
          >
            {isTh ? 'กลับไปยังหน้ารายละเอียดคำสั่งซื้อ' : 'Return to Order Details'}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="w-12 h-12 rounded-full bg-brand-warm-cream border border-brand-border flex items-center justify-center mx-auto text-brand-brown">
            <Loader2 size={24} className="animate-spin text-brand-amber" />
          </div>
          <h2 className="text-base font-black uppercase tracking-tight text-brand-brown">
            {isTh ? 'กำลังยืนยันการชำระเงิน' : 'Authorizing Payment'}
          </h2>
          <p className="text-xs text-stone-600 leading-relaxed font-medium">
            {statusMessage}
          </p>
          <div className="flex items-center justify-center space-x-1.5 text-[11px] text-stone-400">
            <ShieldCheck size={14} className="text-emerald-600" />
            <span>Omise 3-D Secure Payment Gateway</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default function OmiseCallbackPage() {
  return (
    <div className="min-h-[75vh] flex flex-col items-center justify-center px-4 py-16 bg-brand-warm-cream font-sans">
      <Suspense
        fallback={
          <div className="text-center p-8">
            <Loader2 size={28} className="animate-spin text-brand-brown mx-auto" />
          </div>
        }
      >
        <OmiseCallbackContent />
      </Suspense>
    </div>
  );
}
