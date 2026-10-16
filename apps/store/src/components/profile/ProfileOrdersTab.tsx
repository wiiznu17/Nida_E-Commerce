import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiOrder } from '@repo/types';

interface ProfileOrdersTabProps {
  orders: ApiOrder[];
  isLoading: boolean;
}

export function ProfileOrdersTab({ orders, isLoading }: ProfileOrdersTabProps) {
  const { language, t } = useLanguage();

  return (
    <div>
      <div className="mb-6 pb-4 border-b border-gray-200">
        <h2 className="text-xl font-black text-brand-brown uppercase tracking-tight">
          {t('auth.tabOrders')}
        </h2>
        <p className="text-xs text-gray-500">
          {language === 'th'
            ? 'ตรวจสอบสถานะและติดตามพัสดุแบบเรียลไทม์'
            : 'Check order status and track shipments in real time'}
        </p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="border border-gray-200 p-6 bg-white animate-pulse"
            >
              <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-100">
                <div className="h-4 bg-gray-200 rounded-xs w-36" />
                <div className="h-4 bg-gray-200 rounded-xs w-20" />
              </div>
              <div className="flex items-center gap-4">
                <div className="w-16 h-20 bg-gray-200 rounded-xs" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 bg-gray-200 rounded-xs w-1/2" />
                  <div className="h-3 bg-gray-200 rounded-xs w-1/4" />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="border border-dashed border-gray-300 p-12 flex flex-col items-center justify-center text-center bg-gray-50/50">
          <div className="w-12 h-12 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 mb-3">
            <Package size={22} />
          </div>
          <h3 className="text-sm font-bold text-brand-brown uppercase tracking-wide mb-1">
            {t('trackOrder.emptyOrders')}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm mb-6">
            {t('trackOrder.emptyOrdersDesc')}
          </p>
          <Link
            href="/collections"
            className="bg-brand-brown hover:bg-brand-amber text-white px-6 py-2.5 text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center"
          >
            <span>{t('trackOrder.browseCatalog')}</span>
            <ArrowRight size={14} className="ml-1.5" />
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => {
            const statusBadgeClass =
              order.status === 'DELIVERED'
                ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                : order.status === 'SHIPPED'
                  ? 'bg-indigo-50 text-indigo-800 border-indigo-200'
                  : order.status === 'PROCESSING'
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : order.status === 'PAID'
                      ? 'bg-sky-50 text-sky-800 border-sky-200'
                      : order.status === 'CANCELLED' || order.status === 'REFUNDED'
                        ? 'bg-rose-50 text-rose-800 border-rose-200'
                        : 'bg-stone-50 text-stone-700 border-stone-200';

            const dotClass =
              order.status === 'DELIVERED'
                ? 'bg-emerald-500'
                : order.status === 'SHIPPED'
                  ? 'bg-indigo-500'
                  : order.status === 'PROCESSING'
                    ? 'bg-amber-500'
                    : order.status === 'PAID'
                      ? 'bg-sky-500'
                      : order.status === 'CANCELLED' || order.status === 'REFUNDED'
                        ? 'bg-rose-500'
                        : 'bg-stone-400';

            return (
              <div
                key={order.id}
                className="border border-gray-200 p-6 bg-white hover:border-brand-brown transition-colors shadow-xs"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 mb-4 border-b border-gray-200">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-sm text-brand-brown font-mono">
                        {t('trackOrder.order')} #{order.orderNumber}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 border rounded-xs inline-flex items-center space-x-1.5 ${statusBadgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
                        <span>{order.status}</span>
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      {new Date(order.placedAt).toLocaleDateString(
                        language === 'th' ? 'th-TH' : 'en-US',
                        {
                          day: 'numeric',
                          month: 'long',
                          year: 'numeric',
                        },
                      )}
                      {order.shipments?.[0]?.courierName && (
                        <span> • {order.shipments[0].courierName}</span>
                      )}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        {t('checkout.total')}
                      </span>
                      <span className="text-base font-black text-brand-brown font-mono">
                        ฿{Number(order.totalAmount).toLocaleString()}
                      </span>
                    </div>
                    <Link
                      href={`/track-order/${order.orderNumber}`}
                      className="bg-brand-brown hover:bg-brand-amber text-white px-4 py-2 text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center"
                    >
                      <span>{t('orderSuccess.trackOrder')}</span>
                      <ArrowRight size={14} className="ml-1" />
                    </Link>
                  </div>
                </div>

                {/* Items preview list */}
                <div className="space-y-3">
                  {order.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between text-xs py-1"
                    >
                      <div className="flex items-center gap-3">
                        {item.imageUrl ? (
                          <div className="w-12 h-14 bg-gray-100 shrink-0 border border-gray-200 overflow-hidden relative">
                            <Image
                              src={item.imageUrl}
                              alt={item.productName}
                              fill
                              sizes="48px"
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-12 h-14 bg-stone-100 shrink-0 border border-stone-200 flex items-center justify-center text-stone-400">
                            <Package size={16} />
                          </div>
                        )}
                        <div>
                          <h4 className="font-bold text-brand-brown">
                            {item.productName}
                          </h4>
                          <p className="text-gray-500 font-medium text-[11px]">
                            {item.variantInfo}
                          </p>
                        </div>
                      </div>
                      <div className="text-right font-mono text-gray-700">
                        <span>
                          {item.quantity} x ฿{Number(item.unitPrice).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action buttons footer */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex justify-end gap-2">
                  <Link
                    href="/collections"
                    className="border border-gray-300 hover:border-brand-brown text-gray-700 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors"
                  >
                    {t('trackOrder.reorder')}
                  </Link>
                  <Link
                    href={`/track-order/${order.orderNumber}`}
                    className="bg-stone-100 hover:bg-stone-200 text-brand-brown px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors"
                  >
                    {t('orderSuccess.trackOrder')}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
