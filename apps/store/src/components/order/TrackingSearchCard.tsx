import React from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { Alert } from '@/components/ui';

interface TrackingSearchCardProps {
  orderNumberInput: string;
  phoneInput: string;
  isLoading: boolean;
  errorMessage: string | null;
  onOrderNumberChange: (val: string) => void;
  onPhoneChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  compact?: boolean;
}

export function TrackingSearchCard({
  orderNumberInput,
  phoneInput,
  isLoading,
  errorMessage,
  onOrderNumberChange,
  onPhoneChange,
  onSubmit,
  compact = false,
}: TrackingSearchCardProps) {
  const { t } = useLanguage();

  if (compact) {
    return (
      <div className="bg-white border border-brand-border p-6 shadow-xs">
        <div className="mb-4 pb-3 border-b border-gray-100">
          <span className="text-[10px] uppercase font-black tracking-widest text-brand-amber block mb-0.5">
            {t('trackOrder.liveStatus')}
          </span>
          <h3 className="text-sm font-black text-brand-brown uppercase tracking-tight">
            {t('trackOrder.searchTitle')}
          </h3>
        </div>

        <form onSubmit={onSubmit} className="space-y-3.5">
          <div>
            <label
              htmlFor="orderNumber-compact"
              className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-1"
            >
              {t('trackOrder.orderNumberLabel')}
            </label>
            <input
              id="orderNumber-compact"
              type="text"
              required
              value={orderNumberInput}
              onChange={(e) => onOrderNumberChange(e.target.value)}
              placeholder={t('trackOrder.orderNumberPlaceholder')}
              className="w-full border border-gray-300 px-3 py-2 text-xs text-brand-brown focus:border-brand-brown focus:ring-1 focus:ring-brand-brown outline-hidden font-mono uppercase bg-stone-50/50"
            />
          </div>

          <div>
            <label
              htmlFor="phone-compact"
              className="block text-[10px] font-bold uppercase tracking-wider text-gray-700 mb-1"
            >
              {t('trackOrder.phoneLabel')}
            </label>
            <input
              id="phone-compact"
              type="tel"
              value={phoneInput}
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder={t('trackOrder.phonePlaceholder')}
              className="w-full border border-gray-300 px-3 py-2 text-xs text-brand-brown focus:border-brand-brown focus:ring-1 focus:ring-brand-brown outline-hidden bg-stone-50/50"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading || !orderNumberInput.trim()}
            className="w-full bg-brand-brown hover:bg-brand-amber disabled:opacity-50 text-white py-2.5 px-4 text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center justify-center space-x-2 cursor-pointer mt-1"
          >
            {isLoading ? (
              <>
                <Loader2 size={13} className="animate-spin mr-1.5" />
                <span>{t('trackOrder.searching')}</span>
              </>
            ) : (
              <>
                <Search size={13} className="mr-1.5" />
                <span>{t('trackOrder.trackBtn')}</span>
              </>
            )}
          </button>
        </form>

        {errorMessage && (
          <Alert variant="error" className="mt-3">
            {errorMessage}
          </Alert>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white border border-brand-border p-6 sm:p-10 shadow-xs">
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

      <form onSubmit={onSubmit} className="space-y-4">
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
              onChange={(e) => onOrderNumberChange(e.target.value)}
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
              onChange={(e) => onPhoneChange(e.target.value)}
              placeholder={t('trackOrder.phonePlaceholder')}
              className="w-full border border-gray-300 px-3.5 py-2.5 text-xs text-brand-brown focus:border-brand-brown focus:ring-1 focus:ring-brand-brown outline-hidden"
            />
          </div>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isLoading || !orderNumberInput.trim()}
            className="w-full sm:w-auto bg-brand-brown hover:bg-brand-amber disabled:opacity-50 text-white px-6 py-2.5 text-xs font-black uppercase tracking-wider transition-colors inline-flex items-center justify-center space-x-2 cursor-pointer"
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
        <Alert variant="error" className="mt-4">
          {errorMessage}
        </Alert>
      )}
    </div>
  );
}
