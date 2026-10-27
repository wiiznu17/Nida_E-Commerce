import React, { useState } from 'react';
import { Copy, Check, Calendar } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { NidaChevronRibbon } from '@/components/layout';
import type { TrackingResult } from '@repo/types';

interface TrackingHeaderBannerProps {
  trackingData: TrackingResult;
}

export function TrackingHeaderBanner({
  trackingData,
}: TrackingHeaderBannerProps) {
  const { language, t } = useLanguage();
  const [copiedTracking, setCopiedTracking] = useState(false);

  const handleCopyTracking = (code: string) => {
    void navigator.clipboard.writeText(code);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  return (
    <div className="w-full bg-brand-warm-cream border border-brand-border p-6 sm:p-8 lg:p-10 shadow-xs">
      {/* Signature NIDA Chevron Ribbon */}
      <div className="mb-5">
        <NidaChevronRibbon className="w-20 sm:w-24 h-auto" />
      </div>

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-6">
        <div>
          <span className="text-[10px] uppercase font-black tracking-widest text-brand-amber block mb-1">
            {t('trackOrder.liveStatus')}
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-brand-brown uppercase tracking-tight font-mono">
            {t('trackOrder.order')} #{trackingData.orderNumber}
          </h2>
          <div className="flex flex-wrap items-center gap-x-3 text-xs text-gray-600 mt-2">
            <span>
              {t('trackOrder.courier')}{' '}
              <strong>
                {trackingData.shipment?.courierName || 'Kerry Express'}
              </strong>
            </span>
            <span>•</span>
            <span className="inline-flex items-center space-x-1.5">
              <span>{t('trackOrder.trackingNumber')}</span>
              <strong className="font-mono text-brand-brown">
                {trackingData.shipment?.trackingNumber || '-'}
              </strong>
              {trackingData.shipment?.trackingNumber && (
                <button
                  type="button"
                  onClick={() =>
                    handleCopyTracking(trackingData.shipment.trackingNumber)
                  }
                  className="text-gray-400 hover:text-brand-brown ml-1 transition-colors cursor-pointer"
                  title={t('trackOrder.copyTracking')}
                >
                  {copiedTracking ? (
                    <Check size={12} className="text-emerald-600" />
                  ) : (
                    <Copy size={12} />
                  )}
                </button>
              )}
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <span className="inline-flex items-center space-x-1.5 bg-brand-brown text-brand-yellow text-xs font-black px-3 py-1 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow" />
            <span>
              {trackingData.shipment?.status === 'DELIVERED'
                ? t('trackOrder.stepDelivered')
                : trackingData.shipment?.status === 'OUT_FOR_DELIVERY'
                  ? language === 'th'
                    ? 'กำลังนำจ่าย'
                    : 'Out for Delivery'
                  : trackingData.orderStatus === 'SHIPPED'
                    ? t('trackOrder.inTransit')
                    : t('trackOrder.stepProcessing')}
            </span>
          </span>
          {trackingData.shipment?.estimatedDelivery && (
            <p className="text-xs text-gray-500 mt-1 inline-flex items-center sm:justify-end gap-1">
              <Calendar size={12} />
              <span>{t('trackOrder.estimatedArrival')}</span>
              <strong>
                {new Date(
                  trackingData.shipment.estimatedDelivery,
                ).toLocaleDateString(language === 'th' ? 'th-TH' : 'en-US', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              </strong>
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
