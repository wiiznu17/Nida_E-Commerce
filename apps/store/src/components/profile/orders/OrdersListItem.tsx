import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, CreditCard, Copy, Check, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { OrderStatus, type ApiOrder } from '@repo/types';
import { StatusBadge } from '@/components/ui';

interface OrdersListItemProps {
  order: ApiOrder;
}

export function OrdersListItem({ order }: OrdersListItemProps) {
  const { language, t } = useLanguage();
  const [currentOrder] = useState<ApiOrder>(order);
  const [copiedTracking, setCopiedTracking] = useState(false);

  const trackingNumber = currentOrder.shipments?.[0]?.trackingNumber;
  const courierName = currentOrder.shipments?.[0]?.courierName;

  const handleCopyTracking = (code: string) => {
    void navigator.clipboard.writeText(code);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  return (
    <div className="border border-gray-200 bg-white hover:border-brand-brown/80 transition-colors shadow-2xs">
      {/* Top Header Row */}
      <div className="p-4 sm:p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-3 bg-gray-50/40">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={`/profile/orders/${encodeURIComponent(currentOrder.orderNumber)}`}
              className="font-black text-sm text-brand-brown font-mono tracking-tight hover:underline cursor-pointer"
            >
              #{currentOrder.orderNumber}
            </Link>
            <StatusBadge status={currentOrder.status} />
          </div>

          <div className="flex flex-wrap items-center gap-x-2 text-[11px] text-gray-500 mt-1">
            <span>
              {new Date(currentOrder.placedAt).toLocaleDateString(
                language === 'th' ? 'th-TH' : 'en-US',
                {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                },
              )}
            </span>
            {courierName && (
              <>
                <span>•</span>
                <span className="font-medium text-gray-700">{courierName}</span>
              </>
            )}
            {trackingNumber && (
              <span className="inline-flex items-center space-x-1">
                <span>(</span>
                <span className="font-mono text-brand-brown">{trackingNumber}</span>
                <button
                  type="button"
                  onClick={() => handleCopyTracking(trackingNumber)}
                  className="text-gray-400 hover:text-brand-brown transition-colors cursor-pointer"
                  title={t('trackOrder.copyTracking')}
                >
                  {copiedTracking ? (
                    <Check size={11} className="text-emerald-600" />
                  ) : (
                    <Copy size={11} />
                  )}
                </button>
                <span>)</span>
              </span>
            )}
          </div>
        </div>

        <div className="text-left sm:text-right flex sm:flex-col items-center sm:items-end justify-between sm:justify-center">
          <span className="text-[10px] uppercase font-bold text-gray-400 sm:block">
            {t('checkout.total')}
          </span>
          <span className="text-lg font-black text-brand-brown font-mono">
            ฿{Number(currentOrder.totalAmount).toLocaleString()}
          </span>
        </div>
      </div>

      {/* Items Preview List */}
      <div className="p-4 sm:p-5 divide-y divide-gray-100">
        {currentOrder.items.map((item) => (
          <div
            key={item.id}
            className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0 gap-3"
          >
            <div className="flex items-center gap-3 min-w-0 pr-2">
              {item.imageUrl ? (
                <div className="w-14 h-16 bg-gray-100 shrink-0 border border-gray-200 overflow-hidden relative">
                  <Image
                    src={item.imageUrl}
                    alt={item.productName}
                    fill
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-14 h-16 bg-stone-100 shrink-0 border border-stone-200 flex items-center justify-center text-stone-400">
                  <Package size={18} />
                </div>
              )}
              <div className="min-w-0">
                <h4 className="font-bold text-xs text-brand-brown truncate">
                  {item.productName}
                </h4>
                <p className="text-gray-500 font-medium text-[11px] truncate">
                  {item.variantInfo}
                </p>
                <p className="text-[10px] text-gray-400 font-mono sm:hidden mt-0.5">
                  จำนวน: {item.quantity} x ฿{Number(item.unitPrice).toLocaleString()}
                </p>
              </div>
            </div>

            <div className="text-right font-mono text-xs text-gray-700 shrink-0 hidden sm:block">
              <span>
                {item.quantity} x ฿{Number(item.unitPrice).toLocaleString()}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Action Buttons Footer - Mobile-First Grid (Min 44px Touch Targets) */}
      <div className="p-3 sm:p-4 bg-gray-50/60 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2">
        {currentOrder.status === OrderStatus.PENDING && (
          <Link
            href={`/payment?orderNumber=${encodeURIComponent(currentOrder.orderNumber)}`}
            className="min-h-[44px] sm:min-h-0 bg-brand-amber hover:bg-brand-brown text-white px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center justify-center space-x-1.5 shadow-2xs cursor-pointer"
          >
            <CreditCard size={15} />
            <span>{t('orderHistory.payNow')}</span>
          </Link>
        )}

        <Link
          href={`/profile/orders/${encodeURIComponent(currentOrder.orderNumber)}`}
          className="min-h-[44px] sm:min-h-0 bg-brand-brown hover:bg-brand-amber text-white px-5 py-2 text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center justify-center space-x-1.5 shadow-2xs text-center cursor-pointer"
        >
          <span>{t('orderHistory.viewDetails')}</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
