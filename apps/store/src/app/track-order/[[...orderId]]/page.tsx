'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Phone, ShieldCheck, Mail, RefreshCw } from 'lucide-react';
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

  const { t, language } = useLanguage();

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
        const result =
          phoneNum && phoneNum.trim()
            ? await orderRequester.trackOrderByQuery(
                orderNum.trim(),
                phoneNum.trim(),
              )
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

  const handleRefresh = () => {
    if (orderNumberInput.trim()) {
      void fetchTracking(orderNumberInput.trim(), phoneInput.trim());
    }
  };

  return (
    <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 sm:py-10 font-sans">
      {/* Top Header Bar / Breadcrumb */}
      <div className="flex items-center justify-between mb-6 pb-4 border-b border-gray-200">
        <Link
          href="/profile"
          className="inline-flex items-center text-xs font-black uppercase tracking-wider text-stone-500 hover:text-brand-brown transition-colors"
        >
          <ArrowLeft size={14} className="mr-1.5" />
          <span>{t('trackOrder.backToProfile')}</span>
        </Link>
        <div className="flex items-center space-x-3 text-xs text-stone-400">
          <span className="hidden sm:inline text-[10px] font-black uppercase tracking-widest text-stone-400">
            NIDA CONSIGNMENT DISPATCH
          </span>
          {trackingData && (
            <button
              type="button"
              onClick={handleRefresh}
              disabled={isLoading}
              className="inline-flex items-center space-x-1 text-[11px] font-bold uppercase tracking-wider text-stone-600 hover:text-brand-brown cursor-pointer transition-colors"
              title="Refresh tracking status"
            >
              <RefreshCw
                size={12}
                className={isLoading ? 'animate-spin' : ''}
              />
              <span className="hidden sm:inline">
                {language === 'th' ? 'รีเฟรชสถานะ' : 'Refresh'}
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Case 1: Initial Search Hero (No tracking data loaded yet) */}
      {!trackingData ? (
        <div className="max-w-3xl mx-auto py-10 sm:py-16">
          <TrackingSearchCard
            orderNumberInput={orderNumberInput}
            phoneInput={phoneInput}
            isLoading={isLoading}
            errorMessage={errorMessage}
            onOrderNumberChange={setOrderNumberInput}
            onPhoneChange={setPhoneInput}
            onSubmit={handleSearchSubmit}
          />
        </div>
      ) : (
        /* Case 2: Live Tracking Dashboard (Full Width & Responsive 12-Column Grid) */
        <div className="space-y-8">
          {/* Full Width Top Banner */}
          <TrackingHeaderBanner trackingData={trackingData} />

          {/* 12-Column Complementary Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 8 Columns: Stepper Milestones & Checkpoint Timeline */}
            <div className="lg:col-span-8 space-y-8">
              <TrackingMilestonesCard trackingData={trackingData} />
            </div>

            {/* Right 4 Columns: Search Another + Parcel Summary + Concierge */}
            <div className="lg:col-span-4 space-y-6">
              {/* Compact Search Widget */}
              <TrackingSearchCard
                orderNumberInput={orderNumberInput}
                phoneInput={phoneInput}
                isLoading={isLoading}
                errorMessage={errorMessage}
                onOrderNumberChange={setOrderNumberInput}
                onPhoneChange={setPhoneInput}
                onSubmit={handleSearchSubmit}
                compact
              />

              {/* Delivery Assurance & Security Pill */}
              <div className="border border-brand-border bg-brand-warm-cream/50 p-6 shadow-xs">
                <div className="flex items-start space-x-3">
                  <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-wider text-brand-brown">
                      {language === 'th'
                        ? 'การรับประกันการจัดส่งพัสดุ NIDA'
                        : 'NIDA Dispatch Guarantee'}
                    </h4>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">
                      {language === 'th'
                        ? 'พัสดุทุกชิ้นผ่านการตรวจสอบคุณภาพ บรรจุในกล่องกันกระแทกมาตรฐาน และมีประกันความเสียหายตลอดการเดินทาง'
                        : 'Every consignment is inspected, packed in premium protective packaging, and insured throughout transit.'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Client Concierge / Need Assistance */}
              <div className="border border-brand-border bg-white p-6 shadow-xs">
                <span className="text-[10px] uppercase font-black tracking-widest text-brand-amber block mb-1">
                  CLIENT RELATIONS
                </span>
                <h4 className="text-sm font-black uppercase tracking-wider text-brand-brown mb-2">
                  {t('trackOrder.needHelp')}
                </h4>
                <p className="text-xs text-stone-500 mb-5 leading-relaxed">
                  {t('trackOrder.supportHint')}
                </p>

                <div className="space-y-2.5">
                  <a
                    href="tel:021234567"
                    className="w-full bg-brand-brown hover:bg-brand-dark-brown text-white py-2.5 px-4 text-center text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center justify-center space-x-2 shadow-2xs"
                  >
                    <Phone size={13} />
                    <span>{t('trackOrder.contactSupport')}</span>
                  </a>

                  <a
                    href="mailto:support@nida.com"
                    className="w-full border border-stone-300 hover:border-brand-brown text-stone-700 hover:text-brand-brown py-2 px-4 text-center text-xs font-bold uppercase tracking-wider transition-colors inline-flex items-center justify-center space-x-2"
                  >
                    <Mail size={13} />
                    <span>support@nida.com</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
