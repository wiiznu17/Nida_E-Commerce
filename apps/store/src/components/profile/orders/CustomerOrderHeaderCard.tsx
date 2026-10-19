'use client';

import React from 'react';
import Link from 'next/link';
import { Ban, RotateCw, CreditCard, Clock, CheckCircle2, RotateCcw } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { StatusBadge } from '@/components/ui';
import type { ApiOrder } from '@repo/types';

interface CustomerOrderHeaderCardProps {
  order: ApiOrder;
  onOpenCancelModal: () => void;
  onOpenReturnModal: () => void;
  onOpenAcceptModal: () => void;
}

export function CustomerOrderHeaderCard({
  order,
  onOpenCancelModal,
  onOpenReturnModal,
  onOpenAcceptModal,
}: CustomerOrderHeaderCardProps) {
  const { t, language } = useLanguage();

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

  const canAcceptDelivery =
    order.status === 'DELIVERED' && !hasActiveReturn;

  const referenceDate = new Date(
    order.completedAt ?? order.updatedAt ?? order.placedAt,
  );
  const isWithinReturnWindow =
    Date.now() - referenceDate.getTime() <= 7 * 24 * 60 * 60 * 1000;

  const canRequestReturn =
    (order.status === 'DELIVERED' || order.status === 'COMPLETED') &&
    !hasActiveReturn &&
    isWithinReturnWindow;

  const isPendingPayment = order.status === 'PENDING';

  const isPaid = Boolean(
    order.payment?.paidAt ||
      order.payment?.status === 'CAPTURED' ||
      order.payment?.status === 'REFUNDED',
  );

  const isApprovedCancellation = Boolean(
    order.cancellationRequests?.some((req) => req.status === 'APPROVED'),
  );

  const isUnpaidTimeout =
    !isPaid &&
    (order.payment?.status === 'FAILED' ||
      Date.now() - new Date(order.placedAt).getTime() > 15 * 60 * 1000);

  const renderCancelledNotice = () => {
    if (isApprovedCancellation) {
      return (
        <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xs flex items-center space-x-2.5 text-xs text-emerald-900">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{t('orderDetail.cancellationApprovedNotice')}</span>
        </div>
      );
    }
    if (isPaid) {
      return (
        <div className="mt-4 p-3.5 bg-stone-50 border border-stone-200 rounded-xs flex items-center space-x-2.5 text-xs text-stone-700">
          <Ban className="w-4 h-4 text-stone-500 shrink-0" />
          <span>{t('orderDetail.adminCancelledPaidNotice')}</span>
        </div>
      );
    }
    if (isUnpaidTimeout) {
      return (
        <div className="mt-4 p-3.5 bg-stone-50 border border-stone-200 rounded-xs flex items-center space-x-2.5 text-xs text-stone-700">
          <Ban className="w-4 h-4 text-stone-500 shrink-0" />
          <span>{t('orderDetail.unpaidTimeoutCancelledNotice')}</span>
        </div>
      );
    }
    return (
      <div className="mt-4 p-3.5 bg-stone-50 border border-stone-200 rounded-xs flex items-center space-x-2.5 text-xs text-stone-700">
        <Ban className="w-4 h-4 text-stone-500 shrink-0" />
        <span>{t('orderDetail.adminCancelledNotice')}</span>
      </div>
    );
  };

  return (
    <div className="border border-brand-border bg-white p-6 rounded-md mb-6 shadow-2xs font-sans">
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
              href={`/payment?orderNumber=${encodeURIComponent(order.orderNumber)}`}
              className="bg-brand-brown hover:bg-brand-dark-brown text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xs inline-flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <CreditCard size={14} />
              <span>{t('orderDetail.payNowBtn')}</span>
            </Link>
          )}

          {canRequestCancellation && (
            <button
              type="button"
              onClick={onOpenCancelModal}
              className="border border-rose-300 text-rose-700 hover:bg-rose-50 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xs inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <Ban size={13} />
              <span>{t('orderDetail.requestCancelBtn')}</span>
            </button>
          )}

          {canAcceptDelivery && (
            <button
              type="button"
              onClick={onOpenAcceptModal}
              className="bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xs inline-flex items-center space-x-1.5 shadow-2xs transition-colors cursor-pointer"
            >
              <CheckCircle2 size={13} />
              <span>{t('orderDetail.acceptDeliveryBtn')}</span>
            </button>
          )}

          {canRequestReturn && (
            <button
              type="button"
              onClick={onOpenReturnModal}
              className="border border-brand-border text-brand-brown hover:bg-stone-50 text-xs font-bold uppercase tracking-wider px-4 py-2 rounded-xs inline-flex items-center space-x-1.5 transition-colors cursor-pointer"
            >
              <RotateCw size={13} />
              <span>{t('orderDetail.requestReturnBtn')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Notice for Completed Order */}
      {order.status === 'COMPLETED' && (
        <div className="mt-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xs flex items-center space-x-2.5 text-xs text-emerald-900">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{t('orderDetail.completedNotice')}</span>
        </div>
      )}

      {/* Notice for Cancelled Order */}
      {order.status === 'CANCELLED' && renderCancelledNotice()}

      {/* Notice for Refunded Order */}
      {order.status === 'REFUNDED' && (
        <div className="mt-4 p-3.5 bg-stone-50 border border-stone-200 rounded-xs flex items-center space-x-2.5 text-xs text-stone-700">
          <RotateCcw className="w-4 h-4 text-stone-500 shrink-0" />
          <span>{t('orderDetail.refundedNotice')}</span>
        </div>
      )}

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
  );
}
