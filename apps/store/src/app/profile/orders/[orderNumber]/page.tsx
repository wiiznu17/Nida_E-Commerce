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
  CreditCard,
  Clock,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useAuth } from '@/context/AuthContext';
import { orderRequester } from '@/api/requester/orderRequester';
import { EmptyState, LoadingSpinner, StatusBadge } from '@/components/ui';
import {
  CustomerCancelOrderModal,
  CustomerReturnRequestModal,
  CustomerPayOrderModal,
  CustomerOrderHeaderCard,
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
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
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

      {/* Order Header Card */}
      <CustomerOrderHeaderCard
        order={order}
        onOpenPayModal={() => setIsPayModalOpen(true)}
        onOpenCancelModal={() => setIsCancelModalOpen(true)}
        onOpenReturnModal={() => setIsReturnModalOpen(true)}
      />

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

      {/* Pay Order Modal */}
      <CustomerPayOrderModal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        order={order}
        onSuccess={(updated) => {
          setOrder(updated);
          showToast(t('orderDetail.payModal.paymentSuccessToast'));
        }}
      />
    </div>
  );
}
