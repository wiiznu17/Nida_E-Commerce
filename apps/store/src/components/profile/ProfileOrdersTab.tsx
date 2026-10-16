import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, ArrowRight, QrCode } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { OrderStatus, PaymentMethod, type ApiOrder } from '@repo/types';
import { EmptyState, StatusBadge } from '@/components/ui';

interface ProfileOrdersTabProps {
  orders: ApiOrder[];
  isLoading: boolean;
}

export function ProfileOrdersTab({ orders, isLoading }: ProfileOrdersTabProps) {
  const { language, t } = useLanguage();
  const recentOrders = orders.slice(0, 3);

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-gray-200">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-black text-brand-brown uppercase tracking-tight">
              {t('auth.tabOrders')}
            </h2>
            {orders.length > 0 && (
              <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-warm-cream border border-brand-border text-brand-brown rounded-xs">
                {t('orderHistory.recentOrdersCount')}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-500 mt-0.5">
            {language === 'th'
              ? 'ตรวจสอบสถานะและติดตามพัสดุแบบเรียลไทม์'
              : 'Check order status and track shipments in real time'}
          </p>
        </div>

        {orders.length > 0 && (
          <Link
            href="/profile/orders"
            className="inline-flex items-center space-x-1.5 text-xs font-black uppercase tracking-wider text-brand-amber hover:text-brand-brown transition-colors self-start sm:self-auto cursor-pointer"
          >
            <span>{t('orderHistory.viewAllOrders')} ({orders.length})</span>
            <ArrowRight size={14} />
          </Link>
        )}
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
        <EmptyState
          variant="dashed"
          icon={Package}
          title={t('trackOrder.emptyOrders')}
          description={t('trackOrder.emptyOrdersDesc')}
          action={{
            label: t('trackOrder.browseCatalog'),
            href: '/collections',
          }}
          className="p-12"
        />
      ) : (
        <div className="space-y-5">
          {recentOrders.map((order) => {
            const isPendingPromptPay =
              order.status === OrderStatus.PENDING &&
              (order.payment?.paymentMethod === PaymentMethod.PROMPTPAY || !order.payment);

            return (
              <div
                key={order.id}
                className="border border-gray-200 p-5 sm:p-6 bg-white hover:border-brand-brown transition-colors shadow-2xs"
              >
                <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 pb-4 mb-4 border-b border-gray-200">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-black text-sm text-brand-brown font-mono">
                        {t('trackOrder.order')} #{order.orderNumber}
                      </span>
                      <StatusBadge status={order.status} />
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

                  <div className="flex items-center justify-between sm:justify-end space-x-4">
                    <div className="text-left sm:text-right">
                      <span className="text-[10px] uppercase font-bold text-gray-400 block">
                        {t('checkout.total')}
                      </span>
                      <span className="text-base font-black text-brand-brown font-mono">
                        ฿{Number(order.totalAmount).toLocaleString()}
                      </span>
                    </div>
                    <Link
                      href={`/track-order/${order.orderNumber}`}
                      className="bg-brand-brown hover:bg-brand-amber text-white px-3.5 py-2 text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center"
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
                      <div className="flex items-center gap-3 min-w-0 pr-2">
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
                        <div className="min-w-0">
                          <h4 className="font-bold text-brand-brown truncate">
                            {item.productName}
                          </h4>
                          <p className="text-gray-500 font-medium text-[11px] truncate">
                            {item.variantInfo}
                          </p>
                        </div>
                      </div>
                      <div className="text-right font-mono text-gray-700 shrink-0">
                        <span>
                          {item.quantity} x ฿{Number(item.unitPrice).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Action buttons footer */}
                <div className="mt-4 pt-3 border-t border-gray-100 flex flex-wrap justify-end gap-2">
                  {isPendingPromptPay && (
                    <Link
                      href={`/order-success?orderNumber=${encodeURIComponent(order.orderNumber)}`}
                      className="bg-brand-amber hover:bg-brand-brown text-white px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors inline-flex items-center space-x-1 shadow-2xs"
                    >
                      <QrCode size={13} />
                      <span>{t('orderHistory.payNow')}</span>
                    </Link>
                  )}
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

          {/* View All Orders Button at bottom of list */}
          {orders.length > 3 && (
            <div className="pt-2">
              <Link
                href="/profile/orders"
                className="w-full py-3 border-2 border-brand-brown text-brand-brown hover:bg-brand-brown hover:text-white transition-colors text-xs font-black uppercase tracking-wider flex items-center justify-center space-x-2 shadow-2xs"
              >
                <span>{t('orderHistory.viewAllOrders')} ({orders.length} {t('orderHistory.ordersUnit')})</span>
                <ArrowRight size={15} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
