'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Package,
  CheckCircle2,
  Truck,
  MapPin,
  ExternalLink,
  Copy,
  Check,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { ApiOrder, OrderStatus, ShipmentStatus } from '@repo/types';

interface CustomerOrderTrackingCardProps {
  order: ApiOrder;
}

function getStepProgressIndex(
  orderStatus?: OrderStatus,
  shipmentStatus?: ShipmentStatus,
): number {
  if (
    orderStatus === 'COMPLETED' ||
    orderStatus === 'DELIVERED' ||
    shipmentStatus === 'DELIVERED'
  ) {
    return 3;
  }
  if (
    shipmentStatus === 'OUT_FOR_DELIVERY' ||
    shipmentStatus === 'IN_TRANSIT' ||
    shipmentStatus === 'PICKED_UP' ||
    orderStatus === 'SHIPPED'
  ) {
    return 2;
  }
  if (
    orderStatus === 'PROCESSING' ||
    orderStatus === 'PAID' ||
    orderStatus === 'PREORDER_AWAITING_STOCK' ||
    shipmentStatus === 'LABEL_CREATED'
  ) {
    return 1;
  }
  return 0;
}

export function CustomerOrderTrackingCard({
  order,
}: CustomerOrderTrackingCardProps) {
  const { t, language } = useLanguage();
  const [copiedTracking, setCopiedTracking] = useState(false);

  const shipment = order.shipments?.[0];
  const trackingNumber = shipment?.trackingNumber;
  const courierName = shipment?.courierName;
  const latestTimeline = shipment?.timeline?.[shipment.timeline.length - 1];

  const currentStep = getStepProgressIndex(order.status, shipment?.status);

  const steps = [
    { title: t('trackOrder.stepPlaced'), icon: Package },
    { title: t('trackOrder.stepProcessing'), icon: CheckCircle2 },
    { title: t('trackOrder.stepShipped'), icon: Truck },
    { title: t('trackOrder.stepDelivered'), icon: MapPin },
  ];

  const handleCopy = (text: string) => {
    void navigator.clipboard.writeText(text);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const isCancelled = order.status === 'CANCELLED';

  return (
    <div className="border border-brand-border bg-white rounded-md p-6 shadow-2xs font-sans space-y-6">
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 pb-3 border-b border-stone-100">
        <div>
          <span className="text-[10px] uppercase font-black tracking-widest text-brand-amber block mb-0.5">
            {t('orderDetail.trackingTransitTitle')}
          </span>
          <h2 className="text-xs font-black uppercase tracking-wider text-brand-brown">
            {t('trackOrder.milestones')}
          </h2>
        </div>

        <Link
          href={`/track-order/${encodeURIComponent(order.orderNumber)}`}
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-brand-brown hover:text-brand-dark-brown underline underline-offset-4 cursor-pointer self-start sm:self-auto"
        >
          <span>{t('orderDetail.viewFullTracking')}</span>
          <ExternalLink size={12} />
        </Link>
      </div>

      {/* Stepper Progress */}
      {isCancelled ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xs text-xs text-rose-800">
          <p className="font-bold uppercase tracking-wider">
            {t('status.cancelled')}
          </p>
        </div>
      ) : (
        <div className="relative py-2 sm:py-3">
          {/* Stepper Connecting Line */}
          <div className="absolute top-[28px] sm:top-[36px] -translate-y-1/2 left-[12.5%] right-[12.5%] h-0.5 bg-stone-200 hidden sm:block z-0">
            <div
              className="h-full bg-brand-brown transition-all duration-700"
              style={{
                width: `${(currentStep / (steps.length - 1)) * 100}%`,
              }}
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-y-4 sm:gap-x-0 relative z-10">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isCompleted = index <= currentStep;
              const isCurrent = index === currentStep;

              return (
                <div
                  key={index}
                  className="flex flex-col items-center text-center group"
                >
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0 transition-all mb-2 shadow-2xs
                    ${
                      isCompleted
                        ? 'bg-brand-brown text-brand-yellow border-2 border-brand-brown'
                        : 'bg-stone-100 text-stone-400 border border-stone-200'
                    }
                    ${isCurrent ? 'ring-4 ring-amber-200/80 scale-105' : ''}
                  `}
                  >
                    <Icon size={18} strokeWidth={2.2} />
                  </div>

                  <p
                    className={`text-[11px] font-black uppercase tracking-wider leading-tight ${
                      isCompleted ? 'text-brand-brown' : 'text-stone-400'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Courier & Latest Event Summary Bar */}
      {courierName && trackingNumber && (
        <div className="pt-3 border-t border-stone-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-stone-50/60 p-3.5 rounded-xs">
          <div className="flex items-center space-x-2">
            <span className="text-stone-500 font-bold">
              {t('trackOrder.courier')}
            </span>
            <span className="font-bold text-stone-900">{courierName}</span>
            <span className="text-stone-300">•</span>
            <span className="font-mono font-bold text-brand-brown">
              {trackingNumber}
            </span>
            <button
              type="button"
              onClick={() => handleCopy(trackingNumber)}
              className="text-stone-400 hover:text-brand-brown p-1 transition-colors cursor-pointer"
              title={t('trackOrder.copyTracking')}
            >
              {copiedTracking ? (
                <Check size={12} className="text-emerald-600" />
              ) : (
                <Copy size={12} />
              )}
            </button>
          </div>

          {latestTimeline && (
            <div className="text-[11px] text-stone-500 truncate sm:max-w-xs">
              <span className="font-bold text-stone-700">
                {latestTimeline.statusTitle}
              </span>
              {latestTimeline.location && (
                <span className="ml-1 text-stone-400">
                  ({latestTimeline.location})
                </span>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
