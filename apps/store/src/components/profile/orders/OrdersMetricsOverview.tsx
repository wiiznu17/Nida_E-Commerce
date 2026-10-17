import React from 'react';
import { Package, Clock, Truck, CheckCircle2, CreditCard } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { MetricCard } from '@/components/ui';
import type { OrderHistoryMetrics } from './orderHistoryTypes';

interface OrdersMetricsOverviewProps {
  metrics: OrderHistoryMetrics;
}
// not use
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
    },
  ];

  return (
    <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-none sm:grid sm:grid-cols-3 lg:grid-cols-5 sm:gap-3.5 mb-8">
      {cards.map((card, idx) => (
        <MetricCard
          key={idx}
          label={card.label}
          value={card.value}
          icon={card.icon}
          iconColor={card.iconColor}
          bgColor={card.bgColor}
          className="min-w-[150px] sm:min-w-0 flex-1"
        />
      ))}
    </div>
  );
}
