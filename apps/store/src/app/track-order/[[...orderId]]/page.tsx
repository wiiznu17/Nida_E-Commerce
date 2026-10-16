'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Phone } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { orderRequester } from '@/api/requester/orderRequester';
import {
  TrackingSearchCard,
  TrackingHeaderBanner,
  TrackingMilestonesCard,
} from '@/components/order';
import type { TrackingResult } from '@repo/types';

export default function OrderTrackingPage() {
  const params = useParams();
  const router = useRouter();
  const orderIdParam = params?.orderId;
  const initialOrderId = Array.isArray(orderIdParam)
    ? orderIdParam[0]
    : orderIdParam;

  const { t } = useLanguage();

  const [orderNumberInput, setOrderNumberInput] = useState(
    initialOrderId ? String(initialOrderId) : '',
  );
  const [phoneInput, setPhoneInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingResult | null>(null);

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
      <TrackingSearchCard
        orderNumberInput={orderNumberInput}
        phoneInput={phoneInput}
        isLoading={isLoading}
        errorMessage={errorMessage}
        onOrderNumberChange={setOrderNumberInput}
        onPhoneChange={setPhoneInput}
        onSubmit={handleSearchSubmit}
      />

      {/* Live Result View */}
      {trackingData && (
        <>
          <TrackingHeaderBanner trackingData={trackingData} />

          <TrackingMilestonesCard trackingData={trackingData} />

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
