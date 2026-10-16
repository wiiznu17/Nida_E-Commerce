import React from 'react';
import { Package, CheckCircle2, Truck, MapPin } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import type { TrackingResult, OrderStatus, ShipmentStatus } from '@repo/types';

interface TrackingMilestonesCardProps {
  trackingData: TrackingResult;
}

function getStepProgressIndex(
  orderStatus?: OrderStatus,
  shipmentStatus?: ShipmentStatus,
): number {
  if (orderStatus === 'DELIVERED' || shipmentStatus === 'DELIVERED') return 3;
  if (
    shipmentStatus === 'OUT_FOR_DELIVERY' ||
    shipmentStatus === 'IN_TRANSIT' ||
    shipmentStatus === 'PICKED_UP' ||
    orderStatus === 'SHIPPED'
  ) {
    return 2;
  }
  if (orderStatus === 'PROCESSING' || shipmentStatus === 'LABEL_CREATED') {
    return 1;
  }
  return 0;
}

export function TrackingMilestonesCard({ trackingData }: TrackingMilestonesCardProps) {
  const { language, t } = useLanguage();

  const currentStep = getStepProgressIndex(
    trackingData.orderStatus,
    trackingData.shipment?.status,
  );

  const steps = [
    { title: t('trackOrder.stepPlaced'), icon: Package },
    { title: t('trackOrder.stepProcessing'), icon: CheckCircle2 },
    { title: t('trackOrder.stepShipped'), icon: Truck },
    { title: t('trackOrder.stepDelivered'), icon: MapPin },
  ];

  return (
    <div className="border border-gray-200 bg-white p-6 sm:p-10 mb-8 shadow-xs">
      <h3 className="text-xs font-black uppercase tracking-wider text-brand-brown mb-8 pb-3 border-b border-gray-200">
        {t('trackOrder.milestones')}
      </h3>

      <div className="relative">
        <div className="absolute top-6 left-8 right-8 h-0.5 bg-gray-200 hidden sm:block -z-0">
          <div
            className="h-full bg-brand-brown transition-all duration-700"
            style={{
              width: `${(currentStep / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative z-10">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isCompleted = index <= currentStep;
            const isCurrent = index === currentStep;

            return (
              <div
                key={index}
                className="flex sm:flex-col items-center sm:text-center group"
              >
                <div
                  className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 transition-colors mr-4 sm:mr-0 sm:mb-3 shadow-2xs
                  ${
                    isCompleted
                      ? 'bg-brand-brown text-brand-yellow border-2 border-brand-brown'
                      : 'bg-gray-100 text-gray-400 border border-gray-300'
                  }
                  ${isCurrent ? 'ring-4 ring-amber-200' : ''}
                `}
                >
                  <Icon size={20} strokeWidth={2} />
                </div>

                <div className="flex flex-col sm:items-center">
                  <p
                    className={`text-xs font-black uppercase tracking-wider ${
                      isCompleted ? 'text-brand-brown' : 'text-gray-400'
                    }`}
                  >
                    {step.title}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Checkpoint Timeline Logs */}
      <div className="mt-10 pt-6 border-t border-gray-200">
        <h4 className="text-xs font-black uppercase tracking-wider text-gray-600 mb-4">
          {t('trackOrder.checkpointLogs')}
        </h4>

        {trackingData.shipment?.timeline &&
        trackingData.shipment.timeline.length > 0 ? (
          <div className="space-y-4">
            {trackingData.shipment.timeline.map((entry, idx) => (
              <div
                key={entry.id ?? idx}
                className="flex items-start justify-between py-2.5 border-b border-gray-100 last:border-b-0 text-xs"
              >
                <div className="space-y-0.5">
                  <p className="font-bold text-brand-brown">
                    {entry.statusTitle}
                  </p>
                  {entry.statusDescription && (
                    <p className="text-gray-600">{entry.statusDescription}</p>
                  )}
                  {entry.location && (
                    <p className="text-[11px] text-gray-400 inline-flex items-center gap-1">
                      <MapPin size={11} />
                      <span>{entry.location}</span>
                    </p>
                  )}
                </div>
                <span className="text-[11px] text-gray-400 whitespace-nowrap ml-4">
                  {new Date(entry.timestamp).toLocaleString(
                    language === 'th' ? 'th-TH' : 'en-US',
                    {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    },
                  )}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-gray-400 py-3 italic">
            {t('trackOrder.emptyLogs')}
          </p>
        )}
      </div>
    </div>
  );
}
