import React from 'react';
import { Package, Clock, Truck, CheckCircle2, CreditCard } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { OrderHistoryMetrics } from './orderHistoryTypes';

interface OrdersMetricsOverviewProps {
  metrics: OrderHistoryMetrics;
}

export function OrdersMetricsOverview({ metrics }: OrdersMetricsOverviewProps) {
  const { t } = useLanguage();

  const cards = [
    {
      label: t('orderHistory.totalOrders'),
      value: metrics.totalOrders,
      icon: Package,
      iconColor: 'text-brand-brown',
      bgColor: 'bg-brand-warm-cream/60',
    },
    {
      label: t('orderHistory.pendingOrders'),
      value: metrics.pendingCount,
      icon: Clock,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50/70',
    },
    {
      label: t('orderHistory.inTransitOrders'),
      value: metrics.inTransitCount,
      icon: Truck,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50/70',
    },
    {
      label: t('orderHistory.deliveredOrders'),
      value: metrics.deliveredCount,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50/70',
    },
    {
      label: t('orderHistory.totalSpent'),
      value: `฿${metrics.totalSpent.toLocaleString()}`,
      icon: CreditCard,
      iconColor: 'text-brand-amber',
      bgColor: 'bg-stone-50',
      isCurrency: true,
    },
  ];

  return (
    <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-none sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:gap-3.5 mb-8">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`min-w-[150px] sm:min-w-0 flex-1 p-4 border border-brand-border/80 ${card.bgColor} shadow-2xs flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 truncate mr-2">
                {card.label}
              </span>
              <Icon size={15} className={`${card.iconColor} shrink-0`} />
            </div>
            <div
              className={`font-black text-brand-brown tracking-tight font-mono ${
                card.isCurrency ? 'text-lg sm:text-xl' : 'text-2xl'
              }`}
            >
              {card.value}
            </div>
          </div>
        );
      })}
    </div>
  );
}
