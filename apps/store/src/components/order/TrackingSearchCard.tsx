import React from 'react';
import { Search, Loader2, AlertCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';

interface TrackingSearchCardProps {
  orderNumberInput: string;
  phoneInput: string;
  isLoading: boolean;
  errorMessage: string | null;
  onOrderNumberChange: (val: string) => void;
  onPhoneChange: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function TrackingSearchCard({
  orderNumberInput,
  phoneInput,
  isLoading,
  errorMessage,
  onOrderNumberChange,
  onPhoneChange,
  onSubmit,
}: TrackingSearchCardProps) {
  const { t } = useLanguage();

  return (
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
        <div className="mt-4 p-4 border border-rose-200 bg-rose-50 flex items-start space-x-3 text-xs text-rose-800">
          <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
          <span>{errorMessage}</span>
        </div>
      )}
    </div>
  );
}
