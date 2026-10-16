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
    <div className="border border-brand-border bg-white p-6 sm:p-8 lg:p-10 shadow-xs">
      <div className="flex items-center justify-between mb-8 pb-3 border-b border-gray-100">
        <div>
          <span className="text-[10px] uppercase font-black tracking-widest text-brand-amber block mb-0.5">
            TRANSIT PROGRESS
          </span>
          <h3 className="text-sm sm:text-base font-black uppercase tracking-wider text-brand-brown">
            {t('trackOrder.milestones')}
          </h3>
        </div>
        <span className="text-xs font-mono font-bold text-gray-400">
          Step {currentStep + 1} of {steps.length}
        </span>
      </div>

      <div className="relative py-2 sm:py-4">
        {/* Stepper Connecting Line */}
        <div className="absolute top-8 sm:top-10 left-12 right-12 h-0.5 bg-gray-200 hidden sm:block -z-0">
          <div
            className="h-full bg-brand-brown transition-all duration-700"
            style={{
              width: `${(currentStep / (steps.length - 1)) * 100}%`,
            }}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 sm:gap-4 relative z-10">
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
                  className={`w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center shrink-0 transition-all mr-4 sm:mr-0 sm:mb-3 shadow-2xs
                  ${
                    isCompleted
                      ? 'bg-brand-brown text-brand-yellow border-2 border-brand-brown'
                      : 'bg-stone-100 text-stone-400 border border-stone-200'
                  }
                  ${isCurrent ? 'ring-4 ring-amber-200/80 scale-105' : ''}
                `}
                >
                  <Icon size={20} strokeWidth={2.2} />
                </div>

                <div className="flex flex-col sm:items-center">
                  <p
                    className={`text-xs font-black uppercase tracking-wider ${
                      isCompleted ? 'text-brand-brown' : 'text-stone-400'
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
      <div className="mt-12 pt-8 border-t border-gray-100">
        <div className="mb-6">
          <span className="text-[10px] uppercase font-black tracking-widest text-brand-amber block mb-0.5">
            CARRIER SCANS & EVENTS
          </span>
          <h4 className="text-sm font-black uppercase tracking-wider text-brand-brown">
            {t('trackOrder.checkpointLogs')}
          </h4>
        </div>

        {trackingData.shipment?.timeline &&
        trackingData.shipment.timeline.length > 0 ? (
          <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2 sm:before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
            {trackingData.shipment.timeline.map((entry, idx) => {
              const isFirst = idx === 0;
              return (
                <div
                  key={entry.id ?? idx}
                  className="relative flex flex-col sm:flex-row sm:items-start sm:justify-between gap-1.5 sm:gap-4 text-xs"
                >
                  {/* Timeline Node Bullet */}
                  <span
                    className={`absolute -left-6 sm:-left-8 top-1.5 w-3 h-3 rounded-full border-2 border-white ring-2 transition-all ${
                      isFirst
                        ? 'bg-amber-600 ring-amber-300'
                        : 'bg-stone-400 ring-stone-200'
                    }`}
                  />
                  <div className="space-y-1 pr-4">
                    <p className={`font-black text-sm ${isFirst ? 'text-brand-brown' : 'text-stone-800'}`}>
                      {entry.statusTitle}
                    </p>
                    {entry.statusDescription && (
                      <p className="text-stone-600 text-xs leading-relaxed">{entry.statusDescription}</p>
                    )}
                    {entry.location && (
                      <p className="text-[11px] text-stone-500 font-medium inline-flex items-center gap-1 mt-0.5">
                        <MapPin size={12} className="text-amber-700" />
                        <span>{entry.location}</span>
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] font-mono font-bold text-stone-400 whitespace-nowrap sm:text-right shrink-0 mt-0.5">
                    {new Date(entry.timestamp).toLocaleString(
                      language === 'th' ? 'th-TH' : 'en-US',
                      {
                        dateStyle: 'medium',
                        timeStyle: 'short',
                      },
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-xs text-stone-400 py-4 italic">
            {t('trackOrder.emptyLogs')}
          </p>
        )}
      </div>
    </div>
  );
}
