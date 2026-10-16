'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Package,
  Truck,
  MapPin,
  CheckCircle2,
  Phone,
  ArrowLeft,
  Search,
  Copy,
  Check,
  AlertCircle,
  Loader2,
  Calendar,
} from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { orderRequester } from '@/api/requester/orderRequester';
import type { TrackingResult, ShipmentStatus, OrderStatus } from '@repo/types';

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderIdParam = params?.orderId;
  const initialOrderId = Array.isArray(orderIdParam)
    ? orderIdParam[0]
    : orderIdParam;

  const { language, t } = useLanguage();

  const [orderNumberInput, setOrderNumberInput] = useState(
    initialOrderId ? String(initialOrderId) : '',
  );
  const [phoneInput, setPhoneInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingResult | null>(null);
  const [copiedTracking, setCopiedTracking] = useState(false);

  const fetchTracking = useCallback(
    async (orderNum: string, phoneNum?: string) => {
      if (!orderNum.trim()) return;
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const result = phoneNum && phoneNum.trim()
          ? await orderRequester.trackOrderByQuery(orderNum.trim(), phoneNum.trim())
          : await orderRequester.trackOrder(orderNum.trim());
        setTrackingData(result);
      } catch {
        setTrackingData(null);
        setErrorMessage(t('trackOrder.notFound'));
      } finally {
        setIsLoading(false);
      }
    },
    [t],
  );

  useEffect(() => {
    if (initialOrderId) {
      void fetchTracking(String(initialOrderId));
    }
  }, [initialOrderId, fetchTracking]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumberInput.trim()) return;
    router.push(`/track-order/${encodeURIComponent(orderNumberInput.trim())}`);
    void fetchTracking(orderNumberInput.trim(), phoneInput.trim());
  };

  const handleCopyTracking = (code: string) => {
    void navigator.clipboard.writeText(code);
    setCopiedTracking(true);
    setTimeout(() => setCopiedTracking(false), 2000);
  };

  const getStepProgressIndex = (
    orderStatus?: OrderStatus,
    shipmentStatus?: ShipmentStatus,
  ): number => {
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
    return 0; // Placed / Pending
  };

  const currentStep = trackingData
    ? getStepProgressIndex(
        trackingData.orderStatus,
        trackingData.shipment?.status,
      )
    : 1;

  const steps = [
    {
      title: t('trackOrder.stepPlaced'),
      icon: Package,
    },
    {
      title: t('trackOrder.stepProcessing'),
      icon: CheckCircle2,
    },
    {
      title: t('trackOrder.stepShipped'),
      icon: Truck,
    },
    {
      title: t('trackOrder.stepDelivered'),
      icon: MapPin,
    },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 font-sans">
      {/* Navigation Breadcrumb */}
      <div className="mb-6">
        <Link
          href="/profile"
          className="inline-flex items-center text-xs font-black uppercase tracking-wider text-gray-500 hover:text-brand-brown transition-colors"
        >
          <ArrowLeft size={14} className="mr-1.5" />
          <span>{t('trackOrder.backToProfile')}</span>
        </Link>
      </div>

      {/* Query Search Card */}
      <div className="bg-white border border-gray-200 p-6 sm:p-8 mb-8 shadow-xs">
        <div className="mb-6">
          <span className="text-[10px] uppercase font-black tracking-widest text-brand-amber block mb-1">
            {t('trackOrder.liveStatus')}
          </span>
          <h1 className="text-xl sm:text-2xl font-black text-brand-brown uppercase tracking-tight">
            {t('trackOrder.searchTitle')}
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            {t('trackOrder.searchSubtitle')}
          </p>
        </div>

        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="orderNumber"
                className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5"
              >
                {t('trackOrder.orderNumberLabel')}
              </label>
              <input
                id="orderNumber"
                type="text"
                required
                value={orderNumberInput}
                onChange={(e) => setOrderNumberInput(e.target.value)}
                placeholder={t('trackOrder.orderNumberPlaceholder')}
                className="w-full border border-gray-300 px-3.5 py-2.5 text-xs text-brand-brown focus:border-brand-brown focus:ring-1 focus:ring-brand-brown outline-hidden font-mono uppercase"
              />
            </div>

            <div>
              <label
                htmlFor="phone"
                className="block text-[11px] font-bold uppercase tracking-wider text-gray-700 mb-1.5"
              >
                {t('trackOrder.phoneLabel')}
              </label>
              <input
                id="phone"
                type="tel"
                value={phoneInput}
                onChange={(e) => setPhoneInput(e.target.value)}
                placeholder={t('trackOrder.phonePlaceholder')}
                className="w-full border border-gray-300 px-3.5 py-2.5 text-xs text-brand-brown focus:border-brand-brown focus:ring-1 focus:ring-brand-brown outline-hidden"
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isLoading || !orderNumberInput.trim()}
              className="w-full sm:w-auto bg-brand-brown hover:bg-brand-amber disabled:opacity-50 text-white px-6 py-2.5 text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <Loader2 size={14} className="animate-spin mr-1.5" />
                  <span>{t('trackOrder.searching')}</span>
                </>
              ) : (
                <>
                  <Search size={14} className="mr-1.5" />
                  <span>{t('trackOrder.trackBtn')}</span>
                </>
              )}
            </button>
          </div>
        </form>

        {errorMessage && (
          <div className="mt-4 p-4 border border-rose-200 bg-rose-50 flex items-start space-x-3 text-xs text-rose-800">
            <AlertCircle size={16} className="text-rose-600 flex-shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {/* Live Result View */}
      {trackingData && (
        <>
          {/* Header Summary Banner */}
          <div className="bg-brand-warm-cream border border-brand-border p-6 sm:p-8 mb-8">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
              <div>
                <span className="text-[10px] uppercase font-black tracking-widest text-brand-amber block mb-1">
                  {t('trackOrder.liveStatus')}
                </span>
                <h2 className="text-2xl sm:text-3xl font-black text-brand-brown uppercase tracking-tight font-mono">
                  {t('trackOrder.order')} #{trackingData.orderNumber}
                </h2>
                <div className="flex flex-wrap items-center gap-x-3 text-xs text-gray-600 mt-2">
                  <span>
                    {t('trackOrder.courier')}{' '}
                    <strong>{trackingData.shipment?.courierName || 'Kerry Express'}</strong>
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
                        className="text-gray-400 hover:text-brand-brown ml-1 transition-colors"
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
                        ? (language === 'th' ? 'กำลังนำจ่าย' : 'Out for Delivery')
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

          {/* Stepper Progress */}
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
                        className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-colors mr-4 sm:mr-0 sm:mb-3 shadow-xs
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
                          <p className="text-gray-600">
                            {entry.statusDescription}
                          </p>
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

          {/* Contact Support Footer */}
          <div className="border border-gray-200 bg-white p-6 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
            <div>
              <h4 className="text-xs font-black uppercase tracking-wider text-brand-brown mb-1">
                {t('trackOrder.needHelp')}
              </h4>
              <p className="text-xs text-gray-500">
                {t('trackOrder.supportHint')}
              </p>
            </div>
            <a
              href="tel:021234567"
              className="bg-brand-brown hover:bg-brand-amber text-white py-2.5 px-6 text-center text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center justify-center space-x-2"
            >
              <Phone size={14} />
              <span>{t('trackOrder.contactSupport')}</span>
            </a>
          </div>
        </>
      )}
    </div>
  );
}
