'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
  ArrowLeft,
  Package,
  Ban,
  RotateCw,
  ExternalLink,
  QrCode,
  Clock,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { orderRequester } from '@/api/requester/orderRequester';
import { EmptyState, LoadingSpinner, StatusBadge } from '@/components/ui';
import {
  CustomerCancelOrderModal,
  CustomerReturnRequestModal,
  CustomerOrderItemsCard,
  CustomerOrderSummarySidebar,
} from '@/components/profile/orders';
import type { ApiOrder } from '@repo/types';

export default function CustomerOrderDetailPage() {
  const { orderNumber } = useParams<{ orderNumber: string }>();
  const { t, isTh, language } = useLanguage();
  const { token, isLoading: isAuthLoading } = useAuth();

  const [order, setOrder] = useState<ApiOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
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

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

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

  const hasPendingCancellation = Boolean(
    order.cancellationRequests?.some((req) => req.status === 'PENDING'),
  );

  const hasActiveReturn = Boolean(
    order.returnRequests?.some(
      (req) => req.status === 'REQUESTED' || req.status === 'APPROVED',
    ),
  );

  const canRequestCancellation =
    ['PAID', 'PREORDER_AWAITING_STOCK', 'PROCESSING'].includes(order.status) &&
    !hasPendingCancellation;

  const canRequestReturn = order.status === 'DELIVERED' && !hasActiveReturn;

  const isPendingPayment = order.status === 'PENDING';

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 font-sans">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="mb-4 p-3 bg-stone-900 text-white text-xs font-bold uppercase tracking-wider rounded-xs text-center shadow-lg">
          {toastMessage}
        </div>
      )}

      {/* Navigation Breadcrumb */}
      <div className="mb-6 flex items-center justify-between">
        <Link
          href="/profile/orders"
          className="inline-flex items-center text-xs font-bold uppercase tracking-wider text-stone-500 hover:text-brand-brown transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} className="mr-1.5" />
          <span>{t('orderDetail.backToOrders')}</span>
        </Link>

        <Link
          href={`/track-order/${order.orderNumber}`}
          className="inline-flex items-center space-x-1 text-xs font-bold text-brand-brown hover:text-brand-dark-brown transition-colors cursor-pointer"
        >
          <span>{t('orderDetail.liveTrackingLink')}</span>
          <ExternalLink size={13} />
        </Link>
      </div>

      {/* Order Header Card */}
      <div className="border border-brand-border bg-white p-6 rounded-md mb-6 shadow-2xs">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-stone-100 pb-4">
          <div>
            <div className="flex items-center space-x-2.5">
              <span className="text-xl sm:text-2xl font-black font-mono text-brand-dark-brown tracking-tight">
                #{order.orderNumber}
              </span>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-stone-500 mt-1">
              {t('orderDetail.placedAt')}:{' '}
              <span className="font-medium text-stone-800">
                {new Date(order.placedAt).toLocaleDateString(
                  language === 'th' ? 'th-TH' : 'en-US',
                  {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  },
                )}
              </span>
            </p>
          </div>

          {/* Action Hub */}
          <div className="flex flex-wrap items-center gap-2">
            {isPendingPayment && (
              <Link
                href={`/order-success?orderNumber=${encodeURIComponent(order.orderNumber)}`}
                className="bg-brand-brown hover:bg-brand-dark-brown text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xs inline-flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
              >
                <QrCode size={14} />
                <span>{t('orderDetail.payPromptPayBtn')}</span>
              </Link>
            )}

            {canRequestCancellation && (
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(true)}
                className="border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xs inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <Ban size={13} />
                <span>{t('orderDetail.requestCancelBtn')}</span>
              </button>
            )}

            {canRequestReturn && (
              <button
                type="button"
                onClick={() => setIsReturnModalOpen(true)}
                className="border border-brand-border text-brand-brown hover:bg-stone-50 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xs inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
              >
                <RotateCw size={13} />
                <span>{t('orderDetail.requestReturnBtn')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Notices for Active Requests */}
        {hasPendingCancellation && (
          <div className="mt-4 p-3.5 bg-amber-50 border border-amber-200 rounded-xs flex items-center space-x-2.5 text-xs text-amber-900">
            <Clock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{t('orderDetail.cancellationPendingNotice')}</span>
          </div>
        )}

        {hasActiveReturn && (
          <div className="mt-4 p-3.5 bg-blue-50 border border-blue-200 rounded-xs flex items-center space-x-2.5 text-xs text-blue-900">
            <RotateCw className="w-4 h-4 text-blue-600 shrink-0" />
            <span>{t('orderDetail.returnActiveNotice')}</span>
          </div>
        )}
      </div>

      {/* Main 12-Column Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 8 Cols: Items & Lifecycle History */}
        <div className="lg:col-span-8">
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
    </div>
  );
}
