import React, { useState } from 'react';
import { Copy, Check, Calendar, RefreshCw } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { NidaChevronRibbon } from '@/components/layout';
import type { TrackingResult } from '@repo/types';

interface TrackingHeaderBannerProps {
  trackingData: TrackingResult;
  onRefresh?: () => void;
  isLoading?: boolean;
}

export function TrackingHeaderBanner({
  trackingData,
  onRefresh,
  isLoading = false,
}: TrackingHeaderBannerProps) {
  const { language, t } = useLanguage();
  const [copiedTracking, setCopiedTracking] = useState(false);

  const handleCopyTracking = (code: string) => {
    void navigator.clipboard.writeText(code);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  return (
    <div className="w-full bg-brand-warm-cream border border-brand-border p-4 sm:p-6 lg:p-8 rounded-md shadow-xs">
      {/* Signature Ribbon & Refresh Action */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <NidaChevronRibbon className="w-16 sm:w-20 md:w-24 h-auto" />
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={isLoading}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white hover:bg-stone-50 border border-stone-200 hover:border-brand-brown rounded-xs text-[11px] font-bold uppercase tracking-wider text-stone-700 hover:text-brand-brown cursor-pointer transition-colors shadow-2xs"
            title={language === 'th' ? 'รีเฟรชสถานะ' : 'Refresh tracking status'}
          >
            <RefreshCw
              size={12}
              className={isLoading ? 'animate-spin' : ''}
            />
            <span>
              {language === 'th' ? 'รีเฟรชสถานะ' : 'Refresh'}
            </span>
          </button>
        )}
      </div>

      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 sm:gap-6">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] uppercase font-black tracking-widest text-brand-amber block mb-0.5">
            {t('trackOrder.liveStatus')}
          </span>
          <h2 className="text-lg sm:text-2xl lg:text-3xl font-black text-brand-brown uppercase tracking-tight font-mono break-all sm:break-normal">
            {t('trackOrder.order')} #{trackingData.orderNumber}
          </h2>
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs text-stone-600 mt-2">
            <span className="inline-flex items-center gap-1">
              <span className="text-stone-500">{t('trackOrder.courier')}</span>
              <strong className="font-bold text-stone-900">
                {trackingData.shipment?.courierName || 'Kerry Express'}
              </strong>
            </span>
            <span className="text-stone-300">•</span>
            <span className="inline-flex items-center gap-1.5">
              <span className="text-stone-500">{t('trackOrder.trackingNumber')}</span>
              <strong className="font-mono text-brand-brown font-bold">
                {trackingData.shipment?.trackingNumber || '-'}
              </strong>
              {trackingData.shipment?.trackingNumber && (
                <button
                  type="button"
                  onClick={() =>
                    handleCopyTracking(trackingData.shipment.trackingNumber)
                  }
                  className="text-stone-400 hover:text-brand-brown p-1 transition-colors cursor-pointer inline-flex items-center"
                  title={t('trackOrder.copyTracking')}
                  aria-label={t('trackOrder.copyTracking')}
                >
                  {copiedTracking ? (
                    <Check size={13} className="text-emerald-600" />
                  ) : (
                    <Copy size={13} />
                  )}
                </button>
              )}
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right shrink-0 flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 pt-3 sm:pt-0 border-t sm:border-t-0 border-brand-border/40">
          <span className="inline-flex items-center space-x-1.5 bg-brand-brown text-brand-yellow text-xs font-black px-3 py-1.5 rounded-xs uppercase tracking-wider shadow-2xs">
            <span className="w-1.5 h-1.5 rounded-full bg-brand-yellow animate-pulse" />
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
            <p className="text-[11px] sm:text-xs text-stone-600 mt-0 sm:mt-1 inline-flex items-center sm:justify-end gap-1">
              <Calendar size={12} className="text-brand-amber shrink-0" />
              <span>{t('trackOrder.estimatedArrival')}:</span>
              <strong className="text-stone-900">
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
