'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams, useSearchParams } from 'next/navigation';
import { Package } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { orderRequester } from '@/api/requester/orderRequester';
import { EmptyState, LoadingSpinner } from '@/components/ui';
import {
  CustomerCancelOrderModal,
  CustomerReturnRequestModal,
  CustomerAcceptDeliveryModal,
  CustomerOrderHeaderCard,
  CustomerOrderItemsCard,
  CustomerOrderSummarySidebar,
  CustomerOrderTrackingCard,
  CustomerOrderCancellationCard,
  CustomerOrderReturnCard,
} from '@/components/profile/orders';
import { OrderStatus, type ApiOrder } from '@repo/types';

export default function CustomerOrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const searchParams = useSearchParams();
  const queryPaymentError = searchParams.get('paymentError');
  const { t, isTh } = useLanguage();
  const { token, isLoading: isAuthLoading } = useAuth();

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isAcceptModalOpen, setIsAcceptModalOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const loadOrderDetail = useCallback(async () => {
    if (!orderNumber) return;
    try {
      const data = await orderRequester.getOrderDetail(orderNumber, token);
      setOrder(data);
    } catch {
      setOrder(null);
    } finally {
      setIsLoading(false);
    }
  }, [orderNumber, token]);

  useEffect(() => {
    if (!isAuthLoading) {
      void loadOrderDetail();
    }
  }, [isAuthLoading, loadOrderDetail]);

  // Real-time polling when order is PENDING to detect Omise QR or webhook payment automatically
  useEffect(() => {
    if (!order || order.status !== OrderStatus.PENDING || !orderNumber) return;

    const interval = setInterval(async () => {
      try {
        const syncResult = await orderRequester.syncOmiseStatus(orderNumber, token);
        if (syncResult.order.status !== OrderStatus.PENDING) {
          setOrder(syncResult.order);
          setToastMessage(isTh ? 'การชำระเงินสำเร็จแล้ว!' : 'Payment completed successfully!');
        }
      } catch {
        // Silently continue polling
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [order?.status, orderNumber, token, isTh]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const paymentError = queryPaymentError || order?.payment?.failureMessage;

  if (isLoading || isAuthLoading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!order) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center font-sans">
        <EmptyState
          variant="dashed"
          icon={Package}
          title={t('orderDetail.notFoundTitle')}
          description={t('orderDetail.notFoundDesc')}
          action={{
            label: t('orderDetail.backToOrders'),
            href: '/profile/orders',
          }}
          className="p-12 sm:p-16"
        />
      </div>
    );
  }

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-10 font-sans space-y-6">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold uppercase tracking-wider flex items-center justify-between shadow-xs">
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-emerald-700 hover:text-emerald-900 font-bold ml-4"
          >
            ✕
          </button>
        </div>
      )}

      {/* Payment Failure Alert Banner */}
      {paymentError && order.status === OrderStatus.PENDING && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-xs">
          <div>
            <p className="text-xs font-black uppercase tracking-wider text-rose-800">
              {isTh ? 'การชำระเงินไม่สำเร็จ' : 'Payment Failed'}
            </p>
            <p className="text-xs text-rose-700 mt-0.5">
              {paymentError}
            </p>
          </div>
          <Link
            href={`/payment?orderNumber=${encodeURIComponent(order.orderNumber)}`}
            className="shrink-0 px-4 py-2 bg-brand-brown hover:bg-brand-dark-brown text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            {t('orderHistory.payNow')}
          </Link>
        </div>
      )}

      {/* Order Header Card */}
      <CustomerOrderHeaderCard
        order={order}
        onOpenCancelModal={() => setIsCancelModalOpen(true)}
        onOpenReturnModal={() => setIsReturnModalOpen(true)}
        onOpenAcceptModal={() => setIsAcceptModalOpen(true)}
      />

      {/* Main 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Tracking Progress, Requests & Items */}
        <div className="lg:col-span-8 space-y-6">
          <CustomerOrderTrackingCard order={order} />
          {order.cancellationRequests && order.cancellationRequests.length > 0 && (
            <CustomerOrderCancellationCard
              cancellationRequests={order.cancellationRequests}
            />
          )}
          {order.returnRequests && order.returnRequests.length > 0 && (
            <CustomerOrderReturnCard order={order} />
          )}
          <CustomerOrderItemsCard order={order} />
        </div>

        {/* Right 4 Cols: Financial Breakdown, Address */}
        <div className="lg:col-span-4">
          <CustomerOrderSummarySidebar order={order} />
        </div>
      </div>

      {/* Cancellation Modal */}
      <CustomerCancelOrderModal
        isOpen={isCancelModalOpen}
        onClose={() => setIsCancelModalOpen(false)}
        orderNumber={order.orderNumber}
        onSuccess={(updated) => {
          setOrder(updated);
          showToast(t('orderDetail.cancelSuccessToast'));
        }}
      />

      {/* Return Modal */}
      <CustomerReturnRequestModal
        isOpen={isReturnModalOpen}
        onClose={() => setIsReturnModalOpen(false)}
        order={order}
        onSuccess={(updated) => {
          setOrder(updated);
          showToast(t('orderDetail.returnSuccessToast'));
        }}
      />

      {/* Accept Delivery Modal */}
      <CustomerAcceptDeliveryModal
        isOpen={isAcceptModalOpen}
        onClose={() => setIsAcceptModalOpen(false)}
        orderNumber={order.orderNumber}
        onSuccess={(updated) => {
          setOrder(updated);
          showToast(t('orderDetail.acceptSuccessToast'));
        }}
      />
    </div>
  );
}
