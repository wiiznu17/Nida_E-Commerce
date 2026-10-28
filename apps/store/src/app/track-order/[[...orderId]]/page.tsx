'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [trackingData, setTrackingData] = useState<TrackingResult | null>(null);

  const fetchTracking = useCallback(
    async (orderNum: string) => {
      if (!orderNum.trim()) return;
      setIsLoading(true);
      setErrorMessage(null);
      try {
        const result = await orderRequester.trackOrder(orderNum.trim());
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
    void fetchTracking(orderNumberInput.trim());
  };

  const handleRefresh = () => {
    if (orderNumberInput.trim()) {
      void fetchTracking(orderNumberInput.trim());
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-5 sm:py-8 lg:py-10 font-sans">
      {/* Case 1: Initial Search Hero (No tracking data loaded yet) */}
      {!trackingData ? (
        <div className="max-w-xl mx-auto py-6 sm:py-12">
          <TrackingSearchCard
            orderNumberInput={orderNumberInput}
            isLoading={isLoading}
            errorMessage={errorMessage}
            onOrderNumberChange={setOrderNumberInput}
            onSubmit={handleSearchSubmit}
          />
        </div>
      ) : (
        /* Case 2: Live Tracking Dashboard */
        <div className="space-y-6 sm:space-y-8">
          {/* Top Banner */}
          <TrackingHeaderBanner
            trackingData={trackingData}
            onRefresh={handleRefresh}
            isLoading={isLoading}
          />

          {/* Stepper Milestones & Checkpoint Timeline */}
          <TrackingMilestonesCard trackingData={trackingData} />

          {/* Search Another Order */}
          <div className="pt-2">
            <TrackingSearchCard
              orderNumberInput={orderNumberInput}
              isLoading={isLoading}
              errorMessage={errorMessage}
              onOrderNumberChange={setOrderNumberInput}
              onSubmit={handleSearchSubmit}
            />
          </div>
        </div>
      )}
    </div>
  );
}
