'use client';

import React from 'react';
import { Truck } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiOrder } from '@repo/types';

interface CustomerOrderSummarySidebarProps {
  order: ApiOrder;
}

export function CustomerOrderSummarySidebar({
  order,
}: CustomerOrderSummarySidebarProps) {
  const { t } = useLanguage();

  return (
    <div className="space-y-6 font-sans">
      {/* Order Financial Summary */}
      <div className="border border-brand-border bg-white rounded-md p-6 shadow-2xs space-y-3 text-xs">
        <h2 className="text-xs font-black uppercase tracking-wider text-brand-brown pb-2 border-b border-stone-100">
          {t('orderDetail.summaryTitle')}
        </h2>

        <div className="flex justify-between text-stone-600">
          <span>{t('orderDetail.subtotal')}</span>
          <span className="font-mono font-medium">
            ฿{Number(order.subtotal).toLocaleString()}
          </span>
        </div>

        {Number(order.discountTotal) > 0 && (
          <div className="flex justify-between text-rose-600">
            <span>{t('orderDetail.discountTotal')}</span>
            <span className="font-mono font-medium">
              -฿{Number(order.discountTotal).toLocaleString()}
            </span>
          </div>
        )}

        <div className="flex justify-between text-stone-600">
          <span>{t('orderDetail.shippingFee')}</span>
          <span className="font-mono font-medium">
            {Number(order.shippingFee) === 0
              ? t('orderDetail.freeShipping')
              : `฿${Number(order.shippingFee).toLocaleString()}`}
          </span>
        </div>

        <div className="pt-2 border-t border-brand-border flex justify-between items-baseline text-stone-900">
          <span className="font-black uppercase tracking-wider text-xs">
            {t('orderDetail.grandTotal')}
          </span>
          <span className="font-mono font-black text-lg text-brand-dark-brown">
            ฿{Number(order.totalAmount).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Delivery Address Card */}
      <div className="border border-brand-border bg-white rounded-md p-6 shadow-2xs text-xs space-y-2">
        <h2 className="text-xs font-black uppercase tracking-wider text-brand-brown pb-2 border-b border-stone-100 flex items-center space-x-1.5">
          <Truck className="w-3.5 h-3.5" />
          <span>{t('orderDetail.shippingAddressTitle')}</span>
        </h2>

        <div className="text-stone-700 space-y-1">
          <p className="font-bold text-stone-900">
            {order.shippingAddress?.recipientName}
          </p>
          <p className="font-mono text-stone-500">
            {order.shippingAddress?.phone}
          </p>
          <p className="text-stone-600 leading-relaxed">
            {order.shippingAddress?.addressLine1}
            {order.shippingAddress?.addressLine2
              ? ` ${order.shippingAddress.addressLine2}`
              : ''}
            , {order.shippingAddress?.subdistrict},{' '}
            {order.shippingAddress?.district}, {order.shippingAddress?.province}{' '}
            {order.shippingAddress?.postalCode}
          </p>
        </div>
      </div>
    </div>
  );
}
